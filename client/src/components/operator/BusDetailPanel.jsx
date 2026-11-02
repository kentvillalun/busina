"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Dialog, { outlineButton, primaryButton } from "@/components/operator/Dialog";
import StatusChip from "@/components/operator/StatusChip";
import { crewText, routeText, seatsText } from "@/lib/fleet";
import { send } from "@/lib/operatorApi";

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-t border-line/60 py-2.5 text-[13px]">
    <dt className="text-muted">{label}</dt>
    <dd className="text-right font-medium text-ink">{children}</dd>
  </div>
);

// The details of one bus, shown in a modal. Reset PIN and Disable / Enable ask first (Figma OP5 and OP6).
// `onChanged` makes the page ask for the fleet again.
const BusDetailPanel = ({ bus, onClose, onChanged }) => {
  const [step, setStep] = useState(null); // "reset" | "pin" | "active"
  const [pin, setPin] = useState(""); // the new PIN, kept only while its dialog is open
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const open = (next) => {
    setError("");
    setStep(next);
  };
  const close = () => {
    setPin("");
    setStep(null);
  };

  const run = async (action, failure) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch {
      setError(failure);
    }
    setBusy(false);
  };

  const resetPin = () =>
    run(async () => {
      const result = await send(`/api/operator/buses/${bus.id}/reset-pin`, "POST");
      if (!result) return;
      setPin(`${result.pin.slice(0, 3)} ${result.pin.slice(3)}`);
      setStep("pin");
    }, "Could not reset the PIN. Check your connection and try again.");

  const toggleActive = () =>
    run(async () => {
      const result = await send(`/api/operator/buses/${bus.id}/active`, "PATCH", { active: !bus.active });
      if (!result) return;
      close();
      onChanged();
    }, "Could not change the bus. Check your connection and try again.");

  const alert = error && (
    <p role="alert" className="text-sm font-medium text-fault">
      {error}
    </p>
  );

  return (
    <aside className="flex flex-col gap-3">
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
        <Row label="Seats free">{seatsText(bus)}</Row>
        <Row label="Total seats">{bus.seatCount}</Row>
        <Row label="Speed">{bus.speedKmh === null ? "Unknown" : `${bus.speedKmh} km/h`}</Row>
        <Row label="Route">{routeText(bus.direction)}</Row>
        <Row label="Crew">{crewText(bus)}</Row>
        <Row label="Last update">{bus.lastUpdate}</Row>
      </dl>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => open("reset")} className={primaryButton}>
          Reset PIN
        </button>
        <button type="button" onClick={() => open("active")} className={`${outlineButton} ${bus.active ? "text-fault" : ""}`}>
          {bus.active ? "Disable bus" : "Enable bus"}
        </button>
      </div>

      {step === "reset" && (
        <Dialog title={`Reset the PIN for bus ${bus.busNumber}?`} onClose={close}>
          <p className="text-sm leading-5 text-muted">
            The new PIN works at once and the old one stops working. It is shown once. A driver who is already signed in stays signed in until the shift ends; disable the bus to end that now.
          </p>
          {alert}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={close} className={outlineButton}>
              Cancel
            </button>
            <button type="button" onClick={resetPin} disabled={busy} className={primaryButton}>
              {busy ? "Resetting..." : "Reset PIN"}
            </button>
          </div>
        </Dialog>
      )}

      {step === "pin" && (
        <Dialog title={`New PIN for bus ${bus.busNumber}`} onClose={close}>
          <p className="rounded-xl bg-stage py-4 text-center font-display text-[44px] leading-12 tracking-[0.1em] text-navy">{pin}</p>
          <p className="text-sm leading-5 text-muted">Tell the driver now. This PIN is shown only once and cannot be looked up later.</p>
          <button type="button" onClick={close} className={primaryButton}>
            Done
          </button>
        </Dialog>
      )}

      {step === "active" && (
        <Dialog title={bus.active ? `Disable bus ${bus.busNumber}?` : `Enable bus ${bus.busNumber}?`} onClose={close}>
          <p className="text-sm leading-5 text-muted">
            {bus.active
              ? "The driver is signed out now and cannot sign in until you enable the bus again. Commuters stop seeing the bus."
              : "The driver can sign in again with the bus PIN, and commuters see the bus again."}
          </p>
          {alert}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={close} className={outlineButton}>
              Cancel
            </button>
            <button type="button" onClick={toggleActive} disabled={busy} className={bus.active ? `${outlineButton} text-fault` : primaryButton}>
              {busy ? "Saving..." : bus.active ? "Disable bus" : "Enable bus"}
            </button>
          </div>
        </Dialog>
      )}
    </aside>
  );
};

export default BusDetailPanel;
