# BUSina IoT Hardware Tracker Prototype (ESP32)

Bench prototype firmware for the BUSina transit tracking system.

## Hardware Pinout & Wiring

| Module | Module Pin | ESP32 Pin | Logic Level / Notes |
| :--- | :--- | :--- | :--- |
| **NEO-M8N GPS** | VCC | `VIN` (5V) / `3V3` | 3.3V UART signals |
| | GND | `GND` | Common ground |
| | TX | `GPIO 16` | UART1 RX (9600 baud) |
| | RX | `GPIO 17` | UART1 TX |
| **Air780E 4G Cat-1** | VCC / VBAT | **External 5V/4V (≥2A)** | Needs independent power supply (bursts up to 2A) |
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
| **E18-D80NK IR Beam** | Brown (VCC) | `VIN` (5V) | Needs 5V power |
| | Blue (GND) | `GND` | Common ground |
| | Black (OUT) | `GPIO 27` | Active LOW interrupt (`INPUT_PULLUP`) |

## Setup & Libraries
Install via Arduino IDE or PlatformIO:
- `TinyGPSPlus` (by Mikal Hart)
- `HX711` (by Bogdan Necula)
- Built-in `SPI` and `SD` libraries (ESP32 core)

## MicroSD Data Format
Records are appended to `/datalog.csv` every 5 seconds:
```csv
timestamp_ms,bus_id,lat,lng,speed_kmph,weight_kg,seat_status,pax_count
```

