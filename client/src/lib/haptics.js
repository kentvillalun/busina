import { haptics } from "bzzz";

// Android and other phones that can vibrate: call haptic.light() (and the others) from a handler.
// iPhone: a haptic only fires from a real tap on a switch, so code cannot trigger it. Put
// ref={hapticTrigger} on the button instead; it does nothing on other devices.
export { hapticTrigger } from "ios-haptics";

const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

// Skipped on iPhone, where hapticTrigger already does it (otherwise a tap would buzz twice).
const play = (fn) => () => {
  if (!isIOS()) fn();
};

export const haptic = {
  light: play(() => haptics.selection()), // casual navigation, Next, back buttons
  medium: play(() => haptics.snap()), // confirmations, Continue, form submit
  success: play(() => haptics.success()), // something finished
  error: play(() => haptics.error()), // validation error, network fail
  warning: play(() => haptics.toggle()), // confirmation modal, destructive action
};
