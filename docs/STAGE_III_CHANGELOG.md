# CodeBreak v1.2.0-rc.1 — Stage III Release Acceptance

## Added

- `scripts/check_bundle_budget.mjs`: deterministic built-asset byte-budget check.
- `tests/release-gate.test.js`: three size-regression tests.
- `scripts/verify_release_gate.sh` and root `npm run verify:release`.
- `capstone/server/scripts/integration.mjs`: HTTP/JWT/PostgreSQL CRUD/ownership checks in a random disposable schema, with cleanup.
- `capstone/compose.test.yml`: ephemeral isolated database container on localhost port 55432 (overridable).
- `scripts/verify_capstone_integration.sh`: lifecycle, unit tests, integration test and cleanup.
- Separate GitHub Actions CI job running the capstone against a real temporary PostgreSQL service.
- Stage III installation, architecture, manual acceptance and QA documents.

## Unchanged intentionally

- Floor 0–100 teaching content and story.
- Phaser character and elevator rendering.
- Browser LocalStorage progress schema.
- New Game and progress import/export.
- Capstone server's public routes and security model.

## Known release blockers

- Live PostgreSQL test must pass on Ubuntu/CI.
- Full Firefox/Chromium playthrough and accessibility checks must be recorded.
- Production JWT, secrets management, distributed rate limiting, monitoring, backups/restore and other operations requirements are not complete.
