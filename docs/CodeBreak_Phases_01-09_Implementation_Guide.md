# CODEBREAK — PHASES 01–09 IMPLEMENTATION GUIDE

**Companion to:** `CodeBreak_Complete_Game_Design_and_Implementation.md`  
**Status:** Implementation checklist; not evidence of completion  
**Platform:** Ubuntu; browser-based JavaScript game  
**Rule:** Finish and verify each phase before moving to the next.

## Roadmap and phase gates

| Phase | Objective | Deliverable | Acceptance gate |
|---|---|---|---|
| 01 | Initialize project and tooling | Phaser/Vite app, Git repo, README | Fresh install, dev server and build succeed |
| 02 | Create Subject 404 | Movement, jump, idle/run/fall animations | Keyboard controls, collision and consistent animation |
| 03 | Construct Floor 0 | Platforms, camera, rooms, door and elevator | Can traverse room without clipping or scene errors |
| 04 | Add narrative interactions | PATCH, ROOT, dialogue, terminals, prologue | Can finish intro and interact without locking controls |
| 05 | Create challenge engine | Editor, isolated execution, tests, game events | Correct/incorrect/time-out cases safely handled |
| 06 | Implement learning engine | Lessons using nine-step study method | Learner can complete a full guided lesson and assessment |
| 07 | Persist and assess progress | Saves, mastery, diagnostic, checkpoints | Save/load, corruption recovery, skip recommendations |
| 08 | Produce Chapter 1 | Floors 1–10, Infinite Loop boss | Complete chapter and pass all challenge tests |
| 09 | Polish and playtest | Accessibility, sound, UI, QA | Beginner playtest, regression suite, release candidate |

## Stage releases

- **Stage I (01–03):** game foundation / prototype.
- **Stage II (04–06):** interactive learning vertical slice.
- **Stage III (07–09):** complete first chapter, beta 0.2.0 target.

## Phase 01 — Project initialization and architecture

### Objective
Create a small, maintainable browser game project using **JavaScript + Phaser + Vite**, with Git and reproducible installation. **Do not implement the stickman, storyline, backend, database or code execution yet.**

### Prerequisites
- Ubuntu terminal and internet access.
- Node.js and npm available (`node --version`, `npm --version`). Use an actively supported Node LTS version compatible with the installed Vite release; do not assume Windows Node is installed on Ubuntu.
- Git installed (`git --version`).
- VS Code optional (`code --version`).

### Steps
1. In Ubuntu, run `node --version`, `npm --version`, `git --version`. If Node/npm are missing, install a supported Node LTS using the official instructions for your platform; verify the versions before proceeding.
2. Create the project:
   ```bash
   mkdir -p ~/Documents/codebreak
   cd ~/Documents/codebreak
   npm create vite@latest . -- --template vanilla
   npm install
   npm install phaser
   ```
   If Vite warns that your Node version is unsupported, **stop and upgrade Node**, then reinstall. Do not bypass the engine requirement.
3. Open in VS Code: `code .` (or use your preferred editor).
4. Replace the generated `src/main.js` with the minimal Phaser scene shown below. Replace `src/style.css` with the CSS below (or update the CSS import path to match the scaffold). Replace `index.html` with the sample below.
5. Run `npm run dev` and open the local URL printed by Vite.
6. Run `npm run build` and confirm it succeeds.
7. Create `README.md`, initialize Git if necessary, and commit the baseline. Do not push until the repository and remote are verified.

### index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CodeBreak — The Tower of Code</title>
  </head>
  <body>
    <main id="game" aria-label="CodeBreak game canvas"></main>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### src/main.js
```javascript
import Phaser from 'phaser';
import './style.css';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#10141b');
    this.add.text(400, 210, 'CODEBREAK', {
      fontFamily: 'monospace', fontSize: '46px', color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(400, 270, 'THE TOWER OF CODE', {
      fontFamily: 'monospace', fontSize: '20px', color: '#65e0ad'
    }).setOrigin(0.5);
    this.add.text(400, 345, 'Phase 01 — Foundation online', {
      fontFamily: 'monospace', fontSize: '15px', color: '#aab5c4'
    }).setOrigin(0.5);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 450,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene]
});
```

### src/style.css
```css
:root { font-family: system-ui, sans-serif; color: #fff; background: #080a0f; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; }
#game { width: min(100vw, 1000px); }
canvas { display: block; }
```

### Git baseline
```bash
git status
# If not already a repository:
git init
git add .
git commit -m "chore: initialize CodeBreak Phaser Vite foundation"
```

Do not commit `node_modules/`, `dist/`, or `.env` files. Verify `.gitignore` excludes them. To push to GitHub, first create an empty remote repository named `codebreak`, check `git remote -v`, then use `git remote add origin <your-repository-url>` if no origin exists, `git branch -M main`, and `git push -u origin main`. Never overwrite an existing remote without checking it.

