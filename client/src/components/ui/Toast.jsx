// A small pill that confirms an action. Not full width, never takes taps. The page decides when to show and hide it.
const Toast = ({ message }) => (
  <div className="pointer-events-none fixed inset-x-0 bottom-32 z-30 flex justify-center px-4">
    <p
      role="status"
      className="flex max-w-80 items-center gap-2 rounded-full bg-navy py-2.5 pl-3 pr-4 text-[13px] font-semibold text-white shadow-lg"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 shrink-0 fill-none stroke-current stroke-2">
        <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </p>
  </div>
);

export default Toast;
