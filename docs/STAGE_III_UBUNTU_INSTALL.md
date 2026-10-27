# CodeBreak v1.2.0-rc.1 — Ubuntu upgrade and acceptance instructions

This upgrade uses the existing **P0–P2 v1.1.0-rc.1** project. It does not replace the main game engine, reset saves, or touch the `.git` folder. It adds release-verification infrastructure, tests and documentation.

## 1. Export and back up the baseline

1. In CodeBreak, export your current progress to a JSON file (My Progress → Export Save).
2. Open a terminal:

```bash
cd ~/Documents/codebreak
git status
# STOP if you have uncommitted edits you want to keep; commit or stash them first.
backup="$HOME/Documents/codebreak-backup-before-v1.2-$(date +%Y%m%d_%H%M%S)"
cp -a "$HOME/Documents/codebreak" "$backup"
printf 'Backup stored: %s\n' "$backup"
git switch -c feature/release-acceptance-v1.2
```

**Note:** The `cp -a` backup includes Git metadata but not Firefox LocalStorage. Keep the exported JSON independently. Do not use `git clean -fd` or `git reset --hard` as an installation shortcut.

## 2. Apply the update

Save the provided ZIP to `~/Downloads`.

```bash
cd ~/Documents/codebreak
unzip -o ~/Downloads/CodeBreak_StageIII_v1.2.0-rc1_Upgrade.zip -d .
npm install
npm run verify:release
```

`npm install` synchronizes `package-lock.json` after the version/scripts change. This is expected and should be committed with the update.

## 3. Verify the real PostgreSQL capstone

**Preferred method: disposable Docker database** (will use localhost port `55432` by default, leaving any existing PostgreSQL on port 5432 untouched):

```bash
cd ~/Documents/codebreak
bash scripts/verify_capstone_integration.sh
```

This launches a **temporary** PostgreSQL 17 container, tests register/login/JWT/CRUD ownership via HTTP, and deletes the temporary container. It does not touch the existing `codebreak_postgres` development volume. The test database is not a substitute for backing up any personal data.

If Docker isn't installed or usable, create a **separate** local database named e.g. `codebreak_test` using PostgreSQL, then:

```bash
npm install --prefix capstone/server
CODEBREAK_TEST_DATABASE_URL='postgresql://TEST_USER:TEST_PASSWORD@127.0.0.1:5432/codebreak_test' \
  npm run test:integration --prefix capstone/server
```

The integration test will refuse to run against a non-local host or a database whose name doesn't include `test`.

### If Docker's test port is occupied

```bash
CODEBREAK_PG_TEST_PORT=55433 bash scripts/verify_capstone_integration.sh
```

## 4. UI testing

```bash
cd ~/Documents/codebreak
npm run dev
```

Open `http://127.0.0.1:5173/` and verify the elevator, editor, lesson stepper, save/import/New Game, and selected floors in Firefox and Chromium. Use `docs/STAGE_III_RELEASE_ACCEPTANCE.md` as the pass/fail checklist.

## 5. Commit and push (after tests)

```bash
cd ~/Documents/codebreak
git status
npm run verify:release
git add -A
git commit -m "test: add CodeBreak release gate and real PostgreSQL API integration"
git push -u origin "$(git branch --show-current)"
```

GitHub Actions includes a second CI job using a disposable PostgreSQL service. It must be green before considering the release ready to merge. It will install capstone dependencies separately; the capstone currently does not include a committed package lock, so the job uses `npm install` rather than `npm ci`.

## 6. Rollback

If you encounter problems, stop the local server and switch back to the previous branch without deleting the backup:

```bash
cd ~/Documents/codebreak
git status
# Do not discard unsaved changes. Record/commit them on the new branch first if needed.
git switch feature/p0-p2-v1.1-20261027_095142
npm install
npm run dev
```

Alternatively rename the current project and copy the **entire** saved backup back to `~/Documents/codebreak`. Restore the exported JSON separately if browser progress changes.

## 7. What is and isn't finished

**Included:** repeatable source/build gate, bundle-size budget, CI PostgreSQL service job, disposable integration-test script, documented release requirements.  
**Requires your verification:** installed dependencies, build on Ubuntu, actual PostgreSQL integration test, accessibility/browser checks, manual game playthrough.  
**Not included:** production cloud deployment, hardened public authentication infrastructure, real-user accounts for the browser game, professional accreditation.
