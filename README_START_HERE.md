# CodeBreak v1.2.0-rc.2 — Documentation Package

**Manual edition:** 1.0 · 27 October 2026  
**Source reference:** Git tag `v1.2.0-rc.2`, commit `82d13ba`.

## Contents

1. [`docs/manuals/PLAYER_USER_MANUAL.md`](docs/manuals/PLAYER_USER_MANUAL.md) — story, getting started, controls, learning methods, all chapters, editor, scores, save/export/import, restarting, capstone orientation, accessibility and troubleshooting.
2. [`docs/manuals/DEVELOPER_MAINTAINER_MANUAL.md`](docs/manuals/DEVELOPER_MAINTAINER_MANUAL.md) — architecture diagrams, file layout, data contracts, event flow, curriculum creation, security/isolation, API, PostgreSQL, full test/CI/release workflows, backups, rollback and maintenance.

Both manuals are **Markdown** and include Mermaid diagrams supported by GitHub and many Markdown previews. They are meant to accompany the existing CodeBreak repository, not replace its game source.

### Install manuals into existing Ubuntu project

If you downloaded `CodeBreak_v1.2.0-rc.2_Manuals.zip` into `~/Downloads`:

```bash
cd ~/Documents/codebreak
git status                  # review before modifying
git switch -c docs/user-developer-manuals
unzip -l ~/Downloads/CodeBreak_v1.2.0-rc.2_Manuals.zip
unzip -o ~/Downloads/CodeBreak_v1.2.0-rc.2_Manuals.zip -d .
# Verify the two new manual paths and review changes
git status --short
```

The ZIP writes **new documentation paths only** (`docs/manuals/...` and `README_START_HERE.md`); it does **not** replace `package.json`, source code, `.git`, localStorage or database files.

Once reviewed:

```bash
git add README_START_HERE.md docs/manuals/PLAYER_USER_MANUAL.md docs/manuals/DEVELOPER_MAINTAINER_MANUAL.md
git commit -m "docs: add CodeBreak player and developer manuals"
git push -u origin docs/user-developer-manuals
# After review/CI, merge the documentation branch into main using your usual workflow.
```

**Status note:** The project has a tagged release candidate and locally verified checks, but is **not** a public production launch. The browser game uses simulations for advanced backend topics; the capstone is a separate real Express/PostgreSQL project.

> **Tag note:** The published `v1.2.0-rc.2` tag remains an immutable reference to the tested code snapshot. The manuals commit will come **after** that tag and can be included in a subsequent stable or documentation-bearing release. Do not force-move the existing tag.
