"use client";

import { motion } from "motion/react";

// Pieces shared by the three onboarding scenes. Every scene is drawn on a 350 x 380 stage
// with absolute positions copied from the Figma frames (O1, O2, O3).

export const cardShadow = "shadow-[0_4px_7px_rgba(16,59,96,0.18)]";

// How the pieces appear. The Scene wrapper is the parent: when it switches to "show", its pieces
// come in one after another, in the order they are written. `pop` slides up and grows a little,
// `fade` only fades.
const sceneVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
};
const popVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } },
};
const fadeVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

// The root of a scene. `active` turns true when the slide is reached, which starts the entrance.
export const Scene = ({ active = true, children }) => (
  <motion.div
    className="relative h-[380px] w-[350px]"
    variants={sceneVariants}
    initial="hidden"
    animate={active ? "show" : "hidden"}
  >
    {children}
  </motion.div>
);

// A piece that appears in turn with the others. Position it with className and style as usual.
export const Pop = ({ fade = false, className, style, children }) => (
  <motion.div className={className} style={style} variants={fade ? fadeVariants : popVariants}>
    {children}
  </motion.div>
);

// White road with its dashed centre line. The canvas is 120px wider on each side, so the road keeps
// going past the stage when the stage is scaled down; SceneStage clips the rest.
export const RoadBase = () => (
  <motion.svg
    className="absolute top-0"
    style={{ left: -120 }}
    width="590"
    height="380"
    viewBox="-120 0 590 380"
    fill="none"
    variants={fadeVariants}
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
  </motion.svg>
);

// The blue bar from you to the bus. `style` places and turns it (left, top, width, rotate).
export const RouteBar = ({ style }) => (
  <Pop className="absolute h-[7px] rounded-[3.5px] bg-primary" style={style} />
);

// The blue "214" pill used on the road.
export const BusMarker = ({ left, top, label = "214" }) => (
  <Pop
    className={`absolute rounded-[12px] border-[3px] border-white bg-primary px-3 py-[7px] text-[15px] font-bold text-white ${cardShadow}`}
    style={{ left, top }}
  >
    {label}
  </Pop>
);

// "You" dot: blue circle inside a white ring, centred on (x, y).
export const YouDot = ({ x, y }) => (
  <Pop
    className="absolute h-[30px] w-[30px] rounded-full border-4 border-white bg-primary"
    style={{ left: x - 15, top: y - 15 }}
  />
);

// The small navy "You" label next to the dot.
export const YouPill = ({ left, top }) => (
  <Pop
    className="absolute flex h-[26px] w-[42px] items-center justify-center rounded-full bg-navy text-[12px] font-bold text-white"
    style={{ left, top }}
  >
    You
  </Pop>
);

// A soft circle centred on (x, y).
export const Halo = ({ x, y, size, color }) => (
  <Pop
    className="absolute rounded-full"
    style={{ left: x - size / 2, top: y - size / 2, width: size, height: size, background: color }}
  />
);

// Ripples that grow and fade out on repeat, centred on (x, y). `delays` has one entry per ripple.
// The wrapper fades in with the other pieces; the ripples then loop on their own.
export const Pulse = ({ x, y, size = 96, duration = 2.2, color = "rgba(31,115,189,0.35)", delays = [0] }) => (
  <Pop fade className="pointer-events-none absolute inset-0">
    {delays.map((delay) => (
      <motion.div
        key={delay}
        className="absolute rounded-full"
        style={{ left: x - size / 2, top: y - size / 2, width: size, height: size, background: color }}
        initial={{ scale: 0.45, opacity: 1 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration, delay, ease: "easeOut", repeat: Infinity }}
      />
    ))}
  </Pop>
);
