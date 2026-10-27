# Tower Control System — real full-stack capstone

This is **separate from the simulated Floor 51–100 challenges**. It is a real Node.js + Express.js + PostgreSQL application demonstrating SQL queries, password hashing (scrypt), signed/expiring JWTs (jose), owner-scoped API access, and a real browser frontend.

## Prerequisites
- Node.js 22+, npm, PostgreSQL 16+ (or Docker with PostgreSQL).
- NEVER commit `.env`. Never use sample passwords/secrets in production.

## Development quick start (Ubuntu)

```bash
cd capstone/server
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET to correct local values.
# Example secret: openssl rand -hex 32
npm install
npm run migrate
npm test
npm run dev
```

With Docker installed, run `docker compose -f capstone/compose.dev.yml up -d` from the CodeBreak project root to create the local PostgreSQL database using the development credentials in `.env.example`. Otherwise create a PostgreSQL user/database manually. Run the migration only after the database is available. Open `http://127.0.0.1:4500` and register, log in, add a core, delete it, log out. API calls use `Authorization: Bearer <token>` headers. Tokens stay in JS memory and expire after 30 minutes; logging out forgets the local token. No authentication service is deployed automatically.

### API endpoints
- `GET /api/health`
- `POST /api/register` email, displayName, password (at least 12 chars)
- `POST /api/login` email, password → signed JWT
- `GET /api/me` authorized
- `GET /api/cores` authorized, scoped to authenticated owner
- `POST /api/cores` authorized, `{name, online}`
- `PATCH /api/cores/:id` owner only, `{name, online}`
- `DELETE /api/cores/:id` owner only

### Security limitations / production blockers
Demo code. **Do not expose directly on the Internet**. Required first: TLS with a hardened reverse proxy; durable distributed rate limiting; robust input validation, monitoring, audit logs and backup/recovery; token revocation/refresh design; database least-privilege account; CSRF analysis if switching to cookies; environment secret management, dependency audits, integration tests with a disposable real PostgreSQL database. `server.js` binds to `127.0.0.1` intentionally.

Use the included `docs/PHASE_15_DEPLOYMENT.md` for the production checklist and the QA report for known limitations.

## Release acceptance: isolated database integration (v1.2.0-rc.1)

From the project root:

```bash
bash scripts/verify_capstone_integration.sh
```

The script starts an **ephemeral** PostgreSQL instance on `127.0.0.1:55432` (overridable with `CODEBREAK_PG_TEST_PORT`), runs the capstone's own unit tests, creates a temporary random SQL schema, exercises the real API with two users, and removes both the schema and container when finished. It does not use or modify your main development database/volume.

Alternatively, after installing capstone dependencies, supply `CODEBREAK_TEST_DATABASE_URL` pointing to a dedicated localhost PostgreSQL database with `test` in its name, then run `npm run test:integration` in `capstone/server`.

A green local integration run does **not** constitute public-deployment approval. See `docs/STAGE_III_RELEASE_ACCEPTANCE.md` for the remaining security gates.
