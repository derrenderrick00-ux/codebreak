# CodeBreak: Phases 10–15 — Implementation and Acceptance Plan

**Baseline:** v0.2.0 on Git branch `feature/chapter1-phases02-09`; this package adds a **v1.0.0 release candidate**. Status descriptions are scoped to what is implemented in source, not proof of deployment.

## Phase 02–09 corrective baseline
- Original Subject 404 remains a **thin-limbed round-head stickman**, now with articulated shoulder/hip/knee/hand positions, dual eyes, movement stride, idle breathing, jump/fall poses, and directional leaning.
- Elevator has actual sliding leaf rendering, opening tween and glowing interior. The boarding state disables physics, moves the visible stickman to the lift, fades the character and camera, and only then emits `game:elevator:arrived`. A fallback event avoids a permanently stuck transition.
- UI no longer immediately jumps to the next floor when clicking *Board elevator*: it waits for the game transition to complete.
- Original local save format (`codebreak:progress:v2`) is intentionally preserved.

## Phase 10 — Frontend curriculum (Floors 11–50)
**Objective:** Build story-driven chapters 2–5.

- [x] 10 HTML missions with unique selectors/semantics, including a chapter boss.
- [x] 10 CSS missions covering box model, selectors, Grid/Flexbox, responsive rules and accessibility focus.
- [x] 10 browser-JavaScript state/DOM-model exercises.
- [x] 10 async/HTTP/API JavaScript exercises.
- [x] Browser HTML preview with opaque sandbox and CSP; CSS preview with network-disabled CSP.
- [x] DOMParser/CSSOM-based training checks.
- [x] 9-stage lesson structure, hints, scripted characters and chapter core milestones.
- [ ] User acceptance: work through each chapter and verify visual outcome, keyboard accessibility and learning quality.

**Acceptance:** Floors 11–50 load, editor and instructional panels work, reference exercises pass, correct solutions unlock the animated lift. Browser DOM/CSS check alone is not complete accessibility or rendering verification.

## Phase 11 — Node / Express / Databases (Floors 51–80)
**Objective:** Teach server development and databases.

- [x] 10 Node concept exercises using JavaScript models.
- [x] 10 Express routing, validation, middleware and response-model exercises.
- [x] 10 SQL writing challenges with structural checks.
- [x] Standalone Tower Control System capstone: Express server, PostgreSQL schema, migrations and owner-scoped CRUD.
- [x] Separate capstone HTML/CSS/JS frontend.
- [ ] Live PostgreSQL database integration test on Ubuntu.
- [ ] Container-isolated grading of learners' arbitrary Node/Express code (NOT implemented; current levels are model exercises).

**Acceptance:** Browser models pass; actual capstone runs locally with a PostgreSQL instance and real HTTP requests. Do not claim a full Node execution playground.

## Phase 12 — Authentication and Security (Floors 81–90)
**Objective:** Introduce secure authentication patterns.

- [x] 10 login, JWT-claim, authorization, rate-limit and error-sanitization coding models.
- [x] Capstone salted scrypt password hashing, signed JWT with issuer, audience and expiry checks.
- [x] Owner-scoped CRUD endpoints and parameterized SQL statements.
- [x] HTTP security headers, body-size limit, development-only per-process login limiter.
- [ ] Production security audit / distributed limits / account recovery / token revocation / penetration tests.

**Acceptance:** Learners can distinguish authentication and authorization, understand JWT signature validation, and test denied requests in the *real* capstone. Claims-only browser tasks do not constitute actual JWT security.

## Phase 13 — Final Chapter and ROOT Ending (Floors 91–100)
**Objective:** Finish all narrative beats and integration lessons.

- [x] 10 integration-model missions and final restoreTower boss.
- [x] Ten chapter cores and expanded progress stats.
- [x] Final release cinematic dialogue, ROOT explanation, PATCH closing line and progress review.
- [x] Floor map for all 101 locations (Floor 0 plus Floors 1–100).
- [ ] Manually verify the last elevator/ending animation in Phaser.
- [ ] Independently build/verify/deploy the capstone as a separate graded milestone.

## Phase 14 — QA and Educational Validation
**Objective:** Prevent avoidable defects and verify learning quality.

- [x] Automated Node test suite: original exercise references, all extended JS exercise references, content invariants, save migration, core awards, SQL checks.
- [x] Chromium DOM/CSS/SQL validation browser harness: all 30 exercises.
- [x] Representative JS iframe+Worker browser tests, including a forced infinite-loop timeout.
- [x] UI-only browser smoke: challenge modal, floor 10→11 transition event, Floor 100 ending, 101 floor tiles, HTML preview.
- [ ] Run updated `npm run build` with locally installed Phaser/Vite.
- [ ] Playtest full movement, door animation, 100-floor progression on Ubuntu and mobile.
- [ ] Real PostgreSQL integration tests, accessibility audit, security test campaign.

**Acceptance:** No unresolved critical regressions, build green, local browser playthrough passes, production checks documented. See `QA_REPORT.md`.

## Phase 15 — Production deployment and launch
**Objective:** Run the game and API safely in production.

- [x] Deployment runbook including local development and production requirements.
- [x] Environment file template, local PostgreSQL compose file and migration script.
- [x] Separate capstone bound to loopback for local development.
- [ ] Actual cloud production launch, domain, TLS, persistent database, backups, metrics and alerts.
- [ ] Security review and real-user accessibility / load testing.

**Acceptance:** Only mark Phase 15 complete after real deployment is validated end-to-end and user approves launch. This artifact does **not** mark Phase 15 finished.

## Release gates
1. `npm test` passes.
2. `npm run build` succeeds on Ubuntu.
3. First elevator opens, boarding animation shows Subject 404 entering, next floor loads.
4. Repeat at Floor 10→11 and Floor 99→100.
5. HTML/CSS previews and checks behave correctly.
6. Progress exported from v0.2.0 still imports and saved data persists.
7. Capstone `npm test`, migration and HTTP smoke test pass on a disposable PostgreSQL database.
8. QA/production security checks pass before public launch.
