#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
printf '\n--- CodeBreak v1.2 local release gate ---\n'
printf '\n1. Syntax checks\n'
for file in src/main.js src/game/GameScene.js src/game/keyboardFocus.js src/ui/app.js src/runtime/sandbox.js \
  scripts/check_bundle_budget.mjs capstone/server/scripts/integration.mjs; do
  node --check "$file"
done
printf '\n2. Main game tests\n'
npm test
printf '\n3. Production build\n'
npm run build
printf '\n4. Bundle-size budget\n'
node scripts/check_bundle_budget.mjs
printf '\n5. Capstone local unit tests (optional when dependencies installed)\n'
if [[ -d capstone/server/node_modules ]]; then
  npm test --prefix capstone/server
else
  echo 'SKIP: capstone/server/node_modules absent. Run npm install --prefix capstone/server.'
fi
printf '\n6. Real PostgreSQL integration (opt in with CODEBREAK_TEST_DATABASE_URL)\n'
if [[ -n "${CODEBREAK_TEST_DATABASE_URL:-}" ]]; then
  npm run test:integration --prefix capstone/server
else
  echo 'PENDING: run bash scripts/verify_capstone_integration.sh with Docker, or provide a local disposable test DB URL.'
fi
printf '\nLocal source/build checks finished. Browser and real database checks remain independent release gates.\n'
