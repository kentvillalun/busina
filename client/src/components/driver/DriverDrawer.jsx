"use client";

/* eslint-disable @next/next/no-img-element -- the logo is a small SVG; next/image would only add work */

import { useEffect } from "react";
import { staffLogout } from "@/lib/staffSession";
import MenuButton from "./MenuButton";

const PinSolid = () => (
  <svg viewBox="0 0 20 20" className="hidden size-4.5 shrink-0 md:block" aria-hidden="true">
    <path d="M10 18C6 14 3 11 3 8c0-4 3-6 7-6s7 2 7 6c0 3-3 6-7 10Z" fill="currentColor" />
    <circle cx="10" cy="8" r="2.6" fill="#1f73bd" />
  </svg>
);

const LogoutOutline = () => (
  <svg viewBox="0 0 20 20" className="hidden size-4.5 shrink-0 md:block" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3H3v14h7M8 10h9M13 6l4 4-4 4" />
  </svg>
);

// The menu, in the look of the Ecoaid sidebar: white panel, hairline border, logo with a rule under it, who is signed in, the
// active page as a gradient row and Logout at the bottom. It opens over a dimmed page; the scrim, Escape or the menu button
// close it. On a phone the icons are left out (Figma D6); from md up they show.
const DriverDrawer = ({ open, onClose, bus, directionLabel }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/45 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        inert={!open}
        aria-label="Menu"
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r-[0.5px] border-line bg-white transition-transform duration-200 ease-out md:w-65 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col gap-6 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <img src="/logo.svg" alt="Busina" width={110} height={36} />
              <MenuButton onClick={onClose} label="Close menu" className="hidden bg-stage md:flex" />
            </div>
            <div className="flex flex-col">
              <p className="text-base font-medium text-ink">{bus ? `Bus ${bus.busNumber}` : " "}</p>
              <p className="text-xs text-muted">{directionLabel}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-3.5 rounded-xl bg-linear-to-b from-primary-light to-primary-dark px-3 py-2.5 text-left text-base font-medium text-white"
            >
              <PinSolid />
              Pickups ahead
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => staffLogout()}
            className="group flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left text-base text-muted transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <LogoutOutline />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default DriverDrawer;
