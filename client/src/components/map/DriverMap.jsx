"use client";

// The plugin patches Leaflet itself, so it is imported here only: the commuter map (BusMap alone) never loads it.
// Order matters: the global `L` must exist before the plugin runs.
import "./leafletGlobal";
import "leaflet-rotate";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import BusMap from "./BusMap";

// Turns the map so `degrees` (a compass bearing, 0 = north) points up. leaflet-rotate keeps pins and labels upright.
// null leaves the map as it is. The plugin's bearing turns the map clockwise by that angle, so facing 90 (east) up takes -90.
const Bearing = ({ degrees }) => {
  const map = useMap();
  useEffect(() => {
    if (degrees == null) return;
    // The turn is animated only while the page is showing: a hidden page does not run animation frames and would never finish it.
    map.setBearing((360 - degrees) % 360, { animate: document.visibilityState === "visible", duration: 0.6 });
  }, [map, degrees]);
  return null;
};

// The driver's map: the commuter's map that can face the way the bus is going, so "up" on the screen is "ahead" on the road.
// `heading` is a compass bearing (0 = north up), or null to keep the current turn.
const DriverMap = ({ heading, ...props }) => (
  <BusMap {...props} mapOptions={{ rotate: true, bearing: 0, rotateControl: false, touchRotate: false, shiftKeyRotate: false, pitchDrag: false }}>
    <Bearing degrees={heading} />
  </BusMap>
);

export default DriverMap;
