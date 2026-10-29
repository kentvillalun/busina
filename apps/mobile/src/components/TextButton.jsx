import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";

// Quiet secondary action like "Not now" or "Skip".
// Usage: <TextButton title="Not now" onPress={...} />
const TextButton = ({ title, onPress, bold = true, className = "" }) => {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={12}
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      className={`items-center justify-center active:opacity-60 ${className}`}
    >
      <Text
        className={`${bold ? "font-sans-bold" : "font-sans-medium"} text-muted`}
        style={{ fontSize: 15, includeFontPadding: false }}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default TextButton;
