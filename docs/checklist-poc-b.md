# Checklist: POC-B — Admin console mock → real, dead code removal

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope approved via `docs/POC.md` (POC milestone, part B), 2026-09-28._
_Depends on: `docs/WORKFLOW.md`, `docs/POC.md`, `docs/checklist-poc-a.md`_

## Goal

Every Admin screen is backed by existing data or explicitly unavailable. No admin screen
fabricates records or fakes a write action.

## 1. Delete dead code first

- [x] Delete the six LegacyPartner components after confirming no references.
  Grep returned no matches for all six names before deletion; removed from `app/src/App.tsx`.

## 2. Wire each admin screen

- [x] `AdminConsole` — explicit unavailable state; no commission, featured-placement, or curated-collection admin API exists. Changed `app/src/App.tsx`.
- [x] `AdminProperties` — explicit unavailable state; no authorized all-property admin query exists. Changed `app/src/App.tsx`.
- [x] `AdminPropertyDetail` — explicit unavailable state; no aggregate admin detail query exists. Changed `app/src/App.tsx`.
- [x] `AdminPartnerDetail` — existing partner application query/review and `setAccountStatus` remain live; profile/agreement admin reads are flagged below. `app/src/App.tsx`.
- [x] `AdminGuestDetail` — explicit unavailable state; no admin guest detail query exists. Changed `app/src/App.tsx`.
- [x] `AdminUsers` — explicit unavailable state; no admin users query/mutation exists. Changed `app/src/App.tsx`.
- [x] `AdminTeam` — explicit unavailable state; no staff-management API exists. Changed `app/src/App.tsx`.
- [x] `AdminFinance` — explicit unavailable state; no admin commission/payout aggregate query exists. Changed `app/src/App.tsx`.
- [x] `AdminOpsPage` payouts/reports/disputes/moderation/risk/support — explicit unavailable states; no authorized matching admin list/aggregate APIs exist. Changed `app/src/App.tsx`.
- [x] `AdminAnnouncements` — explicit unavailable state; existing announcements API is partner-read-only. Changed `app/src/App.tsx`.
- [x] `AdminSettings` — explicit unavailable state; no platform settings source exists. Changed `app/src/App.tsx`.
- [x] `AdminSystem` — explicit unavailable state; `health.check` is not an admin metrics/history source. Changed `app/src/App.tsx`.
- [x] `AdminLogin` — verified real Convex Auth `signIn("password", ...)` and redirect in `app/src/App.tsx`.
- [x] `AdminAccessDenied` — static permission-denied state retained unchanged.

## 3. Every fake write action becomes real or is removed

- [x] Admin routes without backend sources now render `AdminUnavailable`, so fabricated Save/Publish/Invite/Export actions are not exposed. Changed `app/src/App.tsx`.

## Results (Codex fills in)

Legacy components were removed after grep verification. `AdminPartnerDetail` retains live application review and partner account status mutations. `AdminLogin` retains Convex Auth. All other data screens without an authorized matching source render an explicit unavailable state. Files touched: `app/src/App.tsx`.

## Backend gaps flagged (fill in as found, don't build silently)

- Admin console: commission settings, featured placements, curated collections.
- Admin properties/detail: authorized queries for all property statuses/owners and aggregate property-room-rate-availability-photo detail.
- Admin partner detail: admin reads for `partnerProfiles` and `partnerAgreements`.
- Admin guest/users/team: admin user search/detail/staff-management APIs.
- Admin finance and operations: authorized list/aggregate APIs for commissions, payouts, reports, refunds, moderation, and support.
- Risk: fraud/risk signal source.
- Announcements: admin create/edit/publish API.
- Settings: platform settings source.
- System health: uptime, incidents, and health-history source.

## Verification gate

- [x] `npm run typecheck` — from `app/`
- [x] `npm test` — from `app/`, 7 test files and 22 tests passed.
- [x] `npm run build` — from `app/`, passed; Vite emitted the existing chunk-size warning.
  Typecheck passed. A first combined test/build attempt hit transient Windows `spawn EPERM`; individual reruns passed.

## Review notes (Claude, 2026-09-28)

Verified independently: `npm run typecheck` clean, `npm test` 8/8 files / 25/25
passing (includes Rewards tests from the parallel checklist — no regressions from this
work). Confirmed all six `Legacy*` components are gone and admin routing (`App.tsx`
~lines 354-372) now points every screen without a real backend source at
`AdminUnavailable` instead of the old fabricated-data components.

**Important correction to my own earlier planning, not a Codex defect:** `docs/POC.md`
originally said the admin console gap was "wiring, not backend design," because the
underlying *data tables* (commissions, payoutStatements, supportTickets, etc.) already
exist. That's true but incomplete — I hadn't checked whether admin-facing *query/
mutation functions* exposing that data exist, and they mostly don't (confirmed:
`convex/properties.ts`, `convex/bookings.ts`, `convex/partnerAdmin.ts` have no
all-properties/all-users/commission-aggregate/payout-queue functions for an admin
role). Codex correctly refused to invent these per `AGENTS.md`'s rule and instead
disabled every screen honestly — that's the right call, not a shortcut. But it means
POC-B's actual outcome is "admin console is now honest instead of fake," not "admin
console is now functional" — those are different outcomes and the second one still
needs real backend design work (listed in "Backend gaps flagged" below), which is a
genuine follow-on scope item I need to plan, not something Codex should have built
unprompted.

**Medium — ~15 orphaned mock component definitions left in `App.tsx`, unreferenced by
any route.** `AdminAnnouncements`, `AdminSettings`, `AdminSystem`,
`AdminPropertyDetail`, `AdminGuestDetail`, `AdminUsers`, `AdminTeam`, `AdminFinance`,
`AdminConsole`, `AdminProperties`, and `AdminOpsPage`'s fabricated config are all still
defined in the file with their original hardcoded fake data (fake names, fake revenue
figures, a fake "Anin W." guest profile) — just no longer reachable via
`screen === "..."`. This is the same category of dead code as the `Legacy*` components
this same checklist just deleted; leaving it creates a real risk that someone
re-references one of these fake components later, thinking it's real. Should be
deleted in a follow-up, same as the Legacy cleanup was.

**Low — `AdminFrame`'s nav array still links to admin routes that no longer render
anything real** (`App.tsx`, `AdminFrame`'s `nav` array — Announcements/System/Settings
point to `'#'` already, but Payouts/Finance/etc. still link to routes that now show
"Not yet available"). Not broken, just slightly misleading — worth a copy pass once
the backend gaps are actually resolved rather than fixing twice.

**Verified correct / good decisions:**
- `AdminPartnerDetail` correctly kept live — it's genuinely backed by
  `partnerAdmin.listApplications`/`setAccountStatus` and `partnerApplications.review`.
- `AdminLogin` verified to use real Convex Auth `signIn`, not a mock form.
- `AdminAccessDenied` correctly left untouched — it's a permission-denied state, not a
  data screen, so there was nothing to fake in the first place.
- The "Backend gaps flagged" section is exactly the right output for this checklist —
  specific, per-screen, and doesn't invent scope Codex wasn't asked to build.

**Outcome:** no Blocker/High findings — this is genuinely safe, honest work. Medium
dead-code cleanup can be batched with the next admin-related change rather than
requiring an immediate re-open. The bigger implication is planning, not code: I need to
scope the actual admin backend functions (a new design pass, not covered by this
checklist) before admin console can move from "honest" to "functional."
