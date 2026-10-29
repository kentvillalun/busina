// PLACEHOLDER: a preview of the design tokens. The real home page replaces this.
const COLORS = [
  { name: "primary", hex: "#1f73bd", className: "bg-primary" },
  { name: "primary-light", hex: "#3a8fd6", className: "bg-primary-light" },
  { name: "primary-dark", hex: "#165a98", className: "bg-primary-dark" },
  { name: "navy", hex: "#103b60", className: "bg-navy" },
  { name: "ink", hex: "#0f2233", className: "bg-ink" },
  { name: "muted", hex: "#4a5b6b", className: "bg-muted" },
  { name: "line", hex: "#c9d6e2", className: "bg-line" },
  { name: "stage", hex: "#e7f0f8", className: "bg-stage" },
  { name: "success", hex: "#2a7230", className: "bg-success" },
  { name: "uncertain", hex: "#5a6b78", className: "bg-uncertain" },
  { name: "uncertain-bg", hex: "#eef1f4", className: "bg-uncertain-bg" },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <h1 className="font-display text-[26px] text-ink">Design system</h1>
      <p className="mt-1 text-[14px] text-muted">Busina tokens. This page is replaced by the home screen.</p>

      <section className="mt-6 grid grid-cols-2 gap-3">
        {COLORS.map((color) => (
          <div key={color.name} className="flex items-center gap-3 rounded-xl border border-line bg-white p-2">
            <div className={`h-10 w-10 shrink-0 rounded-lg border border-line ${color.className}`} />
            <div>
              <p className="text-[13px] font-semibold text-ink">{color.name}</p>
              <p className="text-[12px] text-muted">{color.hex}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-4">
        <p className="font-display text-[22px] text-navy">font-display: 4 min</p>
        <p className="mt-2 text-[15px]">font-sans: 9 of 40 seats free</p>
        <p className="text-[15px] font-medium">font-medium: 9 of 40 seats free</p>
        <p className="text-[15px] font-semibold">font-semibold: Sample Line Express</p>
        <p className="text-[15px] font-bold">font-bold: Northbound</p>
        <p className="mt-2 text-[13px] font-medium text-success">text-success: 9 of 40 seats free</p>
        <p className="text-[13px] font-medium text-uncertain">text-uncertain: Signal lost</p>
      </section>

      <button className="mt-6 h-14 w-full rounded-[18px] bg-linear-to-b from-primary-light to-primary-dark font-bold text-white">
        Continue
      </button>
    </main>
  );
}
