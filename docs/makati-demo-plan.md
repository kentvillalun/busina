# Makati demo route (do this the night before the competition)

Decided on Nov 1, 2026. The product is for the Laoag to Vigan corridor only. For the demo in Makati we add one extra
route so the map, ETA and alerts can be shown live. Nothing here is built yet on purpose; we do it on site.

## Why this and not the other ideas

- **Field test Vigan to Manila with friends** is a bonus, never a dependency. If it fails we would have nothing to show.
- **Route chooser** (pick between the diversion and Bantay town) is dropped. The Ilocos lines are fixed: southbound uses the
  Bantay town road, northbound uses the Vigan diversion. Locals know the one route.
- **Device on, no route** proves the modules work but gives no ETA, because there is nothing to snap to.
- The map now names places and streets anywhere (Geoapify `osm-bright-grey`), so Makati needs no landmark list.

## What to do the night before (about 30 minutes)

1. Pick a short road near the venue, 2 to 3 km, so the ETA is 3 to 5 minutes. Get two points as `lng,lat`
   (start, end). Add a middle point only to force a road.
2. Make the line (public OSRM, needs internet):
   ```bash
   cd server
   node scripts/fetch-route.js prisma/routes/makati-demo.json "<lng>,<lat>" "<lng>,<lat>"
   ```
3. Look at it before it goes anywhere: paste the points into geojson.io (wrap them in a `FeatureCollection` with one
   `LineString`) and check it follows the road.
4. Add it to the database. `seed.js` only knows the Ilocos route today, so it needs a small change first: read
   `prisma/routes/makati-demo.json` when the file exists and upsert a second `Route` named `A - B` (same pattern as the
   Ilocos one, no `polylineNorthbound`). Test that change on a branch before the night itself.
   **`npm run seed` writes to the production Neon database** (the `.env` points there), so run it once, on purpose.
5. Point a bus at the new route (move bus 0015, or add a second bus) and run the simulator with
   `START_KM`, `DIRECTION` and `SPEED_KMH` so it drives the Makati line.
6. On a real Android phone: set a boarding spot beside the road, check the ETA, then the near-bus notification
   (keep the app open: there is no real Web Push yet).

## Things to remember

- **Fallback if OSRM is down:** have a Makati line ready as a file (make one now from two points near Ayala).
- **Route names must read `A - B`** if we ever bring back labels that come from the route name.
- Home lists every bus. The Ilocos bus 0015 will still show as "Signal lost" next to the Makati bus; decide whether to
  hide stale buses for the demo.
- No GPS indoors: the ESP32 cannot give a position in the venue. The simulator moves the bus; the ESP32 can send seats.
  Say that plainly in the demo.
- Bring a laptop and mobile data (the venue wifi may fail), a screen recording of the demo as a backup, and test the
  notification on the phone you will use.
- Nothing here changes the Ilocos routes. Do not edit `laoag-vigan.json` or `laoag-vigan-northbound.json` that night.
