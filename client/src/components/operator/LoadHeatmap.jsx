import { Fragment } from "react";
import { DAYS, HOURS, INSIGHT, LOAD } from "@/lib/operatorSample";

// Darker means fuller. Above 100% there are riders standing.
const SHADES = [
  { min: 100, bg: "#103b60", fg: "#ffffff" },
  { min: 80, bg: "#1f73bd", fg: "#ffffff" },
  { min: 60, bg: "#8db8de", fg: "#0f2233" },
  { min: 40, bg: "#c5dcee", fg: "#0f2233" },
  { min: 0, bg: "#e7f0f8", fg: "#4a5b6b" },
];
const shade = (value) => SHADES.find((s) => value >= s.min);

const LoadHeatmap = () => (
  <section className="flex flex-col gap-3 rounded-2xl border border-[#e3eaf1] bg-white p-4">
    <div className="flex flex-col gap-0.5">
      <h2 className="font-display text-lg text-ink">Average load by departure time</h2>
      <p className="text-xs text-muted">
        Seats and standing room used when the bus leaves. Door-sensor estimate, last 30 days.
      </p>
    </div>

    {/* On a phone the grid is wider than the card, so it scrolls sideways. */}
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div
        role="group"
        aria-label="Average load by departure time and day"
        className="grid min-w-136 gap-[3px]"
        style={{ gridTemplateColumns: `34px repeat(${HOURS.length}, minmax(0, 1fr))` }}
      >
        <span />
        {HOURS.map((hour, i) => (
          <span key={hour} className="text-center text-[11px] font-medium text-muted">
            {i % 2 === 0 ? hour : ""}
          </span>
        ))}
        {DAYS.map((day, d) => (
          <Fragment key={day}>
            <span className="self-center text-[11px] font-medium text-muted">{day}</span>
            {LOAD[d].map((value, i) => {
              const { bg, fg } = shade(value);
              return (
                <div
                  key={HOURS[i]}
                  title={`${day} ${HOURS[i]}: ${value}%`}
                  className="flex h-6.5 items-center justify-center rounded-md text-[11px] font-medium"
                  style={{ background: bg, color: fg }}
                >
                  {value}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
      <span>Lower load</span>
      {[...SHADES].reverse().map((s) => (
        <span key={s.bg} className="h-3 w-5.5 rounded-[3px]" style={{ background: s.bg }} />
      ))}
      <span>Full or standing (%)</span>
    </div>

    <div className="flex flex-col gap-1 rounded-xl bg-stage px-3.5 py-3">
      <h3 className="text-[13px] font-semibold text-navy">What stands out</h3>
      <p className="text-xs leading-[18px] text-ink">{INSIGHT}</p>
    </div>
  </section>
);

export default LoadHeatmap;
