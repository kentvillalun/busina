import { useState } from "react";
import { View } from "react-native";
import HeroIllustration from "./HeroIllustration";

// The illustrations are designed on a fixed 350 x 380 stage.
const STAGE_W = 350;
const STAGE_H = 380;

// A card that takes whatever space it is given (so it can shrink on short phones)
// and scales the illustration down to fit, never up.
// Pass a scene as children (HeroLocation, HeroAlerts, ...); defaults to the O1 scene.
export default function HeroCard({ className = "", children }) {
  const [size, setSize] = useState(null);

  const scale = size
    ? Math.min(1, size.height / STAGE_H, size.width / (STAGE_W - 10))
    : 1;

  return (
    <View
      className={`overflow-hidden rounded-[28px] bg-stage ${className}`}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ width, height });
      }}
    >
      {size && (
        <View
          style={{
            position: "absolute",
            left: (size.width - STAGE_W) / 2,
            top: (size.height - STAGE_H) / 2,
            width: STAGE_W,
            height: STAGE_H,
            // transforms scale around the center, so the stage stays centered in the card
            transform: [{ scale }],
          }}
        >
          {children ?? <HeroIllustration />}
        </View>
      )}
    </View>
  );
}
