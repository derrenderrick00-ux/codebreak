# Changelog — CodeBreak v1.1.0-rc.1

## Added
- Chapter-agnostic concept-trace visualization using the existing visualization stage of each nine-step lesson.
- Inert syntax coloring for JavaScript, HTML, CSS and SQL editor text, line numbers, cursor/line metrics, syntax highlighting toggle.
- Multi-stage elevator boarding HUD text, closing lift animation, landing feedback.
- Lazy Phaser import, error message when engine load fails, skip navigation link and touch target sizing.
- Capstone in-memory bounded limiter and `/api/ready` DB-readiness endpoint, no-store and browser feature policy headers.
- New targeted tests, documented backup/rollback, upgrade checklist, QA roadmap.

## Preserved
- Full 100-floor curriculum, Subject 404/PATCH/ROOT/NULL story, original progress schema v2, New Game reset, current floor drafts, source layout, no forced progress reset.

## Not changed
- The browser is still not a real Node/Express/PostgreSQL sandbox. PostgreSQL capstone is separate.
- Public deployment is not completed or claimed.
- Real device gameplay and DB testing remain required.
