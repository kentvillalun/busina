"use client";

import { useState } from "react";
import DataTable from "@/components/operator/DataTable";
import Dialog, { outlineButton, primaryButton } from "@/components/operator/Dialog";
import { FLEET, STAFF } from "@/lib/fleetSample";

const ROLE = { DRIVER: "Driver", CONDUCTOR: "Conductor" };
const fieldClass = "mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink outline-none focus:border-primary";

// Figma OP7 and OP8. A roster, not logins: drivers still sign in with their bus code and PIN, and assigning a bus only records
// who works on it. The list lives in this page's state until the API exists.
export default function OperatorStaffPage() {
  const [people, setPeople] = useState(STAFF);
  const [adding, setAdding] = useState(false);
  const busNumber = (busId) => FLEET.find((bus) => bus.id === busId)?.busNumber ?? "Not assigned";

  const columns = [
    { header: "Name", render: (person) => person.name },
    { header: "Role", render: (person) => ROLE[person.role] },
    { header: "Bus", render: (person) => busNumber(person.busId) },
    {
      header: "Status",
      render: (person) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${person.active ? "bg-success-tint text-success" : "bg-uncertain-bg text-uncertain"}`}>
          {person.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Action",
      render: () => (
        <button type="button" className="font-medium text-primary hover:underline">
          Edit
        </button>
      ),
    },
  ];

  const save = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("name").trim();
    if (!name) return;
    setPeople([...people, { id: `s${people.length + 1}`, name, role: data.get("role"), active: true, busId: data.get("busId") || null }]);
    setAdding(false);
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

      <DataTable columns={columns} rows={people} />

      {adding && (
        <Dialog title="Add employee" onClose={() => setAdding(false)}>
          <p className="text-sm leading-5 text-muted">Staff are records only. Drivers still sign in with their bus code and PIN.</p>
          <form onSubmit={save} className="flex flex-col gap-3.5">
            <label className="text-[13px] font-semibold text-ink">
              Full name
              <input name="name" required autoFocus maxLength={60} className={fieldClass} />
            </label>
            <label className="text-[13px] font-semibold text-ink">
              Role
              <select name="role" className={fieldClass}>
                <option value="DRIVER">Driver</option>
                <option value="CONDUCTOR">Conductor</option>
              </select>
            </label>
            <label className="text-[13px] font-semibold text-ink">
              Bus
              <select name="busId" className={fieldClass}>
                <option value="">Not assigned</option>
                {FLEET.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.busNumber} · {bus.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setAdding(false)} className={outlineButton}>
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
