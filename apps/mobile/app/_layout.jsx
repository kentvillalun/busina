import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque";

export default function RootLayout() {
  const [fontLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMSans_600SemiBold,
    BricolageGrotesque_800ExtraBold,
  });

  if (!fontLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