### Acceptance checklist
- [ ] `node --version`, `npm --version`, `git --version` work on Ubuntu.
- [ ] Vite scaffold installs without unsupported-engine errors.
- [ ] `npm run dev` opens the CodeBreak title screen.
- [ ] Browser console has no uncaught errors.
- [ ] `npm run build` succeeds.
- [ ] `.gitignore` excludes generated and secret files.
- [ ] Initial source is committed.
- [ ] README explains installation and launch.

### Phase 01 evidence to share in chat
Send the output of `node --version`, `npm --version`, `npm run build`, `git status`, and a screenshot or description of the running title screen. Do not share credentials or tokens. We will troubleshoot issues before marking Phase 01 complete.

## Phase 02 — Stickman character
**Objective:** Implement Subject 404 with responsive left/right movement, jump, idle, run and fall states, ground collision, and animation matching the supplied reference video's minimalist silhouette.  
**Tasks:** Define controller and physics parameters; draw or import original stickman assets; implement input handling; build animation state machine; test collision, landing and movement transitions.  
**Acceptance:** No input lag or animation flicker; jumping and landing behave consistently; character remains inside level bounds.  
**Dependency:** Phase 01 complete.

## Phase 03 — World and level system
**Objective:** Create Floor 0 with platforms, walls, door, elevator, camera follow and scene transitions.  
**Tasks:** Level schema, collision layers, interaction zones, camera bounds, transition controller, respawn.  
**Acceptance:** Player can explore and transition without clipping, softlocks or lost state.  
**Dependency:** Phase 02 complete.

## Phase 04 — Interaction and story
**Objective:** Implement the Subject 404 prologue and character dialogue.  
**Tasks:** PATCH and ROOT dialogue, terminal proximity prompts, interaction input, dialogue state, cutscene sequence, skip/replay and input locking.  
**Acceptance:** Intro is playable, readable and repeatable; no stuck controls.  
**Dependency:** Phase 03 complete.

## Phase 05 — Programming challenge engine
**Objective:** Connect real code challenges to world-state changes.  
**Tasks:** Editor UI; challenge schema; independent evaluator; public/hidden tests; structured feedback; secure resource and time limits; success/failure events.  
**Security gate:** Never use `eval`/`new Function` in the trusted page or execute learner code in the main API process. A web worker alone is not a sufficient security boundary for untrusted code. Use appropriately sandboxed isolation and validate threat models before production.  
**Acceptance:** Correct, incorrect, syntax-error, infinite-loop and hostile-input tests behave safely.  
**Dependency:** Phase 04 complete.

## Phase 06 — Educational engine
**Objective:** Embed the nine-step study method in one complete lesson.  
**Tasks:** Objectives; definitions; step-by-step explanation; visualization; examples; real-life applications; exercises; mini-project; integrated chapter project; hints and reflection.  
**Acceptance:** A beginner completes the lesson and demonstrates learning in an independent assessment.  
**Dependency:** Phase 05 complete.

## Phase 07 — Progress and diagnostic assessment
**Objective:** Save and personalize learning.  
**Tasks:** Local persistence, schema versioning, checkpoints, mastery scores, diagnostic questions, skip recommendations, corrupted-save recovery, export/import.  
**Acceptance:** Reload and recovery work; diagnostic skips only demonstrated prerequisites; skipped lessons remain accessible.  
**Dependency:** Phase 06 complete.

## Phase 08 — Chapter 1
**Objective:** Build ten coherent JavaScript floors with a boss and Logic Core reward.  
**Tasks:** Content authoring; puzzle progression; assessment variants; Infinite Loop boss; chapter finale; narrative transitions; regression tests.  
**Acceptance:** New player can complete Floors 1–10; all tests pass; knowledge is transferable beyond memorized answers.  
**Dependency:** Phase 07 complete.

## Phase 09 — UX, accessibility and polish
**Objective:** Prepare a first-chapter beta for outside testers.  
**Tasks:** Sound, animations, menus, keyboard support, contrast, reduced motion, responsive lesson UI, performance, onboarding, QA and feedback.  
**Acceptance:** New testers can complete the chapter independently; no release-blocking defects; documented known limitations.  
**Dependency:** Phase 08 complete.

## Change-control and future modifications
Ideas for multiplayer, AI tutoring, additional languages, advanced cybersecurity, mobile builds, new story arcs and community content belong in a **future backlog**. Do not introduce them into Phases 01–09 unless needed for correctness or safety. Each proposal should record its user value, dependencies, cost, risk and target release.

## Working agreement
For each phase: (1) confirm prerequisites, (2) follow steps, (3) share terminal output or screenshots, (4) fix failures, (5) run acceptance tests, (6) commit changes, (7) mark the phase complete, then move to the next phase.
