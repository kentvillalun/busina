import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text } from "react-native";

// The blue gradient button used for the main action on every screen.
// Usage: <PrimaryButton title="Continue" onPress={...} />
export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  className = "",
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        // a light tap you can feel on a real phone (the emulator does not vibrate)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      disabled={disabled}
      // overflow-hidden + rounded clips the gradient to the rounded corners
      className={`overflow-hidden rounded-[18px] active:opacity-80 ${
        disabled ? "opacity-50" : ""
      } ${className}`}
    >
      <LinearGradient
        colors={["#3a8fd6", "#165a98"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ height: 56, alignItems: "center", justifyContent: "center" }}
      >
        <Text className="font-sans-bold text-base text-white">{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}
