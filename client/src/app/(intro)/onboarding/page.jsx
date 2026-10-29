"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import AlertsScene from "@/components/onboarding/AlertsScene";
import BusNearScene from "@/components/onboarding/BusNearScene";
import SceneStage from "@/components/onboarding/SceneStage";
import WaitScene from "@/components/onboarding/WaitScene";
import { haptic } from "@/lib/haptics";
import { askAlerts, askLocation } from "@/lib/permissions";

const steps = [
  {
    heading: (
      <>
        Is the bus <span className="text-primary">near</span>?<br />
        Is there a <span className="text-primary">seat</span>?
      </>
    ),
    body: "See where your bus is and how many seats are left, before it reaches you.",
    primary: "Continue",
    label: "1 of 3",
    Scene: BusNearScene,
  },
  {
    heading: (
      <>
        Know how long
        <br />
        you&apos;ll <span className="text-primary">wait</span>
      </>
    ),
    body: "Busina uses your location to show how long until a bus reaches you. Only while the app is open.",
    primary: "Show buses near me",
    secondary: "Not now",
    onPrimary: askLocation, // asks for the location permission, then moves on
    label: "2 of 3",
    Scene: WaitScene,
  },
  {
    heading: (
      <>
        Never miss
        <br />
        your <span className="text-primary">bus</span>
      </>
    ),
    body: "We’ll tell you when your bus is close, so you don’t have to keep watching the map. Then you’re all set.",
    primary: "Turn on alerts & start",
    secondary: "Start without alerts",
    onPrimary: askAlerts, // asks to show notifications, then finishes
    label: "Last step",
    Scene: AlertsScene,
  },
];

// Fades in while sliding up a little; `delay` staggers the title, the text and the button.
const FadeUp = ({ delay, className, children }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

// The active dot is long and blue; the others are small and light.
const Dots = ({ step }) => (
  <div className="flex items-center gap-1.5">
    {steps.map((_, i) => (
      <motion.div
        key={i}
        className="h-1.5 rounded-full"
        initial={false}
        animate={{
          width: i === step ? 22 : 6,
          backgroundColor: i === step ? "#1f73bd" : "#c9d6e2",
        }}
        transition={{ duration: 0.25 }}
      />
    ))}
  </div>
);

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const finish = () => router.replace("/home");

  const advance = () => {
    if (isLast) finish();
    else setStep(step + 1);
  };

  const next = () => {
    haptic.light();
    advance();
  };

  // Main button: ask for the permission of this step (if it has one), then continue whatever the
  // user answered. A second tap is blocked while the browser prompt is open: `busyRef` stops it
  // right away, `busy` only dims the button.
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const handlePrimary = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    haptic.light();
    setBusy(true);
    try {
      await current.onPrimary?.();
    } catch (error) {
      console.warn("permission request failed:", error);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    advance();
  };

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (hasSeen) {
      finish();
    }
  }, []);

  return (
    <Page className="bg-white">
      {/* Full-screen scroll area with no top bar and no sidebar. If the screen is very short, it scrolls. */}
      <PageContent
        top="top-0"
        withBottomNav={false}
        className="h-dvh items-center gap-0 p-0 md:h-dvh md:pl-0"
      >
        <div className="flex min-h-150 w-full max-w-107.5 flex-1 flex-col md:max-w-5xl">
          <header className="flex items-center justify-between px-6 pt-[max(1rem,env(safe-area-inset-top))] md:px-10 md:pt-8">
            <img src="/logo.svg" alt="Busina" width={132} height={43} />
            <button
              type="button"
              onClick={() => {
                haptic.light();
                localStorage.setItem("hasSeenOnboarding", "true")
                finish();
              }}
              className={`${isLast ? "invisible" : ""} py-2 pl-4 text-[15px] font-medium text-muted`}
            >
              Skip
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:content-center md:items-center md:gap-x-10 lg:gap-x-14 md:px-10">
            <div className="flex flex-1 flex-col justify-center md:contents">
              <div className="max-h-99 min-h-44 flex-1 overflow-hidden md:col-start-1 md:row-span-2 md:h-[min(520px,70dvh)] md:max-h-none md:flex-none">
                <motion.div
                  className="flex h-full"
                  animate={{ x: `${-step * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {steps.map((item, i) => (
                    <div key={i} className="h-full min-w-full px-6 pt-4 md:p-0">
                      <SceneStage maxScale={1.3} className="h-full w-full">
                        <item.Scene active={step >= i} />
                      </SceneStage>
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="mt-7 min-h-37.5 px-6 md:col-start-2 md:row-start-1 md:mt-0 md:min-h-0 md:self-end md:px-0 md:pb-8">
                <FadeUp key={`title-${step}`} delay={0.35}>
                  <h1 className="font-display text-[clamp(26px,8vw,32px)] leading-[1.2] text-ink md:text-[34px] md:leading-[1.15] lg:text-[44px] lg:leading-[1.1]">
                    {current.heading}
                  </h1>
                </FadeUp>
                <FadeUp key={`body-${step}`} delay={0.45}>
                  <p className="mt-3 text-[15px] leading-6 text-muted md:mt-4 md:max-w-md md:text-lg md:leading-7">
                    {current.body}
                  </p>
                </FadeUp>
              </div>
            </div>

            <footer className="px-6 pb-[max(1rem,env(safe-area-inset-bottom))] md:col-start-2 md:row-start-2 md:self-start md:px-0 md:pb-0">
              <div className="flex items-center gap-3">
                <Dots step={step} />
                <span
                  className={`text-xs font-bold ${isLast ? "text-primary" : "text-muted"}`}
                >
                  {current.label}
                </span>
              </div>

              <FadeUp
                key={`button-${step}`}
                delay={0.55}
                className="md:max-w-sm"
              >
                <button
                  type="button"
                  onClick={handlePrimary}
                  disabled={busy}
                  className="gradient-button active:opacity-80 disabled:opacity-50"
                >
                  {current.primary}
                </button>

                {current.secondary ? (
                  <button
                    type="button"
                    onClick={next}
                    className="mt-3 w-full py-2 text-center text-[15px] font-bold text-muted"
                  >
                    {current.secondary}
                  </button>
                ) : (
                  <div className="h-12.5" />
                )}
              </FadeUp>
            </footer>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
