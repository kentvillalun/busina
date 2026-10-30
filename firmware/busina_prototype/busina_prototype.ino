/**
 * BUSina IoT Transit Tracker - Bench Prototype Firmware
 * Target: ESP32 NodeMCU V1 (30-Pin)
 *
 * Talks to the BUSina Express API (server/): POST /device/ping
 *   Header: X-Device-Key: <DEVICE_KEY>
 *   Body:   {"deviceId","lat","lng","speedKmh","seats":[0/1 x SEAT_COUNT],"doorIn","doorOut"}
 * The shape must match server/src/schemas/device.schema.js, otherwise the API answers 400.
 *
 * Hardware:
 * - NEO-M8N GPS            UART1  RX=16 TX=17  @ 9600
 * - Air780E 4G Cat-1       UART2  RX=25 TX=26  @ 115200
 * - HX711 + 10kg load cell DOUT=32 SCK=33      (one seat)
 * - E18-D80NK IR beam      GPIO 27, active LOW (door entries)
 * - MicroSD (VSPI)         SCK=18 MISO=19 MOSI=23 CS=5
 *
 * Copy secrets.example.h to secrets.h and fill it in before compiling (secrets.h is git-ignored).
 */

#include <Arduino.h>
#include <SPI.h>
#include <SD.h>
#include <TinyGPSPlus.h>
#include <HX711.h>
#include "secrets.h" // DEVICE_ID, DEVICE_KEY, API_BASE_URL, APN

// ============================================================================
// 1. PINS & CONFIGURATION
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

constexpr char     LOG_FILENAME[]        = "/datalog.csv";

// Must equal Bus.seatCount in the database (seed: 40), or the API rejects the ping with SEAT_COUNT_MISMATCH.
constexpr uint8_t  SEAT_COUNT            = 40;
// The prototype has one load cell; it reports this seat. The other seats are sent as free.
constexpr uint8_t  SENSOR_SEAT_INDEX     = 0;

constexpr float    SEAT_THRESHOLD_KG     = 2.0f;
constexpr float    HX711_CALIBRATION     = 2280.0f;    // Replace after calibration (see README)
constexpr uint32_t TELEMETRY_INTERVAL_MS = 5000;       // API limit is 60 pings/min per device
constexpr uint32_t IR_DEBOUNCE_MS        = 350;
constexpr uint32_t GPS_MAX_AGE_MS        = 10000;      // Older fixes are not sent: the map would show a frozen bus
constexpr float    MAX_SPEED_KMH         = 200.0f;     // API schema maximum

// ============================================================================
// 2. HARDWARE INSTANCES & STATE
// ============================================================================
HardwareSerial SerialGPS(1);
HardwareSerial SerialModem(2);
TinyGPSPlus    gps;
HX711          scale;

volatile uint32_t isrDoorInCounter  = 0;
volatile uint32_t lastIrTriggerTick = 0;

struct TelemetryData {
  uint32_t timestampMs  = 0;
  double   lat          = 0.0;
  double   lng          = 0.0;
  double   speedKmh     = 0.0;
  bool     gpsValid     = false;
  float    weightKg     = 0.0f;
  bool     seatOccupied = false;
  uint32_t doorIn       = 0;
  uint32_t doorOut      = 0; // Only one entry sensor on the prototype, so exits are not counted yet
} currentData;

bool     sdReady          = false;
uint32_t lastCycleMillis  = 0;
uint32_t lastWeightMillis = 0;

// ============================================================================
// 3. DOOR SENSOR INTERRUPT (E18-D80NK)
// ============================================================================
void IRAM_ATTR onDoorwayBeamBroken() {
  uint32_t now = millis();
  if (now - lastIrTriggerTick >= IR_DEBOUNCE_MS) {
    isrDoorInCounter++;
    lastIrTriggerTick = now;
  }
}

