"use client";

import { useState } from "react";
import Dialog, { outlineButton, primaryButton } from "@/components/operator/Dialog";
import { send } from "@/lib/operatorApi";

// The input look of Ecoaid: a box with a 1px outline that turns primary on focus; a dropdown is a plain select with no border of
// its own inside that box, and starts on a hidden "Select ..." placeholder.
const box = "flex min-h-11 w-full items-center rounded-lg px-3.5 py-2.5 text-base text-ink outline-1 outline-line transition-colors focus-within:outline-primary";
const bare = "w-full bg-transparent outline-none placeholder:text-muted/60";

const Field = ({ label, htmlFor, error, children }) => (
  <div className="flex w-full flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-start text-sm font-medium text-ink">
      {label}
    </label>
    <div className={box}>{children}</div>
    {error && (
      <p role="alert" className="text-xs text-fault">
        {error}
      </p>
    )}
  </div>
);

// Add a driver or conductor, or edit one (`person` given). A roster entry is a record only: drivers still sign in with their
// bus code and PIN, and the bus here only says who works on it. `buses` is [{ id, busNumber, name }]; `onSaved` reloads the list.
const StaffDialog = ({ person, buses, onClose, onSaved }) => {
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const editing = Boolean(person);

  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const body = { firstName: data.get("firstName").trim(), lastName: data.get("lastName").trim(), role: data.get("role"), busId: data.get("busId") || null };
    if (editing) body.active = data.get("status") === "ACTIVE";

    const found = {};
    if (!body.firstName) found.firstName = "First name is required";
    if (!body.lastName) found.lastName = "Last name is required";
    if (!body.role) found.role = "Role is required";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    setFailure("");
    try {
      const result = editing ? await send(`/api/operator/staff/${person.id}`, "PATCH", body) : await send("/api/operator/staff", "POST", body);
      if (result) {
        onSaved();
        onClose();
        return;
      }
    } catch {
      setFailure("Could not save. Check your connection and try again.");
    }
    setBusy(false);
  };

  return (
    <Dialog title={editing ? "Edit employee" : "Add employee"} onClose={onClose}>
      <p className="text-sm leading-5 text-muted">Staff are records only. Drivers still sign in with their bus code and PIN.</p>
      <form onSubmit={save} noValidate className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <Field label="First name" htmlFor="staffFirstName" error={errors.firstName}>
            <input id="staffFirstName" name="firstName" type="text" placeholder="Enter first name" defaultValue={person?.firstName} autoFocus maxLength={40} className={bare} />
          </Field>
          <Field label="Last name" htmlFor="staffLastName" error={errors.lastName}>
            <input id="staffLastName" name="lastName" type="text" placeholder="Enter last name" defaultValue={person?.lastName} maxLength={40} className={bare} />
          </Field>
        </div>
        <Field label="Role" htmlFor="staffRole" error={errors.role}>
          <select id="staffRole" name="role" defaultValue={person?.role ?? ""} className={bare}>
            <option value="" disabled hidden>
              Select a role
            </option>
            <option value="DRIVER">Driver</option>
            <option value="CONDUCTOR">Conductor</option>
          </select>
        </Field>
        <Field label="Bus" htmlFor="staffBus">
          <select id="staffBus" name="busId" defaultValue={person?.busId ?? ""} className={bare}>
            <option value="">Not assigned</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.busNumber} · {bus.name}
              </option>
            ))}
          </select>
        </Field>
        {editing && (
          <Field label="Status" htmlFor="staffStatus">
            <select id="staffStatus" name="status" defaultValue={person.active ? "ACTIVE" : "INACTIVE"} className={bare}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>
        )}
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

export default StaffDialog;
