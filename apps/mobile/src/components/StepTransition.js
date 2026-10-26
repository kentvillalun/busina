import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";

// Wrap anything that changes with the step. When `stepKey` changes React mounts a new
// view, and the `entering` animation plays on it (fade + slide in from the right).
//
//   <StepTransition stepKey={step}>...heading + body...</StepTransition>
//   <StepTransition stepKey={step} kind="fade">...illustration...</StepTransition>
export default function StepTransition({
  stepKey,
  kind = "slide",
  delay = 0,
  className = "",
  children,
}) {
  const entering =
    kind === "fade"
      ? FadeIn.duration(350).delay(delay)
      : FadeInRight.duration(350).delay(delay);

  return (
    <Animated.View key={stepKey} entering={entering} className={className}>
      {children}
    </Animated.View>
  );
}
