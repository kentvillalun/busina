"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Download", href: "#download" },
];

const ctaClass = "rounded-lg bg-linear-to-b from-primary-light to-primary-dark px-4 py-1.5 text-center text-sm font-bold text-white active:opacity-80";

// Floating navbar: fixed near the top, a blurred pill from md up and a compact bar with a dropdown on a phone (Figma L1, L2, L3).
const LandingNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-4 top-3 z-50 md:inset-x-auto md:left-1/2 md:w-195 md:-translate-x-1/2">
      <nav
        aria-label="Main"
        className="flex h-13 items-center justify-between rounded-[14px] border-[0.8px] border-line bg-white/72 px-3.5 shadow-[0_8px_24px_rgba(15,34,51,0.06)] backdrop-blur-lg md:rounded-full md:px-5"
      >
        <Link href="/get" aria-label="Busina">
          <img src="/logo.svg" alt="Busina" width={96} height={32} />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-muted transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>

        <Link href="/home" className={`${ctaClass} hidden md:block`}>
          Open the app
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="-mr-1 flex size-10 items-center justify-center rounded-full text-ink active:bg-stage md:hidden"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {open && (
        <div className="mt-2 flex flex-col gap-3.5 rounded-[14px] border-[0.8px] border-line bg-white p-5 shadow-[0_10px_28px_rgba(15,34,51,0.08)] md:hidden">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-[17px] font-medium text-ink">
              {link.label}
            </a>
          ))}
          <Link href="/home" className={`${ctaClass} py-3.5`}>
            Open the app
          </Link>
        </div>
      )}
    </header>
  );
};

export default LandingNav;
