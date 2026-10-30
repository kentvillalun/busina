"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconHome from "@/components/icons/IconHome";
import IconSettings from "@/components/icons/IconSettings";
import { haptic, hapticTrigger } from "@/lib/haptics";

const items = [
  { href: "/home", label: "Home", Icon: IconHome },
  { href: "/settings", label: "Settings", Icon: IconSettings },
];

const spring = { type: "spring", stiffness: 500, damping: 38 };

// Routes under (commuters) that should not show the nav, e.g. a full-screen bus details page.
const hiddenOn = ["/bus"];

export const BottomNav = () => {
  const pathname = usePathname();
  if (hiddenOn.some((path) => pathname.startsWith(path))) return null;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-[calc(12px+env(safe-area-inset-bottom))] z-50 flex justify-center md:inset-x-auto md:inset-y-0 md:bottom-0 md:left-4 md:items-center"
    >
      <motion.div
        layout
        transition={spring}
        className="flex items-center gap-1 md:flex-col rounded-full border border-white/70 bg-white/25 p-1.5 shadow-[0_10px_30px_rgba(15,33,51,0.18),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.3)] backdrop-blur-2xl backdrop-saturate-200"
      >
        {items.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              ref={hapticTrigger}
              onClick={haptic.light}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-11 items-center justify-center rounded-full px-3.5 transition-colors active:opacity-70 ${
                active ? "text-navy" : "text-muted"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  transition={spring}
                  className="absolute inset-0 rounded-full bg-stage/75"
                />
              )}
              <Icon solid={active} className="relative" />
              <AnimatePresence initial={false}>
                {active && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={spring}
                    className="relative overflow-hidden whitespace-nowrap text-sm font-bold md:hidden"
                  >
                    <span className="block pl-2 pr-0.5">{label}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
};
