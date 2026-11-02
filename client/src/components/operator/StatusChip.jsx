import { STATUS } from "@/lib/fleet";

const StatusChip = ({ status }) => (
  <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[status].look}`}>
    {STATUS[status].label}
  </span>
);

export default StatusChip;
