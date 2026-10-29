"use client";

/* eslint-disable @next/next/no-img-element -- a plain <img> on purpose: it is a tiny SVG, so next/image would only add work */

import { BusMarker, Pop, RoadBase, Scene } from "./sceneParts";

// O3 "Never miss your bus": a notification preview floating over the road.
// The pieces appear in the order they are written below: road, bus, notification.
// `showBus` is false in the home alerts sheet (S10), which shows only the road and the notification.
const AlertsScene = ({ active, showBus = true }) => (
  <Scene active={active}>
    <RoadBase />

    {showBus && <BusMarker left={268} top={67} />}

    {/* notification preview */}
    <Pop
      className="absolute flex w-[321.64px] gap-[10.32px] rounded-[20.64px] bg-[#fbfcfe] px-[13.76px] py-[12.04px] shadow-[0_6.88px_10px_rgba(15,33,51,0.28)]"
      style={{ left: 14, top: 165 }}
    >
      <img src="/app-icon.svg" alt="" width={34.4} height={34.4} className="shrink-0" />
      <div className="flex flex-col gap-[2.58px]">
        <p className="text-[10.32px] font-medium text-muted">Busina &nbsp;·&nbsp; now</p>
        <p className="text-[12.9px] font-bold text-ink">Bus 214 is about 2 min away</p>
        <p className="text-[11.18px] text-muted">
          9 of 40 seats free now. You will likely still get a seat. Tap to view.
        </p>
      </div>
    </Pop>
  </Scene>
);

export default AlertsScene;
