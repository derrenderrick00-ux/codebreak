# CodeBreak Phase 15: Deployment / Launch Gate

**This document is a runbook. It is not evidence that CodeBreak has been deployed.**

## Browser game (static frontend)
1. On Ubuntu: `npm ci` *after a valid package-lock.json is generated*, `npm test`, `npm run build`.
2. Serve `dist/` through a static hosting provider (HTTPS), set `Cache-Control` based on hashed assets, and verify SPA fallback rules if needed.
3. Test browser sandbox CSP/iframe behavior on the real hostname. Workers, `srcdoc` and strict CSP can vary under hosting policies.
4. Configure a content-security policy that allows only necessary scripts and worker behavior; game challenge runner requires `blob:` worker in a sandbox frame, but trusted frontend should not globally allow `'unsafe-eval'`.
5. Verify site on keyboard, Firefox/Chromium, small devices and low memory.
6. Set up uptime monitoring, release rollback procedures and bug reporting.

## Separate Tower Control System API
1. Use managed PostgreSQL or hardened private database with regular encrypted backups. Run migrations in a controlled deploy job.
2. Deploy Node.js under a monitored process/container, with a reverse proxy terminating TLS and restricting hosts/origins. The example server intentionally binds only to `127.0.0.1`.
3. Load `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGIN`, `JWT_ISSUER`, `JWT_AUDIENCE` from a secrets manager. Do not expose `JWT_SECRET` to Vite or client JS. Rotate compromised credentials.
4. Use DB least privileges, server-side resource limits, distributed login/API rate limiting, structured audit logs without secrets, health checks, alerts, vulnerability scans, and patch cadence.
5. Reconsider JWT refresh/revocation, account recovery and password policies before real users. Current 30-minute bearer token is in memory and can be invalidated locally only by forgetting it; JWT revocation is not provided.
6. Test real HTTP with two users, deny cross-user CRUD, reject injection attempts, test token expiry and signature verification, validate backups by restoring to a separate DB.
7. Block public network exposure until security review and privacy/terms are complete. No current production-ready multi-user code execution service is provided.

## Local capstone commands
```bash
cd ~/Documents/codebreak
docker compose -f capstone/compose.dev.yml up -d
cd capstone/server
cp .env.example .env
openssl rand -hex 32       # paste as JWT_SECRET inside .env
npm install
npm run migrate
npm test
npm run dev
# Open http://127.0.0.1:4500 in another browser tab
```

The Docker file is local development-only. Docker must be installed and PostgreSQL's port must be free. If PostgreSQL already runs on 5432, use that instead or change port mapping/connection URL appropriately.

## Release decision
Phase 15 is **open** until a verified live deployment exists. Game completion is not a credential, and the capstone is not automatically produced by playing the game. User acceptance and QA results are required before release to `main`.
