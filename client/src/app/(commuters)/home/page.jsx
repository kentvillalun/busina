"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import AlertsSheet from "@/components/home/AlertsSheet";
import BottomSheet from "@/components/home/BottomSheet";
import BusCard from "@/components/home/BusCard";
import BusCardSkeleton from "@/components/home/BusCardSkeleton";
import DirectionTab from "@/components/home/DirectionTab";
import LoadError from "@/components/home/LoadError";
import LocationBanner from "@/components/home/LocationBanner";
import LiveStatus from "@/components/home/LiveStatus";
import TopGradient from "@/components/layout/TopGradient";
import IconLocationOff from "@/components/icons/IconLocationOff";
import { useBuses } from "@/hooks/useBuses";
import { distanceM, formatDistance } from "@/lib/geo";
import {
  askAlerts,
  askLocation,
  getAlertsPermission,
  getCurrentPosition,
  getLocationPermission,
} from "@/lib/permissions";
import { secondsSince } from "@/lib/time";

// Leaflet touches `window`, so it can only load in the browser.
const BusMap = dynamic(() => import("@/components/map/BusMap"), { ssr: false });

const ALERTS_DISMISSED_KEY = "busina:alertsPromptDismissed";
const alertsDismissed = () => {
  try {
    return localStorage.getItem(ALERTS_DISMISSED_KEY) === "1";
  } catch {
    return false; // storage can be blocked: then we may ask again, which is harmless
  }
};

const LAOAG = { lat: 18.1978, lng: 120.5936 }; // map center until the user's location is known
const LIVE_WITHIN_S = 30; // same as the server: older than this means signal lost

const DIRECTIONS = [
  { key: "NORTHBOUND", title: "Northbound", hint: "toward Laoag" },
  { key: "SOUTHBOUND", title: "Southbound", hint: "toward Vigan" },
];

// The permission state and, when allowed, the position. Reads only; the page decides what to show.
const readLocation = async () => {
  const result = await getLocationPermission();
  return { result, pos: result.granted ? await getCurrentPosition() : null };
};

// The current minute, or null while rendering on the server (reading the clock there is not allowed).
const subscribe = () => () => {};
const useMinute = () =>
  useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60000),
    () => null,
  );

