// Copy this file to secrets.h (same folder) and fill in the real values.
// secrets.h is git-ignored: never commit the device key or Wi-Fi password.
#pragma once

// 1. Wi-Fi / Phone Hotspot credentials (used when USE_WIFI_HOTSPOT is true)
#define WIFI_SSID    "Your-Phone-Hotspot-Name"
#define WIFI_PASS    "Your-Hotspot-Password"

// 2. From server/.env after `npm run seed` (DEVICE_ID and DEVICE_KEY). The seed bus is esp32-0015.
#define DEVICE_ID    "esp32-0015"
#define DEVICE_KEY   "paste-the-64-char-hex-key-here"

// 3. The deployed Express API or Vercel proxy (no trailing slash).
#define API_BASE_URL "https://gobusina.vercel.app/api"

// 4. Cellular APN (used if USE_WIFI_HOTSPOT is false and Air780E is active)
// Smart / TNT: "internet"   Globe / TM: "internet.globe.com.ph"   DITO: "internet.dito.ph"
#define APN          "internet"
