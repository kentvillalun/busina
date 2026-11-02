"use client";

import { useState } from "react";
import BusDetailPanel from "@/components/operator/BusDetailPanel";
import DataTable from "@/components/operator/DataTable";
import StatusChip from "@/components/operator/StatusChip";
import { FLEET, NEEDS_ATTENTION, crewText, routeText } from "@/lib/fleetSample";

const TABS = [
  { name: "All", test: () => true },
  { name: "Live", test: (bus) => bus.status === "live" },
  { name: "Needs attention", test: (bus) => NEEDS_ATTENTION.includes(bus.status) },
  { name: "At rest", test: (bus) => bus.status === "at_rest" },
  { name: "Stopover", test: (bus) => bus.status === "stopover" },
];

const seatsText = (bus) => (bus.seatsFree === null ? "Unknown" : `${bus.seatsFree} / ${bus.seatCount}`);

const COLUMNS = {
  bus: { header: "Bus", render: (bus) => bus.busNumber },
  route: { header: "Route", render: (bus) => routeText(bus.direction) },
  status: { header: "Status", render: (bus) => <StatusChip status={bus.status} /> },
  seats: { header: "Seats free", render: seatsText },
  crew: { header: "Crew", render: (bus) => crewText(bus.id) },
  update: { header: "Last update", render: (bus) => bus.lastUpdate },
};

// Figma OP3 and OP4. With a bus selected the table keeps four columns and the details open beside it.
export default function OperatorBusesPage() {
  const [tab, setTab] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const rows = FLEET.filter(TABS.find((item) => item.name === tab).test);
  const selected = FLEET.find((bus) => bus.id === selectedId);
  const columns = (selected ? ["bus", "status", "seats", "update"] : ["bus", "route", "status", "seats", "crew", "update"]).map((key) => COLUMNS[key]);

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-4 md:gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-[28px] leading-8 text-ink">Buses</h1>
          <p className="text-[13px] text-muted">{FLEET.length} buses · select a bus for details</p>
        </div>
        <span className="rounded-full border border-primary bg-stage px-2.5 py-1 text-xs font-semibold text-navy md:ml-auto">SIMULATED DATA</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => {
          const on = item.name === tab;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setTab(item.name)}
              aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] ${
                on ? "bg-linear-to-b from-primary-light to-primary-dark font-bold text-white" : "border border-line bg-white font-medium text-muted"
              }`}
            >
              {item.name}
              <span>{FLEET.filter(item.test).length}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <DataTable columns={columns} rows={rows} onRowClick={setSelectedId} selectedId={selectedId} />
        {selected && <BusDetailPanel key={selected.id} bus={selected} onClose={() => setSelectedId(null)} />}
      </div>
    </div>
  );
}
