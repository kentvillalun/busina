"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AlertsSheet from "@/components/home/AlertsSheet";
import LiveStatus from "@/components/home/LiveStatus";
import LoadError from "@/components/home/LoadError";
import IconChevron from "@/components/icons/IconChevron";
import { Page } from "@/components/layout/Page";
import TopGradient from "@/components/layout/TopGradient";
import SeatMap from "@/components/bus/SeatMap";
import { useBuses } from "@/hooks/useBuses";
import { distanceM, formatDistance } from "@/lib/geo";
import { haptic, hapticTrigger } from "@/lib/haptics";
import { askAlerts, getAlertsPermission, getCurrentPosition } from "@/lib/permissions";
import { ago, secondsSince } from "@/lib/time";

const TOWARD = { NORTHBOUND: "Laoag", SOUTHBOUND: "Vigan" };

// Figma S2 has a forecast ("3 to 5 seats may be left"). We cannot make one yet (no ETA, no boarding
// rate), so this only describes the seats that are free right now.
const outlook = (seatsFree) => {
  const left =
    seatsFree === 1 ? "Only 1 seat is free right now." : `Only ${seatsFree} seats are free right now.`;
  if (seatsFree >= 10) return { title: "Plenty of seats", text: `${seatsFree} seats are free right now.` };
  if (seatsFree >= 3) return { title: "Seats are limited", text: left };
  return { title: "Likely full", text: seatsFree === 0 ? "No seat is free right now." : left };
};

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-line bg-white p-3.5 ${className}`}>{children}</div>
);

const OfflinePill = ({ minutes }) => (
  <div className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-2.5 pr-3 shadow-sm">
    <span className="size-4 rounded-full bg-uncertain" />
    <span className="text-xs font-bold text-navy">Offline</span>
    {minutes != null && <span className="text-xs font-medium text-muted">{minutes}m</span>}
  </div>
);

const Skeleton = () => (
  <div aria-hidden="true" className="flex animate-pulse flex-col gap-2.5">
    <div className="h-18 rounded-2xl bg-stage" />
    <div className="h-30 rounded-2xl bg-white" />
    <div className="h-64 rounded-2xl bg-white" />
    <div className="h-24 rounded-2xl bg-white" />
  </div>
);

const BusDetails = ({ id }) => {
  const { data, isLoading, gaveUp, retry } = useBuses();
  const [userPos, setUserPos] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [askingAlerts, setAskingAlerts] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    getCurrentPosition().then(setUserPos);
    getAlertsPermission().then(setAlerts);
  }, []);

  const bus = data?.buses.find((item) => item.id === id);
  const state = bus?.state ?? null;
  const stale = bus ? bus.stale : false;
  const serverTime = data?.serverTime;
  const lastSeen = state ? ago(serverTime, state.lastPingAt) : null;
  const seconds = state ? secondsSince(serverTime, state.lastPingAt) : null;

  // "Notify me": ask for notifications when the browser still can; otherwise say why we cannot.
  const notify = () => {
    if (alerts?.supported && alerts.canAskAgain) {
      setNote("");
      setShowAlerts(true);
    } else if (!alerts?.supported) {
      setNote("This browser can't show notifications.");
    } else if (alerts.granted) {
      setNote("Notifications are allowed on this device.");
    } else {
      setNote("Notifications are blocked. Allow them in your browser's site settings.");
    }
  };
  const allowAlerts = async () => {
    setAskingAlerts(true);
    const result = await askAlerts();
    setAlerts(result);
    setAskingAlerts(false);
    setShowAlerts(false);
  };

  const loading = !data && (!gaveUp || isLoading);
  const failed = !data && gaveUp && !isLoading;
  const notFound = !!data && !bus;

  const title = bus ? `Bus ${bus.busNumber}` : "Bus details";
  const away = state && userPos ? distanceM(userPos, state) : null;
  const heading = state ? `Heading to ${TOWARD[state.direction] ?? "its terminal"}` : "Not heard from yet";
  const seatOutlook = state && !stale ? outlook(state.seatsFree) : null;

  return (
    <Page className="bg-[#f5f8fb]">
      <TopGradient className="h-72" />

      <div className="relative flex w-full max-w-107.5 flex-col gap-2.5 px-4 pb-36 pt-4">
        <div className="flex items-center gap-2.5 py-1.5">
          <Link
            href="/home"
            ref={hapticTrigger}
            onClick={haptic.light}
            aria-label="Back to the buses"
            className="-ml-1 flex size-8 items-center justify-center rounded-full text-ink active:bg-white/60"
          >
            <IconChevron className="size-6 rotate-180" />
          </Link>
          <h1 className="font-display text-[22px] text-ink">{title}</h1>
          <span className="flex-1" />
          {bus && (stale || !state ? (
            <OfflinePill minutes={seconds != null ? Math.max(1, Math.round(seconds / 60)) : null} />
          ) : (
            <LiveStatus seconds={seconds} />
          ))}
        </div>

        {loading && <Skeleton />}
        {failed && (
          <Card>
            <LoadError onRetry={retry} />
          </Card>
        )}
        {notFound && (
          <Card className="text-center">
            <p className="text-[15px] font-semibold text-ink">We can&apos;t find this bus</p>
            <p className="mt-1 text-[13px] text-muted">It may be off the road right now.</p>
            <Link href="/home" className="mt-3 inline-block text-[13px] font-bold text-primary">
              Back to the buses
            </Link>
          </Card>
        )}

        {bus && (
          <>
            {stale || !state ? (
              <div className="rounded-2xl border border-line bg-uncertain-bg p-3.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-line bg-white px-2.5 py-1.25 text-xs font-semibold text-fault">
                    Signal lost
                  </span>
                  {lastSeen && <span className="text-[13px] font-medium text-uncertain">{lastSeen}</span>}
                </div>
                <p className="mt-2.5 text-sm leading-5 text-ink">
                  {state
                    ? "We have not heard from this bus. What you see is the last known position, not live."
                    : "We have not heard from this bus yet."}
                </p>
              </div>
            ) : null}

            {stale || !state ? (
              <Card>
                <div className="flex items-center gap-2.5">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[15px] font-semibold text-ink">{bus.name}</span>
                    <span className="text-[13px] text-muted">{heading}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-display text-[26px] leading-8 text-uncertain">-</span>
                    <span className="text-xs text-muted">no live ETA</span>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="rounded-2xl bg-linear-to-b from-primary-light to-primary-dark p-3.5 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[15px] font-semibold">{bus.name}</span>
                    <span className="text-[13px]">
                      {heading}
                      {away != null && ` · ${formatDistance(away)} from you`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-display text-[26px] leading-8">
                      {bus.etaMin != null ? `${bus.etaMin} min` : "-"}
                    </span>
                    <span className="text-xs">{bus.etaMin != null ? "to your spot" : "ETA coming soon"}</span>
                  </div>
                </div>
              </div>
            )}

            {seatOutlook && (
              <div className="rounded-2xl border border-primary bg-white p-3.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-stage px-2.5 py-1.25 text-xs font-semibold text-navy">
                    Estimate
                  </span>
                  <span className="text-[13px] font-medium text-muted">Seat outlook</span>
                </div>
                <p className="mt-1.5 font-display text-lg text-ink">{seatOutlook.title}</p>
                <p className="mt-1.5 text-[13px] leading-4.75 text-muted">
                  {seatOutlook.text} People get on and off along the way, so this can change.
                </p>
              </div>
            )}

            <Card className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[17px] text-ink">Seats now</h2>
                <span className="flex-1" />
                {stale || !state ? (
                  <span className="rounded-full bg-uncertain-bg px-2.5 py-1.25 text-xs font-semibold text-uncertain">
                    Seats unknown
                  </span>
                ) : (
                  <span className="rounded-full bg-success-tint px-2.5 py-1.25 text-xs font-semibold text-success">
                    {state.seatsFree} of {bus.seatCount} free
                  </span>
                )}
              </div>

              <SeatMap seats={state?.seats ?? []} unknown={stale || !state} />

              {stale || !state ? (
                <>
                  <div className="flex items-center gap-1.25 text-xs text-muted">
                    <span className="size-3 rounded-sm border-[1.5px] border-dashed border-uncertain" />
                    No sensor reading
                  </div>
                  <p className="text-[11px] leading-3.75 text-muted">
                    {state
                      ? `Seat sensor offline. Last reading: ${state.seatsFree} seats free, ${lastSeen}. Do not rely on it.`
                      : "No seat reading yet."}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3.5 text-xs text-muted">
                    <span className="flex items-center gap-1.25">
                      <span className="size-3 rounded-sm border-[1.5px] border-success bg-success-tint" />
                      Free
                    </span>
                    <span className="flex items-center gap-1.25">
                      <span className="size-3 rounded-sm bg-uncertain" />
                      Taken
                    </span>
                  </div>
                  <p className="text-[11px] leading-3.75 text-muted">From seat sensors, {lastSeen}.</p>
                </>
              )}
            </Card>

            <Card className="flex flex-col gap-1.5">
              {stale || !state ? (
                <>
                  <h2 className="font-display text-[17px] text-ink">On board</h2>
                  <p className="text-[13px] leading-4.75 text-muted">
                    Passenger count unavailable while the signal is lost.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <h2 className="font-display text-[17px] text-ink">On board</h2>
                    <span className="flex-1" />
                    <span className="font-display text-2xl text-ink">~{state.onBoard}</span>
                  </div>
                  <p className="text-[11px] leading-3.75 text-muted">
                    Estimated from the door counter. Includes standing riders, so it can be higher than the
                    seats taken.
                  </p>
                </>
              )}
            </Card>
          </>
        )}
      </div>

      {bus && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 bg-linear-to-t from-[#f5f8fb] via-[#f5f8fb]/90 to-transparent px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-6">
          {note && <p className="max-w-107.5 text-center text-xs text-muted">{note}</p>}
          <button
            type="button"
            ref={hapticTrigger}
            onClick={() => {
              haptic.medium();
              notify();
            }}
            className={`h-11.5 w-full max-w-107.5 rounded-[14px] text-[15px] font-bold ${
              stale || !state
                ? "border-[1.5px] border-primary bg-white text-navy"
                : "bg-linear-to-b from-primary-light to-primary-dark text-white"
            }`}
          >
            {stale || !state ? "Notify me if signal returns" : "Notify me when it is near"}
          </button>
        </div>
      )}

      <AlertsSheet
        open={showAlerts}
        busy={askingAlerts}
        onAllow={allowAlerts}
        onDismiss={() => setShowAlerts(false)}
      />
    </Page>
  );
};

export default BusDetails;
