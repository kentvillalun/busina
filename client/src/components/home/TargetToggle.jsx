import { haptic, hapticTrigger } from "@/lib/haptics";

const OPTIONS = [
  { key: "location", label: "My location" },
  { key: "spot", label: "Boarding spot" },
];

// Home header: what the ETA and the alerts are measured from. `mode` is "location" or "spot" (see lib/target.js).
const TargetToggle = ({ mode, onPick }) => (
  <div role="group" aria-label="Measure the ETA from" className="flex rounded-full bg-white/80 p-0.5 text-xs font-semibold">
    {OPTIONS.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        ref={hapticTrigger}
        aria-pressed={mode === key}
        onClick={() => {
          haptic.light();
          onPick(key);
        }}
        className={`rounded-full px-2.5 py-1 transition-colors ${mode === key ? "bg-navy text-white" : "text-navy"}`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default TargetToggle;
