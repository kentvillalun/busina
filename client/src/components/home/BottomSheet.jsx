"use client";

import { animate, motion, useDragControls, useMotionValue } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const spring = { type: "spring", stiffness: 400, damping: 40 };
const NAV_SPACE = 96; // room under the first card for the floating nav
const WIDE = "(min-width: 768px)";

const subscribe = (onChange) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useIsWide = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => false);

// On a phone: a sheet with two stops. Closed shows the first child of the list, open shows
// everything. Drag the handle or the title, or tap the handle. On md and up it is a plain
// panel that always shows everything.
const BottomSheet = ({ title, meta, expanded, onExpandedChange, children }) => {
  const wide = useIsWide();
  const y = useMotionValue(0);
  const controls = useDragControls();
  const sheetRef = useRef(null);
  const listRef = useRef(null);
  const placed = useRef(false);
  const dragged = useRef(false);
  const [closedY, setClosedY] = useState(0); // how far the sheet slides down when closed

  useEffect(() => {
    if (wide) return;
    const measure = () => {
      const first = listRef.current?.firstElementChild;
      if (!sheetRef.current || !first) return;
      const peek = first.offsetTop + first.offsetHeight + NAV_SPACE;
      setClosedY(Math.max(0, sheetRef.current.offsetHeight - peek));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(sheetRef.current);
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [wide]);

  useEffect(() => {
    if (wide) {
      y.set(0);
      return;
    }
    const target = expanded ? 0 : closedY;
    if (!placed.current) {
      if (closedY === 0) return;
      y.set(target); // first placement jumps instead of sliding in
      placed.current = true;
      return;
    }
    animate(y, target, spring);
  }, [wide, expanded, closedY, y]);

  const onDragEnd = (_, info) => {
    const open =
      info.velocity.y < -300 ? true : info.velocity.y > 300 ? false : y.get() < closedY / 2;
    onExpandedChange(open);
    animate(y, open ? 0 : closedY, spring);
  };

  const startDrag = (event) => {
    dragged.current = false;
    if (!wide) controls.start(event);
  };

  const onHandleClick = () => {
    if (dragged.current) return;
    onExpandedChange(!expanded);
  };

  return (
    <motion.section
      ref={sheetRef}
      style={{ y }}
      drag={wide ? false : "y"}
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: closedY }}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={onDragEnd}
      className="pointer-events-auto relative flex min-h-0 max-h-[65dvh] flex-col rounded-t-[28px] bg-white pt-2 after:absolute after:inset-x-0 after:top-full after:h-40 after:bg-white md:after:hidden shadow-[0_-4px_20px_rgba(15,33,51,0.05)] md:max-h-none md:flex-1 md:rounded-none md:shadow-none"
    >
      <div onPointerDown={startDrag} className="touch-none px-4 md:touch-auto">
        <button
          type="button"
          onClick={onHandleClick}
          aria-label={expanded ? "Show fewer buses" : "Show all buses"}
          className="mx-auto mb-2 flex h-5 w-full items-center justify-center md:hidden"
        >
          <span className="h-1 w-9 rounded-full bg-line" />
        </button>

        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-display text-lg text-ink">{title}</h2>
          <span className="text-xs font-medium text-muted">{meta}</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-4">
        <div
          ref={listRef}
          className={`flex flex-col gap-3 *:transition-opacity ${
            expanded
              ? ""
              : "max-md:[&>*:not(:first-child)]:pointer-events-none max-md:[&>*:not(:first-child)]:opacity-0"
          }`}
        >
          {children}
        </div>
      </div>
    </motion.section>
  );
};

export default BottomSheet;
