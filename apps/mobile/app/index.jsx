import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { getOnboardingDone } from "../src/lib/storage";

// Entry point: decides where to send the user.
//   already saw the onboarding -> /home
//   first time (or storage empty) -> /onboarding
export default function Index() {
  // null = still reading the phone's storage
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    getOnboardingDone().then(setOnboardingDone);
  }, []);

  // a blank white screen for the split second while the flag is being read
  if (onboardingDone === null) return <View className="flex-1 bg-white" />;

  return <Redirect href={onboardingDone ? "/home" : "/onboarding"} />;
}
