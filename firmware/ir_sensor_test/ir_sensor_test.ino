/**
 * Single-Door Bidirectional Passenger Counter Test (2x E18-D80NK Side-by-Side)
 * Board: ESP32 Dev Module
 *
 * Mounting in the Single Doorway (5-10 cm apart):
 *   [OUTSIDE]  --->  (Sensor A: D27)      (Sensor B: D14)  --->  [INSIDE BUS]
 *
 * Direction Logic:
 *   - Sensor A (D27) triggered first, then Sensor B (D14) => ENTRY  (doorIn++)
 *   - Sensor B (D14) triggered first, then Sensor A (D27) => EXIT   (doorOut++)
 *
 * Wiring:
 *   Sensor A (Outer): VCC -> 5V (VIN), GND -> GND, OUT -> ESP32 D27
 *   Sensor B (Inner): VCC -> 5V (VIN), GND -> GND, OUT -> ESP32 D14
 */

const int PIN_IR_A  = 27; // Outer doorway sensor (D27)
const int PIN_IR_B  = 14; // Inner doorway sensor (D14)
const int PIN_LED   = 2;  // Built-in blue LED on ESP32

const unsigned long DIRECTION_TIMEOUT_MS = 1200; // Max time to cross from A->B or B->A
const unsigned long COOLDOWN_MS          = 400;  // Pause after a completed pass
const unsigned long EDGE_DEBOUNCE_MS     = 80;   // Debounce single beam glitches

enum DoorStep {
  WAIT_IDLE,
  A_FIRST_WAIT_B, // Outer sensor triggered -> waiting for Inner sensor (Boarding)
  B_FIRST_WAIT_A, // Inner sensor triggered -> waiting for Outer sensor (Exiting)
  PASS_COOLDOWN   // Wait for person to clear the doorway
};

DoorStep doorStep = WAIT_IDLE;
unsigned long stepTimer = 0;

int doorInCount  = 0;
int doorOutCount = 0;

int lastStateA = HIGH;
int lastStateB = HIGH;
unsigned long lastEdgeA = 0;
unsigned long lastEdgeB = 0;

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(PIN_IR_A, INPUT_PULLUP);
  pinMode(PIN_IR_B, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);

  Serial.println("\n=== Single-Door Bidirectional IR Counter Ready ===");
  Serial.printf("Initial States -> Sensor A (D27): %s | Sensor B (D14): %s\n",
                digitalRead(PIN_IR_A) == HIGH ? "HIGH (Clear)" : "LOW (Blocked)",
                digitalRead(PIN_IR_B) == HIGH ? "HIGH (Clear)" : "LOW (Blocked)");
  Serial.println("Swipe hand A (D27) -> B (D14) to BOARD, or B (D14) -> A (D27) to EXIT!");
}

void loop() {
  unsigned long now = millis();
  int stateA = digitalRead(PIN_IR_A); // LOW = blocked, HIGH = clear
  int stateB = digitalRead(PIN_IR_B); // LOW = blocked, HIGH = clear

  // Turn on ESP32 blue LED whenever either beam is broken
  digitalWrite(PIN_LED, (stateA == LOW || stateB == LOW) ? HIGH : LOW);

  // Detect fresh falling edges (beam just broken)
  bool hitA = (stateA == LOW && lastStateA == HIGH && (now - lastEdgeA >= EDGE_DEBOUNCE_MS));
  bool hitB = (stateB == LOW && lastStateB == HIGH && (now - lastEdgeB >= EDGE_DEBOUNCE_MS));
  if (hitA) lastEdgeA = now;
  if (hitB) lastEdgeB = now;

  lastStateA = stateA;
  lastStateB = stateB;

  switch (doorStep) {
    case WAIT_IDLE:
      if (hitA && !hitB) {
        doorStep  = A_FIRST_WAIT_B;
        stepTimer = now;
        Serial.println("  -> Outer Sensor A (D27) triggered... waiting for Inner Sensor B (D14)");
      } else if (hitB && !hitA) {
        doorStep  = B_FIRST_WAIT_A;
        stepTimer = now;
        Serial.println("  <- Inner Sensor B (D14) triggered... waiting for Outer Sensor A (D27)");
      }
      break;

    case A_FIRST_WAIT_B:
      if (hitB || stateB == LOW) {
        doorInCount++;
        int onBoard = max(0, doorInCount - doorOutCount);
        Serial.printf("[BOARDED A->B] +1 Passenger IN!  | doorIn: %d | doorOut: %d | On Board: %d\n",
                      doorInCount, doorOutCount, onBoard);
        doorStep  = PASS_COOLDOWN;
        stepTimer = now;
      } else if (now - stepTimer >= DIRECTION_TIMEOUT_MS) {
        Serial.println("  [x] Timeout (person did not cross B). Resetting.");
        doorStep = WAIT_IDLE;
      }
      break;

    case B_FIRST_WAIT_A:
      if (hitA || stateA == LOW) {
        doorOutCount++;
        int onBoard = max(0, doorInCount - doorOutCount);
        Serial.printf("[EXITED  B->A] -1 Passenger OUT! | doorIn: %d | doorOut: %d | On Board: %d\n",
                      doorInCount, doorOutCount, onBoard);
        doorStep  = PASS_COOLDOWN;
        stepTimer = now;
      } else if (now - stepTimer >= DIRECTION_TIMEOUT_MS) {
        Serial.println("  [x] Timeout (person did not cross A). Resetting.");
        doorStep = WAIT_IDLE;
      }
      break;

    case PASS_COOLDOWN:
      // Wait until both beams are clear and cooldown time has elapsed
      if (stateA == HIGH && stateB == HIGH && (now - stepTimer >= COOLDOWN_MS)) {
        doorStep = WAIT_IDLE;
      }
      break;
  }
}
