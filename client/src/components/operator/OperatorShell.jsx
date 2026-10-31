"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// `inset` places each icon inside its 20px box, as in the Figma file.
const NAV = [
  { name: "Overview", icon: "overview", inset: "5.21%" },
  { name: "Insights", icon: "insights", inset: "8.33% 8.37% 8.33% 8.33%", active: true },
  { name: "Buses", icon: "buses", inset: "5.21% 13.54%" },
  { name: "Routes", icon: "routes", inset: "10.77% 5.25% 10.79% 6.42%" },
  { name: "Alerts", icon: "alerts", inset: "4.92% 13.49% 4.96% 13.45%" },
  { name: "Reports", icon: "reports", inset: "5.21% 9.38%" },
];

const Wordmark = () => <p className="font-display text-[29px] leading-9 tracking-tight text-ink">busina</p>;

// Only Insights exists for now; the other entries are shown but do nothing.
const NavList = ({ onPick }) => (
  <nav aria-label="Operator" className="mt-3 flex flex-col gap-1.5">
    {NAV.map((item) => (
      <button
        key={item.name}
        type="button"
        disabled={!item.active}
        aria-current={item.active ? "page" : undefined}
        onClick={onPick}
        className={`flex w-full items-center gap-3 rounded-[10px] py-2.5 pl-3.5 text-left text-sm disabled:cursor-default ${
          item.active ? "bg-stage font-bold text-navy" : "font-medium text-muted"
        }`}
      >
        <span className="relative size-5 shrink-0">
          <span className="absolute" style={{ inset: item.inset }}>
            <Image src={`/operator/icon-${item.icon}.svg`} alt="" width={20} height={20} className="size-full" />
          </span>
        </span>
        {item.name}
      </button>
    ))}
  </nav>
);

// The operator area has no onboarding and no bottom nav: a sidebar from md up, and on a phone a hamburger that opens a drawer.
const OperatorShell = ({ children }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-dvh bg-[#f5f8fb] md:flex">
      <aside className="sticky top-0 hidden h-dvh w-55 shrink-0 flex-col border-r border-[#e3eaf1] bg-white px-4 pt-7 md:flex">
        <Wordmark />
        <NavList />
      </aside>

      <div className={`fixed inset-0 z-40 md:hidden ${open ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          id="operator-drawer"
          inert={!open}
          className={`absolute inset-y-0 left-0 w-64 bg-white px-4 pt-5 shadow-xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Wordmark />
          <NavList onPick={() => setOpen(false)} />
        </aside>
      </div>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#e3eaf1] bg-white/95 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="operator-drawer"
            onClick={() => setOpen(true)}
            className="-ml-2 flex size-10 items-center justify-center rounded-full text-ink active:bg-stage"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <Wordmark />
        </header>
        <main className="px-4 pb-10 pt-5 md:px-8 md:pt-7">{children}</main>
      </div>
    </div>
  );
};

export default OperatorShell;
