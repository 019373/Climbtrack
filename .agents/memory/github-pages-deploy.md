---
name: GitHub Pages deploy
description: Comment déployer ClimbTrack sur GitHub Pages depuis Replit
---

## Config
- Repo: `github.com/019373/Climbtrack`
- Base path: `/Climbtrack/` (casse exacte, pas `/ClimbTrack/`)
- Config build: `artifacts/climbtrack/vite.config.github.ts`
- Script: `pnpm --filter @workspace/climbtrack run build:github`
- CI: `.github/workflows/deploy.yml` (pnpm 10, Node 24, peaceiris/actions-gh-pages@v4)

## Push via PAT
```bash
git push https://x-access-token:${GITHUB_PAT}@github.com/019373/Climbtrack.git main
```
ou
```bash
git push https://019373:${GITHUB_PAT}@github.com/019373/Climbtrack.git main
```

**Why:** Le helper replit-git-askpass retourne "token request timed out" → utiliser le PAT directement dans l'URL.

**Important:** Le GITHUB_PAT peut expirer. Si l'erreur est "Invalid username or token", le PAT doit être régénéré sur GitHub et mis à jour dans les secrets Replit.

## Setting GitHub Pages (côté GitHub)
Settings → Pages → Source: "Deploy from a branch" → `gh-pages` / `root`
