# How the map, the road and the ETA work (the short version)

Written Oct 31, 2026, for someone new to maps. You do not need to understand every file. Understand these
three ideas and you can find your way around.

## The three ideas

1. **A road is a list of points.** Each point is `[lng, lat]` (longitude first). Join the dots and you have the road.
   A route has one list for the way to Vigan (`polyline`) and one for the way back (`polylineNorthbound`),
   because the buses take their own side of the Vigan diversion.
2. **Snapping.** A GPS fix is never exactly on the road. Snapping finds the nearest point on the road. We keep two
   things from it: the snapped position (so the pin sits on the road) and `progressM`, how many meters the bus has
   gone along the road from Laoag. If the bus is more than 100 m from the road it is not snapped and is marked
   `offRoute`, so we never draw it where it is not.
3. **The ETA.** Meters left on the road between the bus and you, divided by the speed of the bus. We show a range
   (the bus 20% faster to 20% slower), never one exact time.

## Where each idea lives

| Idea | Server | Client |
|---|---|---|
| Snapping | `server/src/utils/geo.js` (`snapToRoute`), used by `controllers/bus.controller.js` | `client/src/lib/geo.js` (same function, for your own position) |
| The roads | `GET /routes` (`controllers/routes.controller.js`), data in `server/prisma/routes/*.json` | `hooks/useRoutes.js`, drawn by `components/map/BusMap.jsx` |
| The ETA | nothing | `client/src/lib/eta.js` (`etaFor`, `formatEta`), shown by `BusCard.jsx` and `BusDetails.jsx` |
| Place names on the map | nothing | `client/src/lib/landmarks.js`, drawn by `Landmarks` in `BusMap.jsx` |

`eta.test.js`, `geo.test.js` (client) and `geo.test.js` (server) test the math. Run them with
`node --test src/lib/eta.test.js src/lib/geo.test.js` in `client`, and `node --test src/utils/geo.test.js` in `server`.

## What you can ignore for now

- `server/scripts/fetch-route.js`: used once to get a road from OSRM (a free routing service built on OpenStreetMap).
  The result is saved in `server/prisma/routes/`. You only run it again for a new road.
- The Leaflet details inside `BusMap.jsx` (panes, `divIcon` strings). The map is a picture (tiles from Geoapify,
  made from OpenStreetMap) with our pins and lines on top.
- The landmark list is hand-picked from OpenStreetMap, not fetched live. Edit the array to add or remove a place.

## When something looks wrong

- **The bus is not on the road:** open `GET /buses`. If `offRoute` is true, the GPS is far from the road, or the
  bus is on the other direction's road.
- **No ETA on a card:** there is no location, the signal is lost, the bus is `offRoute`, or you are more than 1 km
  from the road. All are on purpose: no ETA is better than a wrong one.
- **The road is missing on the map:** open `GET /routes`. The polylines must not be empty.
