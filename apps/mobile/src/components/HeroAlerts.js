import { Text, View } from "react-native";
import AppIcon from "./svg/AppIcon";
import { BusMarker, RoadBase } from "./heroParts";

// O3 "Never miss your bus": a notification preview floating over the road.
// Exact Figma sizes (decimals) go in `style`; NativeWind ignores decimal arbitrary values.
export default function HeroAlerts() {
  return (
    <View className="h-[380px] w-[350px]">
      <RoadBase />

      <BusMarker left={268} top={67} />

      {/* notification preview */}
      <View
        style={{
          position: "absolute",
          left: 14,
          top: 165,
          width: 321.64,
          flexDirection: "row",
          gap: 10.32,
          paddingHorizontal: 13.76,
          paddingVertical: 12.04,
          borderRadius: 20.64,
          backgroundColor: "#fbfcfe",
          shadowColor: "#0f2133",
          shadowOpacity: 0.28,
          shadowOffset: { width: 0, height: 6.88 },
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <AppIcon width={34.4} height={34.4} />
        <View style={{ flex: 1, gap: 2.58 }}>
          <Text
            className="font-sans-medium text-muted"
            style={{ fontSize: 10.32, includeFontPadding: false }}
          >
            {"Busina  ·  now"}
          </Text>
          <Text
            className="font-sans-bold text-ink"
            style={{ fontSize: 12.9, includeFontPadding: false }}
          >
            Bus 214 is about 2 min away
          </Text>
          <Text
            className="font-sans text-muted"
            style={{ fontSize: 11.18, includeFontPadding: false }}
          >
            9 of 40 seats free now. You will likely still get a seat. Tap to
            view.
          </Text>
        </View>
      </View>
    </View>
  );
}
