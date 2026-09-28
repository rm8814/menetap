# Checklist: POC-A — Ground truth close-out

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope approved via `docs/POC.md` (POC milestone, part A), 2026-09-28._
_Depends on: `docs/WORKFLOW.md`, `docs/POC.md`_

## Goal

Eliminate every remaining unverified/hedged claim about the current state of the app,
fix two small confirmed dead-link/dead-route gaps, and produce the first real
`docs/PROJECT-STATUS.md`. No new features. No admin console work here (that's
`docs/checklist-poc-b.md`).

## 1. Confirm the one live admin→Convex call

- [ ] Find and confirm `partnerAdmin.setAccountStatus` — which admin screen calls it,
      confirm it actually executes end-to-end (not just referenced), and note the exact
      file/line in the results section below.

## 2. Confirm live SEO state matches intent

- [ ] Spot-check `robots.txt` and `sitemap.xml` on the live menetap.com deployment
      against what `src/seo.ts` / `scripts/generate-sitemap.mjs` intend to produce.
- [ ] Confirm partner/admin/support/payout/checkout routes are excluded from both, per
      `docs/sitemap.md`.
- [ ] Note any mismatch between live and intended output as a finding, not a silent fix
      — flag back to Claude if the mismatch looks like more than a stale deploy.

## 3. Build real guest auth routes

- [ ] Add pathname handling for `/en/login`, `/en/signup`, `/en/reset-password` (and
      `/id/...` equivalents) that opens `AuthPanel` in the corresponding mode
      (`signIn`/`signUp`/`reset`) on page load, instead of only being reachable via
      `setAuthOpen(true)` from in-app buttons.
- [ ] Fix the 404 page's `/en/login` link (`not-found-login` class, `App.tsx` ~line
      392) so it now correctly opens the login flow instead of being a dead link.
- [ ] Acceptance: visiting `/en/login` directly (fresh page load, not client
      navigation) opens the sign-in panel. Same for signup/reset in their modes.

## 4. Fix dead account nav links

- [ ] In `AccountFrame` (`App.tsx` ~line 4606), fix the "Payment methods" and
      "Settings" sidebar links (currently `href="#"`) to point to `/en/payment-methods`
      and `/en/settings` — both routes/screens already exist and work when reached
      another way.

## 5. Payment model — record the decision, verify it's consistent

- [ ] Confirm every place in the code that mentions payment method only offers
      `pay_at_hotel` / `manual_bank_transfer` (per the decision in `docs/POC.md`) —
      no leftover UI copy implying a card/gateway option exists.
- [ ] Record in the results section below: confirmed consistent, or list any mismatch
      found.

## 6. Verification gate — run and record actual numbers

- [ ] `npm run typecheck` — from `app/`
- [ ] `npm test` — from `app/`, record actual pass/fail counts (previous baseline
      claimed was 6 files / ~87 lines — confirm or correct)
- [ ] `npm run build` — from `app/`

## Results (Codex fills in)

_(One line per numbered section above: what was found/changed, file references.)_

## Deliverable: `docs/PROJECT-STATUS.md`

Once all sections above are complete, write `docs/PROJECT-STATUS.md` (new file) as a
factual, zero-hedge snapshot covering: backend state, frontend real/mock inventory
(cross-reference `docs/checklist-poc-b.md` for admin findings once that's also done),
auth, payments, SEO, test baseline, and known gaps. This does not need to wait for
POC-B to fully close, but should be updated again once POC-B closes (Claude's job per
`docs/WORKFLOW.md`).

## Review notes

_(Claude fills this in after reviewing completed work — Blocker/High/Medium/Low.)_
