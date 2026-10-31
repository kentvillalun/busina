"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import IconChevron from "@/components/icons/IconChevron";
import { useBuses } from "@/hooks/useBuses";
import { useRoutes } from "@/hooks/useRoutes";
import useSavedSetting from "@/hooks/useSavedSetting";
import { MAX_SPOT_FROM_ROUTE_M } from "@/lib/eta";
import { formatDistance, snapToRoute } from "@/lib/geo";
import { placeName } from "@/lib/geocode";
import { getCurrentPosition } from "@/lib/permissions";

const BusMap = dynamic(() => import("@/components/map/BusMap"), { ssr: false });

const LAOAG = { lat: 18.1978, lng: 120.5936 }; // map center until the user's location is known

// Figma S11. The pin stays in the middle of the screen and the map moves under it: the spot is wherever the
// pin points when the map stops.
export default function BoardingSpotPage() {
  const { data } = useBuses();
  const routes = useRoutes();
  const router = useRouter();
  const [saved, saveSpot] = useSavedSetting("busina:spot", null); // { lat, lng, name }
  const [saving, setSaving] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [spot, setSpot] = useState(null); // { lat, lng } under the pin; null until the map has moved once

  useEffect(() => {
    getCurrentPosition().then(setUserPos);
  }, []);

  // The map opens where the spot was saved, then on the user, then on Laoag.
  const start = saved ?? userPos ?? LAOAG;
  const buses = (data?.buses ?? []).filter((bus) => bus.state);

  // How far the pin is from the nearest road. A bus can only reach the road, and the ETA needs the spot within
  // MAX_SPOT_FROM_ROUTE_M of it; unknown (null) until the roads have loaded.
  const pin = spot ?? start;
  const roadDistances = routes
    .flatMap((route) => [route.polyline, route.polylineNorthbound])
    .filter(Boolean)
    .map((polyline) => snapToRoute(pin, polyline)?.distanceFromRouteM)
    .filter((distance) => distance != null);
  const fromRoadM = roadDistances.length > 0 ? Math.min(...roadDistances) : null;
  const tooFar = fromRoadM != null && fromRoadM > MAX_SPOT_FROM_ROUTE_M;

  let hint = null;
  if (fromRoadM != null) {
    if (tooFar) hint = "Too far from any bus route, so there would be no estimates. Move the pin closer to the road.";
    else if (fromRoadM <= 50) hint = "On the bus route.";
    else hint = `${formatDistance(fromRoadM)} from the road. We'll alert you for the nearest point on it.`;
  }

  const confirm = async () => {
    setSaving(true);
    saveSpot({ lat: pin.lat, lng: pin.lng, name: await placeName(pin) });
    router.push("/settings");
  };

  return (
    <main className="fixed inset-0 isolate bg-stage">
      {/* The map stops 240px above the bottom, so its middle is the middle of what you can see and the pin sits on it. */}
      <div className="absolute inset-x-0 top-0 bottom-60 z-0">
        <BusMap
          buses={buses}
          routes={routes}
          me={userPos}
          center={[start.lat, start.lng]}
          onCenterChange={(point) => setSpot({ lat: point.lat, lng: point.lng })}
        />
      </div>

      {/* The tip of the pin is the exact middle of the map. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-60 z-10 flex items-center justify-center">
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

      <section className="absolute inset-x-0 bottom-0 z-20 mx-auto flex h-69 max-w-107.5 flex-col rounded-t-[32px] bg-white px-6 pb-6 pt-3 shadow-[0_-4px_14px_rgba(16,59,96,0.18)]">
        <span className="mx-auto h-1.25 w-10 rounded-full bg-line" />
        <h2 className="mt-4.5 font-display text-[22px] leading-7 text-ink">Your boarding spot</h2>
        <p className="mt-1 text-sm leading-5 text-muted">
          We&apos;ll alert you when a bus is close to this spot. Place the pin on the roadside where you usually wait.
        </p>
        {hint && (
          <p className={`mt-2 text-sm font-medium leading-5 ${tooFar ? "text-red-600" : "text-success"}`}>{hint}</p>
        )}
        <button
          type="button"
          onClick={confirm}
          disabled={tooFar || saving}
          className="mt-auto h-14 rounded-[18px] bg-linear-to-b from-primary-light to-primary-dark text-base font-bold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Confirm spot"}
        </button>
      </section>
    </main>
  );
}
