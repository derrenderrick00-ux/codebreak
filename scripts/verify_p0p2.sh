#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo '--- CodeBreak P0-P2 static syntax checks ---'
while IFS= read -r -d '' file; do
  node --check "$file" >/dev/null
 done < <(find src tests -name '*.js' -print0)
node --check capstone/server/src/app.js
node --check capstone/server/src/limits.js
 echo '--- Main game regression tests ---'
npm test
 echo '--- Standalone capstone rate limiter tests ---'
node --test capstone/server/tests/limits.test.js
 echo '--- Production bundle ---'
npm run build
 echo '--- Built locally. Continue with browser and real database acceptance tests. ---'
