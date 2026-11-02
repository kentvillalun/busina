"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import {
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  Squares2X2Icon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  ChartBarIcon as ChartBarSolid,
  Squares2X2Icon as Squares2X2Solid,
  TruckIcon as TruckSolid,
  UsersIcon as UsersSolid,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Routes, Alerts and Reports are not built, so they are not listed. The active page shows the solid icon.
const NAV = [
  { name: "Overview", href: "/operator", Icon: Squares2X2Icon, ActiveIcon: Squares2X2Solid },
  { name: "Insights", href: "/operator/insights", Icon: ChartBarIcon, ActiveIcon: ChartBarSolid },
  { name: "Buses", href: "/operator/buses", Icon: TruckIcon, ActiveIcon: TruckSolid },
  { name: "Staff", href: "/operator/staff", Icon: UsersIcon, ActiveIcon: UsersSolid },
];

// The menu looks like the driver's (Figma D6): logo with a rule under it, who is signed in, the active page as a gradient row,
// Logout at the bottom. Icons show from md up; on a phone the drawer has text only.
const Menu = ({ onPick }) => {
  const pathname = usePathname();
  return (
    <>
      <div className="flex flex-col gap-6 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex flex-col gap-3">
          <div className="border-b border-line pb-4">
            <img src="/logo.svg" alt="Busina" width={110} height={36} />
          </div>
          <div className="flex flex-col">
            <p className="text-base font-medium text-ink">PITCO (Demo)</p>
            <p className="text-xs text-muted">Operator console</p>
          </div>
        </div>

        <nav aria-label="Operator" className="flex flex-col gap-1">
          {NAV.map(({ name, href, Icon, ActiveIcon }) => {
            const active = pathname === href;
            const Shown = active ? ActiveIcon : Icon;
            return (
              <Link
                key={name}
                href={href}
                onClick={onPick}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-base transition-colors ${
                  active
                    ? "bg-linear-to-b from-primary-light to-primary-dark font-medium text-white"
                    : "text-muted hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Shown className="hidden size-5 shrink-0 md:block" aria-hidden="true" />
                {name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {/* shortcut: leads to the sign-in screen only; it will end the session once operator sign-in exists */}
        <Link
          href="/operator/login"
          className="flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left text-base text-muted transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <ArrowRightStartOnRectangleIcon className="hidden size-5 shrink-0 md:block" aria-hidden="true" />
          Logout
        </Link>
      </div>
    </>
  );
};

// A sidebar from md up; on a phone a hamburger opens the same menu as a drawer.
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
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r-[0.5px] border-line bg-white md:flex">
        <Menu />
      </aside>

      <div className={`fixed inset-0 z-40 md:hidden ${open ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/45 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          id="operator-drawer"
          inert={!open}
          className={`absolute inset-y-0 left-0 flex w-60 flex-col border-r-[0.5px] border-line bg-white transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Menu onPick={() => setOpen(false)} />
        </aside>
      </div>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur md:hidden">
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
          <img src="/logo.svg" alt="Busina" width={96} height={32} />
        </header>
        <main className="px-4 pb-10 pt-5 md:px-8 md:pt-7">{children}</main>
      </div>
    </div>
  );
};

export default OperatorShell;
