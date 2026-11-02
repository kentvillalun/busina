import { ArrowPathIcon } from "@heroicons/react/24/outline";

// Loading, empty and error states, as in Ecoaid: a main message and a smaller line under it that says more, centered in a block
// of fixed height so the page does not jump when the data arrives. The error state has a button that asks again.
const frame = "flex h-56 flex-col items-center justify-center gap-1 px-4 text-center";

export const Loading = ({ text = "Loading. Please wait", subtext = "Items are currently loading" }) => (
  <div role="status" className={frame}>
    <ArrowPathIcon className="mb-1 size-9 animate-spin stroke-primary" aria-hidden="true" />
    <p className="text-xl font-semibold text-ink">{text}</p>
    <p className="text-sm text-muted">{subtext}</p>
  </div>
);

export const Empty = ({ text = "Nothing here yet", subtext }) => (
  <div className={frame}>
    <p className="text-xl font-semibold text-ink">{text}</p>
    {subtext && <p className="text-sm text-muted">{subtext}</p>}
  </div>
);

export const ErrorState = ({ onRetry, text = "Something went wrong", subtext = "Please try again", buttonLabel = "Try again" }) => (
  <div role="alert" className={frame}>
    <p className="text-xl font-semibold text-ink">{text}</p>
    <p className="text-sm text-muted">{subtext}</p>
    <button type="button" onClick={onRetry} className="mt-3 h-10 rounded-xl bg-linear-to-b from-primary-light to-primary-dark px-10 text-sm font-bold text-white active:opacity-80">
      {buttonLabel}
    </button>
  </div>
);
