# CodeBreak v1 — Architecture and Trust Boundaries

## Main runtime

```mermaid
flowchart TB
  USER[Subject 404 / Player] --> UI[HTML/CSS UI + 9-stage lessons]
  USER --> PHASER[Phaser Scene + physics + stickman]
  UI <-->|EventTarget bus| PHASER
  UI --> CURR[101 floor metadata records / 10 chapters]
  UI --> SAVE[LocalStorage + export/import JSON]
  UI --> DISPATCH[Challenge dispatcher]
  DISPATCH -->|JavaScript| IFRAME[Sandbox iframe: opaque origin + CSP]
  IFRAME --> WORKER[Dedicated worker + timeout]
  DISPATCH -->|HTML| DOM[Detached DOMParser structural checks]
  DISPATCH -->|CSS| CSSOM[CSSStyleSheet validation]
  DISPATCH -->|SQL| SQL[Static clause checks only]
  WORKER -->|Result| DISPATCH
  DOM -->|Result| DISPATCH
  CSSOM -->|Result| DISPATCH
  SQL -->|Result| DISPATCH
  DISPATCH -->|Pass / Fail| UI
  UI -->|Solved| PHASER
  PHASER -->|Door opens → character boards → fade → arrived| UI
```

### Critical security boundaries
- JavaScript solutions **never execute in the trusted main page**; they use nested opaque-origin iframe + worker. Worker is destroyed on result/timeout. Sandbox escape resistance has **not** undergone a professional security audit.
- HTML previews use empty iframe sandbox flags (no scripts, no same-origin) with restrictive CSP. HTML checks use an inert document parser.
- CSS checks parse declarations using browser CSSOM; no arbitrary user CSS is attached to the trusted DOM. Preview CSP restricts resource access.
- SQL exercises are **static checks only**: they do not connect to a real database or guarantee semantic correctness.
- Browser floor-completion records are user-editable and cannot certify abilities or unlock server authorizations.

## Separate capstone: Real full stack

```mermaid
flowchart LR
  B[Capstone dashboard in browser] -->|HTTPS in real deployment| A[Express API]
  A --> AUTH[Password hashing + JWT verify + ownership check]
  AUTH --> DB[(PostgreSQL)]
  A -->|JSON| B
  DEV[Local compose PostgreSQL] -.-> DB
```

Real capstone architecture: `capstone/client/` HTML/CSS/JS, `capstone/server/src/app.js` Express routes, `security.js` scrypt and jose JWT, `db.js` pg connection pool, `sql/001_initial.sql` schema. Production launch requires TLS, cloud secrets, backups, durable rate limiting and audits.

## Game state machine

```mermaid
stateDiagram-v2
  [*] --> Explore
  Explore --> Terminal: E / Open challenge
  Terminal --> Explore: Close editor
  Terminal --> Solved: All checks pass
  Solved --> DoorsOpening: solved event
  DoorsOpening --> Explore: Door remains open
  Explore --> Boarding: E at open elevator
  Boarding --> FadeOut: Move player to lift
  FadeOut --> Arrival: Fade complete (or guarded fallback)
  Arrival --> Explore: Load next floor
  FadeOut --> Finale: Floor 100
```

**Do not** jump floors on clicking Enter elevator. UI requests boarding; the Phaser scene owns the animation; only its `game:elevator:arrived` event advances the logical floor.

## Curriculum, tests, and status
Ten 10-floor chapters + prologue; floor records are independent of scene physics. A *chapter core* is awarded by passing floor N*10. Placement tests open earlier lessons without awarding mastery. The completed capstone is a separate external learning objective. User-visible game achievement is not a recognized certification.
