/**
 * NEO-M8N GPS Module - Standalone Wiring & Satellite Lock Test
 * Board: ESP32 Dev Module
 *
 * Direct Wiring (Crossover TX/RX!):
 *   NEO-M8N VCC -> ESP32 3V3 (or VIN)
 *   NEO-M8N GND -> ESP32 GND
 *   NEO-M8N TX  -> ESP32 RX2 / D16 (GPIO 16)
 *   NEO-M8N RX  -> ESP32 TX2 / D17 (GPIO 17)
 */

#include <Arduino.h>
#include <TinyGPSPlus.h>

constexpr uint8_t PIN_GPS_RX = 16; // Connect to GPS TX
constexpr uint8_t PIN_GPS_TX = 17; // Connect to GPS RX

HardwareSerial SerialGPS(1);
TinyGPSPlus gps;

unsigned long lastStatusMs = 0;

void setup() {
  Serial.begin(115200);
  delay(500);

  SerialGPS.begin(9600, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);

  Serial.println("\n=== NEO-M8N GPS Diagnostic Test ===");
  Serial.println("Listening on ESP32 RX2 (D16) / TX2 (D17) @ 9600 baud...");
}

void loop() {
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }

  if (millis() - lastStatusMs >= 2000) {
    lastStatusMs = millis();

    // 1. Check if ESP32 is receiving raw data from the GPS chip at all
    if (gps.charsProcessed() < 10) {
      Serial.println("[!] No data from GPS yet! Check: Is GPS TX wired to D16 (RX2) and GPS RX to D17 (TX2)?");
      return;
    }

    // 2. Wiring is GOOD! Now check satellite lock
    Serial.printf("[WIRING OK] Bytes read: %lu | Satellites: %lu | ",
                  (unsigned long)gps.charsProcessed(),
                  (unsigned long)gps.satellites.value());

    if (gps.location.isValid()) {
      Serial.printf("LOCKED! Lat: %.6f, Lng: %.6f | Speed: %.1f km/h\n",
                    gps.location.lat(),
                    gps.location.lng(),
                    gps.speed.kmph());
    } else {
      Serial.println("Searching for satellites... (Place ceramic antenna near a window or outdoors)");
    }
  }
}