export default function HomePage() {
  const [direction, setDirection] = useState("NORTHBOUND");
  const [expanded, setExpanded] = useState(false); // phone sheet: open = full list, closed = closest bus only
  const minute = useMinute();
  const now = minute === null ? null : new Date(minute * 60000);

  const [userPos, setUserPos] = useState(null); // { lat, lng }, or null while unknown or location is off
  const [pickedId, setPickedId] = useState(null); // a bus the user tapped; null = the closest one
  const [focus, setFocus] = useState(null); // { id, n }: tells the map to fly to a bus

  const { data, isLoading, gaveUp, retry } = useBuses();

  // What the browser says about location (null until checked, so the banner does not flash).
  const [permission, setPermission] = useState(null);
  const showLocation = ({ result, pos }) => {
    setPermission(result);
    setUserPos(pos);
  };

  // Check on load and whenever the user comes back to the tab, e.g. from the browser's site settings.
  useEffect(() => {
    const check = () => readLocation().then(showLocation);
    check();
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Notifications: asked once, after the first bus the user taps, and only if the browser can still
  // ask (onboarding may already have). "Not now" is remembered so we do not nag.
  const [alerts, setAlerts] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [askingAlerts, setAskingAlerts] = useState(false);
  useEffect(() => {
    getAlertsPermission().then(setAlerts);
  }, []);

  const dismissAlerts = () => {
    try {
      localStorage.setItem(ALERTS_DISMISSED_KEY, "1");
    } catch {}
    setShowAlerts(false);
  };
  const allowAlerts = async () => {
    setAskingAlerts(true);
    setAlerts(await askAlerts());
    setAskingAlerts(false);
    setShowAlerts(false);
  };

  const turnOnLocation = async () => {
    await askLocation();
    showLocation(await readLocation());
  };
  const locationOff = permission !== null && !permission.granted;

  const serverTime = data?.serverTime;
  // A bus that has never pinged has no state yet, so it cannot be shown.
  const allBuses = (data?.buses ?? []).filter((bus) => bus.state);

  // Closest bus first. A bus that lost its signal has an old position, so it goes last.
  // Without the user's location the order stays as the API sent it.
  const buses = allBuses
    .filter((bus) => bus.state.direction === direction)
    .sort((a, b) => {
      if (a.stale !== b.stale) return a.stale ? 1 : -1;
      if (!userPos) return 0;
      return distanceM(userPos, a.state) - distanceM(userPos, b.state);
    });

  const freshest =
    allBuses.length > 0
      ? Math.min(
          ...allBuses.map((bus) =>
            secondsSince(serverTime, bus.state.lastPingAt),
          ),
        )
      : null;

  // The API has no ETA yet (FR8), so without one we say how far the closest live bus is.
  const next = buses.find((bus) => !bus.stale);
  const selectedId = buses.some((bus) => bus.id === pickedId)
    ? pickedId
    : next?.id;

  // Tapping a card or a pin shows that bus on the map; on a phone the sheet closes so the map is visible.
  const findBus = (id) => {
    setPickedId(id);
    setFocus((prev) => ({ id, n: (prev?.n ?? 0) + 1 }));
    setExpanded(false);
    if (
      alerts?.supported &&
      alerts.canAskAgain &&
      !alerts.granted &&
      !alertsDismissed()
    ) {
      setShowAlerts(true);
    }
  };
  const away = next && userPos ? distanceM(userPos, next.state) : null;
  const headline = !next
    ? null
    : next.etaMin != null
      ? `Bus ${next.busNumber} reaches you in ~${next.etaMin} min`
      : away != null
        ? `Bus ${next.busNumber} is ${formatDistance(away)} away`
        : `Bus ${next.busNumber} is on its way`;

  // Loading covers the first fetch and a retry: while it runs, only the skeleton is shown.
  const loading = !data && (!gaveUp || isLoading);
  const failed = !data && gaveUp && !isLoading; // nothing to show and the server did not answer
  const connectionLost = !!data && gaveUp; // we still have the last update

  const hour = now?.getHours() ?? 12;
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = now?.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <main className="fixed inset-0 isolate">
        {/* z-0 gives the map its own stacking context: Leaflet panes go up to z-index 1000 and would cover the panel. */}
        <div className="absolute inset-0 z-0">
          <BusMap
            buses={buses}
            me={userPos}
            selectedId={selectedId}
            focus={focus}
            onSelect={findBus}
            center={[(userPos ?? LAOAG).lat, (userPos ?? LAOAG).lng]}
          />
        </div>

        {/* Phone: header on top, sheet at the bottom. md and up: one white panel next to the nav rail. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between md:inset-y-4 md:left-24 md:right-auto md:w-100 md:justify-start md:overflow-hidden md:rounded-[28px] md:bg-white md:shadow-[0_10px_30px_rgba(15,33,51,0.18)]">
          <header className="pointer-events-auto relative isolate px-6 pb-6 pt-4 md:pb-2">
            <TopGradient className="-z-10 md:hidden" />
            <div className="flex items-center justify-between">
              <span className="font-display text-[22px] text-ink">busina</span>
              {gaveUp ? (
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-sm"
                >
                  Can&apos;t connect. Try again
                </button>
              ) : (
                freshest !== null &&
                freshest <= LIVE_WITHIN_S && <LiveStatus seconds={freshest} />
              )}
            </div>

            <div className="mt-4 flex flex-col">
              <span className="min-h-4.5 text-[13px] font-medium text-muted">
                {today}
              </span>
              <h1 className="font-display text-[26px] leading-8 text-ink">
                {greeting}
              </h1>

              {locationOff ? (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                  <IconLocationOff className="size-4" />
                  Location is off
                </p>
              ) : (
                <p className="text-sm font-semibold text-navy">
                  {headline ?? "No buses in this direction"}
                </p>
              )}
            </div>

            <div className="-mx-2 mt-4 flex gap-1 rounded-[18px] shadow-[0_-4px_20px_rgba(15,33,51,0.03)] bg-white p-1.5">
              {DIRECTIONS.map((item) => (
                <DirectionTab
                  key={item.key}
                  item={item}
                  selected={direction === item.key}
                  onPress={() => setDirection(item.key)}
                />
              ))}
            </div>

            <LocationBanner
              permission={permission}
              onTurnOn={turnOnLocation}
              onCheckAgain={async () => {
                const fresh = await readLocation();
                showLocation(fresh);
                return fresh.result;
              }}
            />
          </header>

          <BottomSheet
            title="Buses coming to you"
            meta={
              loading || failed
                ? ""
                : `${buses.length} ${buses.length === 1 ? "bus" : "buses"}`
            }
            notice={
              connectionLost && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-uncertain-bg px-3 py-2 text-xs text-uncertain">
                  <span>Connection lost. Showing the last update.</span>
                  <button
                    type="button"
                    onClick={retry}
                    className="shrink-0 font-bold text-primary"
                  >
                    Try again
                  </button>
                </div>
              )
            }
            expanded={expanded}
            onExpandedChange={setExpanded}
          >
            {/* One placeholder is all a closed sheet shows; an open one shows three. */}
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <BusCardSkeleton key={i} />
              ))}
            {failed && <LoadError onRetry={retry} />}
            {data && buses.length === 0 && (
              <p className="px-1 text-sm text-muted">
                No buses going this direction right now.
              </p>
            )}
            {buses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                serverTime={serverTime}
                selected={bus.id === selectedId}
                locationOff={locationOff}
                onSelect={() => findBus(bus.id)}
              />
            ))}
          </BottomSheet>
        </div>
      </main>
      <AlertsSheet
        open={showAlerts}
        busy={askingAlerts}
        onAllow={allowAlerts}
        onDismiss={dismissAlerts}
      />
    </>
  );
}
