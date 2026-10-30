// Copy this file to secrets.h (same folder) and fill in the real values.
// secrets.h is git-ignored: never commit the device key.
#pragma once

// From server/.env after `npm run seed` (DEVICE_ID and DEVICE_KEY). The seed bus is esp32-0015.
#define DEVICE_ID    "esp32-0015"
#define DEVICE_KEY   "paste-the-64-char-hex-key-here"

// The deployed Express API (the same value as API_URL in the Vercel project settings), no trailing slash.
#define API_BASE_URL "https://your-api-host.example.com"

// Smart / TNT: "internet"   Globe / TM: "internet.globe.com.ph"   DITO: "internet.dito.ph"
#define APN          "internet"

