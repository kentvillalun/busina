// A small card that confirms an action: at the top, centered, about 40% of the screen wide. It never takes taps.
// The page decides when to show and hide it.
const Toast = ({ message }) => (
  <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+16px)] z-30 flex justify-center px-4">
    <p
      role="status"
      className="flex min-h-16 w-[40vw] min-w-44 max-w-xs flex-col items-center justify-center gap-1.5 rounded-3xl bg-navy px-4 py-3 text-center text-[13px] font-semibold leading-4.5 text-white shadow-lg"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-success">
        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 fill-none stroke-white stroke-[2.5]">
          <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {message}
    </p>
  </div>
);

export default Toast;
