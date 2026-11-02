"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { haptic, hapticTrigger } from "@/lib/haptics";

const spring = { type: "spring", stiffness: 400, damping: 40 };

// Asks, in plain words, before anything about where the commuter waits reaches a driver. A bottom sheet on a phone and a
// centered dialog from md up, like AlertsSheet. "Not now" changes nothing: alerts keep working.
const ShareSheet = ({ open, busy = false, onShare, onDismiss }) => {
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
          aria-labelledby="share-title"
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

            <h2 id="share-title" className="font-display text-[28px] leading-8.5 text-ink">
              Let drivers see you&apos;re waiting?
            </h2>
            <p className="mt-2.5 text-[15px] leading-5.5 text-muted">
              Drivers of buses heading your way will see an anonymous marker where you wait, so they can expect a passenger. It shows
              a number and a distance, never your name.
            </p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm font-medium text-ink">
              <li>Lasts 30 minutes, then it disappears.</li>
              <li>Stop any time in Settings &gt; Alerts.</li>
              <li>Signing out stops it too.</li>
            </ul>

            <button
              type="button"
              ref={hapticTrigger}
              disabled={busy}
              onClick={() => {
                haptic.medium();
                onShare();
              }}
              className="gradient-button disabled:opacity-60"
            >
              {busy ? "Sharing..." : "Share with drivers"}
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

export default ShareSheet;
