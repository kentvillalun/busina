"use client";

import { motion } from "motion/react";

// Pieces shared by the three onboarding scenes. Every scene is drawn on a 350 x 380 stage
// with absolute positions copied from the Figma frames (O1, O2, O3).

export const cardShadow = "shadow-[0_4px_7px_rgba(16,59,96,0.18)]";

// White road with its dashed centre line. The canvas is 120px wider on each side, so the road keeps
// going past the stage when the stage is scaled down; SceneStage clips the rest.
export const RoadBase = ({ withRoute = false }) => (
  <svg
    className="absolute top-0"
    style={{ left: -120 }}
    width="590"
    height="380"
    viewBox="-120 0 590 380"
    fill="none"
  >
    <rect
      x="-132.69"
      y="365.447"
      width="700"
      height="70"
      rx="35"
      transform="rotate(-34.6952 -132.69 365.447)"
      fill="white"
    />
    <line
      x1="-105.399"
      y1="387.298"
      x2="453.692"
      y2="0.235289"
      stroke="#92CEFF"
      strokeWidth="3"
      strokeDasharray="10 12"
    />
    {withRoute && (
      <rect
        x="71.6078"
        y="262.322"
        width="161.276"
        height="7"
        rx="3.5"
        transform="rotate(-34.6952 71.6078 262.322)"
        fill="#1F73BD"
      />
    )}
  </svg>
);

// The blue "214" pill used on the road.
export const BusMarker = ({ left, top, label = "214" }) => (
  <div
    className={`absolute rounded-[12px] border-[3px] border-white bg-primary px-3 py-[7px] text-[15px] font-bold text-white ${cardShadow}`}
    style={{ left, top }}
  >
    {label}
  </div>
);

// "You" dot: blue circle inside a white ring, centred on (x, y).
export const YouDot = ({ x, y }) => (
  <div
    className="absolute h-[30px] w-[30px] rounded-full border-4 border-white bg-primary"
    style={{ left: x - 15, top: y - 15 }}
  />
);

// A soft circle centred on (x, y).
export const Halo = ({ x, y, size, color }) => (
  <div
    className="absolute rounded-full"
    style={{ left: x - size / 2, top: y - size / 2, width: size, height: size, background: color }}
  />
);

// A circle that grows and fades out on repeat (a ripple), centred on (x, y).
// `delay` lets two rings overlap so they read as a wave.
export const PulseRing = ({ x, y, size = 96, delay = 0, duration = 2.2, color = "rgba(31,115,189,0.35)" }) => (
  <motion.div
    className="pointer-events-none absolute rounded-full"
    style={{ left: x - size / 2, top: y - size / 2, width: size, height: size, background: color }}
    initial={{ scale: 0.45, opacity: 1 }}
    animate={{ scale: 1.5, opacity: 0 }}
    transition={{ duration, delay, ease: "easeOut", repeat: Infinity }}
  />
);

// The small navy "You" label next to the dot.
export const YouPill = ({ left, top }) => (
  <div
    className="absolute flex h-[26px] w-[42px] items-center justify-center rounded-full bg-navy text-[12px] font-bold text-white"
    style={{ left, top }}
  >
    You
  </div>
);
