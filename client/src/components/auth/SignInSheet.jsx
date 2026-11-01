"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { haptic, hapticTrigger } from "@/lib/haptics";

const spring = { type: "spring", stiffness: 400, damping: 40 };

// Shown to a guest who taps something that needs an account. Same shape as AlertsSheet: a bottom sheet, a centered dialog
// from md up. Placeholder look until the Figma design is final. `next` is where Google sends them back to.
const SignInSheet = ({ open, next, onDismiss }) => {
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
          aria-labelledby="signin-title"
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

            <h2 id="signin-title" className="font-display text-[28px] leading-8.5 text-ink">
              Sign in to continue
            </h2>
            <p className="mt-2.5 text-[15px] leading-5.5 text-muted">
              Sign in with Google to see bus details, save your boarding spot and get an alert when your bus is near.
              You can keep watching the map without an account.
            </p>

            {/* A plain link: the whole page goes to Google and comes back, so the router cannot do it. */}
            <a
              href={`/api/auth/google?next=${encodeURIComponent(next)}`}
              ref={hapticTrigger}
              onClick={() => haptic.medium()}
              className="gradient-button flex items-center justify-center"
            >
              Continue with Google
            </a>
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

export default SignInSheet;
