"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { haptic, hapticTrigger } from "@/lib/haptics";

// Only the operator app: a sign-in sent from /operator/... goes back there, never to another page or site.
const safeOperatorNext = (next) => (next && /^\/operator(\/|$)/.test(next) && !next.startsWith("/operator/login") ? next : "/operator");

const inputClass =
  "mt-2 h-14 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-[17px] font-medium text-ink outline-none placeholder:text-muted/60 focus:border-primary";

// Username and password, as in Figma OP1. The server gives one answer for every wrong sign-in, so this does too.
const OperatorLoginForm = () => {
  const params = useSearchParams();
  const next = safeOperatorNext(params.get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("expired") ? "Your session ended. Please sign in again." : "");

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!username.trim() || !password) {
      setError(username.trim() ? "Enter your password." : "Enter your username.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/operator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (response.ok) {
        haptic.success();
        window.location.replace(next); // a full page load, so the proxy sees the new cookie
        return;
      }
      haptic.error();
      setError(
        response.status === 429
          ? "Too many wrong passwords. Try again in 15 minutes."
          : response.status === 401 || response.status === 400
            ? "Wrong username or password."
            : "Something went wrong. Please try again.",
      );
    } catch {
      setError("No connection. Check your internet and try again.");
    }
    setBusy(false);
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#f5f8fb] px-4 py-10">
      <form onSubmit={submit} noValidate className="w-full max-w-105 rounded-3xl border-[0.5px] border-line bg-white p-6 md:p-10">
        <img src="/logo.svg" alt="Busina" width={132} height={43} />
        <h1 className="mt-9 font-display text-[30px] leading-9 text-ink">Operator sign in</h1>
        <p className="mt-3 text-[15px] leading-6 text-muted">Sign in with the account your company gave you.</p>

        <label className="mt-6 block text-[13px] font-semibold text-ink">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className={inputClass}
            placeholder="operator"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={50}
          />
        </label>

        <label className="mt-4 block text-[13px] font-semibold text-ink">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            maxLength={72}
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

      <p className="text-[13px] font-medium text-muted">
        Not an operator?{" "}
        <Link href="/home" className="text-primary hover:underline">
          Open the Busina commuter app.
        </Link>
      </p>
    </main>
  );
};

export default OperatorLoginForm;
