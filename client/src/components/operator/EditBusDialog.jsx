"use client";

import { useState } from "react";
import Dialog, { outlineButton, primaryButton } from "@/components/operator/Dialog";
import { Field, bare } from "@/components/operator/FormField";
import { send } from "@/lib/operatorApi";

// Name, plate number and the total number of seats of a bus. The seat count is what the device must report: it has to send exactly
// this many seat readings, or the server turns its pings down. The app draws at most 10 rows of 4 seats.
const EditBusDialog = ({ bus, onClose, onSaved }) => {
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const name = data.get("name").trim();
    const plateNumber = data.get("plateNumber").trim();
    const seatCount = Number(data.get("seatCount"));

    const found = {};
    if (!name) found.name = "Name is required";
    if (!plateNumber) found.plateNumber = "Plate number is required";
    if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 40) found.seatCount = "Enter a whole number from 1 to 40";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Only what changed is sent: a seat count that did not change must not clear the seat reading.
    const changes = {};
    if (name !== bus.name) changes.name = name;
    if (plateNumber !== bus.plateNumber) changes.plateNumber = plateNumber;
    if (seatCount !== bus.seatCount) changes.seatCount = seatCount;
    if (Object.keys(changes).length === 0) return onClose();

    setBusy(true);
    setFailure("");
    try {
      const result = await send(`/api/operator/buses/${bus.id}`, "PATCH", changes);
      if (result) {
        onSaved();
        onClose();
        return;
      }
    } catch (error) {
      setFailure(error.status === 409 ? "That plate number is already used by another bus." : "Could not save. Check your connection and try again.");
    }
    setBusy(false);
  };

  return (
    <Dialog title={`Edit bus ${bus.busNumber}`} onClose={onClose}>
      <form onSubmit={save} noValidate className="flex flex-col gap-3.5">
        <Field label="Name" htmlFor="busName" error={errors.name}>
          <input id="busName" name="name" type="text" defaultValue={bus.name ?? ""} maxLength={60} autoFocus className={bare} />
        </Field>
        <Field label="Plate number" htmlFor="busPlate" error={errors.plateNumber}>
          <input id="busPlate" name="plateNumber" type="text" defaultValue={bus.plateNumber} maxLength={20} className={bare} />
        </Field>
        <Field
          label="Total seats"
          htmlFor="busSeats"
          error={errors.seatCount}
          hint="The device must send exactly this many seat readings. Changing it clears the current reading until the device reports again."
        >
          <input id="busSeats" name="seatCount" type="number" inputMode="numeric" min={1} max={40} defaultValue={bus.seatCount} className={bare} />
        </Field>
        {failure && (
          <p role="alert" className="text-sm font-medium text-fault">
            {failure}
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className={outlineButton}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default EditBusDialog;
