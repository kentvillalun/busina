# Seat count on the device

`Bus.seatCount` is the real number of seats of a bus, and the operator can change it (Buses, Edit bus, Total seats, 1 to 40).
The API is strict about it: `POST /device/ping` is refused with `400 SEAT_COUNT_MISMATCH` unless `seats` has exactly that many
entries. The number is strict because "full, with people standing" is decided against it (people on board above the seats).

The firmware does not have to hard-code the number. The API tells it.

## What the API sends back

| Ping answer | Body |
| :--- | :--- |
| `200` accepted | `{"ok":true,"seatCount":4}` |
| `400` wrong number of seats | `{"error":{"code":"SEAT_COUNT_MISMATCH","message":"seats must have exactly 4 entries","details":{"seatCount":4}}}` |

Both contain the text `"seatCount":4`.

## What the firmware needs to do (`busina_prototype.ino`)

1. Replace the constant `SEAT_COUNT` with a variable, `uint8_t seatCount`, that starts at a default (the last known value from the
   SD card, or 40) and is used by `buildPayload` for the length of `seats`.
2. After `+HTTPACTION: 1,<status>,<length>` with status `200` or `400`, read the body with `AT+HTTPREAD=0,<length>` before
   `AT+HTTPTERM`.
3. Find `"seatCount":` in what came back, read the integer after it, and accept it when it is from 1 to 40. If it differs from
   `seatCount`, set the variable (and save it to the SD card so a reboot starts with it).

A wrong first guess costs one ping: it is refused with the right number, the device adopts it, and the next ping is accepted.
When the operator changes the total seats, the same happens once, about one ping interval later; until then the bus shows
"No signal yet" because the old seat reading is cleared.

`SENSOR_SEAT_INDEX = 0` is seat 1, and seat 1 is drawn in the **front** row of the bus map.
