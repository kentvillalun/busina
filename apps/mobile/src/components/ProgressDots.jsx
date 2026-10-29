import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// One dot: 6 dp round and light when inactive, 22 dp long and blue when active.
// `progress` animates 0 -> 1 so the width and the color change smoothly together.
const Dot = ({ active }) => {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 250 });
  }, [active, progress]);

  const style = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [6, 22]),
    backgroundColor: interpolateColor(progress.value, [0, 1], ["#c9d6e2", "#1f73bd"]),
  }));

  return <Animated.View style={[{ height: 6, borderRadius: 3 }, style]} />;
};

// <ProgressDots step={0} total={3} />
const ProgressDots = ({ step, total }) => {
  return (
    <View className="flex-row items-center gap-[6px]">
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} active={i === step} />
      ))}
    </View>
  );
};

export default ProgressDots;
