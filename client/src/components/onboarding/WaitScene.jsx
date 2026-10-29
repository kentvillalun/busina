"use client";

import { BusMarker, Halo, PulseRing, RoadBase, YouDot, YouPill, cardShadow } from "./sceneParts";

// O2 "Know how long you'll wait": you in the middle of two halos, bus 214 up the road.
const YOU = { x: 175, y: 195 };

const WaitScene = () => (
  <div className="relative h-[380px] w-[350px]">
    <RoadBase />

    {/* route from you up to the bus: a 161 x 7 bar centered at (241.3, 149.1), turned -34.7 degrees */}
    <div
      className="absolute rounded-[3.5px] bg-primary"
      style={{
        left: 241.3 - 161.276 / 2,
        top: 149.1 - 3.5,
        width: 161.276,
        height: 7,
        transform: "rotate(-34.7deg)",
      }}
    />

    <BusMarker left={283.6} top={86.2} />

    {/* two static halos, with slow ripples expanding from the outer one */}
    <Halo x={YOU.x} y={YOU.y} size={200} color="rgba(146,206,255,0.22)" />
    <Halo x={YOU.x} y={YOU.y} size={124} color="rgba(146,206,255,0.35)" />
    <PulseRing x={YOU.x} y={YOU.y} size={200} duration={2.6} color="rgba(31,115,189,0.16)" />
    <PulseRing x={YOU.x} y={YOU.y} size={200} duration={2.6} delay={1.3} color="rgba(31,115,189,0.16)" />

    <YouDot x={YOU.x} y={YOU.y} />
    <YouPill left={154} top={146} />

    {/* line from the chip up toward the route */}
    <div
      className="absolute h-[27px] w-[2px] bg-navy"
      style={{ left: 248.1, top: 146.7, opacity: 0.45 }}
    />

    {/* "Your wait" chip */}
    <div
      className={`absolute rounded-[16px] bg-white px-[14px] py-[11px] ${cardShadow}`}
      style={{ left: 195.6, top: 173.7 }}
    >
      <p className="text-[12px] font-medium text-muted">Your wait</p>
      <p className="font-display text-[26px] leading-[30px] text-navy">12 min</p>
    </div>
  </div>
);

export default WaitScene;
