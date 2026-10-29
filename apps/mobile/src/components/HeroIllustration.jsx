import { Text, View } from "react-native";
import HeroBg from "./svg/HeroBg";
import PulseRing from "./PulseRing";

// Fixed 350 x 380 stage. Every left/top below comes from the Figma "O1" frame.
// The outer card clips and centers it, so it still looks right on narrower phones.
const shadow = {
  shadowColor: "#103b60",
  shadowOpacity: 0.18,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 7,
  elevation: 5,
};

// Center of the "You" dot, used to place the halo and pulse rings.
const YOU = { x: 73.6, y: 265.2 };

const HeroIllustration = () => {
  return (
    <View className="h-[380px] w-[350px]">
      {/* road, dashed centre line and the blue route (exported from Figma) */}
      {/* canvas is 120 dp wider on each side so the road keeps going past the stage
          (also when the stage is scaled down); the rounded card does the clipping */}
      <View style={{ position: "absolute", left: -120, top: 0 }}>
        <HeroBg width={590} height={380} viewBox="-120 0 590 380" />
      </View>

      {/* static halo + two pulse rings, so the dot is never "empty" between ripples */}
      <View
        style={{
          position: "absolute",
          left: YOU.x - 48,
          top: YOU.y - 48,
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: "rgba(146, 206, 255, 0.35)",
        }}
      />
      <PulseRing
        size={96}
        style={{ left: YOU.x - 48, top: YOU.y - 48 }}
      />
      <PulseRing
        size={96}
        delay={1100}
        style={{ left: YOU.x - 48, top: YOU.y - 48 }}
      />

      {/* "You" dot: 22 dp blue fill inside a 4 dp white ring */}
      <View
        className="absolute h-[30px] w-[30px] rounded-full border-4 border-white bg-primary"
        style={{ left: YOU.x - 15, top: YOU.y - 15 }}
      />

      {/* "You" pill */}
      <View
        className="absolute h-[26px] w-[42px] items-center justify-center rounded-full bg-navy"
        style={{ left: 52.6, top: 208.2 }}
      >
        <Text className="font-sans-bold text-[12px] text-white">You</Text>
      </View>

      {/* bus 087 marker */}
      <View
        className="absolute h-[34px] w-[52px] items-center justify-center rounded-[12px] bg-white"
        style={[{ left: 281.6, top: 86.2 }, shadow]}
      >
        <Text className="font-sans-bold text-[15px] text-muted">087</Text>
      </View>

      {/* bus 214 marker (selected): blue pill with a white 3 dp border */}
      <View
        className="absolute h-[53px] w-[73px] items-center justify-center rounded-[19px] border-[3px] border-white bg-primary"
        style={[{ left: 170, top: 147 }, shadow]}
      >
        <Text className="font-sans-bold text-[22px] text-white">214</Text>
      </View>

      {/* line connecting the chip to the 214 marker */}
      <View
        className="absolute h-[39px] w-[2px] bg-navy"
        style={{ left: 205.2, top: 110, opacity: 0.45 }}
      />

      {/* info chip: bus, ETA, seats */}
      <View
        className="absolute w-[117px] rounded-[16px] bg-white px-[14px] py-[11px]"
        style={[{ left: 147.7, top: 22 }, shadow]}
      >
        <Text className="font-sans-medium text-[12px] text-muted">Bus 214</Text>
        <Text className="font-display text-[26px] leading-[30px] text-navy">
          12 min
        </Text>
        <View className="mt-[2px] flex-row items-center gap-[6px]">
          <View className="h-[8px] w-[8px] rounded-full bg-success" />
          <Text className="font-sans-bold text-[12px] text-success">
            18 seats free
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HeroIllustration;
