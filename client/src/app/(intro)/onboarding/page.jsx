"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageContent } from "@/components/layout/PageContent";
import AlertsScene from "@/components/onboarding/AlertsScene";
import BusNearScene from "@/components/onboarding/BusNearScene";
import SceneStage from "@/components/onboarding/SceneStage";
import WaitScene from "@/components/onboarding/WaitScene";
import { haptic } from "@/lib/haptics";

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
  <div className="flex items-center gap-[6px]">
    {steps.map((_, i) => (
      <motion.div
        key={i}
        className="h-[6px] rounded-full"
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

  // `replace`, not `push`, so the back button cannot return to the onboarding.
  // TODO (you): remember that onboarding was seen before leaving, and decide where to go.
  const finish = () => router.replace("/home");

  useEffect

  const next = () => {
    haptic.light();
    if (isLast) finish();
    else setStep(step + 1);
  };

  return (
    <Page className="bg-white">
      {/* Full-screen scroll area with no top bar and no sidebar. If the screen is very short, it scrolls. */}
      <PageContent
        top="top-0"
        withBottomNav={false}
        className="h-dvh items-center gap-0 p-0 md:h-dvh md:pl-0"
      >
        <div className="flex min-h-[600px] w-full max-w-[430px] flex-1 flex-col md:max-w-5xl">
          <header className="flex items-center justify-between px-6 pt-[max(1rem,env(safe-area-inset-top))] md:px-10 md:pt-8">
            <img src="/logo.svg" alt="Busina" width={132} height={43} />
            <button
              type="button"
              onClick={() => {
                haptic.light();
                finish();
              }}
              className={`${isLast ? "invisible" : ""} py-2 pl-4 text-[15px] font-medium text-muted`}
            >
              Skip
            </button>
          </header>

          {/* Phone: the scene on top, then the text, then the buttons at the bottom.
              Medium screens and up: two columns, the scene on the left and the text and buttons on the right. */}
          <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:content-center md:items-center md:gap-x-10 lg:gap-x-14 md:px-10">
            {/* On phones this centers the scene and the text between the header and the buttons;
                on medium screens it disappears so its children join the grid. */}
            <div className="flex flex-1 flex-col justify-center md:contents">
              {/* All the scenes sit side by side; the track slides left as the step grows. */}
              <div className="max-h-[396px] min-h-[176px] flex-1 overflow-hidden md:col-start-1 md:row-span-2 md:h-[min(520px,70dvh)] md:max-h-none md:flex-none">
                <motion.div
                  className="flex h-full"
                  animate={{ x: `${-step * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {steps.map((item, i) => (
                    <div key={i} className="h-full min-w-full px-6 pt-4 md:p-0">
                      <SceneStage maxScale={1.3} className="h-full w-full">
                        <item.Scene />
                      </SceneStage>
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="mt-7 min-h-[150px] px-6 md:col-start-2 md:row-start-1 md:mt-0 md:min-h-0 md:self-end md:px-0 md:pb-8">
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

              <FadeUp key={`button-${step}`} delay={0.55} className="md:max-w-sm">
                <button
                  type="button"
                  onClick={next}
                  className="gradient-button active:opacity-80"
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
                  <div className="h-[38.5px]" />
                )}
              </FadeUp>
            </footer>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}

// Reference: the Ecoaid onboarding, kept as a guide for the carousel.
// "use client";

// import { useEffect, useState } from "react";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { DesktopGuard } from "@/components/ui/DesktopGuard";
// import { motion } from "motion/react";
// import { Page } from "@/components/layout/Page";
// import { PageTransition } from "@/components/ui/PageTransition";
// import { haptic } from "@/lib/haptics";
// import { LogoWithName } from "@/components/branding/LogoWithName";

// export default function OnboardingPage() {
//   const [step, setStep] = useState(1);
//   const router = useRouter();

//   useEffect(() => {
//     const hasSeen = localStorage.getItem("hasSeenOnboarding");

//     if (hasSeen) {
//       router.push("/login");
//     }
//   }, []);

//   return (
//     <>
//       <DesktopGuard />

//       <Page className="bg-bg! lg:hidden!">
//         <PageTransition
//           key={"page"}
//           className="flex flex-col items-center justify-between min-w-full pt-6 "
//         >
//           <div className="w-full flex flex-col items-center gap-3.5 min-h-18.75">

//             <LogoWithName logoSize="max-w-8" nameSize="text-3xl" className="justify-center"/>
//             <div
//               className={`${step === 3 ? "hidden" : "flex"} items-center justify-end w-full pr-4 md:px-15`}
//             >
//               <Link
//                 className="text-dark"
//                 href={"/login"}
//                 onClick={() => {
//                   localStorage.setItem("hasSeenOnboarding", "true");
//                   sessionStorage.setItem("skipSplash", "true");
//                   document.cookie = "hasSeenOnboarding=true; path=/";
//                 }}
//               >
//                 Skip
//               </Link>
//             </div>
//           </div>

//           <div className="overflow-hidden w-full flex-1">
//             <motion.div
//               key={"onboarding1"}
//               className="flex flex-row h-full  w-full"
//               animate={{ x: `${-(step - 1) * 100}vw` }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             >
//               {/* Onboarding 1 */}

//               <div className="flex flex-col items-center justify-between h-full overflow-x-hidden min-w-full">
//                 <div className="flex flex-col items-center justify-center h-full w-full gap-2">
//                   <div className="xs:max-w-64 mobile:max-w-90 md:max-w-110 relative aspect-square w-full mx-auto">
//                     <Image
//                       src={"/onboarding-2.0/onb1.webp"}
//                       alt="A girl beign frustrated that she is sorrounded by recyclable materials."
//                       fill
//                       priority
//                       loading="eager"
//                       className="z-50"
//                     />

//                     <div
//                       className="xs:w-45 xs:h-45 mobile:w-55 mobile:h-55 md:w-70 md:h-70 bg-success/25 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
//                       style={{
//                         borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
//                       }}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-center justify-between gap-3.5 w-full">
//                   <div className="grid grid-cols-4 mx-auto items-center justify-center gap-1 w-full max-w-30">
//                     <div className="col-span-2 h-1.25 bg-accent rounded-xl"></div>
//                     <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
//                     <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
//                   </div>

//                   <div className="bg-white mobile:min-h-69 w-full rounded-t-4xl mobile:p-8.25 xs:p-6 ">
//                     <div className="flex flex-col items-center gap-4 md:max-w-xl md:mx-auto md:gap-8 mobile:mb-10 xs:mb-5">
//                       <div className="flex flex-col items-center gap-2">
//                         <motion.div
//                           key={`headline-${step}`}
//                           initial={{ opacity: 0, y: 12 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ duration: 0.5, delay: 0.35 }}
//                         >
//                           <h2 className="text-xl font-semibold text-center text-text-primary">
//                             Recyclable Go to Waste Without a Clear System
//                           </h2>
//                         </motion.div>

//                         <motion.div
//                           key={`body-${step}`}
//                           initial={{ opacity: 0, y: 12 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ duration: 0.5, delay: 0.45 }}
//                         >
//                           <p className="text-xs text-text-primary text-center">
//                             Many households want to help, but without a proper
//                             way to collect and track recyclables, usable
//                             materials end up in the trash instead of benefiting
//                             the community.
//                           </p>
//                         </motion.div>
//                       </div>
//                       <motion.div
//                         className="w-full"
//                         key={`button-${step}`}
//                         initial={{ opacity: 0, y: 12 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5, delay: 0.55 }}
//                       >
//                         <button
//                           className="bg-accent w-full text-white font-medium mobile:py-5 xs:py-3.5 rounded-[14px] text-sm gradient-button"
//                           onClick={() => {
//                             setStep(step + 1);
//                             haptic.light();
//                           }}
//                         >
//                           Next
//                         </button>
//                       </motion.div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Onboarding 2 */}

//               <div className="flex flex-col items-center justify-between h-full overflow-x-hidden min-w-full">
//                 <div className="flex flex-col items-center justify-center h-full w-full gap-2">
//                   <div className="xs:max-w-64 mobile:max-w-90 md:max-w-110 relative aspect-square w-full mx-auto">
//                     <Image
//                       src={"/onboarding-2.0/onb2.webp"}
//                       alt="A girl and boy putting trashes in a container."
//                       fill
//                       priority
//                       loading="eager"
//                       className="z-50"
//                     />

//                     <div
//                       className="xs:w-64 xs:h-45 mobile:w-90 mobile:h-55 md:w-110 md:h-70 bg-success/25 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
//                       style={{
//                         borderRadius: "52% 48% 58% 42% / 38% 42% 52% 48%",
//                       }}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-center justify-between gap-3.5 w-full">
//                   <div className="grid grid-cols-4 mx-auto items-center justify-center gap-1 w-full max-w-30">
//                     <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
//                     <div className="col-span-2 h-1.25 bg-accent rounded-xl"></div>
//                     <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
//                   </div>

//                   <div className="bg-white mobile:min-h-69 w-full rounded-t-4xl mobile:p-8.25 xs:p-6">
//                     {step === 2 && (
//                       <div className="flex flex-col items-center gap-4 md:max-w-xl md:mx-auto md:gap-8 mobile:mb-10 xs:mb-5">
//                         <div className="flex flex-col items-center gap-2 ">
//                           <motion.div
//                             key={`headline-${step}`}
//                             initial={{ opacity: 0, y: 12 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.5, delay: 0.35 }}
//                           >
//                             <h2 className="text-xl font-semibold text-center text-text-primary">
//                               Your recyclables have value. Benefit from them
//                             </h2>
//                           </motion.div>

//                           <motion.div
//                             key={`body-${step}`}
//                             initial={{ opacity: 0, y: 12 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.5, delay: 0.45 }}
//                           >
//                             <p className="text-xs text-text-primary text-center">
//                               Every recyclable counts. Turn yours into value and
//                               earn rewards, recognition, or incentives along the
//                               way, all recorded and tracked transparently.
//                             </p>
//                           </motion.div>
//                         </div>
//                         <motion.div
//                           className="w-full"
//                           key={`button-${step}`}
//                           initial={{ opacity: 0, y: 12 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ duration: 0.5, delay: 0.55 }}
//                         >
//                           <button
//                             className="bg-accent w-full text-white font-medium xs:py-3.5 mobile:py-5 rounded-[14px] text-sm gradient-button"
//                             onClick={() => {
//                               setStep(step + 1);
//                               haptic.light();
//                             }}
//                           >
//                             Next
//                           </button>
//                         </motion.div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Onboarding 3 */}

//               <div className="flex flex-col items-center justify-between h-full overflow-x-hidden min-w-full">
//                 <div className="flex flex-col items-center justify-center h-full w-full gap-2">
//                   <div className="xs:max-w-64 mobile:max-w-90 md:max-w-110 relative aspect-square w-full mx-auto">
//                     <Image
//                       src={"/onboarding-2.0/onb3.webp"}
//                       alt="A girl and boy putting trashes in a container."
//                       fill
//                       priority
//                       loading="eager"
//                       className="z-50"
//                     />

//                     <div
//                       className="xs:w-48 xs:h-52 mobile:w-65 mobile:h-72 md:w-80 md:h-90 bg-success/25 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
//                       style={{
//                         borderRadius: "45% 55% 50% 50% / 55% 45% 60% 40%",
//                       }}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-center justify-between gap-3.5 w-full">
//                   <div className="grid grid-cols-4 mx-auto items-center justify-center gap-1 w-full max-w-30">
//                     <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
//                     <div className="h-1.25 bg-[#D1D5DB] col-span-1 rounded-xl"></div>
//                     <div className="col-span-2 h-1.25 bg-accent rounded-xl"></div>
//                   </div>
//                   <div className="bg-white mobile:min-h-69 w-full rounded-t-4xl mobile:p-8.25 xs:p-6">
//                     {step === 3 && (
//                       <div className="flex flex-col items-center gap-4 md:max-w-xl md:mx-auto md:gap-8 mobile:mb-10 xs:mb-5">
//                         <div className="flex flex-col items-center gap-2">
//                           <motion.div
//                             key={`headline-${step}`}
//                             initial={{ opacity: 0, y: 12 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.5, delay: 0.35 }}
//                           >
//                             <h2 className="text-xl font-semibold text-center text-text-primary">
//                               How EcoAid Works
//                             </h2>
//                           </motion.div>

//                           <motion.div
//                             key={`body-${step}`}
//                             initial={{ opacity: 0, y: 12 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.5, delay: 0.45 }}
//                           >
//                             <p className="text-xs text-text-primary text-center">
//                               Snap a photo of your recyclables, requests a
//                               pickup, and get collected by the barangay. Every
//                               contribution earns your points, a spot on the
//                               communiity leaderboard, and keep community clean.
//                             </p>
//                           </motion.div>
//                         </div>
//                         <motion.div
//                           className="w-full"
//                           key={`button-${step}`}
//                           initial={{ opacity: 0, y: 12 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ duration: 0.5, delay: 0.55 }}
//                         >
//                           <Link
//                             className="bg-accent w-full text-white font-medium mobile:py-5 xs:py-3.5 rounded-[14px] block text-center text-sm gradient-button"
//                             onClick={() => {
//                               localStorage.setItem("hasSeenOnboarding", "true");
//                               sessionStorage.setItem("skipSplash", "true");
//                               document.cookie =
//                                 "hasSeenOnboarding=true; path=/";
//                               haptic.light();
//                             }}
//                             href={"/login"}
//                           >
//                             Get Started
//                           </Link>
//                         </motion.div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </PageTransition>
//       </Page>
//     </>
//   );
// }
