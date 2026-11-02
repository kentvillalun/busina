"use client";

import { useState } from "react";
import DataTable from "@/components/operator/DataTable";
import { primaryButton } from "@/components/operator/Dialog";
import StaffDialog from "@/components/operator/StaffDialog";
import useFleet from "@/hooks/useFleet";
import useStaff from "@/hooks/useStaff";

const ROLE = { DRIVER: "Driver", CONDUCTOR: "Conductor" };
const fullName = (person) => `${person.firstName} ${person.lastName}`;
const statusChip = (person) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${person.active ? "bg-success-tint text-success" : "bg-uncertain-bg text-uncertain"}`}>
    {person.active ? "Active" : "Inactive"}
  </span>
);

const LABELS = {
  loading: ["Loading staff", "We are fetching the drivers and conductors of your company."],
  empty: ["No staff yet", "Press the Add employee button above to register your first driver or conductor."],
  error: ["Could not load the staff", "Check your connection, then try again."],
};

// Figma OP7 and OP8. A roster, not logins: drivers still sign in with their bus code and PIN, and a bus here only records who
// works on it. `dialog` is null, "add", or the person being edited.
export default function OperatorStaffPage() {
  const { staff, loaded, failed, reload } = useStaff();
  const { fleet } = useFleet({ poll: false });
  const [dialog, setDialog] = useState(null);
  const busNumber = (busId) => (busId ? (fleet.find((bus) => bus.id === busId)?.busNumber ?? "—") : "Not assigned");

  const columns = [
    { header: "Name", render: fullName },
    { header: "Role", render: (person) => ROLE[person.role] },
    { header: "Bus", render: (person) => busNumber(person.busId) },
    { header: "Status", render: statusChip },
    { header: "Action", render: () => <span className="font-medium text-primary">Edit</span> },
  ];

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-4 md:gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-[28px] leading-8 text-ink">Staff</h1>
          <p className="text-[13px] text-muted">Drivers and conductors, and the bus each one works on</p>
        </div>
        <button type="button" onClick={() => setDialog("add")} className={`${primaryButton} w-full md:ml-auto md:w-40`}>
          Add employee
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={staff}
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
        onRowClick={(id) => setDialog(staff.find((person) => person.id === id))}
        loading={!loaded && !failed}
        error={failed}
        onRetry={reload}
        labels={LABELS}
      />

      {dialog && <StaffDialog person={dialog === "add" ? null : dialog} buses={fleet} onClose={() => setDialog(null)} onSaved={reload} />}
    </div>
  );
}
