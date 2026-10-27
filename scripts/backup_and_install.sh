#!/usr/bin/env bash
set -euo pipefail
PROJECT="${1:-$HOME/Documents/codebreak}"
ZIP="${2:-$HOME/Downloads/CodeBreak_P0-P2_v1.1.0-rc1_Upgrade.zip}"
if [[ ! -d "$PROJECT/.git" || ! -f "$PROJECT/package.json" ]]; then
  echo 'Refusing: expected existing CodeBreak git repository and package.json.' >&2; exit 1
fi
if [[ ! -f "$ZIP" ]]; then echo "Upgrade archive missing: $ZIP" >&2; exit 1; fi
cd "$PROJECT"
STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="${PROJECT}-backup-before-v1.1-${STAMP}"
N=1
while [[ -e "$BACKUP" ]]; do
  BACKUP="${PROJECT}-backup-before-v1.1-${STAMP}-${N}"
  N=$((N+1))
done
cp -a "$PROJECT" "$BACKUP"
echo "Backup created: $BACKUP"
echo 'Browser progress is stored in localStorage and must be exported from My progress separately.'
if [[ -n "$(git status --porcelain)" ]]; then
 echo 'Upgrade stopped safely: your Git working tree is not clean. Backup still exists.' >&2
 echo 'Run git status, then commit or move any untracked files and rerun.' >&2
 exit 1
fi
git switch -c "feature/p0-p2-v1.1-${STAMP}"
unzip -o "$ZIP" -d "$PROJECT"
npm install
npm test
npm run build
echo "Upgrade checks complete; restore from $BACKUP if needed. Test in browser before committing."
