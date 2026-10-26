import { Text, View } from "react-native";
import RoadBg from "./svg/RoadBg";

// Shared pieces for the onboarding illustrations (all on the 350 x 380 stage).

export const shadow = {
  shadowColor: "#103b60",
  shadowOpacity: 0.18,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 7,
  elevation: 5,
};

// White road + dashed centre line. The canvas is 120 dp wider on each side so the road
// keeps going past the stage (also when the stage is scaled down); the card clips it.
export function RoadBase() {
  return (
    <View style={{ position: "absolute", left: -120, top: 0 }}>
      <RoadBg width={590} height={380} viewBox="-120 0 590 380" />
    </View>
  );
}

// The blue "214" pill used in the small markers.
export function BusMarker({ left, top, label = "214" }) {
  return (
    <View
      style={[
        {
          position: "absolute",
          left,
          top,
          backgroundColor: "#1f73bd",
          borderWidth: 3,
          borderColor: "#ffffff",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 7,
        },
        shadow,
      ]}
    >
      <Text
        className="font-sans-bold text-white"
        style={{ fontSize: 15, includeFontPadding: false }}
      >
        {label}
      </Text>
    </View>
  );
}

// "You" dot: 22 dp blue fill inside a 4 dp white ring, centered on (x, y).
export function YouDot({ x, y }) {
  return (
    <View
      className="absolute h-[30px] w-[30px] rounded-full border-4 border-white bg-primary"
      style={{ left: x - 15, top: y - 15 }}
    />
  );
}

// A soft circle centered on (x, y).
export function Halo({ x, y, size, color }) {
  return (
    <View
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}
