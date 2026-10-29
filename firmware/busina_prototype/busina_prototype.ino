/**
 * BUSina IoT Transit Tracker - Bench Prototype Firmware
 * Target: ESP32 NodeMCU V1 (30-Pin)
 *
 * Hardware Components:
 * - ESP32 NodeMCU V1 (3.3V Logic)
 * - NEO-M8N GPS Module (UART1: RX=16, TX=17 @ 9600 baud)
 * - Air780E 4G Cat-1 Cellular Modem (UART2: RX=25, TX=26 @ 115200 baud)
 * - HX711 Weight Sensor Amplifier + 10kg Load Cell (DOUT=32, SCK=33)
 * - E18-D80NK Doorway IR Sensor (GPIO 27, Active LOW interrupt)
 * - MicroSD SPI Card Module (VSPI: SCK=18, MISO=19, MOSI=23, CS=5)
 *
 * Architecture:
 * - Non-blocking main loop: continuous TinyGPSPlus streaming & HX711 polling
 * - Interrupt-driven passenger doorway counting with software debounce
 * - Asynchronous, non-blocking AT-command state machine for Air780E HTTP POST
 * - MicroSD fail-safe logging: records always written to /datalog.csv first
 */

#include <Arduino.h>
#include <SPI.h>
#include <SD.h>
#include <TinyGPSPlus.h>
#include <HX711.h>

// ============================================================================
// 1. PIN DEFINITIONS & CONSTANTS
// ============================================================================
constexpr uint8_t PIN_GPS_RX     = 16;
constexpr uint8_t PIN_GPS_TX     = 17;

constexpr uint8_t PIN_MODEM_RX   = 25;
constexpr uint8_t PIN_MODEM_TX   = 26;

constexpr uint8_t PIN_SD_SCK     = 18;
constexpr uint8_t PIN_SD_MISO    = 19;
constexpr uint8_t PIN_SD_MOSI    = 23;
constexpr uint8_t PIN_SD_CS      = 5;

constexpr uint8_t PIN_HX711_DOUT = 32;
constexpr uint8_t PIN_HX711_SCK  = 33;

constexpr uint8_t PIN_IR_SENSOR  = 27;

// Identity and Network Configuration
constexpr char     BUS_ID[]              = "BUS-01";
constexpr char     API_URL[]             = "http://your-api-endpoint.com/device/ping";
constexpr char     APN[]                 = "internet"; // "internet" for Smart / "http.globe.com.ph" for Globe
constexpr char     LOG_FILENAME[]        = "/datalog.csv";

// Sensor Configuration
constexpr float    SEAT_THRESHOLD_KG     = 2.0f;       // > 2.0 kg triggers OCCUPIED
constexpr float    HX711_CALIBRATION     = 2280.0f;    // Calibrate with known weight (see README)
constexpr uint32_t TELEMETRY_INTERVAL_MS = 5000;       // Log and transmit every 5 seconds
constexpr uint32_t IR_DEBOUNCE_MS        = 350;        // Debounce window for IR door beam

// ============================================================================
// 2. HARDWARE INSTANCES & TELEMETRY STRUCT
// ============================================================================
HardwareSerial SerialGPS(1);
HardwareSerial SerialModem(2);
TinyGPSPlus    gps;
HX711          scale;

// Doorway Interrupt State
volatile uint32_t isrPaxCounter     = 0;
volatile uint32_t lastIrTriggerTick = 0;

struct TelemetryData {
  uint32_t timestampMs  = 0;
  double   lat          = 0.0;
  double   lng          = 0.0;
  double   speedKmph    = 0.0;
  bool     gpsValid     = false;
  float    weightKg     = 0.0f;
  bool     seatOccupied = false;
  uint32_t paxCount     = 0;
} currentData;

bool     sdReady          = false;
uint32_t lastCycleMillis  = 0;
uint32_t lastWeightMillis = 0;

// ============================================================================
// 3. INTERRUPT SERVICE ROUTINE (E18-D80NK)
// ============================================================================
void IRAM_ATTR onDoorwayBeamBroken() {
  uint32_t now = millis();
  if (now - lastIrTriggerTick >= IR_DEBOUNCE_MS) {
    isrPaxCounter++;
    lastIrTriggerTick = now;
  }
}

