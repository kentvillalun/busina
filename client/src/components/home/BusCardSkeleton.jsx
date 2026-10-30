// Placeholder with the same shape as BusCard, shown while the first fetch is running.
const BusCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="flex animate-pulse flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5"
  >
    <div className="flex items-center gap-3">
      <span className="h-10 w-13.5 rounded-[10px] bg-stage" />
      <div className="flex flex-1 flex-col gap-2">
        <span className="h-3.5 w-3/5 rounded-full bg-stage" />
        <span className="h-3 w-2/5 rounded-full bg-stage" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="h-5 w-14 rounded-full bg-stage" />
        <span className="h-2.5 w-16 rounded-full bg-stage" />
      </div>
    </div>
    <span className="h-3 w-1/2 rounded-full bg-stage" />
  </div>
);

export default BusCardSkeleton;
