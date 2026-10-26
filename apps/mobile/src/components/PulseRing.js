import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// A circle that grows and fades out on repeat (a ripple).
// `delay` lets several rings overlap so they read as a wave.
export default function PulseRing({
  size = 96,
  delay = 0,
  duration = 2200,
  color = "rgba(31, 115, 189, 0.35)",
  style,
}) {
  // 0 -> 1 over `duration`, then jumps back to 0 and repeats forever.
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.out(Easing.quad) }),
        -1, // repeat forever
        false, // restart from 0 instead of reversing
      ),
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.45 + progress.value * 1.05 }], // 0.45 -> 1.5
    opacity: 1 - progress.value, // fades out as it grows
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}
