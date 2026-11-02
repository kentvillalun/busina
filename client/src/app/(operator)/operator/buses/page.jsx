"use client";

import { useState } from "react";
import BusDetailPanel from "@/components/operator/BusDetailPanel";
import DataTable from "@/components/operator/DataTable";
import StatusChip from "@/components/operator/StatusChip";
import useFleet from "@/hooks/useFleet";
import { NEEDS_ATTENTION, routeText, seatsText } from "@/lib/fleet";

const TABS = [
  { name: "All", test: () => true },
  { name: "Live", test: (bus) => bus.status === "live" },
  { name: "Needs attention", test: (bus) => NEEDS_ATTENTION.includes(bus.status) },
  { name: "At rest", test: (bus) => bus.status === "at_rest" },
  { name: "Stopover", test: (bus) => bus.status === "stopover" },
];

// Crew joins the table with the staff roster.
const COLUMNS = {
  bus: { header: "Bus", render: (bus) => bus.busNumber },
  route: { header: "Route", render: (bus) => routeText(bus.direction) },
  status: { header: "Status", render: (bus) => <StatusChip status={bus.status} /> },
  seats: { header: "Seats free", render: seatsText },
  speed: { header: "Speed", render: (bus) => (bus.speedKmh === null ? "—" : `${bus.speedKmh} km/h`) },
  update: { header: "Last update", render: (bus) => bus.lastUpdate },
};

// Figma OP3 and OP4. With a bus selected the table keeps four columns and the details open beside it.
export default function OperatorBusesPage() {
  const { fleet, loaded, offline, reload } = useFleet();
  const [tab, setTab] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  if (!loaded) return <p className="mx-auto max-w-300 text-sm text-muted">{offline ? "Could not load the fleet. Check your connection." : "Loading the fleet..."}</p>;

  const rows = fleet.filter(TABS.find((item) => item.name === tab).test);
  const selected = fleet.find((bus) => bus.id === selectedId);
  const columns = (selected ? ["bus", "status", "seats", "update"] : ["bus", "route", "status", "seats", "speed", "update"]).map((key) => COLUMNS[key]);

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-display text-[28px] leading-8 text-ink">Buses</h1>
        <p className="text-[13px] text-muted">
          {fleet.length} {fleet.length === 1 ? "bus" : "buses"} · select a bus for details{offline ? " · connection lost, showing the last data" : ""}
        </p>
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
              <span>{fleet.filter(item.test).length}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <DataTable columns={columns} rows={rows} onRowClick={setSelectedId} selectedId={selectedId} />
        {selected && <BusDetailPanel key={selected.id} bus={selected} onClose={() => setSelectedId(null)} onChanged={reload} />}
      </div>
    </div>
  );
}
