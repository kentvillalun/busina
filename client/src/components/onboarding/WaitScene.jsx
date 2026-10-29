"use client";

import { BusMarker, Halo, Pop, Pulse, RoadBase, RouteBar, Scene, YouDot, YouPill, cardShadow } from "./sceneParts";

// O2 "Know how long you'll wait": you in the middle of two halos, bus 214 up the road.
// The pieces appear in the order they are written below: road, you, the route, the bus, the chip.
const YOU = { x: 175, y: 195 };

const WaitScene = ({ active }) => (
  <Scene active={active}>
    <RoadBase />

    {/* two static halos, with slow ripples expanding from the outer one */}
    <Halo x={YOU.x} y={YOU.y} size={200} color="rgba(146,206,255,0.22)" />
    <Halo x={YOU.x} y={YOU.y} size={124} color="rgba(146,206,255,0.35)" />
    <Pulse x={YOU.x} y={YOU.y} size={200} duration={2.6} color="rgba(31,115,189,0.16)" delays={[0, 1.3]} />
    <YouDot x={YOU.x} y={YOU.y} />
    <YouPill left={154} top={146} />

    {/* route from you up to the bus: a 161 x 7 bar centered at (241.3, 149.1), turned -34.7 degrees */}
    <RouteBar style={{ left: 241.3 - 161.276 / 2, top: 149.1 - 3.5, width: 161.276, rotate: -34.7 }} />

    <BusMarker left={283.6} top={86.2} />

    {/* line from the chip up toward the route */}
    <Pop fade className="absolute h-[27px] w-[2px] bg-navy/45" style={{ left: 248.1, top: 146.7 }} />

    {/* "Your wait" chip */}
    <Pop
      className={`absolute rounded-[16px] bg-white px-[14px] py-[11px] ${cardShadow}`}
      style={{ left: 195.6, top: 173.7 }}
    >
      <p className="text-[12px] font-medium text-muted">Your wait</p>
      <p className="font-display text-[26px] leading-[30px] text-navy">12 min</p>
    </Pop>
  </Scene>
);

export default WaitScene;
