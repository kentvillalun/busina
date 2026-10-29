"use client";

import { useEffect, useState } from "react";
import IconLocationOff from "@/components/icons/IconLocationOff";
import { haptic, hapticTrigger } from "@/lib/haptics";

// Figma S8 / S9. `permission` is what getLocationPermission() returned.
//  - can still be asked: "Turn on" shows the browser prompt
//  - blocked (the browser will not ask again): the only way back is the site settings, which a
//    web page cannot open, so we explain where to go and offer "Check again" for when they return
//  - the browser has no location at all: nothing to press
// `onCheckAgain` returns the fresh permission, so a check that changed nothing can say so.
const LocationBanner = ({ permission, onTurnOn, onCheckAgain }) => {
  const [stillBlocked, setStillBlocked] = useState(false);

  useEffect(() => {
    if (!stillBlocked) return;
    const timer = setTimeout(() => setStillBlocked(false), 2000);
    return () => clearTimeout(timer);
  }, [stillBlocked]);

  if (!permission || permission.granted) return null;

  const checkAgain = async () => {
    const fresh = await onCheckAgain();
    if (fresh && !fresh.granted) {
      haptic.error();
      setStillBlocked(true);
    }
  };

  let text = "Turn on location to see how long until your bus arrives.";
  let action = { label: "Turn on", onPress: onTurnOn };
  if (!permission.supported) {
    text = "This browser can't share your location, so we can't tell how far the bus is.";
    action = null;
  } else if (!permission.canAskAgain) {
    text = "Location is blocked for this site. Allow it in your browser's site settings.";
    action = { label: stillBlocked ? "Still blocked" : "Check again", onPress: checkAgain };
  }

  return (
    <div className="-mx-2 mt-3 flex items-center gap-3 rounded-[18px] bg-white p-3 shadow-[0_2px_10px_rgba(16,59,96,0.1)]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stage text-navy">
        <IconLocationOff />
      </span>
      <p className="min-w-0 flex-1 text-[13px] leading-[18px] text-ink">{text}</p>
      {action && (
        <button
          type="button"
          ref={hapticTrigger}
          onClick={() => {
            haptic.light();
            action.onPress();
          }}
          className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] font-bold transition-colors ${
            stillBlocked
              ? "bg-line text-navy"
              : "bg-linear-to-b from-primary-light to-primary-dark text-white"
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default LocationBanner;
