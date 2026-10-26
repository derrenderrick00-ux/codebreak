# CodeBreak v0.2.0 — Player Acceptance & Regression Checklist

**Test environment:** Ubuntu / Firefox or Chromium (record versions).  
**Goal:** Identify functional, learning, visual, accessibility and safety issues before starting Phase 10.

## A. Install and build

- [ ] ZIP extracted in the existing `~/Documents/codebreak` repository root, retaining `.git`.
- [ ] `node --version`, `npm --version`, `git --version` work.
- [ ] `npm install` completes without engine errors.
- [ ] `npm test` passes every case.
- [ ] `npm run build` succeeds.
- [ ] `npm run dev` starts and browser loads local Vite URL.
- [ ] No uncaught errors appear in browser console (F12 → Console).

## B. Onboarding and story

- [ ] Intro opens first time and explains Subject 404, PATCH and ROOT.
- [ ] Beginner route starts on Floor 0.
- [ ] Diagnostic displays exactly eight questions.
- [ ] Submitting incomplete diagnostic shows a readable error.
- [ ] Diagnostic recommends floor based on results without falsely marking any floor complete.
- [ ] Story archive displays readable lore.
- [ ] Closing the modal returns keyboard focus and movement.

## C. Stickman physics (physical-browser verification required)

- [ ] Stickman visible in scene (white head/limbs, minimalist design).
- [ ] `A/D`, `←/→` walk smoothly and face appropriate directions.
- [ ] `Shift` accelerates movement.
- [ ] `W`, `↑` and `Space` jump; cannot repeatedly air-jump.
- [ ] Actor lands and cannot fall through the ground or raised platforms.
- [ ] Idle, running and airborne poses look correct.
- [ ] Camera follows the actor and remains within world bounds.
- [ ] Press `E` near terminal opens coding challenge.
- [ ] Press `E` by a locked elevator does not unlock it.
- [ ] Press `E` near unlocked elevator enters next floor.
- [ ] Floor transitions do not duplicate sprites or freeze movement.

## D. Learning flow

- [ ] Every floor presents all nine study-method steps.
- [ ] Each step has accurate objectives, vocabulary and code examples.
- [ ] Editor can be focused, edited and accepts Tab indentation.
- [ ] `Ctrl+Enter` starts tests.
- [ ] Reset editor returns to original starter code.
- [ ] Hints are available in Guided mode.
- [ ] Switching Guided/Practice/Mastery alters explanation visibility as expected.
- [ ] Correct code unlocks the elevator.
- [ ] Incorrect code fails and displays actionable expected/actual values.
- [ ] Syntax errors fail without closing the game.
- [ ] `while(true){}` times out; game remains responsive.
- [ ] Code under Floor 1 cannot mark Floor 10 completed without completing tests.
- [ ] Passing tests keeps challenge replayable after revisiting that floor.

## E. Chapter content

- [ ] Floor 0 — identify name, trim, fallback.
- [ ] Floor 1 — generator voltage.
- [ ] Floor 2 — key + clearance.
- [ ] Floor 3 — online/offline signal.
- [ ] Floor 4 — loop step sequence.
- [ ] Floor 5 — transform array values.
- [ ] Floor 6 — find first safe door.
- [ ] Floor 7 — normalize transmission.
- [ ] Floor 8 — default function parameter.
- [ ] Floor 9 — count active modules.
- [ ] Floor 10 — ascending/descending lift, equal floor and negative floors.
- [ ] Chapter ending displays Logic Core and teasing NULL dialogue.

## F. Saving and review

- [ ] Reload the tab; floor, completed missions and mode persist.
- [ ] Floor map shows unlocked/locked/completed correctly.
- [ ] Return to an earlier floor and replay without losing later unlocks.
- [ ] Export progress downloads valid JSON.
- [ ] Import progress restores previously exported save.
- [ ] Import malformed JSON displays error and retains good save.
- [ ] Reset progress only after confirmation.
- [ ] Progress percentage represents Floors 1–10, not Floor 0.

## G. UI, performance, devices

- [ ] Menus work at 1366×768 laptop resolution.
- [ ] Menus and game scale at 960×540 window size.
- [ ] At mobile viewport sizes, touch buttons appear and work.
- [ ] Code editor remains usable with a mobile keyboard.
- [ ] Modals have visible close control and Escape dismisses.
- [ ] Full keyboard navigation and visible focus indicator work.
- [ ] Reduced motion setting is respected.
- [ ] Sound toggle starts muted and persists preference.
- [ ] Browser does not crash or consume excessive resources after replaying multiple floors.
- [ ] Separate browser or private-window save is isolated.

## H. Sandbox smoke test

While Vite is running, open `http://localhost:5173/tests/browser/sandbox.html`.

- [ ] Correct solution passes.
- [ ] Incorrect solution fails.
- [ ] Syntax error safely fails.
- [ ] Infinite loop stops via timeout.
- [ ] CSP/network attempted access does not crash the app (inspect console for blocked request).

## Feedback format for ChatGPT

Copy this block when reporting findings:

```text
CODEBREAK v0.2.0 PLAYTEST FEEDBACK
OS:
Browser and version:
Node/npm versions:
npm test result:
npm run build result:
Floors completed:
Working features:
Failed checklist items:
First red browser-console error (if any):
Screenshot(s) or steps to reproduce:
Visual / story / teaching feedback:
```

**Release gate:** Zero known critical crashes, working real-browser stickman controls and scene transitions, safe timeout behavior, reliable progress saves, and a complete Floor 0–10 playthrough on the actual Ubuntu machine.