// ============================================================================
// 4. NON-BLOCKING MODEM (Air780E) STATE MACHINE
// ============================================================================
enum class ModemState : uint8_t {
  IDLE,
  WAIT_CGATT,
  WAIT_SAPBR_CONTYPE,
  WAIT_SAPBR_APN,
  WAIT_SAPBR_OPEN,
  WAIT_HTTPINIT,
  WAIT_HTTPPARA_CID,
  WAIT_HTTPPARA_URL,
  WAIT_HTTPPARA_CONTENT,
  WAIT_HTTPDATA_PROMPT,
  WAIT_HTTPDATA_LOAD,
  WAIT_HTTPACTION,
  WAIT_HTTPTERM
};

struct ModemJob {
  ModemState state        = ModemState::IDLE;
  uint32_t   stateEntered = 0;
  uint32_t   timeoutMs    = 2000;
  char       payload[256] = {0};
  char       rxBuf[256]   = {0};
  size_t     rxIdx        = 0;
} modem;

void sendATCommand(const char* cmd, ModemState nextState, uint32_t timeoutMs = 2000) {
  while (SerialModem.available()) SerialModem.read();
  modem.rxIdx = 0;
  modem.rxBuf[0] = '\0';
  SerialModem.println(cmd);
  modem.state = nextState;
  modem.stateEntered = millis();
  modem.timeoutMs = timeoutMs;
}

bool startCellularPost(const TelemetryData& data) {
  if (modem.state != ModemState::IDLE) {
    Serial.println(F("[MODEM] Busy; skipping telemetry TX this cycle (saved on SD)."));
    return false;
  }

  snprintf(
    modem.payload,
    sizeof(modem.payload),
    "{\"bus_id\":\"%s\",\"lat\":%.6f,\"lng\":%.6f,\"speed\":%.2f,\"seat_status\":\"%s\",\"pax_count\":%lu}",
    BUS_ID,
    data.lat,
    data.lng,
    data.speedKmph,
    data.seatOccupied ? "OCCUPIED" : "VACANT",
    (unsigned long)data.paxCount
  );

  Serial.print(F("[MODEM] Queued payload: "));
  Serial.println(modem.payload);

  sendATCommand("AT+CGATT?", ModemState::WAIT_CGATT, 2000);
  return true;
}

