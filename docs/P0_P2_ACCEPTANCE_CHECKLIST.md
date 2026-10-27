# CodeBreak P0–P2 Ubuntu acceptance checklist

## Before installing
- [ ] Confirm you are on `feature/full-tower-v1-rc1` at or after commit `3ce2cb3` and clean: `git status`.
- [ ] Export the current browser save from **My progress → Export save** to `~/Downloads`.
- [ ] Run the supplied `backup_and_install.sh` from outside the project (it creates a full backup including `.git`).
- [ ] Keep backup path and browser JSON save somewhere safe.

## P0 gameplay and progression
- [ ] Load Floor 0 after New Game (only after save export).
- [ ] Complete terminal test: unlocked lift opens visibly.
- [ ] Board elevator; observe walk → enter → panels close → fade → new floor.
- [ ] Verify floor status text changes during boarding.
- [ ] Confirm rapid repeated boarding doesn't skip extra floors.
- [ ] Verify save survives a reload; import previously exported progress.
- [ ] Test Chapter 1 Floor 10 → Floor 11 and Floor 100 finale (via saved progress if available).

## P1 editor, character and learning
- [ ] Check head/arm/leg movement when walking, jumping, falling and landing.
- [ ] Test editor on JavaScript, HTML, CSS and SQL floors.
- [ ] Observe line numbers and syntax colors; toggle **Highlight: Off/On**.
- [ ] Type multiple lines, scroll horizontally and vertically, edit near end of file.
- [ ] Press Tab for indentation and Ctrl+Enter to run.
- [ ] Run wrong code, malformed code, correct code and an infinite loop (sandbox should timeout).
- [ ] Visit **Interactive concept trace** and navigate Previous / Next.
- [ ] Use mouse, keyboard-only and smaller browser viewport.

## P2 performance, security, a11y and capstone
- [ ] `npm test` and `npm run build` pass.
- [ ] Browser developer console shows no uncaught errors.
- [ ] Reload with network throttled and observe game loads after UI (async Phaser chunk).
- [ ] Press Tab from address bar to focus the Skip link and activate it.
- [ ] Ensure challenge dialog traps focus and Escape closes.
- [ ] Editor literal `<img src=x onerror=alert(1)>` never inserts an actual image.
- [ ] With real PostgreSQL available, `cd capstone/server; npm install; npm test; npm run migrate; npm run dev`.
- [ ] `GET /api/ready` reports ready when DB is up and 503 if down.
- [ ] Register, log in, create/edit/delete cores, and verify another account cannot access them.
- [ ] Before public launch, separately complete security audit, TLS, backup restore drill, monitoring, rate-limit hardening and deployment approval.

## Regression reporting
Record: floor number, study mode, browser version, expected result, observed result, screenshot/video, console errors, whether reload reproduces it, and Git commit hash.
