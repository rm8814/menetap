# Menetap Deployment Environments

## Environments

| Environment | Frontend | Convex | Purpose |
|---|---|---|---|
| Local | Vite dev server | Local or cloud development deployment | Feature development |
| Preview | GitHub/Hostinger preview target | Convex preview deployment | Pull-request review |
| Staging | Hostinger staging site | Convex staging/production-type deployment | Release validation |
| Production | `menetap.com` | Convex production deployment | Live guest and partner traffic |

## Environment variables

### Frontend

- `VITE_CONVEX_URL` — Convex client URL.
- `VITE_CONVEX_SITE_URL` — Convex HTTP actions/site URL when needed.

### CI/CD

- `CONVEX_DEPLOY_KEY` — GitHub Actions secret for Convex deployment. Never commit it.

## Rules

- `.env.local` is local-only and is ignored by Git.
- `.env.example` documents variable names without secrets.
- Development and staging data must not contain real guest personal data.
- Production deploys require a successful typecheck, test run, and production build.
- Convex preview deployments should be used for pull-request validation.

## Deployment workflow

1. Develop locally against the Convex development deployment.
2. Run `npm run typecheck`, `npm test`, and `npm run build` from `app/`.
3. Push the reviewed change to `main` on GitHub.
4. Hostinger pulls `main`, runs `npm ci` and `npm run build`, and publishes `dist/`.
5. Convex backend changes are deployed by GitHub Actions after `CONVEX_DEPLOY_KEY` is configured.
6. Confirm the deployed frontend points to the intended Convex environment before accepting traffic.

The current Hostinger deployment uses the `app` root directory, Node 22, React preset, `npm ci`, `npm run build`, and `dist` output.

## Staging configuration

Repository configuration:

- Branch: `staging`
- GitHub workflow: `.github/workflows/staging-check.yml`
- GitHub Actions variable: `STAGING_VITE_CONVEX_URL`
- Frontend build variable: `VITE_CONVEX_URL`

Hostinger configuration:

- Create a staging subdomain such as `staging.menetap.com`.
- Create a separate Hostinger application connected to this repository and the `staging` branch.
- Use the same React, Node 22, `app`, `npm ci`, `npm run build`, and `dist` settings as production.
- Set `VITE_CONVEX_URL` to the staging Convex deployment URL.
- Enable HTTPS and password/access protection before sharing the URL externally.

Staging is only complete after the Hostinger subdomain serves the `staging` branch and a booking test succeeds against the staging Convex deployment.

## Data migration and rollback

Convex schema changes are deployed through the Convex CLI/GitHub workflow. Before a production schema change:

- confirm the change is backward-compatible with the currently deployed frontend;
- deploy additive fields and indexes before code that reads them;
- avoid destructive field removal until all readers and historical data are migrated;
- record the commit SHA and deployment time in the release notes;
- test the affected query or mutation against the target deployment.

If a release fails, roll back the frontend to the last known-good Git commit in Hostinger and revert the application code. Keep additive Convex fields in place unless a separate, verified cleanup is required. For data corrections, use an explicit, reviewed Convex migration or admin mutation; never edit production data manually through an untracked script.

## Remaining account setup

- Add `CONVEX_DEPLOY_KEY` to GitHub repository secrets.
- Create the production Convex deployment.
- Configure staging and production frontend environment variables.
