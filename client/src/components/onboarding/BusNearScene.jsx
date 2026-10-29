"use client";

import { Halo, Pop, Pulse, RoadBase, RouteBar, Scene, YouDot, YouPill, cardShadow } from "./sceneParts";

// O1 "Is the bus near?": you on the road, buses 087 and 214 up ahead, and an info chip for 214.
// The pieces appear in the order they are written below: road, you, the route, the buses, the chip.
// Center of the "You" dot, used to place the halo and the ripples.
const YOU = { x: 73.6, y: 265.2 };

const BusNearScene = ({ active }) => (
  <Scene active={active}>
    <RoadBase />

    {/* a static halo under the ripples, so the dot is never empty between pulses */}
    <Halo x={YOU.x} y={YOU.y} size={96} color="rgba(146,206,255,0.35)" />
    <Pulse x={YOU.x} y={YOU.y} size={96} delays={[0, 1.1]} />
    <YouDot x={YOU.x} y={YOU.y} />
    <YouPill left={52.6} top={208.2} />

    {/* the route from you to the bus, turned around its top-left corner */}
    <RouteBar
      style={{ left: 71.6078, top: 262.322, width: 161.276, rotate: -34.6952, originX: 0, originY: 0 }}
    />

    {/* bus 087, not selected */}
    <Pop
      className={`absolute flex h-[34px] w-[52px] items-center justify-center rounded-[12px] bg-white text-[15px] font-bold text-muted ${cardShadow}`}
      style={{ left: 281.6, top: 86.2 }}
    >
      087
    </Pop>

    {/* bus 214, selected: blue with a white border */}
    <Pop
      className={`absolute flex h-[53px] w-[73px] items-center justify-center rounded-[19px] border-[3px] border-white bg-primary text-[22px] font-bold text-white ${cardShadow}`}
      style={{ left: 170, top: 147 }}
    >
      214
    </Pop>

    {/* line from the chip to bus 214 */}
    <Pop fade className="absolute h-[39px] w-[2px] bg-navy/45" style={{ left: 205.2, top: 110 }} />

    {/* info chip: bus, ETA, seats */}
    <Pop
      className={`absolute w-[117px] rounded-[16px] bg-white px-[14px] py-[11px] ${cardShadow}`}
      style={{ left: 147.7, top: 22 }}
    >
      <p className="text-[12px] font-medium text-muted">Bus 214</p>
      <p className="font-display text-[26px] leading-[30px] text-navy">12 min</p>
      <div className="mt-[2px] flex items-center gap-[6px]">
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className="text-[12px] font-bold text-success">18 seats free</span>
      </div>
    </Pop>
  </Scene>
);

export default BusNearScene;
