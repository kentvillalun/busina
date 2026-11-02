"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useRoutes } from "@/hooks/useRoutes";

const BusMap = dynamic(() => import("@/components/map/BusMap"), { ssr: false });

// The whole road at once, so the zoom is set here (BusMap starts at the street zoom the commuter map uses).
// Sample pins sit at `progress` along the road until real positions arrive.
const FleetMap = ({ fleet, selectedId, onSelect }) => {
  const route = useRoutes()[0];

  const buses = useMemo(() => {
    const road = route?.polyline;
    if (!road) return [];
    return fleet
      .filter((bus) => bus.progress !== null)
      .map((bus) => {
        const [lng, lat] = road[Math.min(road.length - 1, Math.floor(bus.progress * road.length))];
        return { id: bus.id, busNumber: bus.busNumber, stale: bus.status === "stale", state: { lat, lng } };
      });
  }, [fleet, route]);

  if (!route?.polyline) return <div className="size-full animate-pulse bg-stage" />;
  const [lng, lat] = route.polyline[Math.floor(route.polyline.length / 2)];

  return (
    <BusMap
      buses={buses}
      routes={[route]}
      center={[lat, lng]}
      selectedId={selectedId}
      onSelect={onSelect}
      mapOptions={{ zoom: 9 }}
    />
  );
};

export default FleetMap;
