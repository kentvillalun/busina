"use client";

import { Halo, Pop, Pulse, RoadBase, RouteBar, Scene, YouDot, YouPill, cardShadow } from "./sceneParts";

const YOU = { x: 73.6, y: 265.2 };

const BusNearScene = ({ active }) => (
  <Scene active={active}>
    <RoadBase />

    <Halo x={YOU.x} y={YOU.y} size={96} color="rgba(146,206,255,0.35)" />
    <Pulse x={YOU.x} y={YOU.y} size={96} delays={[0, 1.1]} />
    <YouDot x={YOU.x} y={YOU.y} />
    <YouPill left={52.6} top={208.2} />

    <RouteBar
      style={{ left: 71.6078, top: 262.322, width: 161.276, rotate: -34.6952, originX: 0, originY: 0 }}
    />

    <Pop
      className={`absolute flex h-8.5 w-13 items-center justify-center rounded-xl bg-white text-[15px] font-bold text-muted ${cardShadow}`}
      style={{ left: 281.6, top: 86.2 }}
    >
      087
    </Pop>

    {/* bus 214, selected: blue with a white border */}
    <Pop
      className={`absolute flex h-13.25 w-18.25 items-center justify-center rounded-[19px] border-[3px] border-white bg-primary text-[22px] font-bold text-white ${cardShadow}`}
      style={{ left: 170, top: 147 }}
    >
      214
    </Pop>

    {/* line from the chip to bus 214 */}
    <Pop fade className="absolute h-9.75 w-0.5 bg-navy/45" style={{ left: 205.2, top: 110 }} />

    {/* info chip: bus, ETA, seats */}
    <Pop
      className={`absolute w-29.25 rounded-2xl bg-white px-3.5 py-2.75 ${cardShadow}`}
      style={{ left: 147.7, top: 22 }}
    >
      <p className="text-[12px] font-medium text-muted">Bus 214</p>
      <p className="font-display text-[26px] leading-7.5 text-navy">12 min</p>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className="text-[12px] font-bold text-success">18 seats free</span>
      </div>
    </Pop>
  </Scene>
);

export default BusNearScene;
