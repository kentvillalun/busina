import { requireOptionalNativeModule } from "expo";
import * as Location from "expo-location";
import { Linking, Platform } from "react-native";

// Every function returns a plain object, so screens never need to know the Expo API.
// Foreground location only: the buses report their own GPS, so the app never needs
// to track the commuter in the background.

// --- Location -------------------------------------------------------------

// Ask for location while the app is open. Safe to call more than once: Android only
// shows the dialog while the system still allows it (`canAskAgain`).
export async function askLocation() {
  const res = await Location.requestForegroundPermissionsAsync();
  return { granted: res.granted, canAskAgain: res.canAskAgain };
}

// Read the current location permission without prompting (for the "location off" /
// "location blocked" states on the map screen).
export async function getLocationPermission() {
  const res = await Location.getForegroundPermissionsAsync();
  return { granted: res.granted, canAskAgain: res.canAskAgain };
}

// --- Notifications --------------------------------------------------------

// expo-notifications has native code that Expo Go does not include, so importing it at
// the top of the file would crash the whole app in Expo Go. Load it only when needed and
// report `available: false` if it is missing (works in a development build / the APK).
// The check uses requireOptionalNativeModule, which returns null instead of throwing.
// (A try/catch around require() is not enough: in dev, Metro still shows a red screen.)
const NOTIFICATION_NATIVE_MODULES = [
  "ExpoNotificationPermissionsModule",
  "ExpoNotificationChannelManager",
  "ExpoTopicSubscriptionModule",
];

function loadNotifications() {
  const missing = NOTIFICATION_NATIVE_MODULES.filter(
    (name) => !requireOptionalNativeModule(name),
  );
  if (missing.length > 0) {
    console.warn("Notifications are not available in this build (Expo Go). Missing:", missing.join(", "));
    return null;
  }
  return require("expo-notifications");
}

// Ask to show notifications.
export async function askAlerts() {
  const Notifications = loadNotifications();
  if (!Notifications) return { granted: false, canAskAgain: true, available: false };

  // Android 13+: the permission prompt does not appear until a channel exists.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Bus alerts",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const res = await Notifications.requestPermissionsAsync();
  return { granted: res.granted, canAskAgain: res.canAskAgain, available: true };
}

export async function getAlertsPermission() {
  const Notifications = loadNotifications();
  if (!Notifications) return { granted: false, canAskAgain: true, available: false };

  const res = await Notifications.getPermissionsAsync();
  return { granted: res.granted, canAskAgain: res.canAskAgain, available: true };
}

// --- Settings -------------------------------------------------------------

// When the dialog can no longer be shown (canAskAgain is false) the only way
// forward is the system settings screen for this app.
export function openAppSettings() {
  return Linking.openSettings();
}
