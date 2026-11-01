"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import Link from "next/link";
import IconChevron from "@/components/icons/IconChevron";
import { haptic, hapticTrigger } from "@/lib/haptics";
import { useSearchParams } from "next/navigation";
import AlertsScene from "@/components/onboarding/AlertsScene";
import SceneStage from "@/components/onboarding/SceneStage";

const MESSAGES = {
  expired: "Your session expired. Please sign in again.",
  state: "Sign-in did not finish. Please try again.",
  google: "Google did not accept the sign-in. Please try again.",
};

// The four-colour Google "G" has to keep its own colours, so it sits on a white circle.
const GoogleG = () => (
  <span className="flex size-7 items-center justify-center rounded-full bg-white">
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  </span>
);

// "Continue with Google" is a plain link: the whole page has to go to Google and come back, so the router cannot do it.
const LoginForm = () => {
  const params = useSearchParams();
  const next = params.get("next") ?? "/home";
  const fromApp = params.has("next");
  const message = params.get("expired") ? MESSAGES.expired : MESSAGES[params.get("error")];

  return (
    <div className="min-h-svh bg-white">
      <main className="mx-auto flex min-h-svh w-full max-w-107.5 flex-col px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:max-w-5xl md:px-10 md:pt-8">
        <header className="flex items-center gap-2.5">
          {/* Sent here from inside the app (the proxy adds ?next=): a way back to the map. From onboarding there is none. */}
          {fromApp && (
            <Link
              href="/home"
              ref={hapticTrigger}
              onClick={haptic.light}
              aria-label="Back to the map"
              className="-ml-1 flex size-8 items-center justify-center rounded-full text-ink active:bg-stage"
            >
              <IconChevron className="size-6 rotate-180" />
            </Link>
          )}
          <img src="/logo.svg" alt="Busina" width={132} height={43} />
        </header>

        {/* Phone: one column. Medium screens and up: the scene on the left, the text and buttons on the right. */}
        <div className="flex flex-1 flex-col md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center md:gap-x-10 lg:gap-x-14">
          <div className="mt-4 flex max-h-99 min-h-44 flex-1 flex-col md:mt-0 md:h-[min(520px,70dvh)] md:max-h-none md:flex-none">
            <SceneStage maxScale={1.3} className="w-full flex-1">
              <AlertsScene active body="9 of 40 seats free now. Your alerts follow you to any phone." />
            </SceneStage>
          </div>

          <div className="md:max-w-sm">
            <h1 className="mt-7 font-display text-[clamp(26px,8vw,32px)] leading-[1.2] text-ink md:mt-0 md:text-[34px] md:leading-[1.15] lg:text-[44px] lg:leading-[1.1]">
              Keep your alerts
              <br />
              on <span className="text-primary">any phone</span>
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-muted md:mt-4 md:text-lg md:leading-7">
              Sign in with Google to get bus alerts and save your boarding spot. Guests can still watch buses on the map.
            </p>

            {message && (
              <p role="alert" className="mt-4 text-sm font-medium text-fault">
                {message}
              </p>
            )}

            <a
              href={`/api/auth/google?next=${encodeURIComponent(next)}`}
              className="gradient-button flex items-center justify-center gap-3 active:opacity-80"
            >
              <GoogleG />
              Continue with Google
            </a>
            <Link href="/home" className="mt-1 block w-full py-3 text-center text-[15px] font-bold text-muted">
              Continue as guest
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginForm;
