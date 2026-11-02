/**
 * Air780E 4G LTE Cat-1 Module - Standalone Diagnostic & AT Tester
 * Board: ESP32 Dev Module
 *
 * Wiring (Crossover TX/RX!):
 *   Air780E 5V / VCC -> Buck 5.0V OUT+ (or ESP32 VIN)
 *   Air780E GND      -> Common GND (ESP32 GND + Buck OUT-)
 *   Air780E TXD      -> ESP32 D25 (GPIO 25)
 *   Air780E RXD      -> ESP32 D26 (GPIO 26)
 */

#include <Arduino.h>

constexpr uint8_t PIN_MODEM_RX = 25; // Connect to Air780E TXD
constexpr uint8_t PIN_MODEM_TX = 26; // Connect to Air780E RXD

HardwareSerial SerialModem(2);
unsigned long lastCheckMs = 0;
int step = 0;

void sendCmd(const char* cmd) {
  Serial.printf("\n>>> Sending: %s\n", cmd);
  SerialModem.println(cmd);
}

void setup() {
  Serial.begin(115200);
  delay(500);

  SerialModem.begin(115200, SERIAL_8N1, PIN_MODEM_RX, PIN_MODEM_TX);

  Serial.println("\n=== Air780E 4G LTE Diagnostic Test ===");
  Serial.println("Listening on ESP32 D25 (RX) / D26 (TX) @ 115200 baud...");
  Serial.println("You can also type any AT command in the Serial Monitor top box and press Enter!");
}

void loop() {
  // 1. Print everything the Air780E sends back
  while (SerialModem.available()) {
    Serial.write(SerialModem.read());
  }

  // 2. Forward anything you type in the Serial Monitor to the Air780E
  while (Serial.available()) {
    SerialModem.write(Serial.read());
  }

  // 3. Automatic step-by-step diagnostic every 3 seconds
  if (millis() - lastCheckMs >= 3000) {
    lastCheckMs = millis();

    switch (step) {
      case 0:
        sendCmd("AT");         // Expect: OK (checks wiring & power)
        break;
      case 1:
        sendCmd("AT+CPIN?");   // Expect: +CPIN: READY (checks if SIM card is inserted properly)
        break;
      case 2:
        sendCmd("AT+CSQ");     // Expect: +CSQ: <0-31>,99 (checks antenna signal strength; 99 = no signal)
        break;
      case 3:
        sendCmd("AT+CEREG?");  // Expect: +CEREG: 0,1 or 0,5 (1 = registered on 4G network!)
        break;
      case 4:
        sendCmd("AT+CGATT?");  // Expect: +CGATT: 1 (1 = 4G packet data attached and ready!)
        break;
    }
    step = (step + 1) % 5;
  }
}

