# CODEBREAK: THE TOWER OF CODE

**Release:** `v0.2.0` — Chapter I: The Awakening  
**Scope:** Phases 01–09, Floors 0–10 (prologue + ten JavaScript learning floors)  
**Platform:** Modern Chromium or Firefox on Ubuntu; responsive touch controls included.  
**Stack:** JavaScript ES modules, Phaser 3 Arcade Physics, Vite 8, native browser APIs.

> Enter as a beginner. Escape as a full-stack developer. The complete 100-floor story is the **long-term design**, not what this v0.2.0 archive contains. This archive implements the playable first chapter only.

## 1. INSTALL INTO YOUR EXISTING GITHUB REPOSITORY — IMPORTANT

Your repository is already in `~/Documents/codebreak` and has its own `.git` directory and first commit. **Do not run `git init`, remove `.git`, or overwrite your GitHub repository.**

Back up and create a feature branch before applying these source files:

```bash
cd ~/Documents/codebreak
npm run build                      # optional: verify your existing baseline
cp -a ~/Documents/codebreak ~/Documents/codebreak-backup-before-v0.2

git status
# Ensure your existing changes are committed/stashed before switching branches.
git switch -c feature/chapter1-phases02-09
```

Download `CodeBreak_Phases01-09_v0.2.0.zip` and extract its contents **directly into** `~/Documents/codebreak`, for example:

```bash
unzip -o ~/Downloads/CodeBreak_Phases01-09_v0.2.0.zip -d ~/Documents/codebreak
cd ~/Documents/codebreak
npm install
npm test
npm run build
npm run dev
```

**Find the ZIP before running unzip**: the downloaded path may differ depending on your browser. The ZIP deliberately contains no `.git`, `node_modules`, or old `package-lock.json`. `npm install` updates your existing lockfile for the release's dependencies.

Once local tests pass, visit **http://localhost:5173/**. On the first launch, start Floor 0 as a beginner or take the optional placement assessment.

To stop the Vite server, press `Ctrl+C` in that terminal.

## 2. NEXT STEPS IN ORDER

1. Make the backup and feature branch (above).
2. Extract ZIP into the existing repository root.
3. Run `npm install` (requires internet the first time).
4. Run `npm test` and verify all checks pass.
5. Run `npm run build` and confirm Vite reports success.
6. Run `npm run dev`; open the game in Firefox or Chromium.
7. Complete the [manual QA checklist](docs/PLAYTEST_CHECKLIST.md) including valid code, invalid code, timeouts, and save/reload.
8. Inspect your changes: `git status` and `git diff --stat`.
9. When satisfied, commit to your feature branch:

   ```bash
   git add .
   git commit -m "feat: implement CodeBreak Chapter I phases 2-9"
   git push -u origin feature/chapter1-phases02-09
   ```

10. Send playtest feedback to ChatGPT (browser, console errors, screenshots, failed tests, visual feedback). We will fix regressions before implementing Phase 10.

For users who want to remain on `main` instead of a branch, do so only after reviewing the change: `git switch main && git merge feature/chapter1-phases02-09 && git push origin main`.

## 3. CONTROLS

| Action | Keys / controls |
|---|---|
| Walk | `A` / `D` or `←` / `→` |
| Jump | `W`, `↑` or `Space` |
| Sprint | `Shift` while moving |
| Open nearby terminal | `E` |
| Enter unlocked elevator | `E` when near door, or use button after passing tests |
| Open challenge from anywhere | **Open challenge** button below scene |
| Execute code | **Run tests** or `Ctrl+Enter` inside the editor |
| Insert indentation in editor | `Tab` |
| Close pop-up | `Escape` |
| Touch | Movement, Jump and Use buttons below scene at narrow viewport widths |

## 4. FEATURES BY IMPLEMENTATION PHASE

| Phase | Included functionality |
|---|---|
| **01 — Setup** | Vite project, Phaser dependency, npm commands, README, git-safe archive |
| **02 — Stickman** | Original vector-drawn stickman, walk/run/jump/fall/idle poses, Arcade Physics collisions |
| **03 — World** | Scrolling tower sector, camera follow, raised platforms, terminals, elevator, per-floor scene reload |
| **04 — Story** | Prologue, PATCH/ROOT dialogue, ROOT warning, NULL hint, story archive, floor arrival scenes |
| **05 — Challenges** | Browser code editor, authored evaluation cases, sandboxed code execution, result feedback, timeout |
| **06 — Learning** | All **nine** study-method sections for each floor, examples, real-life applications, exercises, hints |
| **07 — Progress** | Local saves, schema version, safe recovery, export/import JSON, mastery per passed floor, placement diagnostic |
| **08 — Chapter I** | Floor 0 + Floors 1–10, unique puzzles, Infinite Loop boss, Logic Core and chapter-ending sequence |
| **09 — Polish** | Keyboard and responsive controls, reduced-motion CSS, procedural optional sound, floor map, progress dashboard, automated regressions and QA plan |

## 5. LEARNING CONTENT

Floor 0 is the story prologue and programming introduction. Floors 1–10 cover values and comparisons, Boolean conditions, if/else, for loops, arrays, objects and searching, strings, functions and defaults, filtering data, and a combined elevator-controller boss.

Every lesson follows the nine-step study sequence:

1. Objectives
2. Key definitions
3. Step-by-step explanation
4. Visualization
5. Worked code example
6. Real-world applications
7. Exercise
8. Mini-project
9. Main project connection

