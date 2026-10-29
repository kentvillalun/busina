import { Text, View } from "react-native";
import PulseRing from "./PulseRing";
import { BusMarker, Halo, RoadBase, YouDot, shadow } from "./heroParts";

// O2 "Know how long you'll wait": you in the middle of two halos, bus 214 up the road.
const YOU = { x: 175, y: 195 };

const HeroLocation = () => {
  return (
    <View className="h-[380px] w-[350px]">
      <RoadBase />

      {/* route from you up to the bus: 161 x 7 bar, centered at (241.3, 149.1), -34.7 deg */}
      <View
        style={{
          position: "absolute",
          left: 241.3 - 161.276 / 2,
          top: 149.1 - 3.5,
          width: 161.276,
          height: 7,
          borderRadius: 3.5,
          backgroundColor: "#1f73bd",
          transform: [{ rotate: "-34.7deg" }],
        }}
      />

      <BusMarker left={283.6} top={86.2} />

      {/* two static halos, with slow pulse rings expanding from the outer one */}
      <Halo x={YOU.x} y={YOU.y} size={200} color="rgba(146, 206, 255, 0.22)" />
      <Halo x={YOU.x} y={YOU.y} size={124} color="rgba(146, 206, 255, 0.35)" />
      <PulseRing
        size={200}
        duration={2600}
        color="rgba(31, 115, 189, 0.16)"
        style={{ left: YOU.x - 100, top: YOU.y - 100 }}
      />
      <PulseRing
        size={200}
        duration={2600}
        delay={1300}
        color="rgba(31, 115, 189, 0.16)"
        style={{ left: YOU.x - 100, top: YOU.y - 100 }}
      />

      <YouDot x={YOU.x} y={YOU.y} />

      {/* "You" pill */}
      <View
        className="absolute h-[26px] w-[42px] items-center justify-center rounded-full bg-navy"
        style={{ left: 154, top: 146 }}
      >
        <Text
          className="font-sans-bold text-[12px] text-white"
          style={{ includeFontPadding: false }}
        >
          You
        </Text>
      </View>

      {/* line from the chip up toward the route */}
      <View
        className="absolute h-[27px] w-[2px] bg-navy"
        style={{ left: 248.1, top: 146.7, opacity: 0.45 }}
      />

      {/* "Your wait" chip */}
      <View
        className="absolute rounded-[16px] bg-white px-[14px] py-[11px]"
        style={[{ left: 195.6, top: 173.7 }, shadow]}
      >
        <Text
          className="font-sans-medium text-[12px] text-muted"
          style={{ includeFontPadding: false }}
        >
          Your wait
        </Text>
        <Text
          className="font-display text-[26px] leading-[30px] text-navy"
          style={{ includeFontPadding: false }}
        >
          12 min
        </Text>
      </View>
    </View>
  );
};

export default HeroLocation;
