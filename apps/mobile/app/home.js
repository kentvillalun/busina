import { router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TextButton from "../src/components/TextButton";
import { resetOnboarding } from "../src/lib/storage";

// PLACEHOLDER: the real home (S1 map view with the bus list) replaces this.
export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="font-display text-[32px] text-ink">Home</Text>
        <Text className="font-sans text-base text-muted">
          Placeholder for the map view.
        </Text>

        {/* development only: see the onboarding again */}
        {__DEV__ && (
          <TextButton
            title="Reset onboarding (dev)"
            onPress={async () => {
              await resetOnboarding();
              router.replace("/");
            }}
            className="mt-8"
          />
        )}
      </View>
    </SafeAreaView>
  );
}
