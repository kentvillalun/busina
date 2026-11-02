"use client";

import { useState } from "react";
import DataTable from "@/components/operator/DataTable";
import Dialog, { outlineButton, primaryButton } from "@/components/operator/Dialog";
import { FLEET, STAFF } from "@/lib/fleetSample";

const ROLE = { DRIVER: "Driver", CONDUCTOR: "Conductor" };
const fullName = (person) => `${person.firstName} ${person.lastName}`;
const statusChip = (person) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${person.active ? "bg-success-tint text-success" : "bg-uncertain-bg text-uncertain"}`}>
    {person.active ? "Active" : "Inactive"}
  </span>
);

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

// Figma OP7 and OP8. A roster, not logins: drivers still sign in with their bus code and PIN, and assigning a bus only records
// who works on it. The list lives in this page's state until the API exists.
export default function OperatorStaffPage() {
  const [people, setPeople] = useState(STAFF);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState({});
  const busNumber = (busId) => FLEET.find((bus) => bus.id === busId)?.busNumber ?? "Not assigned";

  const columns = [
    { header: "Name", render: fullName },
    { header: "Role", render: (person) => ROLE[person.role] },
    { header: "Bus", render: (person) => busNumber(person.busId) },
    { header: "Status", render: statusChip },
    {
      header: "Action",
      render: () => (
        <button type="button" className="font-medium text-primary hover:underline">
          Edit
        </button>
      ),
    },
  ];

  const closeForm = () => {
    setErrors({});
    setAdding(false);
  };

  const save = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const firstName = data.get("firstName").trim();
    const lastName = data.get("lastName").trim();
    const role = data.get("role");

    const found = {};
    if (!firstName) found.firstName = "First name is required";
    if (!lastName) found.lastName = "Last name is required";
    if (!role) found.role = "Role is required";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPeople([...people, { id: `s${people.length + 1}`, firstName, lastName, role, active: true, busId: data.get("busId") || null }]);
    closeForm();
  };

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-4 md:gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-[28px] leading-8 text-ink">Staff</h1>
          <p className="text-[13px] text-muted">Drivers and conductors, and the bus each one works on</p>
        </div>
        <span className="rounded-full border border-primary bg-stage px-2.5 py-1 text-xs font-semibold text-navy">SIMULATED DATA</span>
        <button type="button" onClick={() => setAdding(true)} className={`${primaryButton} w-full md:ml-auto md:w-40`}>
          Add employee
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={people}
        card={(person) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-ink">{fullName(person)}</p>
              {statusChip(person)}
            </div>
            <p className="text-xs text-muted">
              {ROLE[person.role]} · {busNumber(person.busId)}
            </p>
          </div>
        )}
        labels={{ empty: ["No staff yet", "Press the Add employee button above to register your first driver or conductor."] }}
      />

      {adding && (
        <Dialog title="Add employee" onClose={closeForm}>
          <p className="text-sm leading-5 text-muted">Staff are records only. Drivers still sign in with their bus code and PIN.</p>
          <form onSubmit={save} noValidate className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <Field label="First name" htmlFor="staffFirstName" error={errors.firstName}>
                <input id="staffFirstName" name="firstName" type="text" placeholder="Enter first name" autoFocus maxLength={40} className={bare} />
              </Field>
              <Field label="Last name" htmlFor="staffLastName" error={errors.lastName}>
                <input id="staffLastName" name="lastName" type="text" placeholder="Enter last name" maxLength={40} className={bare} />
              </Field>
            </div>
            <Field label="Role" htmlFor="staffRole" error={errors.role}>
              <select id="staffRole" name="role" defaultValue="" className={bare}>
                <option value="" disabled hidden>
                  Select a role
                </option>
                <option value="DRIVER">Driver</option>
                <option value="CONDUCTOR">Conductor</option>
              </select>
            </Field>
            <Field label="Bus" htmlFor="staffBus">
              <select id="staffBus" name="busId" defaultValue="" className={bare}>
                <option value="">Not assigned</option>
                {FLEET.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.busNumber} · {bus.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={closeForm} className={outlineButton}>
                Cancel
              </button>
              <button type="submit" className={primaryButton}>
                Save
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
