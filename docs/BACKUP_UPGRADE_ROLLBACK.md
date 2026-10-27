# Backup, upgrade, and rollback — Ubuntu

## Critical distinction
This release ZIP is a **code/source upgrade**. The user’s real local Git history, uncommitted work, and browser LocalStorage are **not** inside the ZIP. Back them up on their own Ubuntu machine.

## Backup before installing
1. In CodeBreak's **My progress**, choose **Export save (JSON)**; keep that file safe.
2. Ensure `git status --porcelain` prints nothing (commit or stash changes first).
3. Save the upgrade ZIP under `~/Downloads`.
4. Run from the directory containing `backup_and_install.sh`:

```bash
bash backup_and_install.sh "$HOME/Documents/codebreak" "$HOME/Downloads/CodeBreak_P0-P2_v1.1.0-rc1_Upgrade.zip"
```

The script checks the project, creates a **timestamped full folder copy including .git**, creates a new feature branch, extracts the ZIP, installs dependencies, runs tests, and builds. It won't erase a dirty working tree.

## If the upgrade fails
Note the printed backup path, such as `~/Documents/codebreak-backup-before-v1.1-20261027_101500`.

```bash
cd ~/Documents
mv codebreak codebreak-failed-v1.1
cp -a codebreak-backup-before-v1.1-YYYYMMDD_HHMMSS codebreak
cd codebreak
npm install
npm test
npm run dev
```

**Replace** the example timestamp with the actual backup folder name. The failed version remains separately stored. Do not overwrite or delete a backup while diagnosing problems.

## Browser save rollback
If necessary, use **My progress → Import save (JSON)** with the JSON exported before upgrading. The progress schema intentionally remains v2 for compatibility. Never assume copying the filesystem also copies Firefox LocalStorage.

## Git: commit only after acceptance
```bash
cd ~/Documents/codebreak
git status
npm test
npm run build
git add -A
git commit -m 'feat: P0-P2 gameplay editor learning and hardening'
git push -u origin "$(git branch --show-current)"
```

**Do not merge to `main` until manual acceptance passes.**
