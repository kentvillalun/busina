"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Download", href: "#download" },
];

const ctaClass = "rounded-lg bg-linear-to-b from-primary-light to-primary-dark px-4 py-1.5 text-center text-sm font-bold text-white active:opacity-80";

// At the top of the page the bar is part of the page: transparent, square, as wide as the content. Once the page is scrolled it
// floats: it moves in from the edges, turns glassy and gets rounded (a pill from md up, the 14px of the buttons on a phone).
const LandingNav = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 flex flex-col items-center transition-[padding] duration-300 ${scrolled ? "px-4 pt-3" : "px-0 pt-0"}`}>
      <nav
        aria-label="Main"
        className={`flex w-full items-center justify-between border-[0.8px] transition-all duration-300 ${
          scrolled
            ? "h-13 max-w-195 rounded-[14px] border-line bg-white/72 px-3.5 shadow-[0_8px_24px_rgba(15,34,51,0.06)] backdrop-blur-lg md:rounded-full md:px-5"
            : "h-16 max-w-310 rounded-none border-transparent bg-transparent px-5 md:px-10"
        }`}
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
        <div
          className={`flex w-full flex-col gap-3.5 border-[0.8px] border-line bg-white p-5 shadow-[0_10px_28px_rgba(15,34,51,0.08)] md:hidden ${
            scrolled ? "mt-2 rounded-[14px]" : "rounded-b-[14px] border-t-0"
          }`}
        >
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
