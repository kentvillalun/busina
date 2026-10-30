# BUSina IoT Hardware Tracker Prototype (ESP32)

Bench prototype firmware. It sends the same request as `server/scripts/simulate-bus.js`, so the
deployed API and the web app treat it exactly like the simulator.

## Connecting it to the deployed system

1. Copy `secrets.example.h` to `secrets.h` (same folder; it is git-ignored).
2. Fill in:
   - `DEVICE_ID` and `DEVICE_KEY`: from `server/.env` after `npm run seed` was run **against the
     production database**. The key is shown nowhere else; ask the project owner for it privately.
   - `API_BASE_URL`: the deployed Express API (the `API_URL` value set in the Vercel project), `https://...`,
     no trailing slash. The firmware posts to `API_BASE_URL + "/device/ping"`.
   - `APN`: your SIM's carrier APN.
3. Flash, open the Serial Monitor at 115200 and look for `[MODEM] Ping accepted (200).`
4. Open the web app: bus 0015 should go live within a few seconds.

| Serial message | Meaning |
| :--- | :--- |
| `No fresh GPS fix; ping skipped` | Normal indoors. Take the GPS antenna near a window or outside. |
| `400: payload rejected` | `SEAT_COUNT` does not match the bus's `seatCount` (40 in the seed). |
| `401` | `DEVICE_ID` / `DEVICE_KEY` wrong, or the seed was run on a different database. |
| `HTTP status 6xx` | Modem-side network, DNS or TLS error. Check the APN and signal. |

## What the prototype reports

- **Seats:** one load cell = seat index `0` (`SENSOR_SEAT_INDEX`). The other 39 seats are always sent as free.
- **Door:** one IR sensor counts entries (`doorIn`). `doorOut` is always 0, so the app's "on board" and
  "standing" numbers only grow until the device restarts.
- **Position:** a ping is only sent with a GPS fix younger than 10 s. Every 5 s cycle is still written to the SD card.

## Hardware Pinout & Wiring

| Module | Module Pin | ESP32 Pin | Logic Level / Notes |
| :--- | :--- | :--- | :--- |
| **NEO-M8N GPS** | VCC | `VIN` (5V) / `3V3` | 3.3V UART signals |
| | GND | `GND` | Common ground |
| | TX | `GPIO 16` | UART1 RX (9600 baud) |
| | RX | `GPIO 17` | UART1 TX |
| **Air780E 4G Cat-1** | VCC / VBAT | **Buck 5V (≥2A)** | Never from the ESP32 3V3 pin (bursts up to 2A) |
| | GND | `GND` | Common ground with ESP32 |
| | TXD | `GPIO 25` | UART2 RX (115200 baud) |
| | RXD | `GPIO 26` | UART2 TX |
| **MicroSD SPI Module** | VCC | `VIN` (5V) / `3V3` | Standard SPI breakout |
| | GND | `GND` | Common ground |
| | SCK | `GPIO 18` | VSPI SCK |
| | MISO | `GPIO 19` | VSPI MISO |
| | MOSI | `GPIO 23` | VSPI MOSI |
| | CS | `GPIO 5` | VSPI Chip Select |
| **HX711 + Load Cell** | VCC | `3V3` | Power with 3.3V to keep DOUT at 3.3V |
| | GND | `GND` | Common ground |
| | DOUT (DT) | `GPIO 32` | Digital Input |
| | SCK | `GPIO 33` | Digital Output |
| **E18-D80NK IR Beam** | Brown (VCC) | Buck 5V | Needs 5V power |
| | Blue (GND) | `GND` | Common ground |
| | Black (OUT) | `GPIO 27` | Active LOW, `INPUT_PULLUP`. Add a diode if the output idles at 5V |

Power: 12V battery → buck converter set to 5.0V → Air780E, E18-D80NK, ESP32 `VIN`. All grounds tied together.

## Libraries
- `TinyGPSPlus` (Mikal Hart)
- `HX711` (Bogdan Necula)
- `SPI` and `SD` (ESP32 core)

Board: **ESP32 Dev Module**.

## MicroSD Data Format
Appended to `/datalog.csv` every 5 seconds:
```csv
timestamp_ms,device_id,gps_valid,lat,lng,speed_kmh,weight_kg,seat_status,door_in,door_out
```
