import { SLOTS } from "@/lib/operatorSample";

const Pill = ({ highlight, children }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
      highlight ? "bg-stage text-navy" : "bg-uncertain-bg text-uncertain"
    }`}
  >
    {children}
  </span>
);

// A table from lg up; below that each slot is a card, because six columns do not fit a phone.
const DepartureSlots = () => (
  <section className="rounded-2xl border border-[#e3eaf1] bg-white p-4">
    <h2 className="font-display text-lg text-ink">Departure slots</h2>

    <div className="mt-2 hidden lg:block">
      <div className="grid grid-cols-[90px_1.2fr_1fr_0.8fr_1fr_1.4fr] border-b border-[#e3eaf1] py-2 text-xs font-semibold text-muted">
        <span>Departure</span>
        <span>Days</span>
        <span>Demand</span>
        <span>Avg load</span>
        <span>Standing (est.)</span>
        <span>Suggestion</span>
      </div>
      {SLOTS.map((slot) => (
        <div
          key={slot.time + slot.days}
          className="grid grid-cols-[90px_1.2fr_1fr_0.8fr_1fr_1.4fr] items-center border-b border-[#e3eaf1] py-2.5 text-sm text-ink last:border-b-0"
        >
          <span className="font-bold">{slot.time}</span>
          <span>{slot.days}</span>
          <span>
            <Pill highlight={slot.highlight}>{slot.demand}</Pill>
          </span>
          <span>{slot.load}</span>
          <span>{slot.standing}</span>
          <span>{slot.suggestion}</span>
        </div>
      ))}
    </div>

    <ul className="mt-3 flex flex-col gap-3 lg:hidden">
      {SLOTS.map((slot) => (
        <li key={slot.time + slot.days} className="flex flex-col gap-2 rounded-xl border border-[#e3eaf1] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-ink">
              <span className="font-bold">{slot.time}</span> · {slot.days}
            </p>
            <Pill highlight={slot.highlight}>{slot.demand}</Pill>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-muted">Avg load</dt>
              <dd className="text-sm text-ink">{slot.load}</dd>
            </div>
            <div>
              <dt className="text-muted">Standing (est.)</dt>
              <dd className="text-sm text-ink">{slot.standing}</dd>
            </div>
          </dl>
          <p className="text-sm font-medium text-navy">{slot.suggestion}</p>
        </li>
      ))}
    </ul>
  </section>
);

export default DepartureSlots;