void updateModemStateMachine() {
  while (SerialModem.available()) {
    char c = (char)SerialModem.read();
    if (modem.rxIdx < sizeof(modem.rxBuf) - 1) {
      modem.rxBuf[modem.rxIdx++] = c;
      modem.rxBuf[modem.rxIdx]   = '\0';
    }
  }

  if (modem.state == ModemState::IDLE) return;

  uint32_t elapsed = millis() - modem.stateEntered;
  if (elapsed >= modem.timeoutMs) {
    Serial.printf("[MODEM] Timeout in state %d. Resetting session (offline safe).\n", (int)modem.state);
    if (modem.state != ModemState::WAIT_HTTPTERM && modem.state != ModemState::WAIT_CGATT) {
      sendATCommand("AT+HTTPTERM", ModemState::WAIT_HTTPTERM, 1000);
    } else {
      modem.state = ModemState::IDLE;
    }
    return;
  }

  bool hasOK    = (strstr(modem.rxBuf, "OK") != nullptr);
  bool hasError = (strstr(modem.rxBuf, "ERROR") != nullptr);

  switch (modem.state) {
    case ModemState::WAIT_CGATT:
      if (strstr(modem.rxBuf, "+CGATT: 1") && hasOK) {
        sendATCommand("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"", ModemState::WAIT_SAPBR_CONTYPE);
      } else if (strstr(modem.rxBuf, "+CGATT: 0") || hasError) {
        Serial.println(F("[MODEM] Cellular not attached (+CGATT: 0). Skipping HTTP."));
        modem.state = ModemState::IDLE;
      }
      break;

    case ModemState::WAIT_SAPBR_CONTYPE:
      if (hasOK || hasError) {
        char cmd[96];
        snprintf(cmd, sizeof(cmd), "AT+SAPBR=3,1,\"APN\",\"%s\"", APN);
        sendATCommand(cmd, ModemState::WAIT_SAPBR_APN);
      }
      break;

    case ModemState::WAIT_SAPBR_APN:
      if (hasOK || hasError) {
        sendATCommand("AT+SAPBR=1,1", ModemState::WAIT_SAPBR_OPEN, 4000);
      }
      break;

    case ModemState::WAIT_SAPBR_OPEN:
      if (hasOK || hasError) {
        sendATCommand("AT+HTTPINIT", ModemState::WAIT_HTTPINIT);
      }
      break;

    case ModemState::WAIT_HTTPINIT:
      if (hasOK || hasError) {
        sendATCommand("AT+HTTPPARA=\"CID\",1", ModemState::WAIT_HTTPPARA_CID);
      }
      break;

    case ModemState::WAIT_HTTPPARA_CID:
      if (hasOK) {
        char cmd[192];
        snprintf(cmd, sizeof(cmd), "AT+HTTPPARA=\"URL\",\"%s\"", API_URL);
        sendATCommand(cmd, ModemState::WAIT_HTTPPARA_URL);
      } else if (hasError) {
        sendATCommand("AT+HTTPTERM", ModemState::WAIT_HTTPTERM, 1000);
      }
      break;

    case ModemState::WAIT_HTTPPARA_URL:
      if (hasOK) {
        sendATCommand("AT+HTTPPARA=\"CONTENT\",\"application/json\"", ModemState::WAIT_HTTPPARA_CONTENT);
      } else if (hasError) {
        sendATCommand("AT+HTTPTERM", ModemState::WAIT_HTTPTERM, 1000);
      }
      break;

    case ModemState::WAIT_HTTPPARA_CONTENT:
      if (hasOK) {
        char cmd[64];
        snprintf(cmd, sizeof(cmd), "AT+HTTPDATA=%u,5000", (unsigned int)strlen(modem.payload));
        sendATCommand(cmd, ModemState::WAIT_HTTPDATA_PROMPT, 3000);
      } else if (hasError) {
        sendATCommand("AT+HTTPTERM", ModemState::WAIT_HTTPTERM, 1000);
      }
      break;

    case ModemState::WAIT_HTTPDATA_PROMPT:
      if (strstr(modem.rxBuf, "DOWNLOAD") != nullptr) {
        modem.rxIdx = 0;
        modem.rxBuf[0] = '\0';
        SerialModem.print(modem.payload);
        modem.state = ModemState::WAIT_HTTPDATA_LOAD;
        modem.stateEntered = millis();
        modem.timeoutMs = 3000;
      } else if (hasError) {
        sendATCommand("AT+HTTPTERM", ModemState::WAIT_HTTPTERM, 1000);
      }
      break;

    case ModemState::WAIT_HTTPDATA_LOAD:
      if (hasOK) {
        sendATCommand("AT+HTTPACTION=1", ModemState::WAIT_HTTPACTION, 8000);
      } else if (hasError) {
        sendATCommand("AT+HTTPTERM", ModemState::WAIT_HTTPTERM, 1000);
      }
      break;

    case ModemState::WAIT_HTTPACTION:
      if (strstr(modem.rxBuf, "+HTTPACTION:") != nullptr) {
        Serial.print(F("[MODEM] HTTP Result: "));
        Serial.println(modem.rxBuf);
        sendATCommand("AT+HTTPTERM", ModemState::WAIT_HTTPTERM, 1500);
      } else if (hasError) {
        sendATCommand("AT+HTTPTERM", ModemState::WAIT_HTTPTERM, 1500);
      }
      break;

    case ModemState::WAIT_HTTPTERM:
      if (hasOK || hasError) {
        modem.state = ModemState::IDLE;
      }
      break;

    default:
      modem.state = ModemState::IDLE;
      break;
  }
}

// ============================================================================
// 5. STORAGE & SENSOR HELPERS
// ============================================================================
void initMicroSD() {
  SPI.begin(PIN_SD_SCK, PIN_SD_MISO, PIN_SD_MOSI, PIN_SD_CS);
  if (!SD.begin(PIN_SD_CS)) {
    Serial.println(F("[SD] Card mount failed! Verify FAT32 formatting and wiring."));
    sdReady = false;
    return;
  }
  sdReady = true;

  if (!SD.exists(LOG_FILENAME)) {
    File file = SD.open(LOG_FILENAME, FILE_WRITE);
    if (file) {
      file.println(F("timestamp_ms,bus_id,lat,lng,speed_kmph,weight_kg,seat_status,pax_count"));
      file.close();
    }
  }
  Serial.println(F("[SD] Card initialized successfully."));
}

void logToMicroSD(const TelemetryData& data) {
  if (!sdReady) {
    if (SD.begin(PIN_SD_CS)) {
      sdReady = true;
    } else {
      Serial.println(F("[SD] Storage unavailable; skipping log."));
      return;
    }
  }

  File file = SD.open(LOG_FILENAME, FILE_APPEND);
  if (!file) {
    Serial.println(F("[SD] Failed to open datalog.csv for writing."));
    sdReady = false;
    return;
  }

  file.printf(
    "%lu,%s,%.6f,%.6f,%.2f,%.2f,%s,%lu\n",
    (unsigned long)data.timestampMs,
    BUS_ID,
    data.lat,
    data.lng,
    data.speedKmph,
    data.weightKg,
    data.seatOccupied ? "OCCUPIED" : "VACANT",
    (unsigned long)data.paxCount
  );
  file.flush();
  file.close();

  Serial.println(F("[SD] Record appended to /datalog.csv"));
}

void pollGPS() {
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }

  if (gps.location.isValid()) {
    currentData.lat      = gps.location.lat();
    currentData.lng      = gps.location.lng();
    currentData.gpsValid = true;
  }
  if (gps.speed.isValid()) {
    currentData.speedKmph = gps.speed.kmph();
  }
}

