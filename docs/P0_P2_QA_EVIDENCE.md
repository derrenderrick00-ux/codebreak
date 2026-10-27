# P0–P2 test evidence — as built in assistant environment

Test date: 2026-10-27. Release candidate: v1.1.0-rc.1.

## Verified
- Node.js built-in test runner: **35 of 35 main-game tests passed**, including prior 32 regression checks and new syntax/visualizer tests.
- Standalone capstone local rate-limit unit suite: **2 of 2 passed**.
- JavaScript syntax: source changes checked with `node --check`.
- Headless Chromium DOM acceptance harness: syntax coloring, inert escaped HTML, cursor/line numbers and interactive trace control passed. Screenshot: `editor_visualization_browser_smoke.png` (available separately).
- Baseline source ZIP created before edits, SHA-256 recorded in release manifest.

## Not verified here
- Updated Vite `npm run build` and actual Phaser physics/animations (npm registry/dependency fetch blocked in assistant runtime; user has a working npm installation).
- Real PostgreSQL migration and CRUD integration (database and capstone packages unavailable here).
- GitHub Actions execution (workflow runs only after user pushes).
- End-to-end assistive technology evaluation, external security audit and public deployment.

## Acceptance criteria for release stability
1. Existing `npm test` remains green on Ubuntu, plus `npm run build` and `npm run verify:p0p2`.
2. Confirm floor transitions: opening / approach / entering / closing / ascent / next-floor arrival.
3. Confirm local saves and editor drafts persist across reload and export/import.
4. Confirm capstone authenticates and isolates data for two different test users with real database.
5. Merge into `main` only after visual acceptance and critical vulnerabilities resolved.
