import StatusChip from "@/components/operator/StatusChip";
import { crewText, routeText, seatsText } from "@/lib/fleet";

// One bus as a card, for phones (the table is for md and up).
const BusCard = ({ bus }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between gap-3">
      <p className="font-semibold text-ink">
        {bus.busNumber} <span className="font-normal text-muted">· {bus.name}</span>
      </p>
      <StatusChip status={bus.status} />
    </div>
    <p className="text-xs text-muted">
      {routeText(bus.direction)} · {crewText(bus)}
    </p>
    <div className="flex items-center justify-between border-t border-line/60 pt-2 text-xs text-muted">
      <span>Seats free {seatsText(bus)}</span>
      <span>{bus.lastUpdate}</span>
    </div>
  </div>
);

export default BusCard;
