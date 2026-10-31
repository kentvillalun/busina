import DepartureSlots from "@/components/operator/DepartureSlots";
import LoadHeatmap from "@/components/operator/LoadHeatmap";
import { KPIS, SUGGESTIONS } from "@/lib/operatorSample";

// Figma S6. Every number comes from lib/operatorSample.js and is simulated; the page says so.
export default function OperatorInsightsPage() {
  return (
    <div className="mx-auto flex max-w-300 flex-col gap-4 md:gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-[28px] leading-8 text-ink">Insights</h1>
          <p className="text-[13px] text-muted">Laoag – Vigan · last 30 days</p>
        </div>
        <span className="rounded-full border border-primary bg-stage px-2.5 py-1 text-xs font-semibold text-navy md:ml-auto">
          SIMULATED DATA
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="flex flex-col gap-1 rounded-2xl border border-[#e3eaf1] bg-white p-4">
            <p className="text-[13px] font-medium text-muted">{kpi.label}</p>
            <p className="font-display text-[28px] leading-9 text-ink md:text-[32px]">{kpi.value}</p>
            <p className="text-xs text-muted">{kpi.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <LoadHeatmap />
        <section className="flex flex-col gap-3 rounded-2xl border border-[#e3eaf1] bg-white p-4">
          <h2 className="font-display text-lg text-ink">Suggested departures</h2>
          <p className="text-xs text-muted">
            Estimates from the last 30 days. A starting point for your schedule, not a forecast.
          </p>
          {SUGGESTIONS.map((item) => (
            <div key={item.title} className="flex flex-col gap-1.5 border-t border-[#e3eaf1] pt-3">
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  item.highlight ? "bg-stage text-navy" : "bg-uncertain-bg text-uncertain"
                }`}
              >
                {item.tag}
              </span>
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="text-xs leading-[18px] text-muted">{item.text}</p>
            </div>
          ))}
        </section>
      </div>

      <DepartureSlots />
    </div>
  );
}
