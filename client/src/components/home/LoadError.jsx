import { haptic, hapticTrigger } from "@/lib/haptics";

// Shown in the sheet when the buses could not be loaded at all.
const LoadError = ({ onRetry }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
    <p className="text-[15px] font-semibold text-ink">Can&apos;t load buses</p>
    <p className="text-[13px] leading-4.5 text-muted">
      Check your connection, then try again.
    </p>
    <button
      type="button"
      ref={hapticTrigger}
      onClick={() => {
        haptic.light();
        onRetry();
      }}
      className="mt-2 rounded-full bg-linear-to-b from-primary-light to-primary-dark px-4 py-2.5 text-[13px] font-bold text-white"
    >
      Try again
    </button>
  </div>
);

export default LoadError;
