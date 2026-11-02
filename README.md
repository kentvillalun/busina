# Busina

Live bus tracking for commuters: where the bus is, how many seats are free, and when to leave for the boarding spot.
A PWA (Next.js) with an Express API and an ESP32 device on the bus. UMAK ITSO 2026, IoT category.

- `client/`: Next.js 16 PWA with three areas: commuters, drivers (`/driver`) and operators (`/operator`)
- `server/`: Express 5 + Prisma 7 + Postgres (Neon)
- `firmware/`: ESP32 prototype
- `docs/`: requirements and decisions, Web Push, map, PWA notes, demo plan, submission

**Status (Nov 2, 2026):** commuter side and driver side done and deployed; the operator side is next.

## Read first

- `AGENTS.md`: stack, conventions, commands, current state and what comes next (for developers and AI agents)
- `PROJECT_SPEC.md`: product spec (historical in parts; the latest status is at the end)
- `docs/requirements.md`: build list and decision log

## Getting started

```bash
# API (needs server/.env: ask the owner, never commit it)
cd server && npm install
npm run dev          # http://localhost:4000
npm run simulate     # fake bus 0015, no hardware needed

# client
cd client && npm install
npm run dev          # http://localhost:3000, /api is proxied to the API
```

## Workflow

One branch per task (`feat/...`, `fix/...`), never push to `main` directly, open a pull request, the owner merges.
After a pull that changes `package.json`: `npm install`. Run `npm run lint` and `npm run build` in `client/` before a PR.
