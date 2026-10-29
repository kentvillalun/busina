import { Pressable, Text } from "react-native";

// One button of the bottom nav. `TabTrigger asChild` passes isFocused, onPress and href in `props`,
// so they must reach the Pressable or the tab will not switch.
const BottomNavItem = ({ isFocused, label, SolidIcon, OutlineIcon, ...props }) => {
  const Icon = isFocused ? SolidIcon : OutlineIcon;

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      className={`h-[44px] flex-row items-center justify-center gap-2 rounded-full active:opacity-70 ${
        isFocused ? "bg-stage px-4" : "px-[14px]"
      }`}
    >
      <Icon color={isFocused ? "#103b60" : "#4a5b6b"} />
      {isFocused && (
        <Text
          className="font-sans-bold text-[14px] text-navy"
          style={{ includeFontPadding: false }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

export default BottomNavItem;
