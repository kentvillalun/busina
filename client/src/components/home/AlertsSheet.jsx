"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import AlertsScene from "@/components/onboarding/AlertsScene";
import { haptic, hapticTrigger } from "@/lib/haptics";

const spring = { type: "spring", stiffness: 400, damping: 40 };

// The onboarding scene is drawn 350 wide; the part that matters (the notification over the road)
// starts 100px down. The hero shows that window, scaled down when the sheet is narrower.
const SCENE_W = 350;
const SCENE_CROP_TOP = 100;

const Hero = ({ open }) => {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / (SCENE_W - 8)));
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative h-47.5 overflow-hidden rounded-[28px] bg-stage">
      <div
        className="absolute left-1/2 top-0"
        style={{
          transform: `translate(-50%, ${-SCENE_CROP_TOP * scale}px) scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <AlertsScene active={open} showBus={false} />
      </div>
    </div>
  );
};

// Figma S10: asks to turn on notifications. The phone's own prompt only appears after "Alert me".
// On md and up it is a centered dialog instead of a bottom sheet.
const AlertsSheet = ({ open, busy = false, onAllow, onDismiss }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && onDismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="alerts-title"
          className="fixed inset-0 z-60 flex items-end justify-center md:items-center"
        >
          <motion.div
            className="absolute inset-0 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
          />

          <motion.div
            className="relative w-full max-w-md rounded-t-4xl bg-white px-6 pb-[calc(32px+env(safe-area-inset-bottom))] pt-3 md:rounded-4xl md:pb-8"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring}
          >
            <span className="mx-auto mb-4.25 block h-1.25 w-10 rounded-[3px] bg-line md:hidden" />

            <Hero open={open} />

            <h2 id="alerts-title" className="mt-6 font-display text-[28px] leading-8.5 text-ink">
              Never miss your bus
            </h2>
            <p className="mt-2.5 text-[15px] leading-5.5 text-muted">
              We&apos;ll alert you when this bus is close to your boarding spot, so you don&apos;t
              have to keep watching the map.
            </p>

            <button
              type="button"
              ref={hapticTrigger}
              disabled={busy}
              onClick={() => {
                haptic.medium();
                onAllow();
              }}
              className="gradient-button disabled:opacity-60"
            >
              Alert me when it&apos;s near
            </button>
            <button
              type="button"
              ref={hapticTrigger}
              onClick={() => {
                haptic.light();
                onDismiss();
              }}
              className="mt-1 w-full py-3 text-center text-[15px] font-bold text-muted"
            >
              Not now
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AlertsSheet;
