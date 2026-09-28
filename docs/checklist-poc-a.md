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

- [x] Find and confirm `partnerAdmin.setAccountStatus` — which admin screen calls it,
      confirm it actually executes end-to-end (not just referenced), and note the exact
      file/line in the results section below.
  Confirmed `AdminPartnerDetail` calls and awaits the mutation at `app/src/App.tsx:4450`; server authorization and audit logging are implemented in `app/convex/partnerAdmin.ts:13-27`.

## 2. Confirm live SEO state matches intent

- [x] Spot-check `robots.txt` and `sitemap.xml` on the live menetap.com deployment
      against what `src/seo.ts` / `scripts/generate-sitemap.mjs` intend to produce.
- [x] Confirm partner/admin/support/payout/checkout routes are excluded from both, per
      `docs/sitemap.md`.
- [x] Note any mismatch between live and intended output as a finding, not a silent fix
      — flag back to Claude if the mismatch looks like more than a stale deploy.
  Live endpoints were unreachable from this environment (connection refused). Checked-in `app/public/robots.txt` and `sitemap.xml` match the intended private-route exclusions; live parity remains unverified and is flagged for Claude.

## 3. Build real guest auth routes

- [x] Add pathname handling for `/en/login`, `/en/signup`, `/en/reset-password` (and
      `/id/...` equivalents) that opens `AuthPanel` in the corresponding mode
      (`signIn`/`signUp`/`reset`) on page load, instead of only being reachable via
      `setAuthOpen(true)` from in-app buttons.
- [x] Fix the 404 page's `/en/login` link (`not-found-login` class, `App.tsx` ~line
      392) so it now correctly opens the login flow instead of being a dead link.
- [x] Acceptance: visiting `/en/login` directly (fresh page load, not client
      navigation) opens the sign-in panel. Same for signup/reset in their modes.
  Added deep-link mode routing in `app/src/App.tsx:110-114,314` and `app/src/auth.tsx:5-8`; the existing 404 link at `app/src/App.tsx:392` now reaches login handling. Fresh-browser acceptance was not executable here; build/type/test verification passed.

## 4. Fix dead account nav links

- [x] In `AccountFrame` (`App.tsx` ~line 4606), fix the "Payment methods" and
      "Settings" sidebar links (currently `href="#"`) to point to `/en/payment-methods`
      and `/en/settings` — both routes/screens already exist and work when reached
      another way.
  Updated the sidebar anchors at `app/src/App.tsx:2665-2666`.

## 5. Payment model — record the decision, verify it's consistent

- [x] Confirm every place in the code that mentions payment method only offers
      `pay_at_hotel` / `manual_bank_transfer` (per the decision in `docs/POC.md`) —
      no leftover UI copy implying a card/gateway option exists.
- [x] Record in the results section below: confirmed consistent, or list any mismatch
      found.
  Checkout, Convex schema, and booking mutation restrict methods to the two approved values. Mismatch: `PaymentMethods` remains a local card-management mock at `app/src/App.tsx:4600`, implying card support; documented for Claude, with no new payment behavior invented.

## 6. Verification gate — run and record actual numbers

- [x] `npm run typecheck` — from `app/`
- [x] `npm test` — from `app/`, record actual pass/fail counts (previous baseline
      claimed was 6 files / ~87 lines — confirm or correct)
- [x] `npm run build` — from `app/`
  `npm run typecheck` passed; `npm test` passed with 7 test files and 22 tests; `npm run build` passed with an existing Vite chunk-size warning.

## Results (Codex fills in)

1. Confirmed live admin call: `app/src/App.tsx:4450`; server mutation: `app/convex/partnerAdmin.ts:13-27`.
2. Live SEO endpoints were unreachable; checked-in SEO files match intended exclusions, live parity unverified.
3. Added auth deep links and activated the existing 404 login link: `app/src/App.tsx`, `app/src/auth.tsx`.
4. Fixed account links: `app/src/App.tsx:2665-2666`.
5. Booking/backend payment methods are consistent; local card mock remains a mismatch at `app/src/App.tsx:4600`.
6. Verification passed: typecheck; 7 test files/22 tests; build.

## Deliverable: `docs/PROJECT-STATUS.md`

Once all sections above are complete, write `docs/PROJECT-STATUS.md` (new file) as a
factual, zero-hedge snapshot covering: backend state, frontend real/mock inventory
(cross-reference `docs/checklist-poc-b.md` for admin findings once that's also done),
auth, payments, SEO, test baseline, and known gaps. This does not need to wait for
POC-B to fully close, but should be updated again once POC-B closes (Claude's job per
`docs/WORKFLOW.md`).

## Review notes (Claude, 2026-09-28)

Verified independently: `npm run typecheck` clean, `npm test` 8/8 files / 25/25
passing (test/pass counts are higher than Codex's reported 7/22 because POC-C's
Rewards tests landed in the same working tree — no discrepancy, just a snapshot-timing
difference between when each checklist recorded its numbers). Confirmed the
`/en/login`/`/en/signup`/`/en/reset-password` deep links and the account nav fixes by
reading the routing code directly (see POC-B review notes for the auth-route
verification detail — same session).

No Blocker/High findings. Two things worth surfacing, both already honestly
self-flagged by Codex rather than hidden:

**Medium — the `PaymentMethods` mock is now more discoverable, not less.** Item 4
fixed the dead `href="#"` link so the account sidebar now actually navigates to this
screen — which is a fake credit-card save form (`App.tsx` ~line 4530, hardcoded VISA
••••4242, a "Save card" button that only appends to local state) that directly
contradicts the approved no-gateway, pay-at-hotel/manual-transfer-only payment model.
Fixing the link was correct per the checklist item, but it's an example of why POC-B's
"every fake write action becomes real or is removed" rule should extend here too —
this screen should be folded into a near-term cleanup (either gut it to match the real
payment model, or remove the entire screen/nav item since there's nothing for it to
manage under manual-transfer/pay-at-hotel). Not blocking, but shouldn't sit
indefinitely now that it's reachable.

**Low — live SEO parity genuinely couldn't be checked** (environment couldn't reach
menetap.com). Checked-in `robots.txt`/`sitemap.xml` match intent, which is the best
verifiable evidence available here. Recommend a manual spot-check from a machine that
can reach the live site before this milestone is fully closed out, but this doesn't
block moving forward — the discrepancy risk (if any) is a deploy-staleness issue, not a
code defect.

**Verified correct / good decisions:**
- The `partnerAdmin.setAccountStatus` confirmation (`AdminPartnerDetail`,
  `App.tsx:4450`) matches what POC-B's review also confirmed independently.
- Payment-model consistency check was thorough and correctly distinguished "backend/
  booking flow is consistent" from "one UI screen still implies card support" instead
  of glossing over the latter.
- `docs/PROJECT-STATUS.md` was created as required — see its own note below.

**One thing I'm fixing as part of this review, not asking Codex to redo:**
`docs/PROJECT-STATUS.md` was written mid-sequence (before POC-B closed) and still said
"some admin screens remain local mock interfaces" — that's now stale since POC-B
replaced every unbacked screen with an honest "unavailable" state rather than a mock.
I'm updating that file now as part of closing out this review, per `docs/WORKFLOW.md`'s
rule that Claude keeps `PROJECT-STATUS.md` current once milestones close.

**Outcome:** no Blocker/High findings, this closes. The `PaymentMethods` mock is
flagged for near-term follow-up, not a reason to hold this open.

_(Claude fills this in after reviewing completed work — Blocker/High/Medium/Low.)_
