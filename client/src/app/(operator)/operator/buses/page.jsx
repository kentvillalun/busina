"use client";

import { useState } from "react";
import BusCard from "@/components/operator/BusCard";
import BusDetailPanel from "@/components/operator/BusDetailPanel";
import DataTable from "@/components/operator/DataTable";
import Dialog from "@/components/operator/Dialog";
import StatusChip from "@/components/operator/StatusChip";
import useFleet from "@/hooks/useFleet";
import { BUS_LABELS, NEEDS_ATTENTION, crewText, routeText, seatsText } from "@/lib/fleet";

const TABS = [
  { name: "All", test: () => true },
  { name: "Live", test: (bus) => bus.status === "live" },
  { name: "Needs attention", test: (bus) => NEEDS_ATTENTION.includes(bus.status) },
  { name: "At rest", test: (bus) => bus.status === "at_rest" },
  { name: "Stopover", test: (bus) => bus.status === "stopover" },
];

const COLUMNS = [
  { header: "Bus", render: (bus) => bus.busNumber },
  { header: "Route", render: (bus) => routeText(bus.direction) },
  { header: "Status", render: (bus) => <StatusChip status={bus.status} /> },
  { header: "Seats free", render: seatsText },
  { header: "Crew", render: crewText },
  { header: "Last update", render: (bus) => bus.lastUpdate },
];

// Figma OP3. The table (cards on a phone) takes the whole width; a tap on a bus opens its details in a modal on every screen size.
export default function OperatorBusesPage() {
  const { fleet, loaded, offline, reload } = useFleet();
  const [tab, setTab] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const rows = fleet.filter(TABS.find((item) => item.name === tab).test);
  const selected = fleet.find((bus) => bus.id === selectedId);
  const labels = { ...BUS_LABELS, empty: fleet.length === 0 ? BUS_LABELS.empty : [`No buses in "${tab}"`, "Buses with this status will show up here."] };
  const close = () => setSelectedId(null);

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-display text-[28px] leading-8 text-ink">Buses</h1>
        <p className="text-[13px] text-muted">
          {loaded ? `${fleet.length} ${fleet.length === 1 ? "bus" : "buses"} · select a bus for details` : " "}
          {loaded && offline ? " · connection lost, showing the last data" : ""}
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

      <DataTable
        columns={COLUMNS}
        rows={rows}
        card={(bus) => <BusCard bus={bus} />}
        onRowClick={setSelectedId}
        loading={!loaded && !offline}
        error={!loaded && offline}
        onRetry={reload}
        labels={labels}
      />

      {selected && (
        <Dialog title={`Bus ${selected.busNumber}`} onClose={close} bare>
          <BusDetailPanel key={selected.id} bus={selected} onClose={close} onChanged={reload} />
        </Dialog>
      )}
    </div>
  );
}
