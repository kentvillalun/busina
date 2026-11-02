import { Bars3Icon } from "@heroicons/react/24/outline";
import { haptic, hapticTrigger } from "@/lib/haptics";

// The hamburger (Heroicons Bars3). No background at rest; the soft circle shows only while it is pressed (Figma "Menu button states").
const MenuButton = ({ onClick, label = "Open menu", className = "" }) => (
  <button
    type="button"
    ref={hapticTrigger}
    onClick={() => {
      haptic.light();
      onClick();
    }}
    aria-label={label}
    className={`flex size-10 shrink-0 items-center justify-center rounded-full active:bg-white/80 ${className}`}
  >
    <Bars3Icon className="size-6 text-ink" strokeWidth={2} aria-hidden="true" />
  </button>
);

export default MenuButton;
