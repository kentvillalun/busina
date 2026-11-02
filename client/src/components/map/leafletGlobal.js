import L from "leaflet";

// leaflet-rotate is a plugin that looks for Leaflet as the global `L`, which a bundled Leaflet does not set.
// Imported before the plugin, and only by the driver map.
globalThis.L = L;
