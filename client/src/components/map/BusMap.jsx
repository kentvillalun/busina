"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Fragment, useEffect, useState } from "react";
import { roadFor } from "@/lib/eta";
import { AttributionControl, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";

// Geoapify "positron" tinted toward the app's pale blue (.map-tiles-light in globals.css).
// Without a key we fall back to plain OpenStreetMap tiles (.map-tiles filter).
const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
const tiles = GEOAPIFY_KEY
  ? {
      url: `https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`,
      attribution: "© Geoapify © OpenMapTiles © OpenStreetMap contributors",
      className: "map-tiles-light",
    }
  : {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      className: "map-tiles",
    };

// Leaflet swaps the DOM whenever it gets a new icon object, which would restart the pulse on
// every poll, so one icon is built per look and reused.
const icons = new Map();
const cached = (key, build) => {
  if (!icons.has(key)) icons.set(key, build());
  return icons.get(key);
};

// A pin: pill with the bus number and a tail whose tip is the bus position.
const busIcon = (bus, selected) => {
  const look = bus.stale ? "stale" : selected ? "selected" : "live";
  return cached(`${look}-${bus.busNumber}`, () => {
    const pill = {
      stale: "bg-uncertain-bg text-uncertain",
      selected: "bg-primary text-white scale-110",
      live: "bg-white text-navy",
    }[look];
    const tail = { stale: "bg-uncertain-bg", selected: "bg-primary", live: "bg-white" }[look];
    return L.divIcon({
      className: "",
      iconSize: [0, 0],
      html: `<div class="relative -translate-x-1/2 -translate-y-full w-max pb-2 ${bus.stale ? "opacity-80" : ""}">
        <span class="absolute bottom-0.5 left-1/2 size-4 -translate-x-1/2 rotate-45 rounded-sm border-b-2 border-r-2 border-white shadow-md ${tail}"></span>
        <span class="relative block whitespace-nowrap rounded-full border-2 border-white px-3 py-1.5 text-sm font-bold shadow-md ${pill}">${bus.busNumber}</span>
      </div>`,
    });
  });
};

// "You are here": the dot sits exactly on the position, with a soft pulse and a label above it.
const meIcon = L.divIcon({
  className: "",
  iconSize: [0, 0],
  html: `<div class="relative -translate-x-1/2 -translate-y-1/2 size-5">
    <span class="absolute -inset-5 rounded-full bg-primary/15"></span>
    <span class="absolute -inset-5 animate-ping rounded-full bg-primary/20 [animation-duration:2.4s]"></span>
    <span class="absolute inset-0 rounded-full border-[3px] border-white bg-primary shadow-[0_2px_8px_rgba(31,115,189,0.55)]"></span>
    <span class="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary bg-white px-3 py-1 text-xs font-medium text-navy shadow-sm">You are here</span>
  </div>`,
});

// MapContainer only reads `center` once, so this moves the view when it changes (the user's location arrives late).
const Recenter = ({ center }) => {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.setView([lat, lng]);
  }, [map, lat, lng]);
  return null;
};

// Moves the map to a bus when `focus` ({ id, n }) changes. `n` changes on every tap, so tapping the
// same bus again flies back to it. The padding keeps the bus clear of the header and the sheet
// (phone) or of the side panel (md and up).
const FlyToBus = ({ buses, focus }) => {
  const map = useMap();
  useEffect(() => {
    const bus = buses.find((item) => item.id === focus?.id);
    if (!bus) return;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    map.fitBounds(L.latLngBounds([[bus.state.lat, bus.state.lng]]), {
      paddingTopLeft: wide ? [520, 40] : [20, 290],
      paddingBottomRight: wide ? [40, 40] : [20, 230],
      maxZoom: 17,
      animate: true,
      duration: 0.8,
    });
    // only when `focus` changes, not on every poll that moves the bus
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.n]);
  return null;
};

// Tells the boarding spot picker where the middle of the map is each time the map stops moving.
const CenterReporter = ({ onChange }) => {
  const map = useMapEvents({ moveend: () => onChange(map.getCenter()) });
  return null;
};

// `center` is [lat, lng]; `routes` come from GET /routes; `direction` draws only that way's road (both when left out); `ahead` is the [lat, lng] stretch from the selected bus to you. Map clicks and zoom buttons are off: the sheet and tabs sit on top of it.
const LeafletMap = ({ buses, routes = [], direction, ahead = [], me, selectedId, center, focus, onSelect, onCenterChange }) => (
  <MapContainer
    center={center}
    zoom={15}
    zoomControl={false}
    attributionControl={false}
    className="size-full"
  >
    <TileLayer
      className={tiles?.className}
      url={tiles?.url}
      attribution={tiles?.attribution}
      maxZoom={19}
    />
    <Recenter center={center} />
    <FlyToBus buses={buses} focus={focus} />
    {onCenterChange && <CenterReporter onChange={onCenterChange} />}
    <AttributionControl prefix={false} position="topright" />
    {routes.flatMap((route) => (direction ? [roadFor(route, direction)] : [route.polyline, route.polylineNorthbound])).map((polyline, i) => {
      if (!polyline) return null;
      // The API sends [lng, lat]; Leaflet wants [lat, lng]. Pins sit in a higher pane, so they stay on top of the line.
      // Like the onboarding road: a white road with a thin edge, and a dashed blue line down the middle.
      // The southbound and northbound roads are the same one almost everywhere; they part only at the Vigan diversion.
      const positions = polyline.map(([lng, lat]) => [lat, lng]);
      return (
        <Fragment key={i}>
          <Polyline positions={positions} pathOptions={{ color: "#c9d6e2", weight: 16, opacity: 0.9 }} />
          <Polyline positions={positions} pathOptions={{ color: "#ffffff", weight: 13, opacity: 1 }} />
          <Polyline positions={positions} pathOptions={{ color: "#3a8fd6", weight: 2.5, dashArray: "8 10", lineCap: "butt" }} />
        </Fragment>
      );
    })}
    {/* The stretch between the selected bus and you: the solid blue bar of the onboarding. */}
    {ahead.length > 1 && <Polyline positions={ahead} pathOptions={{ color: "#1f73bd", weight: 6, opacity: 0.95 }} />}
    {buses.map((bus) => (
      <Marker
        key={bus.id}
        position={[bus.state.lat, bus.state.lng]}
        icon={busIcon(bus, bus.id === selectedId)}
        zIndexOffset={bus.id === selectedId ? 1000 : 0}
        eventHandlers={{ click: () => onSelect?.(bus.id) }}
      />
    ))}
    {me && <Marker position={[me.lat, me.lng]} icon={meIcon} />}
  </MapContainer>
);

// Next keeps a page you left alive but hidden: React runs the effect cleanups (react-leaflet then
// removes the map) and runs the effects again when you come back, which would add layers to a
// removed map. So the map only exists while the effects are connected: a fresh one on every return.
const BusMap = (props) => {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnected(true);
    return () => setConnected(false);
  }, []);
  return connected ? <LeafletMap {...props} /> : null;
};

export default BusMap;
