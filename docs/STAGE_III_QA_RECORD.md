# Stage III QA evidence — CodeBreak v1.2.0-rc.1

## Completed while producing the package

- Source/static syntax checks for every new JavaScript module and shell script: **passed**.
- Main Node test suite, now including three bundle-budget regression tests: **38/38 passed**.
- Test cases confirm small lazy-loaded entry accepted; monolithic oversized entry rejected; missing entry and oversized CSS rejected.
- Baseline project reconstructed from previous P0–P2 package and its own release source; original 100 floors and LocalStorage format unchanged.
- Package ZIP creation/integrity will be verified before delivery.

## Not run in the packaging environment

- `npm run build` against the new root package: npm registry and dependencies are unavailable in this environment; source does not change the Vite/Phaser runtime but Ubuntu must rebuild.
- `npm run test:integration` (real PostgreSQL): the container lacks the `pg` and `express` Node dependencies and Docker/PostgreSQL services. GitHub CI and the Ubuntu script are provided to run it.
- Real-browser acceptance for elevator movements and learner challenge dialogs in this stage.
- Any live service deployment or penetration test.

## Suggested QA result format

| Check | Command / method | Actual result | Notes |
|---|---|---|---|
| Main suite | `npm test` | Pending Ubuntu | |
| Prod build | `npm run build` | Pending Ubuntu | |
| Bundle guard | `npm run test:bundle` | Pending Ubuntu | |
| Capstone unit | `npm test --prefix capstone/server` | Pending Ubuntu | |
| Live API+PG | `bash scripts/verify_capstone_integration.sh` | Pending Ubuntu | |
| GitHub CI | Game + capstone jobs | Pending push | |
| Manual gameplay | Firefox + Chromium | Pending | |
| Rollback | Backup restore drill | Pending | |

A green automated run does not by itself constitute security certification or a public release authorization.
