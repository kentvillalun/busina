import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text } from "react-native";
import { noPad } from "../lib/styles";

// One half of the Northbound / Southbound switch. `item` is { title, hint }.
const DirectionTab = ({ item, selected, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="h-[60px] flex-1 items-center justify-center overflow-hidden rounded-[14px]"
    >
      {selected && (
        <LinearGradient colors={["#3a8fd6", "#165a98"]} style={StyleSheet.absoluteFill} />
      )}
      <Text
        className={`font-sans-bold text-[15px] ${selected ? "text-white" : "text-muted"}`}
        style={noPad}
      >
        {item.title}
      </Text>
      <Text
        className={`font-sans-medium text-[12px] ${selected ? "text-white" : "text-muted"}`}
        style={noPad}
      >
        {item.hint}
      </Text>
    </Pressable>
  );
};

export default DirectionTab;
