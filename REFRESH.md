# Daily refresh

What the scheduled task runs once a day to regenerate the data, check it, and publish it only when something changed. It reads Treza's model catalog from a fresh fetch of `origin/main` in the treza-xyz checkout and never touches that checkout's working tree or branches.

## One-time setup

- treza-xyz is checked out next to this repo (`../treza-xyz`), or `TREZA_XYZ_DIR` points at it, with its dependencies installed (`node_modules` present). The generator borrows them; it does not install anything there.
- This repo has `origin` pointing at `git@github.com:treza-labs/ai-video-models.git` and can push to `main`.
- Node 20 or later.

## The run

Run it as one script from the root of this repo. Every step stops the run on failure (`set -euo pipefail`), and a failed run puts the generated files back so the next run starts clean.

```bash
#!/usr/bin/env bash
set -euo pipefail

export TREZA_XYZ_DIR="${TREZA_XYZ_DIR:-$PWD/../treza-xyz}"
export TREZA_XYZ_REF=origin/main

# 1. A fresh catalog: fetch treza-xyz main. Only the remote-tracking ref moves.
git -C "$TREZA_XYZ_DIR" fetch -q origin main

# 2. This repo matches GitHub and has no local edits.
git fetch -q origin main
git checkout -q main
git merge -q --ff-only origin/main
if [ -n "$(git status --porcelain)" ]; then
  echo "ai-video-models has uncommitted changes; not refreshing" >&2
  exit 1
fi
[ -d node_modules ] || npm ci --silent

# From here on, a failure restores the generated files.
trap 'git checkout -q -- data README.md' ERR

# 3. Regenerate from origin/main, then check the result.
npm run -s generate
npm test
npm run -s generate -- --check --check-links   # every Treza page link answers 200

# 4. Publish only if something changed.
if [ -z "$(git status --porcelain -- data README.md)" ]; then
  echo "No changes."
  exit 0
fi
git --no-pager diff --stat -- data README.md
npm run -s changes                             # what changed, for the report
{
  npm run -s changes
  printf '\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n'
} > "$(git rev-parse --git-dir)/REFRESH_MSG"
git add -- data README.md
git commit -q -F "$(git rev-parse --git-dir)/REFRESH_MSG"
git push -q origin main
git log -1 --format='Pushed %h: %s'
```

## What the task reports

- "No changes." when nothing moved. That is the usual day.
- Otherwise the `npm run -s changes` lines (models added or removed, a headline price moving, which spec fields changed) and the pushed commit.
- Lines starting `left out` on stderr list catalog entries the generator skipped and why. They name Treza's internal model ids, so they belong in the private report only, never in an issue, a commit message or a post.
- A failure, with its step. The usual ones:
  - `--check-links` fails: a model has a Treza page on main that is not live yet. Nothing was pushed; the next run picks it up once the site deploys.
  - The generator cannot import a module: treza-xyz main needs a package its local `node_modules` lacks. Install treza-xyz's dependencies by hand, then rerun.
  - `npm test` fails: the catalog produced something the schema or the checks reject. Nothing was pushed; look at the failing check before changing the schema.

## Checking a run by hand

```bash
git -C "${TREZA_XYZ_DIR:-../treza-xyz}" fetch -q origin main
npm run -s generate -- --check   # exits 1 if the files would change, writes nothing
```
