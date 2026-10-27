# CodeBreak v1.0.0-rc.1 — Playtest Checklist

Test on **your Ubuntu machine** on the feature branch. Save a progress export before destructive testing.

## A. Installation / regression
- [ ] Run `npm install`, `npm test`, `npm run build`, `npm run dev` — retain outputs.
- [ ] Open the game in Firefox and Chromium (if installed).
- [ ] No red errors in browser developer console.
- [ ] Previously saved Floor 07 / diagnostic state still loads.
- [ ] Reset only after saving a JSON export; import old save again to verify roundtrip.

## B. Corrected Subject 404 + elevator
- [ ] Stickman keeps round head + thin limbs consistent with reference video.
- [ ] Idle breathing, walk-cycle legs/arms, run stride, left/right facing, jump and fall pose are visible.
- [ ] Character collides with ground/platforms and doesn't fall through.
- [ ] Complete one coding challenge; elevator **door leaves slide open visibly**.
- [ ] Stand near the elevator and press E; Subject 404 **walks to lift and fades into it** before next floor.
- [ ] Repeat using the **Board elevator** button from the code modal (not only E).
- [ ] Wait for floor-change animation; no stuck transition / double transition when spam-clicking.
- [ ] Test chapter transitions 10→11, 20→21, 99→100, and final 100-ending.

## C. Full-stack curriculum
- [ ] Floor 11 HTML: write semantic HTML, preview renders; invalid document fails checks.
- [ ] Floor 14 labels/input association, Floor 20 semantic boss checks.
- [ ] Floor 21 CSS values parse correctly (hex colors accepted).
- [ ] Floor 27 CSS media query and Floor 30 CSS boss pass.
- [ ] Floor 31 browser DOM model JS works through isolated worker.
- [ ] Floor 42 Promise challenge succeeds; infinite loop challenge returns timeout.
- [ ] Floors 51–70 clearly identified as **Node/Express browser models**, not live server execution.
- [ ] Floor 71 SQL editing explicitly warns about structural-only validation.
- [ ] Floor 81 security lessons explain claims versus signed token verification.
- [ ] Floor 100 ROOT ending appears after submitting correct solution and boarding lift.

## D. Learning workflow
- [ ] Objectives, definitions, explanation, visualization, example, applications, exercise, mini-project, main project appear on every floor.
- [ ] Hints reveal guidance; students can retry failed tests.
- [ ] Guided, Practice, Mastery modes remain selectable.
- [ ] Floor map scrolls and filters visually by chapter sections; 101 total floor tiles.
- [ ] Chapter cores and progress counters show 0–10 and 0–100.

## E. Real capstone (separate runnable exercise)
- [ ] PostgreSQL dev instance starts, `npm run migrate` passes.
- [ ] `capstone/server`: `npm install`, `npm test`, `npm run dev` pass.
- [ ] Create account, login, create/read/update/delete core with real HTTP.
- [ ] A second account cannot read/change another user's core.
- [ ] Wrong passwords rejected, tampered JWT rejected, expired JWT rejected.
- [ ] Secrets are absent from Git and client JS bundle.

## F. Production gate
- [ ] Responsive/mobile browser, keyboard and screen-reader audit.
- [ ] Performance and memory check on ThinkPad X280 / 8 GB RAM.
- [ ] Threat modeling of code sandbox / input validation / API protections.
- [ ] HTTPS, robust backups, restore rehearsal, cloud monitoring, safe configuration.

## Feedback format
```
CodeBreak v1.0.0-rc.1
Node tests: PASS / FAIL
Vite build: PASS / FAIL
Character: PASS / problems
Door opens: YES / NO
Board animation: YES / NO
Floor 10→11: PASS / FAIL
Floor 100 finale: PASS / FAIL
HTML/CSS/SQL labs: PASS / FAIL
Capstone database test: PASS / FAIL / NOT RUN
Browser console errors: [paste]
Suggestions: [describe]
```
