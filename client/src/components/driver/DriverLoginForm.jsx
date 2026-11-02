"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { haptic, hapticTrigger } from "@/lib/haptics";

// Only the driver app: a sign-in sent from /driver/... goes back there, never to another page or site.
const safeDriverNext = (next) => (next && /^\/driver(\/|$)/.test(next) && !next.startsWith("/driver/login") ? next : "/driver");

const inputClass =
  "mt-2 h-14 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-[17px] font-medium text-ink outline-none placeholder:text-muted/60 focus:border-primary";

// Bus code and PIN, as in Figma D1/D7. The server gives one answer for every wrong sign-in, so this does too.
const DriverLoginForm = () => {
  const params = useSearchParams();
  const next = safeDriverNext(params.get("next"));
  const [busNumber, setBusNumber] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("expired") ? "Your session ended. Please sign in again." : "");

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!busNumber.trim() || !/^\d{4,8}$/.test(pin)) {
      setError(busNumber.trim() ? "The PIN is 4 to 8 digits." : "Enter the bus code.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busNumber: busNumber.trim(), pin }),
      });
      if (response.ok) {
        haptic.success();
        window.location.replace(next); // a full page load, so the proxy sees the new cookie
        return;
      }
      haptic.error();
      setError(
        response.status === 429
          ? "Too many wrong PINs. Try again in 15 minutes."
          : response.status === 401 || response.status === 400
            ? "Wrong bus code or PIN."
            : "Something went wrong. Please try again.",
      );
    } catch {
      setError("No connection. Check your internet and try again.");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-svh bg-white">
      <main className="mx-auto flex min-h-svh w-full max-w-107.5 flex-col px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:max-w-5xl md:px-10 md:pt-8">
        <header>
          <img src="/logo.svg" alt="Busina" width={132} height={43} />
        </header>

        <div className="flex flex-1 flex-col md:items-center md:justify-center">
          <form onSubmit={submit} className="mt-20 w-full md:mt-0 md:max-w-100" noValidate>
            <h1 className="font-display text-[clamp(26px,8vw,30px)] leading-[1.2] text-ink md:text-[34px]">Driver sign in</h1>
            <p className="mt-4 text-[15px] leading-6 text-muted">Enter the bus code and PIN your operator gave you.</p>

            <label className="mt-6 block text-[13px] font-semibold text-ink">
              Bus code
              <input
                value={busNumber}
                onChange={(event) => setBusNumber(event.target.value)}
                className={inputClass}
                placeholder="0015"
                autoComplete="username"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={20}
              />
            </label>

            <label className="mt-4 block text-[13px] font-semibold text-ink">
              PIN
              <input
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
                className={`${inputClass} tracking-[0.3em]`}
                type="password"
                inputMode="numeric"
                placeholder="••••"
                autoComplete="current-password"
                maxLength={8}
              />
            </label>

            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-fault">
                {error}
              </p>
            )}

            <button type="submit" ref={hapticTrigger} disabled={busy} className="gradient-button active:opacity-80 disabled:opacity-50">
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[13px] font-medium text-muted">
          Not a driver?{" "}
          <Link href="/home" className="font-bold text-primary">
            Open the Busina commuter app.
          </Link>
        </p>
      </main>
    </div>
  );
};

export default DriverLoginForm;
