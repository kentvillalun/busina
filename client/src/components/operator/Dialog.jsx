"use client";

import { useEffect, useRef } from "react";

// Buttons are rectangles with a 12px radius, never pills; in a dialog they fill the width, and two share a row in two columns.
export const primaryButton = "h-12 rounded-xl bg-linear-to-b from-primary-light to-primary-dark px-5 text-sm font-bold text-white active:opacity-80 disabled:opacity-50";
export const outlineButton = "h-12 rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink active:bg-stage";

// Dialogs that are open now, the last one on top. Escape closes only the top one (a bus modal can hold a confirm dialog).
const open = [];

// A centered dialog over a dimmed page. Escape or a tap on the dimmed area closes it. With `bare` the children bring their own
// heading (a modal that shows a whole panel); `title` is then only the accessible name.
// Keyboard focus moves into the dialog when it opens (unless a field inside already took it) and goes back to where it was on close.
const Dialog = ({ title, onClose, bare = false, children }) => {
  const closeRef = useRef(onClose);
  const panelRef = useRef(null);

  useEffect(() => {
    closeRef.current = onClose; // read at key time, so the listener below never has to be replaced
  });

  useEffect(() => {
    const me = {};
    const before = document.activeElement;
    open.push(me);
    if (!panelRef.current.contains(document.activeElement)) panelRef.current.focus();
    const onKey = (event) => event.key === "Escape" && open[open.length - 1] === me && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      open.splice(open.indexOf(me), 1);
      window.removeEventListener("keydown", onKey);
      if (before instanceof HTMLElement && before.isConnected) before.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0 bg-ink/40" />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[90dvh] w-full max-w-110 flex-col gap-3.5 overflow-y-auto rounded-2xl bg-white outline-none ${bare ? "p-5" : "p-7"}`}
      >
        {!bare && <h2 className="font-display text-2xl leading-8 text-ink">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Dialog;
