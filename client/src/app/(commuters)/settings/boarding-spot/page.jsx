"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import IconChevron from "@/components/icons/IconChevron";
import { useBuses } from "@/hooks/useBuses";
import { useRoutes } from "@/hooks/useRoutes";
import { getCurrentPosition } from "@/lib/permissions";

const BusMap = dynamic(() => import("@/components/map/BusMap"), { ssr: false });

const LAOAG = { lat: 18.1978, lng: 120.5936 }; // map center until the user's location is known

// Figma S11. The pin stays in the middle of the screen and the map moves under it: the spot is wherever the
// pin points when the map stops.
export default function BoardingSpotPage() {
  const { data } = useBuses();
  const routes = useRoutes();
  const [userPos, setUserPos] = useState(null);
  const [spot, setSpot] = useState(null); // { lat, lng } under the pin; null until the map has moved once

  useEffect(() => {
    getCurrentPosition().then(setUserPos);
  }, []);

  const start = userPos ?? LAOAG;
  const buses = (data?.buses ?? []).filter((bus) => bus.state);

  // TODO(you): save `spot ?? start` (the point under the pin; localStorage is enough for now), then go back to
  // Settings and show the place in the "Boarding spot" row. The alerts (FR9) will read it.
  const confirm = () => {};

  return (
    <main className="fixed inset-0 isolate bg-stage">
      {/* The map stops 200px above the bottom, so its middle is the middle of what you can see and the pin sits on it. */}
      <div className="absolute inset-x-0 top-0 bottom-50 z-0">
        <BusMap
          buses={buses}
          routes={routes}
          me={userPos}
          center={[start.lat, start.lng]}
          onCenterChange={(point) => setSpot({ lat: point.lat, lng: point.lng })}
        />
      </div>

      {/* The tip of the pin is the exact middle of the map. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-50 z-10 flex items-center justify-center">
        <Image src="/spot/pin-shadow.svg" alt="" width={26} height={9} className="absolute" />
        <Image src="/spot/pin.svg" alt="" width={44} height={56} className="relative -translate-y-7" />
      </div>

      <div className="absolute inset-x-4 top-14 z-20 mx-auto flex max-w-107.5 items-center gap-3 rounded-3xl bg-white py-2.5 pl-2.5 pr-4.5 shadow-[0_4px_14px_rgba(16,59,96,0.18)]">
        <Link
          href="/settings"
          aria-label="Back to settings"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-stage text-ink"
        >
          <IconChevron className="size-6 rotate-180" />
        </Link>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="font-display text-xl leading-6 text-ink">Where will you wait?</h1>
          <p className="text-[13px] text-muted">Move the map to place the pin.</p>
        </div>
      </div>

      <section className="absolute inset-x-0 bottom-0 z-20 mx-auto flex h-59 max-w-107.5 flex-col rounded-t-[32px] bg-white px-6 pb-6 pt-3 shadow-[0_-4px_14px_rgba(16,59,96,0.18)]">
        <span className="mx-auto h-1.25 w-10 rounded-full bg-line" />
        <h2 className="mt-4.5 font-display text-[22px] leading-7 text-ink">Your boarding spot</h2>
        <p className="mt-1 text-sm leading-5 text-muted">
          We&apos;ll alert you when a bus is close to this spot. Place the pin on the roadside where you usually wait.
        </p>
        <button
          type="button"
          onClick={confirm}
          className="mt-auto h-14 rounded-[18px] bg-linear-to-b from-primary-light to-primary-dark text-base font-bold text-white"
        >
          Confirm spot
        </button>
      </section>
    </main>
  );
}
