"use client";

import FleetMap from "@/components/operator/FleetMap";
import DataTable from "@/components/operator/DataTable";
import StatusChip from "@/components/operator/StatusChip";
import { FLEET, NEEDS_ATTENTION, ROUTE_NAME, routeText } from "@/lib/fleetSample";

const COLUMNS = [
  { header: "Bus", render: (bus) => bus.busNumber },
  { header: "Route", render: (bus) => routeText(bus.direction) },
  { header: "Status", render: (bus) => <StatusChip status={bus.status} /> },
  { header: "Seats free", render: (bus) => (bus.seatsFree === null ? "Unknown" : `${bus.seatsFree} / ${bus.seatCount}`) },
  { header: "Speed", render: (bus) => (bus.speedKmh === null ? "—" : `${bus.speedKmh} km/h`) },
  { header: "Last update", render: (bus) => bus.lastUpdate },
];

// Figma OP2. Sample fleet until GET /operator/fleet exists; the page says so.
export default function OperatorOverviewPage() {
  const reporting = FLEET.filter((bus) => bus.status === "live" || bus.status === "stopover").length;
  const known = FLEET.filter((bus) => bus.seatsFree !== null);
  const seatsTaken = Math.round((1 - known.reduce((sum, bus) => sum + bus.seatsFree, 0) / known.reduce((sum, bus) => sum + bus.seatCount, 0)) * 100);
  const attention = FLEET.filter((bus) => NEEDS_ATTENTION.includes(bus.status));
  const lost = attention.filter((bus) => bus.status === "stale").length;

  const kpis = [
    { label: "Buses reporting", value: `${reporting} / ${FLEET.length}`, note: `${FLEET.length - reporting} at rest, stale or offline` },
    { label: "Seats taken now", value: `${seatsTaken}%`, note: "From seat sensors, fleet average" },
    { label: "Needs attention", value: attention.length, note: `${lost} signal lost · ${attention.length - lost} no signal yet`, alert: attention.length > 0 },
    { label: "Fleet size", value: FLEET.length, note: "Buses of your company" },
  ];

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-4 md:gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-[28px] leading-8 text-ink">Fleet overview</h1>
          <p className="text-[13px] text-muted">
            {ROUTE_NAME.replace("–", "to")} · {FLEET.length} buses
          </p>
        </div>
        <span className="rounded-full border border-primary bg-stage px-2.5 py-1 text-xs font-semibold text-navy md:ml-auto">SIMULATED DATA</span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex flex-col gap-1 rounded-2xl border border-[#e3eaf1] bg-white p-4">
            <p className="text-[13px] font-medium text-muted">{kpi.label}</p>
            <p className={`font-display text-[28px] leading-9 md:text-[32px] ${kpi.alert ? "text-fault" : "text-ink"}`}>{kpi.value}</p>
            <p className="text-xs text-muted">{kpi.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative h-80 overflow-hidden rounded-2xl border border-[#e3eaf1] bg-white md:h-96 lg:h-auto lg:min-h-80">
          <FleetMap fleet={FLEET} />
        </div>
        <section className="flex flex-col gap-3 rounded-2xl border border-[#e3eaf1] bg-white p-4">
          <h2 className="font-display text-lg text-ink">Needs attention</h2>
          {attention.length === 0 && <p className="text-sm text-muted">Every bus is reporting.</p>}
          {attention.map((bus) => (
            <div key={bus.id} className="flex items-start gap-3 border-t border-[#e3eaf1] pt-3">
              <span className="rounded-lg bg-uncertain-bg px-2.5 py-1 text-sm font-bold text-uncertain">{bus.busNumber}</span>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-fault">{bus.status === "stale" ? "Signal lost" : "No signal yet"}</p>
                <p className="text-xs text-muted">
                  {bus.status === "stale" ? `Last update ${bus.lastUpdate}` : "The device has not sent a position yet"}
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-ink">Buses</h2>
        <DataTable columns={COLUMNS} rows={FLEET} />
      </section>
    </div>
  );
}