**Important:** passing the authored browser tests demonstrates progress in an individual *game challenge*. It does not prove production competence or grant a professional certification. The diagnostic recommends a starting floor but does not mark earlier missions completed.

## 6. BROWSER CODE EXECUTION SAFETY

Student code is evaluated in a **Web Worker inside a sandboxed iframe** without `allow-same-origin`. The iframe sets a restrictive Content Security Policy to block outgoing connections; a timeout discards the iframe/worker after 2.4 seconds. Student code never executes inside the Phaser game page or in the trusted application server.

Do not interpret this as a production-grade hostile-code runner. Client-side tests can be inspected or bypassed, browser sandbox behavior varies, and hostile code security must be independently reviewed before public deployment. Advanced Node/Express challenges in future phases require an entirely separate server execution service with strong isolation, resource limits, rate limiting, network restrictions, and auditing. Never put credentials or private data into challenge code.

## 7. DATA STORAGE

Progress is saved in the current browser via `localStorage`, key `codebreak:progress:v2`. Save files can be downloaded and imported via **My progress**. This build has no account server or cloud sync. Browser data removal will erase saves unless you previously exported them.

Project state is versioned and imported records are shape-checked. Imported local saves are not cryptographically verified and should not be used for competitive leaderboards or certification.

## 8. PROJECT STRUCTURE

```text
codebreak/
├── index.html                       Main browser screen
├── package.json                     npm scripts and Phaser / Vite versions
├── src/
│   ├── main.js                       Phaser + interface startup
│   ├── style.css                     Game and learning interface theme
│   ├── content/
│   │   ├── floors.js                 11 authored missions, example starters, tests
│   │   └── diagnostic.js             Eight onboarding questions + placement
│   ├── core/
│   │   ├── bus.js                    Event bus between Phaser and HTML interface
│   │   └── sound.js                  Tiny procedural audio cues
│   ├── game/GameScene.js             Stickman, camera, platforms, interaction
│   ├── learning/lesson.js            Nine-step lesson contract
│   ├── runtime/sandbox.js            Sandboxed JS evaluation
│   ├── state/progress.js             Save/restore, unlock, import/export
│   └── ui/app.js                     Story, lessons, terminal, menus, diagnostic
├── public/favicon.svg
├── tests/
│   ├── challenges.test.js            Test-only correct solutions
│   ├── curriculum.test.js            Content structure checks
│   ├── progress.test.js              Persistence and progression checks
│   └── browser/sandbox.html          Browser sandbox regression page
└── docs/
    ├── CodeBreak_Complete_Game_Design_and_Implementation.md
    ├── CodeBreak_Phases_01-09_Implementation_Guide.md
    ├── PHASES_01-09_RELEASE_NOTES.md
    └── PLAYTEST_CHECKLIST.md
```

## 9. TESTING & LIMITATIONS

`npm test` runs Node's built-in unit tests. `npm run build` uses locally installed Vite. For an additional browser check, open **http://localhost:5173/tests/browser/sandbox.html** after `npm run dev`. It runs a valid, invalid, syntax-error and infinite-loop case in the browser.

**Testing conducted when this ZIP was prepared:** Node tests for curriculum/solutions/saves passed; headless Chromium passed the isolated executor's correct/incorrect/syntax-error/timeout cases; headless Chromium also stepped through every authored chapter challenge and reached the ending in an HTML-interface integration harness without uncaught JavaScript errors. The development container could **not install Phaser/Vite from npm**, so a real Phaser+Vite browser build and actual game physics/animation playtest could not be verified here. Run the build and check movement locally before considering this release fully verified.

Known scope boundaries:
- Only Chapter I (Floors 0–10) is playable: the complete 100-floor story remains the design target.
- The editor is a lightweight accessible text area, **not Monaco**; full editor features are reserved for later enhancements.
- Lessons include exercises and suggested mini-projects, but mini-projects are not yet independently graded or exported as separate repos.
- No production backend, PostgreSQL, cloud accounts, or real Node/Express evaluation yet.
- No professional game audio, cinematic videos, or custom sprite sheets; the character is original geometric artwork animated programmatically.
- Touch layout has responsive controls but should still be tested on physical devices.

## 10. TROUBLESHOOTING

**npm says ENOENT / cannot find package.json**: you are probably not in the repository root. Run `cd ~/Documents/codebreak && ls package.json`.

**'vite: command not found'**: run `npm install` in the root.

**Node engine error**: use a supported Node.js LTS version (`node --version`). Vite 8 requires a sufficiently new supported Node release.

**Black game canvas**: check the browser console (F12 → Console), verify Phaser installed, and share the first red error message; do not delete `.git`.

**Stuck on a floor**: use **Open challenge** even if you cannot reach the terminal, solve all test cases, and use the **Enter elevator** button.

**Blank/corrupt progress**: inspect **My progress** and import an earlier exported backup. The game attempts to isolate malformed saved state and start fresh.

**Tests pass but movement fails**: the Node tests do not simulate Phaser physics. This needs a real-browser playtest.

## 11. DESIGN DOCUMENTATION

Read the master architecture in `docs/CodeBreak_Complete_Game_Design_and_Implementation.md`, the phase checklist in `docs/CodeBreak_Phases_01-09_Implementation_Guide.md`, and the release-specific notes in `docs/PHASES_01-09_RELEASE_NOTES.md`.

**Do not skip feedback:** verify v0.2.0 thoroughly before moving to Phase 10 (HTML/CSS/browser frontend chapters).
