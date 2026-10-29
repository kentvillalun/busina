import { haptic, hapticTrigger } from "@/lib/haptics";

// One half of the Northbound / Southbound switch. `item` is { title, hint }.
const DirectionTab = ({ item, selected, onPress }) => (
  <button
    type="button"
    ref={hapticTrigger}
    onClick={() => {
      haptic.light();
      onPress();
    }}
    aria-pressed={selected}
    className={`flex h-15 flex-1 flex-col  items-center justify-center rounded-[14px] transition-colors ${
      selected
        ? "bg-linear-to-b from-primary-light to-primary-dark text-white"
        : "text-muted"
    }`}
  >
    <span className="text-[15px] font-bold">{item.title}</span>
    <span className="text-xs font-medium">{item.hint}</span>
  </button>
);

export default DirectionTab;
