import { useMemo, useRef } from "react";
import { PanResponder, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const PEEK_HEIGHT = 260; // visible when collapsed: handle + header + one card (~160) + the nav pill area

// A sheet pinned to the bottom. `y` is how far it is pushed down: 0 = fully open, collapsedY = peeking.
// Only the handle area is draggable, so it never fights with scrolling the content.
// `onExpandedChange(true)` fires when the handle is touched and when the sheet settles open;
// `onExpandedChange(false)` when it settles collapsed.
const BottomSheet = ({ children, onExpandedChange }) => {
  const { height } = useWindowDimensions();
  const sheetHeight = Math.round(height * 0.7);
  const collapsedY = sheetHeight - PEEK_HEIGHT;

  const y = useSharedValue(collapsedY);
  const startY = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startY.current = y.value;
          onExpandedChange?.(true); // show the full list as soon as the handle is touched
        },
        onPanResponderMove: (_, gesture) => {
          y.value = Math.min(Math.max(startY.current + gesture.dy, 0), collapsedY);
        },
        onPanResponderRelease: (_, gesture) => {
          // vy is the release speed: a quick flick counts even if you did not drag past the middle
          const open = y.value + gesture.vy * 200 <= collapsedY / 2;
          y.value = withSpring(open ? 0 : collapsedY, { damping: 20 });
          onExpandedChange?.(open);
        },
      }),
    [collapsedY, onExpandedChange, y],
  );

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: sheetHeight,
          paddingHorizontal: 16,
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderWidth: 0,
        },
        animatedStyle,
      ]}
    >
      <View {...panResponder.panHandlers} className="items-center py-3">
        <View className="h-[5px] w-[40px] rounded-[3px] bg-line" />
      </View>
      {children}
    </Animated.View>
  );
};

export default BottomSheet;
