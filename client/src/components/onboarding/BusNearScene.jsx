"use client";

import { Halo, PulseRing, RoadBase, YouDot, YouPill, cardShadow } from "./sceneParts";

// O1 "Is the bus near?": you on the road, buses 087 and 214 up ahead, and an info chip for 214.
// Center of the "You" dot, used to place the halo and the ripples.
const YOU = { x: 73.6, y: 265.2 };

const BusNearScene = () => (
  <div className="relative h-[380px] w-[350px]">
    <RoadBase withRoute />

    {/* a static halo under the ripples, so the dot is never empty between pulses */}
    <Halo x={YOU.x} y={YOU.y} size={96} color="rgba(146,206,255,0.35)" />
    <PulseRing x={YOU.x} y={YOU.y} size={96} />
    <PulseRing x={YOU.x} y={YOU.y} size={96} delay={1.1} />
    <YouDot x={YOU.x} y={YOU.y} />
    <YouPill left={52.6} top={208.2} />

    {/* bus 087, not selected */}
    <div
      className={`absolute flex h-[34px] w-[52px] items-center justify-center rounded-[12px] bg-white text-[15px] font-bold text-muted ${cardShadow}`}
      style={{ left: 281.6, top: 86.2 }}
    >
      087
    </div>

    {/* bus 214, selected: blue with a white border */}
    <div
      className={`absolute flex h-[53px] w-[73px] items-center justify-center rounded-[19px] border-[3px] border-white bg-primary text-[22px] font-bold text-white ${cardShadow}`}
      style={{ left: 170, top: 147 }}
    >
      214
    </div>

    {/* line from the chip to bus 214 */}
    <div
      className="absolute h-[39px] w-[2px] bg-navy"
      style={{ left: 205.2, top: 110, opacity: 0.45 }}
    />

    {/* info chip: bus, ETA, seats */}
    <div
      className={`absolute w-[117px] rounded-[16px] bg-white px-[14px] py-[11px] ${cardShadow}`}
      style={{ left: 147.7, top: 22 }}
    >
      <p className="text-[12px] font-medium text-muted">Bus 214</p>
      <p className="font-display text-[26px] leading-[30px] text-navy">12 min</p>
      <div className="mt-[2px] flex items-center gap-[6px]">
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className="text-[12px] font-bold text-success">18 seats free</span>
      </div>
    </div>
  </div>
);

export default BusNearScene;
