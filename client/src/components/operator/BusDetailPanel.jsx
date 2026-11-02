"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Dialog, { outlineButton, primaryButton } from "@/components/operator/Dialog";
import StatusChip from "@/components/operator/StatusChip";
import { routeText } from "@/lib/fleet";

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-t border-line/60 py-2.5 text-[13px]">
    <dt className="text-muted">{label}</dt>
    <dd className="text-right font-medium text-ink">{children}</dd>
  </div>
);

// Reset PIN and Disable ask first (Figma OP4 to OP6): both lock the driver out of the bus. Nothing here reaches the API yet,
// so the PIN shown is a sample.
const BusDetailPanel = ({ bus, onClose }) => {
  const [step, setStep] = useState(null); // "reset" | "pin" | "disable"
  const close = () => setStep(null);

  return (
    <aside className="flex flex-col gap-3 rounded-xl border-[0.5px] border-line bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="font-display text-[26px] leading-8 text-ink">Bus {bus.busNumber}</p>
          <p className="text-[13px] text-muted">{bus.name}</p>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="-mr-2 ml-auto flex size-9 items-center justify-center rounded-full text-muted active:bg-stage">
          <XMarkIcon className="size-5" />
        </button>
      </div>

      <dl>
        <Row label="Status">
          <StatusChip status={bus.status} />
        </Row>
        <Row label="Seats free">{bus.seatsFree === null ? "Unknown" : `${bus.seatsFree} of ${bus.seatCount}`}</Row>
        <Row label="Speed">{bus.speedKmh === null ? "Unknown" : `${bus.speedKmh} km/h`}</Row>
        <Row label="Route">{routeText(bus.direction)}</Row>
        <Row label="Last update">{bus.lastUpdate}</Row>
      </dl>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setStep("reset")} className={primaryButton}>
          Reset PIN
        </button>
        <button type="button" onClick={() => setStep("disable")} className={`${outlineButton} text-fault`}>
          Disable bus
        </button>
      </div>

      {step === "reset" && (
        <Dialog title={`Reset the PIN for bus ${bus.busNumber}?`} onClose={close}>
          <p className="text-sm leading-5 text-muted">The driver is signed out now and needs the new PIN to sign in again. The new PIN is shown once.</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={close} className={outlineButton}>
              Cancel
            </button>
            <button type="button" onClick={() => setStep("pin")} className={primaryButton}>
              Reset PIN
            </button>
          </div>
        </Dialog>
      )}

      {step === "pin" && (
        <Dialog title={`New PIN for bus ${bus.busNumber}`} onClose={close}>
          <p className="rounded-xl bg-stage py-4 text-center font-display text-[44px] leading-12 tracking-[0.1em] text-navy">482 916</p>
          <p className="text-sm leading-5 text-muted">Tell the driver now. This PIN is shown only once and cannot be looked up later.</p>
          <p className="text-xs font-semibold text-navy">Sample PIN: the server is not connected yet.</p>
          <button type="button" onClick={close} className={primaryButton}>
            Done
          </button>
        </Dialog>
      )}

      {step === "disable" && (
        <Dialog title={`Disable bus ${bus.busNumber}?`} onClose={close}>
          <p className="text-sm leading-5 text-muted">The driver is signed out now and cannot sign in until you enable the bus again.</p>
          <p className="text-xs font-semibold text-navy">Not connected to the server yet (sample data).</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={close} className={outlineButton}>
              Cancel
            </button>
            <button type="button" onClick={close} className={`${outlineButton} text-fault`}>
              Disable bus
            </button>
          </div>
        </Dialog>
      )}
    </aside>
  );
};

export default BusDetailPanel;
