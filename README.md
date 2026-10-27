# CODEBREAK: THE TOWER OF CODE

**v1.0.0-rc.1 — Complete 100-floor browser campaign / release candidate**

A story-driven stickman programming game following Subject 404, PATCH, ROOT, NULL, and the missing Architect. Ten chapters introduce JavaScript, HTML, CSS, browser JavaScript, async work, Node.js, Express, PostgreSQL/SQL, JWT/security and full-stack integration. Each floor has the user's nine-stage learning sequence. The full-stack material includes **browser learning simulations** AND a **separate runnable Tower Control System Express/PostgreSQL capstone**.

> **Status:** Feature implementation/release candidate — **NOT** a production launch or accredited full-stack certification. Public deployment, real database integration, full animations and cross-browser accessibility still require local/external verification.

## 1. Apply to your existing Ubuntu repository

```bash
cd ~/Documents/codebreak
git status
# Commit your current work before continuing.
cp -a ~/Documents/codebreak ~/Documents/codebreak-backup-before-v1
# If on the old release branch, make a new development branch:
git switch -c feature/full-tower-v1-rc1
unzip -o ~/Downloads/CodeBreak_Full_Tower_Phases10-15_v1.0.0-rc1.zip -d ~/Documents/codebreak
npm install
npm test
npm run build
npm run dev
```

Visit **http://127.0.0.1:5173/** (Vite reports the actual local address). Do not extract on top of `node_modules/`, `.git/` or `dist/`: those are intentionally absent from the ZIP. All previous Git commits remain intact. Old saved progress under `codebreak:progress:v2` remains compatible; export it first for safety.

If you have not yet committed your v0.2.0 branch, commit it before extracting. Do not merge into `main` until playtesting passes.

## 2. Main controls
- `A`/`D`, arrows: move. `W` / `Space` / Up: jump. Shift: sprint. `E`: interact near the terminal/elevator.
- **Open challenge** also opens the current floor remotely. Complete editor challenges, pass each check, then press **Board elevator**, or walk to the lift and press `E`.
- A successfully solved floor animates the elevator doors opening. Boarding runs Subject 404 into the open lift, fades out, loads the next room, and triggers chapter/core story beats.
- Floor map groups chapters and allows revisiting unlocked rooms.
- Save progress is browser-local, export/import JSON. Diagnostic grants access only, never mastery.

## 3. Chapters
| Chapter | Floors | Curriculum | Core |
|---|---:|---|---|
| 1 The Awakening | 0–10 | JavaScript fundamentals | Logic |
| 2 Invisible Structure | 11–20 | Semantic HTML | Structure |
| 3 Architect's Lab | 21–30 | CSS, Flexbox, Grid and responsive design | Design |
| 4 Living Machine | 31–40 | Browser JavaScript, DOM concepts | Interaction |
| 5 Signal Network | 41–50 | Promises, HTTP, JSON, async functions | Network |
| 6 Engine Room | 51–60 | Node.js concepts (simulated in browser) | Runtime |
| 7 Server Citadel | 61–70 | Express/REST concepts (simulated in browser) | API |
| 8 Memory Vault | 71–80 | PostgreSQL SQL editor + structural checks (no DB execution in-game) | Memory |
| 9 Identity Gate | 81–90 | Authentication/JWT/authorization models | Security |
| 10 Final Deployment | 91–100 | Full-stack integration models, ROOT finale | Freedom |

**Important distinction:** HTML has DOM checks, CSS has CSSOM checks, SQL uses transparent structural checks, and JS uses a browser-isolated worker. **Back-end functions in the game are models**, not actual Node/Express execution. The `capstone/` folder contains the live server and PostgreSQL project; follow `capstone/README.md` to run it separately.

## 4. Development checks
```bash
npm test
npm run build
npm run dev
```

Browser validator harness (requires running Vite server): `http://127.0.0.1:5173/tests/browser/extended.html`. It runs authored structural exercise checks and representative browser JS sandbox tests. For comprehensive user-level QA see `docs/PLAYTEST_V1.md`.

## 5. Real full-stack practice
Run a separate local PostgreSQL database with Docker (optional but convenient):

```bash
docker compose -f capstone/compose.dev.yml up -d
cd capstone/server
cp .env.example .env
# Set JWT_SECRET in .env using `openssl rand -hex 32`.
npm install
npm run migrate
npm test
npm run dev
```

Open `http://127.0.0.1:4500/`. This is a standalone API + dashboard with user registration/login and owner-scoped CRUD. It is bound to loopback only; don't expose it publicly without a complete production security review.

## 6. Repository structure
```text
codebreak/
├── index.html
├── src/
│   ├── content/{floors.js,extended.js,diagnostic.js}
│   ├── game/GameScene.js
│   ├── runtime/{sandbox.js,validators.js}
│   ├── state/progress.js
│   ├── learning/lesson.js
│   ├── ui/app.js
│   └── core/{bus.js,sound.js}
├── capstone/
│   ├── compose.dev.yml
│   ├── client/{index.html,app.js,style.css}
│   └── server/{src/,sql/,tests/}
├── tests/
│   ├── browser/extended.html
│   └── *.test.js
└── docs/
    ├── PHASES_10-15_IMPLEMENTATION.md
    ├── ARCHITECTURE_V1.md
    ├── QA_REPORT.md
    ├── PLAYTEST_V1.md
    ├── PHASE_15_DEPLOYMENT.md
    └── FUTURE_MODIFICATIONS.md
```

## 7. Known constraints
- Phaser/Vite dependencies could **not** be downloaded in the artifact build environment, so **this updated ZIP's production bundle and actual Phaser physics were not locally built or reverified**. Your existing Ubuntu installation previously built successfully; run `npm install && npm run build` on your laptop for this revision.
- The real Express/PostgreSQL capstone also requires installation, local database migration, and integration/security testing. It was not deployed and no live database test has been run here.
- This offline learning game is not a cheating-resistant assessment platform: lesson solutions can be inspected from client-side source. Do not use floor passes as credentials or professional certification.
- UI and structural exercise checks provide helpful feedback but do not substitute for full accessibility, rendering, semantic correctness, SQL execution or production grading.

## 8. License & references
Project intended as the author's original educational game. No third-party copied character assets are included: the white stickman is rendered as original Phaser graphics. Reuse of dependencies is governed by their respective licenses.
