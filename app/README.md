# Menetap Application

The production Menetap MVP lives in this directory.

## Stack

- React, TypeScript, and Vite
- Convex for the backend, database, and booking mutations
- CSS design tokens and responsive styles aligned to the Menetap design system
- GitHub and GitHub Actions for source control and checks
- Hostinger shared hosting for the static production frontend

The `.dc.html` files in the repository root are visual references. The React application under `app/` is the implementation target.

## Local development

From this directory:

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and provide the Convex development URL:

```text
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

The Convex CLI can be used to link or deploy the development functions:

```bash
npx convex dev
```

## Verification commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Hostinger deployment

The GitHub-connected Hostinger deployment uses:

- Framework preset: React
- Branch: `main`
- Root directory: `app`
- Node.js: 22
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`

Required public build variable:

```text
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

Only public `VITE_*` values belong in the frontend build. Never place Convex deploy keys, passwords, or private credentials in this file or in client-side environment variables.
