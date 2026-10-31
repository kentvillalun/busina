busina

Less guessing, better commuting.

ITSO 2026 · Application Development Using Android Programming · Internet of Things (IoT)

## App Concept Description (Abstract of the Project)

On provincial highways like Laoag to Vigan there are no bus stops or schedules. Commuters wait by the road without knowing if a bus is near or already full. Busina is an installable Android app and an IoT unit that answers both questions. Each bus carries an ESP32 with a GPS module, a door sensor that counts passengers, and a seat sensor. The unit sends its readings to our server over the internet, using a key that belongs to that bus alone. The app shows the bus on a live map, the time range it needs to reach the commuter's boarding spot, which seats are free, and an estimate of how many people are on board. It also notifies the commuter when a bus is near. If a bus stops reporting, the app shows its last known position and says the data is not live.

**Why Busina**

On provincial highways such as the Laoag to Vigan route, there are no dedicated bus stops or staff. Commuters wait roadside and flag down buses that pick up anywhere. They cannot tell how far a bus is or whether it still has seats, so they may wait for a bus that turns out to be full.

**How it works**

Every bus carries a small onboard unit with a GPS module and sensors at the seats and doorway. Readings go to a cloud server, and the commuter app turns them into a live map, arrival times, seats free, and an estimated passenger count.

**Who it is for**

**Commuters** decide whether to wait for a bus, or for the next one, using live location and seat information instead of guessing. **Bus operators** are the customers who avail Busina. Insights that help them plan trips around demand are planned for a later version.

## Hardware and Software Requirements

**On the bus.** A microcontroller (ESP32) reads the sensors and sends the data to the server through a 4G modem (Air780E). A GPS module (NEO-M8N) gives position and speed, a load cell (HX711) shows whether a seat is taken, and an infrared beam sensor (E18-D80NK) at the doorway counts passengers boarding. The unit runs on a 5 V supply from a buck converter, and a microSD card keeps the readings when there is no signal. The prototype has one seat sensor and one door sensor. A simulator that sends the same requests as the unit is used for testing and for the demonstration.

**On the commuter's phone.** An Android smartphone with GPS and internet access, with Android 8.0 (API 26) or later. The app is a Progressive Web App built with Next.js and React, and packaged as an Android APK with PWABuilder (Trusted Web Activity).

**Behind the scenes.** A cloud-hosted REST API (Node.js and Express) and a PostgreSQL database. The web app runs on Vercel and the API on Render. Development uses VS Code, Git and GitHub.

## Product Features

**Live map and arrival time.** See your location and approaching buses on a live map, with the estimated time each bus will reach you.

**Seat availability.** Open a bus to see which seats are free.

**Passenger count.** An estimate of how many people are onboard, including standing riders.

**Seat outlook.** A short note, labeled as an estimate, on whether seats are likely to be left, based on the seats free now.

**Near-bus notification.** Get notified when a bus is near, with its arrival time and seats free.

**Signal-lost handling.** When a bus stops reporting for 30 seconds, the app shows its last known position and marks the seat and passenger data as not live, instead of presenting old data as live.

**Operator insights.** Planned. Operators will see which departures run full or nearly empty, to help plan trips.

## Screenshots and Brief Description

**Screens for commuters**

[image: live map and the list of buses]
**Figure 1. Live map and nearby buses**
Commuters see their location and approaching buses, then open the list to compare each bus's arrival time and seats free.

[image: bus details and the notification]
**Figure 2. Bus details and near-bus alerts**
Commuters check a bus's seat map and estimated passengers, and get a notification when it is near.

[image: bus details with signal lost, and the map with the last known position]
**Figure 3. Signal-lost handling**
When a bus stops reporting, the app shows its last known position and marks the seat and passenger data as not live.

[image: lock screen notification]
**Figure 4. Near-bus notification**
Commuters get a notification when a bus is near their boarding spot, with its arrival time and seats free.
