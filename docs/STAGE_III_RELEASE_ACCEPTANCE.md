# CodeBreak — Stage III: Release Acceptance (v1.2.0-rc.1)

**Status:** Release-candidate implementation. **Not a public production launch.**  
**Baseline:** CodeBreak v1.1.0-rc.1 / Git commit `7b4fe2b` (`feature/p0-p2-v1.1-20261027_095142`).  
**Scope:** Verify the complete Tower game plus the separate Tower Control System capstone; do not alter existing player progress or core teaching content.

## Stage objective

Prove that the current game's release candidate builds cleanly and the separate real API behaves correctly against PostgreSQL. Translate the outstanding P2 work into reproducible **pass/fail gates**, not unverified assurances.

## Architecture and verification paths

```mermaid
flowchart TD
  A[Git feature branch / tagged commit] --> B[Main game checks]
  A --> C[Capstone checks]
  B --> D[38 Node regression tests]
  B --> E[Vite production build]
  E --> F[Bundle-size budget]
  C --> G[Capstone security and limiter unit tests]
  C --> H[Express + disposable PostgreSQL integration]
  H --> I[Register / login / JWT / CRUD / user isolation]
  D --> J[Release decision]
  F --> J
  G --> J
  I --> J
  K[Manual Chromium + Firefox walkthrough] --> J
  L[Accessibility / security review] --> J
  J -->|all required checks pass| M[Candidate for merge]
  J -->|any failure| N[Fix in release branch]
```

```mermaid
sequenceDiagram
  participant Script as Integration verifier
  participant PG as PostgreSQL test DB
  participant API as Express API (localhost)
  Script->>PG: CREATE SCHEMA cb_verify_<random>
  Script->>PG: Apply SQL schema (isolated search_path)
  Script->>API: Listen on localhost ephemeral port
  Script->>API: Register A and B
  API->>PG: Insert account rows
  Script->>API: Login A and B
  API-->>Script: Signed JWTs
  Script->>API: A creates core
  API->>PG: INSERT with owner_id=A
  Script->>API: B lists/edits/deletes A's core
  API-->>Script: Empty list / 404 / 404
  Script->>API: A updates and deletes core
  API-->>Script: 200 / 204
  Script->>API: Stop listener
  Script->>PG: DROP SCHEMA cb_verify_<random> CASCADE
```

## Gate R1: Codebase and Git safety

- [ ] `git status --short` is clean before applying the upgrade.
- [ ] Export current player progress as JSON. Browser LocalStorage is **not** inside a Git or project-directory backup.
- [ ] Copy the entire project (including `.git`) to a timestamped directory outside it.
- [ ] Create a new feature branch; do not overwrite `main`.
- [ ] Restore the backup manually if the upgrade or testing fails.

**Exit:** Safe baseline preserved, with a clean branch for the upgrade.

## Gate R2: Game correctness and build budgets

- [x] Main tests updated with three bundle-regression tests; 38/38 passed in the packaging environment.
- [ ] `npm test` passes on Ubuntu.
- [ ] `npm run build` passes on Ubuntu.
- [ ] `npm run test:bundle` passes on Ubuntu. Enforces budgets of initial JS < 180 KB, total JS < 1.6 MB, CSS < 150 KB, and initial-JS gzip < 75 KB.
- [ ] Test game in Firefox and Chromium without uncaught console errors.
- [ ] Character boarding animation: door opens → player walks in → closes → ascends.
- [ ] Floor 0 → 1, Floor 10 → 11, Floor 99 → 100, and final ending, with no skipped floors or duplicate boarding.
- [ ] Progress export, import, save persistence, and New Game confirmed.

**Note:** A budget checks transfer sizes only, not actual FPS, responsiveness, or memory usage.

## Gate R3: Real Express + PostgreSQL integration

Tests use a dedicated local database whose name includes `test` and connect only to localhost. The verifier creates a unique schema and removes it afterwards; the Docker script also removes the temporary container.

- [ ] Docker Engine and Docker Compose v2 installed and functional, **or** a disposable local PostgreSQL test database is available.
- [ ] `bash scripts/verify_capstone_integration.sh` passes.
- [ ] All capstone unit tests pass.
- [ ] JWT issuance, tamper rejection, and authenticated identity checks pass.
- [ ] Register/login, wrong-password, duplicate-account and malformed-body handling pass.
- [ ] User A's cores cannot be listed, edited, or deleted by User B.
- [ ] SQL creation/migration and data persistence checks pass.
- [ ] Temporary database/schema was cleaned up.

**Not covered:** Production-scale concurrency, long-lived token revocation, distributed rate limiting, secure multi-tenant production operations.

## Gate R4: Accessibility, security, user acceptance

- [ ] Keyboard-only navigation and focus visibility tested.
- [ ] Tested a 1280×720 viewport and a narrow 390px-wide viewport.
- [ ] Confirm HTML/CSS previews never execute learner scripts in the trusted game origin.
- [ ] Confirm the sandbox times out on infinite loops.
- [ ] Complete one introductory, one HTML, one CSS, one JavaScript, and one SQL floor.
- [ ] Confirm final capstone instructions identify simulated activities separately from real server work.
- [ ] Check at least one complete beginner playthrough, with observations recorded in a bug tracker.
- [ ] Review dependency audits and known security caveats. No public real-user deployment of the capstone yet.

## Gate R5: Review, merge, and release candidate

- [ ] CI Game job green.
- [ ] CI Capstone PostgreSQL job green.
- [ ] No high-severity defects outstanding.
- [ ] User reports manual acceptance complete.
- [ ] Pull request reviewed before merge to `main`.
- [ ] Tag the *merged, tested commit* as a stable version only after gates pass.

**Release decision:** **PENDING** until the above operational gates pass. The entire game can be content-complete without being production-certified.

## Commands (Ubuntu)

```bash
cd ~/Documents/codebreak
npm install
npm run verify:release
# Choose ONE PostgreSQL test method:
bash scripts/verify_capstone_integration.sh
# OR (your own disposable localhost DB named *test*)
# npm install --prefix capstone/server
# CODEBREAK_TEST_DATABASE_URL='postgresql://USER:PASSWORD@127.0.0.1:5432/codebreak_test' npm run test:integration --prefix capstone/server
```

## Limitations

1. The browser-based Node.js/Express/security challenges are pedagogical simulations. A separate runnable capstone exercises real Express and PostgreSQL.
2. SQL challenge grading in the main game is structural, not executed SQL equivalence testing.
3. The capstone should **not** be deployed publicly without a separate security, privacy, and operations review. JWT revocation/refresh, durable distributed rate limiting, audit logs, secure secret storage, backup restoration and monitoring remain open.
4. No production URL, domain, paid hosting, or public launch has been configured in this stage.
