import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// PLACEHOLDER: the real settings screen (Figma S12) replaces this.
export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-stage">
      <View className="px-6 pt-2">
        <Text className="font-display text-[26px] text-ink">Settings</Text>
        <Text className="mt-2 font-sans text-[14px] text-muted">Coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}
