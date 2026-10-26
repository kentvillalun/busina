import AsyncStorage from "@react-native-async-storage/async-storage";

// Small wrapper around AsyncStorage (the phone's local key-value storage, like localStorage).
// Values are stored as strings; storage can fail, so every call is wrapped and never throws.

const KEYS = {
  onboardingDone: "busina:onboardingDone",
};

export async function getOnboardingDone() {
  try {
    return (await AsyncStorage.getItem(KEYS.onboardingDone)) === "true";
  } catch (error) {
    console.warn("could not read onboarding flag:", error);
    return false; // if storage fails, show onboarding rather than skipping it
  }
}

export async function setOnboardingDone() {
  try {
    await AsyncStorage.setItem(KEYS.onboardingDone, "true");
  } catch (error) {
    console.warn("could not save onboarding flag:", error);
  }
}

// For development: forget that onboarding was seen.
export async function resetOnboarding() {
  try {
    await AsyncStorage.removeItem(KEYS.onboardingDone);
  } catch (error) {
    console.warn("could not reset onboarding flag:", error);
  }
}
