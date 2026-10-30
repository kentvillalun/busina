// The "Live 8s" pill. `seconds` is the age of the freshest ping across all buses.
const LiveStatus = ({ seconds }) => (
  <div className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-2.5 pr-3 shadow-sm">
    <span className="relative flex size-4 items-center justify-center">
      <span className="absolute size-4.5 rounded-full bg-primary/10" />
      <span className="size-2 rounded-full bg-primary" />
    </span>
    <span className="text-xs font-bold text-navy">Live</span>
    <span className="text-xs font-medium text-muted">{seconds}s</span>
  </div>
);

export default LiveStatus;