void pollWeightSensor() {
  if (millis() - lastWeightMillis >= 200 && scale.is_ready()) {
    lastWeightMillis = millis();
    float reading = scale.get_units(1);
    if (reading < 0.0f) reading = 0.0f;

    currentData.weightKg     = (0.7f * currentData.weightKg) + (0.3f * reading);
    currentData.seatOccupied = (currentData.weightKg >= SEAT_THRESHOLD_KG);
  }
}

// ============================================================================
// 6. SETUP & MAIN LOOP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=== BUSina IoT Transit Tracker Prototype ==="));

  // Initialize GPS (UART1)
  SerialGPS.begin(9600, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);
  Serial.println(F("[GPS] UART1 initialized (RX=16, TX=17 @ 9600)."));

  // Initialize Air780E Modem (UART2)
  SerialModem.begin(115200, SERIAL_8N1, PIN_MODEM_RX, PIN_MODEM_TX);
  Serial.println(F("[MODEM] UART2 initialized (RX=25, TX=26 @ 115200)."));

  // Initialize HX711 Load Cell
  scale.begin(PIN_HX711_DOUT, PIN_HX711_SCK);
  scale.set_scale(HX711_CALIBRATION);
  if (scale.wait_ready_timeout(500)) {
    scale.tare();
    Serial.println(F("[HX711] Scale zeroed (tared)."));
  } else {
    Serial.println(F("[HX711] Warning: Sensor not ready at startup."));
  }

  // Initialize E18-D80NK Doorway Sensor
  pinMode(PIN_IR_SENSOR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_IR_SENSOR), onDoorwayBeamBroken, FALLING);
  Serial.println(F("[IR] Doorway sensor interrupt attached on GPIO 27 (FALLING)."));

  // Initialize MicroSD Card
  initMicroSD();
}

void loop() {
  pollGPS();
  pollWeightSensor();
  updateModemStateMachine();

  uint32_t now = millis();
  if (now - lastCycleMillis >= TELEMETRY_INTERVAL_MS) {
    lastCycleMillis = now;

    noInterrupts();
    uint32_t paxSnapshot = isrPaxCounter;
    interrupts();

    currentData.timestampMs = now;
    currentData.paxCount    = paxSnapshot;

    // Fail-safe black box logging to SD card first
    logToMicroSD(currentData);

    // Trigger asynchronous HTTP POST over cellular
    startCellularPost(currentData);
  }
}