// ============================================================================
// 4. NON-BLOCKING AIR780E HTTP POST STATE MACHINE
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
  WAIT_HTTPPARA_HEADER,
  WAIT_HTTPDATA_PROMPT,
  WAIT_HTTPDATA_LOAD,
  WAIT_HTTPACTION,
  WAIT_HTTPTERM
};

struct ModemJob {
  ModemState state        = ModemState::IDLE;
  uint32_t   stateEntered = 0;
  uint32_t   timeoutMs    = 2000;
  char       payload[320] = {0};
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

void abortHttp() {
  sendATCommand("AT+HTTPTERM", ModemState::WAIT_HTTPTERM, 1500);
}

void buildPayload(const TelemetryData& data) {
  int n = snprintf(
    modem.payload, sizeof(modem.payload),
    "{\"deviceId\":\"%s\",\"lat\":%.6f,\"lng\":%.6f,\"speedKmh\":%.1f,\"seats\":[",
    DEVICE_ID, data.lat, data.lng, data.speedKmh
  );
  for (uint8_t i = 0; i < SEAT_COUNT; i++) {
    uint8_t taken = (i == SENSOR_SEAT_INDEX && data.seatOccupied) ? 1 : 0;
    n += snprintf(modem.payload + n, sizeof(modem.payload) - n, i == 0 ? "%u" : ",%u", taken);
  }
  snprintf(
    modem.payload + n, sizeof(modem.payload) - n,
    "],\"doorIn\":%lu,\"doorOut\":%lu}",
    (unsigned long)data.doorIn, (unsigned long)data.doorOut
  );
}

bool startCellularPost(const TelemetryData& data) {
  if (!data.gpsValid) {
    // Sending 0,0 would put the bus in the ocean on the commuter map.
    Serial.println(F("[MODEM] No fresh GPS fix; ping skipped (saved on SD)."));
    return false;
  }
  if (modem.state != ModemState::IDLE) {
    Serial.println(F("[MODEM] Busy; ping skipped this cycle (saved on SD)."));
    return false;
  }

  buildPayload(data);
  Serial.print(F("[MODEM] Payload: "));
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

  if (millis() - modem.stateEntered >= modem.timeoutMs) {
    Serial.printf("[MODEM] Timeout in state %d (offline safe).\n", (int)modem.state);
    if (modem.state == ModemState::WAIT_HTTPTERM || modem.state == ModemState::WAIT_CGATT) {
      modem.state = ModemState::IDLE;
    } else {
      abortHttp();
    }
    return;
  }

  bool hasOK    = (strstr(modem.rxBuf, "OK") != nullptr);
  bool hasError = (strstr(modem.rxBuf, "ERROR") != nullptr);
  char cmd[192];

  switch (modem.state) {
    case ModemState::WAIT_CGATT:
      if (strstr(modem.rxBuf, "+CGATT: 1") && hasOK) {
        sendATCommand("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"", ModemState::WAIT_SAPBR_CONTYPE);
      } else if (strstr(modem.rxBuf, "+CGATT: 0") || hasError) {
        Serial.println(F("[MODEM] Not attached to the network. Staying offline."));
        modem.state = ModemState::IDLE;
      }
      break;

    case ModemState::WAIT_SAPBR_CONTYPE:
      if (hasOK || hasError) {
        snprintf(cmd, sizeof(cmd), "AT+SAPBR=3,1,\"APN\",\"%s\"", APN);
        sendATCommand(cmd, ModemState::WAIT_SAPBR_APN);
      }
      break;

    case ModemState::WAIT_SAPBR_APN:
      if (hasOK || hasError) sendATCommand("AT+SAPBR=1,1", ModemState::WAIT_SAPBR_OPEN, 4000);
      break;

    case ModemState::WAIT_SAPBR_OPEN:
      // ERROR here usually means the bearer is already open, which is fine.
      if (hasOK || hasError) sendATCommand("AT+HTTPINIT", ModemState::WAIT_HTTPINIT);
      break;

    case ModemState::WAIT_HTTPINIT:
      // ERROR here usually means a previous HTTP session is still open; it is reused.
      if (hasOK || hasError) sendATCommand("AT+HTTPPARA=\"CID\",1", ModemState::WAIT_HTTPPARA_CID);
      break;

    case ModemState::WAIT_HTTPPARA_CID:
      if (hasOK) {
        snprintf(cmd, sizeof(cmd), "AT+HTTPPARA=\"URL\",\"%s/device/ping\"", API_BASE_URL);
        sendATCommand(cmd, ModemState::WAIT_HTTPPARA_URL);
      } else if (hasError) abortHttp();
      break;

    case ModemState::WAIT_HTTPPARA_URL:
      if (hasOK) sendATCommand("AT+HTTPPARA=\"CONTENT\",\"application/json\"", ModemState::WAIT_HTTPPARA_CONTENT);
      else if (hasError) abortHttp();
      break;

    case ModemState::WAIT_HTTPPARA_CONTENT:
      if (hasOK) {
        snprintf(cmd, sizeof(cmd), "AT+HTTPPARA=\"USER_DEFINED\",\"X-Device-Key: %s\"", DEVICE_KEY);
        sendATCommand(cmd, ModemState::WAIT_HTTPPARA_HEADER);
      } else if (hasError) abortHttp();
      break;

    case ModemState::WAIT_HTTPPARA_HEADER:
      if (hasOK) {
        snprintf(cmd, sizeof(cmd), "AT+HTTPDATA=%u,5000", (unsigned int)strlen(modem.payload));
        sendATCommand(cmd, ModemState::WAIT_HTTPDATA_PROMPT, 3000);
      } else if (hasError) abortHttp();
      break;

    case ModemState::WAIT_HTTPDATA_PROMPT:
      if (strstr(modem.rxBuf, "DOWNLOAD")) {
        modem.rxIdx = 0;
        modem.rxBuf[0] = '\0';
        SerialModem.print(modem.payload);
        modem.state = ModemState::WAIT_HTTPDATA_LOAD;
        modem.stateEntered = millis();
        modem.timeoutMs = 3000;
      } else if (hasError) abortHttp();
      break;

    case ModemState::WAIT_HTTPDATA_LOAD:
      // HTTPS handshake over Cat-1 can take several seconds.
      if (hasOK) sendATCommand("AT+HTTPACTION=1", ModemState::WAIT_HTTPACTION, 15000);
      else if (hasError) abortHttp();
      break;

    case ModemState::WAIT_HTTPACTION: {
      // URC format: +HTTPACTION: <method>,<status>,<length>
      const char* urc = strstr(modem.rxBuf, "+HTTPACTION:");
      int method = 0, status = 0, length = 0;
      if (urc && sscanf(urc, "+HTTPACTION: %d,%d,%d", &method, &status, &length) == 3) {
        if (status == 200)      Serial.println(F("[MODEM] Ping accepted (200)."));
        else if (status == 400) Serial.println(F("[MODEM] 400: payload rejected. Check SEAT_COUNT and the JSON shape."));
        else if (status == 401) Serial.println(F("[MODEM] 401: wrong DEVICE_ID or DEVICE_KEY in secrets.h."));
        else if (status == 403) Serial.println(F("[MODEM] 403: this bus is disabled on the server."));
        else if (status == 429) Serial.println(F("[MODEM] 429: pinging too fast."));
        else Serial.printf("[MODEM] HTTP status %d (6xx = network/DNS/TLS error on the modem).\n", status);
        abortHttp();
      } else if (hasError) abortHttp();
      break;
    }

    case ModemState::WAIT_HTTPTERM:
      if (hasOK || hasError) modem.state = ModemState::IDLE;
      break;

    default:
      modem.state = ModemState::IDLE;
      break;
  }
}

// ============================================================================
// 5. STORAGE & SENSORS
// ============================================================================
void initMicroSD() {
  SPI.begin(PIN_SD_SCK, PIN_SD_MISO, PIN_SD_MOSI, PIN_SD_CS);
  if (!SD.begin(PIN_SD_CS)) {
    Serial.println(F("[SD] Mount failed. Check FAT32 formatting and wiring."));
    sdReady = false;
    return;
  }
  sdReady = true;

  if (!SD.exists(LOG_FILENAME)) {
    File file = SD.open(LOG_FILENAME, FILE_WRITE);
    if (file) {
      file.println(F("timestamp_ms,device_id,gps_valid,lat,lng,speed_kmh,weight_kg,seat_status,door_in,door_out"));
      file.close();
    }
  }
  Serial.println(F("[SD] Ready."));
}

void logToMicroSD(const TelemetryData& data) {
  if (!sdReady) {
    if (SD.begin(PIN_SD_CS)) {
      sdReady = true;
    } else {
      Serial.println(F("[SD] Unavailable; log skipped."));
      return;
    }
  }

  File file = SD.open(LOG_FILENAME, FILE_APPEND);
  if (!file) {
    Serial.println(F("[SD] Could not open datalog.csv."));
    sdReady = false;
    return;
  }

  file.printf(
    "%lu,%s,%d,%.6f,%.6f,%.1f,%.2f,%s,%lu,%lu\n",
    (unsigned long)data.timestampMs, DEVICE_ID, data.gpsValid ? 1 : 0,
    data.lat, data.lng, data.speedKmh, data.weightKg,
    data.seatOccupied ? "OCCUPIED" : "VACANT",
    (unsigned long)data.doorIn, (unsigned long)data.doorOut
  );
  file.close();
  Serial.println(F("[SD] Record appended."));
}

void pollGPS() {
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }

  currentData.gpsValid = gps.location.isValid() && gps.location.age() < GPS_MAX_AGE_MS;
  if (currentData.gpsValid) {
    currentData.lat = gps.location.lat();
    currentData.lng = gps.location.lng();
  }
  if (gps.speed.isValid()) {
    currentData.speedKmh = constrain(gps.speed.kmph(), 0.0, (double)MAX_SPEED_KMH);
  }
}

void pollWeightSensor() {
  if (millis() - lastWeightMillis >= 200 && scale.is_ready()) {
    lastWeightMillis = millis();
    float reading = scale.get_units(1);
    if (reading < 0.0f) reading = 0.0f;

    // Smooths out bus vibration so the seat does not flicker between states.
    currentData.weightKg     = (0.7f * currentData.weightKg) + (0.3f * reading);
    currentData.seatOccupied = (currentData.weightKg >= SEAT_THRESHOLD_KG);
  }
}

// ============================================================================
// 6. SETUP & LOOP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=== BUSina IoT Transit Tracker Prototype ==="));
  Serial.printf("Device %s -> %s/device/ping\n", DEVICE_ID, API_BASE_URL);

  SerialGPS.begin(9600, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);
  SerialModem.begin(115200, SERIAL_8N1, PIN_MODEM_RX, PIN_MODEM_TX);
  // Echo off, so the modem does not repeat our commands back into the response buffer.
  SerialModem.println("ATE0");

  scale.begin(PIN_HX711_DOUT, PIN_HX711_SCK);
  scale.set_scale(HX711_CALIBRATION);
  if (scale.wait_ready_timeout(500)) {
    scale.tare(); // The seat must be empty at boot.
    Serial.println(F("[HX711] Tared."));
  } else {
    Serial.println(F("[HX711] Not detected at boot."));
  }

  pinMode(PIN_IR_SENSOR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_IR_SENSOR), onDoorwayBeamBroken, FALLING);

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
    currentData.doorIn = isrDoorInCounter;
    interrupts();
    currentData.timestampMs = now;

    // SD first, so a record survives even when the network is down.
    logToMicroSD(currentData);
    startCellularPost(currentData);
  }
}
