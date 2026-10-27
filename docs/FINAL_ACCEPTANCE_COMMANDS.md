# CodeBreak — Final local release workflow

> Your baseline branch and current Git history are preserved. This document explains the keyboard hotfix and how to merge only after it passes in Firefox.

1. In Firefox, choose **My Progress → Export save** to back up browser data.
2. Confirm no uncommitted edits: `cd ~/Documents/codebreak && git status`.
3. Run the supplied installer from `~/Downloads` to create a timestamped filesystem backup and apply the patch on a **new feature branch**.
4. Run `npm run verify:release` and `bash scripts/verify_capstone_integration.sh` if desired.
5. Launch `npm run dev` in `~/Documents/codebreak` and follow `docs/KEYBOARD_FIX_AND_FINAL_ACCEPTANCE.md`.
6. Commit/push the new branch. Check the GitHub Actions CI jobs and merge only if green.

### Commit after checks

```bash
cd ~/Documents/codebreak
git status
git add -A
git commit -m "fix: route editor keyboard input without Phaser capture"
git push -u origin "$(git branch --show-current)"
```

### Fast-forward stable `main` after browser and CI acceptance

```bash
cd ~/Documents/codebreak
git status                           # must be clean
git branch --show-current             # note final feature branch
git switch main
git pull --ff-only origin main
git merge --ff-only feature/final-keyboard-v1.2-<your-timestamp>
git push origin main
```

Replace the `feature/final-keyboard...` placeholder with the branch name printed by the installer or `git branch --list`. If `git merge --ff-only` fails, **stop and inspect branch history rather than forcing a merge**.

Optionally create a `v1.2.0` tag only after release acceptance and matching package version:

```bash
# First update package.json version and run npm install, tests, and build;
# commit the version bump before tagging.
git tag -a v1.2.0 -m "CodeBreak v1.2.0 accepted release"
git push origin v1.2.0
```

**Do not tag `v1.2.0` while `package.json` still says `1.2.0-rc.2`.**

### Recovery

The installer prints the exact backup directory path. To restore, stop the Vite server, move the broken project aside and copy the backup directory back. Use `cp -a` rather than deleting data:

```bash
mv "$HOME/Documents/codebreak" "$HOME/Documents/codebreak-rejected-$(date +%Y%m%d_%H%M%S)"
cp -a "<backup-directory-printed-by-installer>" "$HOME/Documents/codebreak"
```

Downloaded JSON progress backups are restored from the game's Import feature, not copied into the project directory.
