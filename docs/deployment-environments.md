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
- Development data must not contain real guest personal data.
- Production deploys require a successful typecheck, test run, and production build.
- Convex preview deployments should be used for pull-request validation.

## Remaining account setup

- Confirm Hostinger static hosting, DNS, HTTPS, and deployment method.
- Add `CONVEX_DEPLOY_KEY` to GitHub repository secrets.
- Create the production Convex deployment.
- Configure staging and production frontend environment variables.
