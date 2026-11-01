/**
 * BUSina IoT Transit Tracker - Bench Prototype Firmware
 * Target: ESP32 NodeMCU V1 (30-Pin)
 *
 * Talks to the BUSina Express API (server/): POST /device/ping
 *   Header: X-Device-Key: <DEVICE_KEY>
 *   Body:   {"deviceId","lat","lng","speedKmh","direction","seats":[0/1 x SEAT_COUNT],"doorIn","doorOut"}
 *
 * Transport Modes:
 *   - USE_WIFI_HOTSPOT = true  -> Built-in ESP32 Wi-Fi + HTTPS (WiFiClientSecure + HTTPClient)
 *   - USE_WIFI_HOTSPOT = false -> Air780E 4G LTE Cat-1 Modem on UART2 (RX=25, TX=26)
 *
 * Hardware:
 * - NEO-M8N GPS            UART1  RX=16 TX=17  @ 9600
 * - Air780E 4G Cat-1       UART2  RX=25 TX=26  @ 115200
 * - HX711 + 10kg load cell DOUT=32 SCK=33      (one seat)
 * - E18-D80NK IR beam #1   GPIO 27, active LOW (Outer doorway sensor A)
 * - E18-D80NK IR beam #2   GPIO 14, active LOW (Inner doorway sensor B)
 * - MicroSD (VSPI)         SCK=18 MISO=19 MOSI=23 CS=5
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <SD.h>
#include <TinyGPSPlus.h>
#include <HX711.h>
#include "secrets.h" // WIFI_SSID, WIFI_PASS, DEVICE_ID, DEVICE_KEY, API_BASE_URL, APN

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
constexpr uint8_t PIN_IR_A       = 27; // Outer doorway sensor (D27)
constexpr uint8_t PIN_IR_B       = 14; // Inner doorway sensor (D14)

// Set true to send pings over ESP32 Wi-Fi / Phone Hotspot (no Air780E needed).
constexpr bool     USE_WIFI_HOTSPOT      = true;
// Set true so indoor bench testing still sends coordinates along the seeded Laoag route when GPS has no sky lock yet.
constexpr bool     INDOOR_GPS_FALLBACK   = true;
// Must be "NORTHBOUND" or "SOUTHBOUND" so the web app's direction tabs display the bus.
constexpr char     DEFAULT_DIRECTION[]   = "NORTHBOUND";

constexpr char     LOG_FILENAME[]        = "/datalog.csv";

// Must equal Bus.seatCount in the database (seed: 40), or the API rejects the ping with SEAT_COUNT_MISMATCH.
constexpr uint8_t  SEAT_COUNT            = 40;
constexpr uint8_t  SENSOR_SEAT_INDEX     = 0;

constexpr float    SEAT_THRESHOLD_KG     = 2.0f;
constexpr float    HX711_CALIBRATION     = 2280.0f;
constexpr uint32_t TELEMETRY_INTERVAL_MS = 5000;       // API limit is 60 pings/min per device
constexpr uint32_t IR_DEBOUNCE_MS        = 350;
constexpr uint32_t GPS_MAX_AGE_MS        = 10000;
constexpr float    MAX_SPEED_KMH         = 200.0f;

// ============================================================================
// 2. HARDWARE INSTANCES & STATE
// ============================================================================
HardwareSerial SerialGPS(1);
HardwareSerial SerialModem(2);
TinyGPSPlus    gps;
HX711          scale;

struct TelemetryData {
  uint32_t timestampMs  = 0;
  double   lat          = 18.197800; // Seeded route start (Laoag)
  double   lng          = 120.593600;
  double   speedKmh     = 0.0;
  bool     gpsValid     = false;
  float    weightKg     = 0.0f;
  bool     seatOccupied = false;
  uint32_t doorIn       = 0;
  uint32_t doorOut      = 0;
} currentData;

bool     sdReady          = false;
uint32_t lastCycleMillis  = 0;
uint32_t lastWeightMillis = 0;
uint8_t  demoStep         = 0;

// ============================================================================
// 3. SINGLE-DOOR BIDIRECTIONAL PASSENGER COUNTER (2x E18-D80NK: A=D27, B=D14)
// ============================================================================
enum class DoorState : uint8_t { IDLE, A_WAIT_B, B_WAIT_A, COOLDOWN };

DoorState doorState     = DoorState::IDLE;
uint32_t  doorStepTimer = 0;
int       lastIrStateA  = HIGH;
int       lastIrStateB  = HIGH;
uint32_t  lastIrEdgeA   = 0;
uint32_t  lastIrEdgeB   = 0;

void pollDoorwaySensors() {
  uint32_t now = millis();
  int stateA = digitalRead(PIN_IR_A); // LOW = blocked, HIGH = clear
  int stateB = digitalRead(PIN_IR_B);

  bool hitA = (stateA == LOW && lastIrStateA == HIGH && (now - lastIrEdgeA >= 80));
  bool hitB = (stateB == LOW && lastIrStateB == HIGH && (now - lastIrEdgeB >= 80));
  if (hitA) lastIrEdgeA = now;
  if (hitB) lastIrEdgeB = now;

  lastIrStateA = stateA;
  lastIrStateB = stateB;

  switch (doorState) {
    case DoorState::IDLE:
      if (hitA && !hitB) {
        doorState     = DoorState::A_WAIT_B;
        doorStepTimer = now;
      } else if (hitB && !hitA) {
        doorState     = DoorState::B_WAIT_A;
        doorStepTimer = now;
      }
      break;

    case DoorState::A_WAIT_B:
      // Outer A broken first, then Inner B -> Passenger boarded (doorIn++)
      if (hitB || stateB == LOW) {
        currentData.doorIn++;
        Serial.printf("[DOOR] Passenger IN (A->B) | doorIn=%lu doorOut=%lu\n",
                      (unsigned long)currentData.doorIn, (unsigned long)currentData.doorOut);
        doorState     = DoorState::COOLDOWN;
        doorStepTimer = now;
      } else if (now - doorStepTimer >= 1200) {
        doorState = DoorState::IDLE;
      }
      break;

    case DoorState::B_WAIT_A:
      // Inner B broken first, then Outer A -> Passenger exited (doorOut++)
      if (hitA || stateA == LOW) {
        if (currentData.doorOut < currentData.doorIn) {
          currentData.doorOut++;
        }
        Serial.printf("[DOOR] Passenger OUT (B->A) | doorIn=%lu doorOut=%lu\n",
                      (unsigned long)currentData.doorIn, (unsigned long)currentData.doorOut);
        doorState     = DoorState::COOLDOWN;
        doorStepTimer = now;
      } else if (now - doorStepTimer >= 1200) {
        doorState = DoorState::IDLE;
      }
      break;

    case DoorState::COOLDOWN:
      if (stateA == HIGH && stateB == HIGH && (now - doorStepTimer >= IR_DEBOUNCE_MS)) {
        doorState = DoorState::IDLE;
      }
      break;
  }
}

// ============================================================================
// 4. PAYLOAD BUILDER, WI-FI HTTPS POST, & AIR780E FALLBACK
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
  char       payload[384] = {0};
  char       rxBuf[256]   = {0};
  size_t     rxIdx        = 0;
} modem;

void buildPayload(const TelemetryData& data) {
  int n = snprintf(
    modem.payload, sizeof(modem.payload),
    "{\"deviceId\":\"%s\",\"lat\":%.6f,\"lng\":%.6f,\"speedKmh\":%.1f,\"direction\":\"%s\",\"seats\":[",
    DEVICE_ID, data.lat, data.lng, data.speedKmh, DEFAULT_DIRECTION
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

void initWiFi() {
  if (!USE_WIFI_HOTSPOT) return;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("[WIFI] Connecting to \"%s\"", WIFI_SSID);
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 8000) {
    delay(250);
    Serial.print('.');
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println(F("\n[WIFI] Not connected yet (will keep retrying in background).Check WIFI_SSID/WIFI_PASS in secrets.h."));
  }
}

bool sendWiFiPost(const TelemetryData& data) {
  if (!data.gpsValid && !INDOOR_GPS_FALLBACK) {
    Serial.println(F("[WIFI] No GPS fix yet; ping skipped."));
    return false;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WIFI] Disconnected; reconnecting to hotspot..."));
    WiFi.reconnect();
    return false;
  }

  buildPayload(data);
  Serial.print(F("[WIFI] POST Payload: "));
  Serial.println(modem.payload);

  WiFiClientSecure client;
  client.setInsecure(); // Skip root CA bundle verification for bench prototype

  HTTPClient http;
  String url = String(API_BASE_URL) + "/device/ping";
  http.setTimeout(4000);
  // Follow 307/308 redirects if Vercel rewrites or redirects
  http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);

  if (!http.begin(client, url)) {
    Serial.println(F("[WIFI] Failed to initialize HTTP client."));
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);

  int status = http.POST((uint8_t*)modem.payload, strlen(modem.payload));
  String response = http.getString();
  http.end();

  if (status == 200) {
    Serial.printf("[WIFI] SUCCESS (200)! Live on web app -> %s\n", response.c_str());
    return true;
  } else if (status == 401) {
    Serial.printf("[WIFI] 401 Unauthorized: DEVICE_ID or DEVICE_KEY in secrets.h does not match the production DB! (%s)\n", response.c_str());
  } else if (status == 400) {
    Serial.printf("[WIFI] 400 Bad Request: %s\n", response.c_str());
  } else {
    Serial.printf("[WIFI] HTTP Error %d: %s\n", status, response.c_str());
  }
  return false;
}

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

bool startCellularPost(const TelemetryData& data) {
  if (!data.gpsValid && !INDOOR_GPS_FALLBACK) {
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
  if (USE_WIFI_HOTSPOT) return;

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
      if (hasOK || hasError) sendATCommand("AT+HTTPINIT", ModemState::WAIT_HTTPINIT);
      break;

    case ModemState::WAIT_HTTPINIT:
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
      if (hasOK) sendATCommand("AT+HTTPACTION=1", ModemState::WAIT_HTTPACTION, 15000);
      else if (hasError) abortHttp();
      break;

    case ModemState::WAIT_HTTPACTION: {
      const char* urc = strstr(modem.rxBuf, "+HTTPACTION:");
      int method = 0, status = 0, length = 0;
      if (urc && sscanf(urc, "+HTTPACTION: %d,%d,%d", &method, &status, &length) == 3) {
        if (status == 200)      Serial.println(F("[MODEM] Ping accepted (200)."));
        else if (status == 400) Serial.println(F("[MODEM] 400: payload rejected."));
        else if (status == 401) Serial.println(F("[MODEM] 401: wrong DEVICE_ID or DEVICE_KEY in secrets.h."));
        else if (status == 403) Serial.println(F("[MODEM] 403: this bus is disabled on the server."));
        else if (status == 429) Serial.println(F("[MODEM] 429: pinging too fast."));
        else Serial.printf("[MODEM] HTTP status %d\n", status);
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
    Serial.println(F("[SD] Mount failed (optional for live test)."));
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
  if (!sdReady) return;

  File file = SD.open(LOG_FILENAME, FILE_APPEND);
  if (!file) {
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
    if (gps.speed.isValid()) {
      currentData.speedKmh = constrain(gps.speed.kmph(), 0.0, (double)MAX_SPEED_KMH);
    }
  } else if (INDOOR_GPS_FALLBACK) {
    // Indoor fallback along the seeded Laoag route so the bus is visible on the map indoors.
    // As soon as the real NEO-M8N gets a satellite lock, currentData.gpsValid becomes true and overrides this.
    currentData.lat      = 18.197800 - (demoStep % 10) * 0.001800;
    currentData.lng      = 120.593600 - (demoStep % 10) * 0.000600;
    currentData.speedKmh = 25.0;
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
// 6. SETUP & LOOP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=== BUSina IoT Transit Tracker Prototype ==="));
  Serial.printf("Device %s -> %s/device/ping\n", DEVICE_ID, API_BASE_URL);

  SerialGPS.begin(9600, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);
  if (!USE_WIFI_HOTSPOT) {
    SerialModem.begin(115200, SERIAL_8N1, PIN_MODEM_RX, PIN_MODEM_TX);
    SerialModem.println("ATE0");
  }

  scale.begin(PIN_HX711_DOUT, PIN_HX711_SCK);
  scale.set_scale(HX711_CALIBRATION);
  if (scale.wait_ready_timeout(500)) {
    scale.tare();
    Serial.println(F("[HX711] Tared."));
  } else {
    Serial.println(F("[HX711] Not detected at boot."));
  }

  pinMode(PIN_IR_A, INPUT_PULLUP);
  pinMode(PIN_IR_B, INPUT_PULLUP);

  initMicroSD();
  initWiFi();
}

void loop() {
  pollGPS();
  pollDoorwaySensors();
  pollWeightSensor();
  updateModemStateMachine();

  uint32_t now = millis();
  if (now - lastCycleMillis >= TELEMETRY_INTERVAL_MS) {
    lastCycleMillis = now;
    currentData.timestampMs = now;
    demoStep++;

    Serial.printf(
      "[GPS] bytes=%lu sats=%lu lock=%s lat=%.6f lng=%.6f | seat=%s (%.1fkg) | doorIn=%lu doorOut=%lu\n",
      (unsigned long)gps.charsProcessed(),
      (unsigned long)gps.satellites.value(),
      currentData.gpsValid ? "REAL-GPS" : "INDOOR-FALLBACK",
      currentData.lat,
      currentData.lng,
      currentData.seatOccupied ? "OCCUPIED" : "VACANT",
      currentData.weightKg,
      (unsigned long)currentData.doorIn,
      (unsigned long)currentData.doorOut
    );

    logToMicroSD(currentData);

    if (USE_WIFI_HOTSPOT) {
      sendWiFiPost(currentData);
    } else {
      startCellularPost(currentData);
    }
  }
}
