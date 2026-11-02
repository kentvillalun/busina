"use client";

import BusCard from "@/components/operator/BusCard";
import DataTable from "@/components/operator/DataTable";
import FleetMap from "@/components/operator/FleetMap";
import { Empty, ErrorState, Loading } from "@/components/operator/states";
import StatusChip from "@/components/operator/StatusChip";
import useFleet from "@/hooks/useFleet";
import { BUS_LABELS, NEEDS_ATTENTION, routeText, seatsText } from "@/lib/fleet";

const COLUMNS = [
  { header: "Bus", render: (bus) => bus.busNumber },
  { header: "Route", render: (bus) => routeText(bus.direction) },
  { header: "Status", render: (bus) => <StatusChip status={bus.status} /> },
  { header: "Seats free", render: seatsText },
  { header: "Speed", render: (bus) => (bus.speedKmh === null ? "—" : `${bus.speedKmh} km/h`) },
  { header: "Last update", render: (bus) => bus.lastUpdate },
];

// Figma OP2: the live fleet of the signed-in operator's company. The layout is always there; before the first answer the
// numbers are dashes and the table says it is loading, and if the first answer never comes the table says so in red.
export default function OperatorOverviewPage() {
  const { fleet, loaded, offline, reload } = useFleet();
  const loadError = !loaded && offline;

  const reporting = fleet.filter((bus) => bus.status === "live" || bus.status === "stopover").length;
  const known = fleet.filter((bus) => bus.seatsFree !== null);
  const seatTotal = known.reduce((sum, bus) => sum + bus.seatCount, 0);
  const seatsTaken = seatTotal ? `${Math.round((1 - known.reduce((sum, bus) => sum + bus.seatsFree, 0) / seatTotal) * 100)}%` : "—";
  const attention = fleet.filter((bus) => NEEDS_ATTENTION.includes(bus.status));
  const lost = attention.filter((bus) => bus.status === "stale").length;
  const dash = (value) => (loaded ? value : "—");

  const kpis = [
    { label: "Buses reporting", value: dash(`${reporting} / ${fleet.length}`), note: loaded ? `${fleet.length - reporting} at rest, stale or offline` : " " },
    { label: "Seats taken now", value: dash(seatsTaken), note: "From seat sensors, fleet average" },
    { label: "Needs attention", value: dash(attention.length), note: loaded ? `${lost} signal lost · ${attention.length - lost} no signal yet` : " ", alert: loaded && attention.length > 0 },
    { label: "Fleet size", value: dash(fleet.length), note: "Buses of your company" },
  ];

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-display text-[28px] leading-8 text-ink">Fleet overview</h1>
        <p className="text-[13px] text-muted">
          {loaded ? `${fleet.length} ${fleet.length === 1 ? "bus" : "buses"}${fleet[0] ? ` · ${fleet[0].routeName}` : ""}` : " "}
          {loaded && offline ? " · connection lost, showing the last data" : ""}
        </p>
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
        <div className="relative isolate h-80 overflow-hidden rounded-2xl border border-[#e3eaf1] bg-white md:h-96 lg:h-auto lg:min-h-80">
          <FleetMap fleet={fleet} />
        </div>
        <section className="flex flex-col gap-3 rounded-2xl border border-[#e3eaf1] bg-white p-4">
          <h2 className="font-display text-lg text-ink">Needs attention</h2>
          {attention.length === 0 &&
            (loadError ? (
              <ErrorState onRetry={reload} text={BUS_LABELS.error[0]} subtext={BUS_LABELS.error[1]} />
            ) : !loaded ? (
              <Loading text={BUS_LABELS.loading[0]} subtext={BUS_LABELS.loading[1]} />
            ) : fleet.length === 0 ? (
              <Empty text={BUS_LABELS.empty[0]} subtext={BUS_LABELS.empty[1]} />
            ) : (
              <Empty text="No bus needs attention" subtext="Every bus is reporting or off duty." />
            ))}
          {attention.map((bus) => (
            <div key={bus.id} className="flex items-start gap-3 border-t border-[#e3eaf1] pt-3">
              <span className="rounded-lg bg-uncertain-bg px-2.5 py-1 text-sm font-bold text-uncertain">{bus.busNumber}</span>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-fault">{bus.status === "stale" ? "Signal lost" : "No signal yet"}</p>
                <p className="text-xs text-muted">{bus.status === "stale" ? `Last update ${bus.lastUpdate}` : "The device has not sent a position yet"}</p>
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-ink">Buses</h2>
        <DataTable columns={COLUMNS} rows={fleet} card={(bus) => <BusCard bus={bus} />} loading={!loaded && !offline} error={loadError} onRetry={reload} labels={BUS_LABELS} />
      </section>
    </div>
  );
}
