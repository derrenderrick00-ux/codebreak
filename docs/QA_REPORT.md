# QA Report — CodeBreak v1.0.0-rc.1

## Evidence from this artifact build (2026-10-27)

| Check | Observed result | Limitation |
|---|---|---|
| Node.js test suite | **29 passed, 0 failed** | Unit/content tests, not full integrated game |
| JavaScript extended reference fixtures | All 60 JS exercises passed their authored cases | Trusted reference tests; no malicious-adversarial audit |
| Browser HTML/CSS/SQL grading | **30/30 passes; blank submissions fail** | Chrome headless DOMParser/CSSOM and static SQL checks |
| Browser JS isolated runner | Representative Floors 31, 42, 51, 81, 100 pass | Sample rather than all 60 in isolated browser |
| Infinite-loop handling | Worker timed out without hanging parent | Does not prove resistance to all hostile JS |
| UI-only browser smoke | Modal opens, 10→11 event sequence, 100 finale, 101 floor map tiles, editor preview; no JS errors | Phaser engine/physics not running in this smoke harness |
| Phaser/Vite production build | **NOT RUN** | npm registry/dependency installation unavailable in this environment |
| Visual character/elevator animation in Phaser | **NOT VERIFIED** | Needs local Ubuntu manual acceptance |
| Live PostgreSQL / Express integration | **NOT RUN** | Requires npm install + local database instance |
| Production deployment | **NOT DONE** | Infrastructure, TLS, backups, monitoring, security review pending |

## Fixed from v0.2.0
- Visible, sliding elevator doors; boarding moves character before floor transition.
- Articulated stickman animation with more expressive walk/run/idle/jump/fall poses.
- Game state update no longer immediately swaps floors upon clicking the boarding button.
- Ten chapters supported; floor map and HUD no longer hardcoded to Chapter I.
- Browser CSSOM comparator canonicalizes CSS values, preventing hex/rgb and ms/s false negatives.
- Progress v2 schema remains compatible and 10 core awards are computed.

## Known risks and limitations
1. **Public server execution of student backend code is not implemented**. Chapter 6–7 levels are JavaScript logic simulations. SQL uses structural checking, not actual PostgreSQL execution. Real capstone is separate from the 100-floor simulation.
2. **Offline grading is not cheating-resistant**. Reference functions remain in the client-side content source for authoring and automated tests. Users could inspect them; do not issue external certifications or server authorization from local progress.
3. **Incomplete QA**: Performance, animation timing, cross-browser rendering, screen readers, mobile, live database integration, production security review and hosting remain unverified.
4. **Single-player local saves**: No cloud account or sync for the Phaser game; clear browser data can remove progress. Use export/import.
5. Production capstone needs distributed rate limits, audit logging, secrets management, operational resilience and extensive integration/security tests.

## Corrective prioritization
**P0 before using new ZIP:** Run `npm install && npm test && npm run build && npm run dev` on Ubuntu, verify the elevator animation end-to-end. P1 before claiming full-stack competence: run and test actual capstone. P0 before Internet launch: security hardening, TLS, backups, deployment review and independent QA.
