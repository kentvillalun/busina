// A pill that confirms an action: at the top, centered, check on the left and the message on the right. It never takes taps.
// The page decides when to show and hide it.
const Toast = ({ message }) => (
  <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+16px)] z-30 flex justify-center px-4">
    <p
      role="status"
      className="flex min-h-14 w-[40vw] min-w-56 max-w-sm animate-toast items-center gap-3 rounded-full bg-navy py-2.5 pl-2.5 pr-5 text-left text-[13px] font-medium leading-4.5 text-white shadow-lg motion-reduce:animate-none"
    >
      <span className="flex size-9 shrink-0 animate-check-pop items-center justify-center rounded-full bg-white motion-reduce:animate-none">
        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 fill-none stroke-success stroke-[2.5]">
          <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {message}
    </p>
  </div>
);

export default Toast;
