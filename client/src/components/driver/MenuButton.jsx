import { haptic, hapticTrigger } from "@/lib/haptics";

// The hamburger. No background at rest; the soft circle shows only while it is pressed (Figma "Menu button states").
const MenuButton = ({ onClick, label = "Open menu", className = "" }) => (
  <button
    type="button"
    ref={hapticTrigger}
    onClick={() => {
      haptic.light();
      onClick();
    }}
    aria-label={label}
    className={`flex size-10 shrink-0 flex-col items-center justify-center gap-1.25 rounded-full active:bg-white/80 ${className}`}
  >
    <span className="h-0.5 w-4.5 rounded-full bg-ink" />
    <span className="h-0.5 w-4.5 rounded-full bg-ink" />
    <span className="h-0.5 w-4.5 rounded-full bg-ink" />
  </button>
);

export default MenuButton;
