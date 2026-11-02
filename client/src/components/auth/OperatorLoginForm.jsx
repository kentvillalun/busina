"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import Link from "next/link";
import { useState } from "react";

const inputClass =
  "mt-2 h-14 w-full rounded-2xl border-[1.5px] border-line bg-white px-4 text-[17px] font-medium text-ink outline-none placeholder:text-muted/60 focus:border-primary";

// Username and password, as in Figma OP1. Not connected to the server yet: operator sign-in is the next slice.
const OperatorLoginForm = () => {
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    setError("Operator sign-in is not connected yet.");
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#f5f8fb] px-4 py-10">
      <form onSubmit={submit} noValidate className="w-full max-w-105 rounded-3xl border-[0.5px] border-line bg-white p-6 md:p-10">
        <img src="/logo.svg" alt="Busina" width={132} height={43} />
        <h1 className="mt-9 font-display text-[30px] leading-9 text-ink">Operator sign in</h1>
        <p className="mt-3 text-[15px] leading-6 text-muted">Sign in with the account your company gave you.</p>

        <label className="mt-6 block text-[13px] font-semibold text-ink">
          Username
          <input className={inputClass} placeholder="operator" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={50} />
        </label>

        <label className="mt-4 block text-[13px] font-semibold text-ink">
          Password
          <input className={inputClass} type="password" placeholder="••••••••" autoComplete="current-password" maxLength={72} />
        </label>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-fault">
            {error}
          </p>
        )}

        <button type="submit" className="gradient-button active:opacity-80">
          Sign in
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
