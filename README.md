# Busina

See PROJECT_SPEC.md for the full spec.

- apps/mobile: Expo (Android), commuter and driver roles
- server: Express (JS) backend
- apps/operator-web: empty, dropped from the MVP

## Read first

- `AGENTS.md`: stack, conventions, design tokens, Figma references, git workflow (for developers and AI agents)
- `PROJECT_SPEC.md`: features, decisions, plan and status

## Getting started

```bash
# mobile app (needs an Android emulator or a device)
cd apps/mobile
npm install
npx expo start --clear     # press "a" for the Android emulator

# API (needs server/.env with DATABASE_URL; ask the owner, never commit it)
cd server
npm install
npm run dev
```

## Workflow

One branch per task (`feat/...`, `fix/...`), never push to `main` directly, open a pull request, the owner merges.
After a pull that changes `package.json`: `npm install`, then restart Metro with `npx expo start --clear`.

