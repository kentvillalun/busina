"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useRoutes } from "@/hooks/useRoutes";

const BusMap = dynamic(() => import("@/components/map/BusMap"), { ssr: false });

// The whole road at once, so the zoom is set here (BusMap starts at the street zoom the commuter map uses).
// shortcut: draws the first route only; a company with several routes needs one map per route.
const FleetMap = ({ fleet, selectedId, onSelect }) => {
  const route = useRoutes()[0];

  const buses = useMemo(
    () =>
      fleet
        .filter((bus) => bus.position)
        .map((bus) => ({ id: bus.id, busNumber: bus.busNumber, stale: bus.status === "stale", state: bus.position })),
    [fleet],
  );

  if (!route?.polyline) return <div className="size-full animate-pulse bg-stage" />;
  const [lng, lat] = route.polyline[Math.floor(route.polyline.length / 2)];

  return <BusMap buses={buses} routes={[route]} center={[lat, lng]} selectedId={selectedId} onSelect={onSelect} mapOptions={{ zoom: 9 }} />;
};

export default FleetMap;
