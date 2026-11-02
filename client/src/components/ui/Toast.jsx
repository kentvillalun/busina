// A pill at the top, centered: the icon on the left, the message on the right, an optional action button at the end.
// type "success" shows a check, "error" an X. Without an action it never takes taps. The page decides when to show and
// hide it; `ms` is how long the page keeps it, and the slide-in/fade-out animation is stretched to the same time.
const Toast = ({ message, type = "success", action = null, ms = 2500 }) => (
  <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+16px)] z-30 flex justify-center px-4">
    <p
      role="status"
      style={{ animationDuration: `${ms}ms` }}
      className={`flex min-h-14 animate-toast items-center gap-3 rounded-full bg-navy py-2.5 pl-2.5 pr-5 text-left text-[13px] font-medium leading-4.5 text-white shadow-lg/5 ${
        action ? "w-full max-w-sm" : "w-[40vw] min-w-56 max-w-sm md:w-auto md:min-w-0"
      }`}
    >
      <span className="flex size-9 shrink-0 animate-check-pop items-center justify-center rounded-full bg-white">
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`size-5 fill-none stroke-[2.5] ${type === "error" ? "stroke-fault" : "stroke-success"}`}
        >
          <path
            d={type === "error" ? "M5 5l10 10M15 5L5 15" : "M4 10.5l4 4 8-9"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex-1">{message}</span>
      {action && (
        <button
          type="button"
          onClick={action.onPress}
          className="pointer-events-auto -mr-2 shrink-0 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-navy"
        >
          {action.label}
        </button>
      )}
    </p>
  </div>
);

export default Toast;
