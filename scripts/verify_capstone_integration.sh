#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
if ! command -v docker >/dev/null 2>&1; then echo 'Docker is required for this isolated local integration test.' >&2; exit 2; fi
if ! docker compose version >/dev/null 2>&1; then echo 'Docker Compose v2 is required.' >&2; exit 2; fi
PORT="${CODEBREAK_PG_TEST_PORT:-55432}"
if ! [[ "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1024 || PORT > 65535 )); then echo 'Invalid CODEBREAK_PG_TEST_PORT' >&2; exit 2; fi
PROJECT="codebreak-verify-$$"
cleanup(){ docker compose -p "$PROJECT" -f capstone/compose.test.yml down --volumes --remove-orphans >/dev/null 2>&1 || :; }
trap cleanup EXIT
printf '\n--- Starting disposable PostgreSQL (project %s, port %s) ---\n' "$PROJECT" "$PORT"
docker compose -p "$PROJECT" -f capstone/compose.test.yml up -d --wait
printf '\n--- Installing capstone dependencies ---\n'
npm install --prefix capstone/server --no-audit --no-fund
printf '\n--- Capstone unit tests ---\n'
npm test --prefix capstone/server
printf '\n--- Live API/database integration test ---\n'
export CODEBREAK_TEST_DATABASE_URL="postgresql://codebreak_test:local_test_only@127.0.0.1:${PORT}/codebreak_test"
npm run test:integration --prefix capstone/server
printf '\n--- All capstone checks passed; temporary database will be deleted ---\n'
