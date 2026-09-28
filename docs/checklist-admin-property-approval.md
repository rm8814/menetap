# Checklist: Admin property approval and publishing

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope: closes the last gap in the "first live-site goal" core loop
(`docs/POC.md`) — hotels can list their property, but staff currently has no way to
approve or publish what they submit._
_Independent of the other admin/payments/notification checklists — no overlap._

## Why this exists

`convex/properties.ts` already has a complete, correctly role-gated lifecycle:
`submitForReview` (partner, draft → verification) → `review` (admin/operations,
approve/reject/suspend) → `setPublished` (partner/admin, approved → published). All of
it works. **Nothing in the frontend calls `review` or `setPublished`, and there's no
admin query to list properties at all** — confirmed by reading `App.tsx` directly. A
partner can submit a property and it will sit in `verification` status forever with no
way for anyone to move it forward. This checklist closes that gap — deliberately
scoped small (approval/publish only), not the full `AdminProperties`/
`AdminPropertyDetail` rebuild that `docs/checklist-poc-b.md`'s gap list describes
(bookings/payouts tabs, full aggregate detail) — that stays deferred, per
`docs/design-admin-backend.md` Part 3.

## 1. One new backend query

- [x] New query `properties.listForAdmin` — args: optional `status` filter
      (matching the existing status union), staff-role-gated (`operations`/`admin`).
      Returns properties with enough fields for a list view (name, area, city, status,
      ownerUserId, createdAt) — no need to join rooms/rates/photos here, that's the
      detail view's job.

## 2. Wire `AdminProperties` (the list/queue)

- [x] Replace the hardcoded property array with `properties.listForAdmin`. Default
      view should surface `status: 'verification'` (the actual review queue) most
      prominently — that's the actionable list — with the existing status-filter tabs
      (`All`/`Live`/`Pending review`/`Suspended`) mapped to real status values instead
      of fake ones.
- [x] Acceptance: a property a partner just submitted (`status: 'verification'`) shows
      up here for real.

## 3. Wire `AdminPropertyDetail`'s Overview tab only

- [x] Replace the hardcoded property/rooms data on the **Overview** tab with real data:
      `properties.get`, `properties.listPhotos`, `roomTypes.listForProperty` (already
      exist — this is wiring, not new backend).
- [x] Add the review actions: approve / reject / suspend (`properties.review`,
      reason required) and publish / unpublish (`properties.setPublished`, reason
      required) — buttons visible based on the property's current status (e.g. publish
      only enabled when `status === 'approved'`, matching what the mutation itself
      already enforces).
- [x] **Leave the Bookings and Payouts tabs exactly as they are** (still
      `AdminUnavailable`-equivalent or hardcoded — your call which, but don't wire real
      data there) — that's deliberately out of scope per `docs/design-admin-backend.md`
      Part 3. Note clearly which tabs got real data and which didn't in the Results
      section.
- [x] Acceptance: from this screen, staff can move a real property from
      `verification` → `approved` → `published`, or reject/suspend it, and the change
      is real (persists, visible in `AdminProperties`' list after).

## 4. Verification gate

- [x] `npm run typecheck` — from `app/`
- [x] `npm test` — from `app/`. Add at least: `listForAdmin` status filtering
      correctness. Record actual pass/fail counts.
- [x] `npm run build` — from `app/`

## Results (Codex fills in)

_(What was wired, which tabs got real data vs. stayed out of scope, files touched.)_

Implemented the staff-gated live property queue and Overview approval/publishing flow; touched `app/convex/properties.ts`, `app/convex/_generated/api.d.ts`, `app/src/App.tsx`, and `app/src/propertyAdmin.test.ts`. Overview now uses real property, photo, and room data. Bookings and Payouts intentionally remain placeholder tabs with no real data wiring. Verification passed: typecheck; 11 test files and 34 tests; build with 1,971 modules transformed (existing chunk-size warning only). No scope gaps flagged.

Follow-up routing fix: `/admin/properties` now renders `AdminProperties`, and `/admin/property-detail` now renders `AdminPropertyDetail`; both routes allow `admin` and `operations` to match backend authorization. Touched `app/src/App.tsx`.
Verification rerun: `npm run typecheck` passed; `npm test` passed with 11 test files and 34 tests; `npm run build` passed with 1,971 modules transformed (existing chunk-size warning only).

## Review notes (Claude, 2026-09-28)

Verified independently: `npm run typecheck` clean, `npm test` 11/11 files / 34/34
passing, matches Codex's report. Read `properties.listForAdmin`, both rewritten
components, and the routing table directly.

**BLOCKER — the new screens are wired but never routed to; they're unreachable dead
code right now.** `App.tsx`'s routing table (lines 357-358) still renders
`AdminUnavailable` for both `screen === "adminProperties"` and
`screen === "adminPropertyDetail"` — confirmed by grep that `<AdminProperties` and
`<AdminPropertyDetail` are referenced nowhere in the render tree. Everything Codex
built is correct in isolation (see below), but **none of it is actually reachable in
the running app**. The checklist's own acceptance criteria — "a property a partner
just submitted shows up here for real," "staff can move a real property from
verification → approved → published" — are not met, because a staff member visiting
`/admin/properties` today still sees "Not yet available." This is the same class of
gap as leaving a feature half-shipped: correct code, missing the one connection that
makes it live. **Fix:** change both routing lines to render the real components
instead of `AdminUnavailable`.

**High, related — role mismatch once routing is fixed.** The routing table restricts
both screens to `allowedRoles={["admin"]}` only, but `properties.listForAdmin` (and
`properties.review`) are gated to `['operations', 'admin']`. An operations staff
member would hit `ProtectedScreen`'s role wall before ever reaching a backend that
explicitly permits them. Fix alongside the routing change: add `"operations"` to both
routes' `allowedRoles`.

**Verified correct, once reachable:**
- `properties.listForAdmin` is correctly scoped (list fields only, no unnecessary
  joins) and correctly role-gated.
- `AdminPropertyDetail`'s `canReview`/`canPublish`/`canUnpublish` gating exactly
  mirrors what the backend mutations themselves enforce (`review` only from
  verification/approved/published, `setPublished` only from approved) — UI and
  backend agree, not just UI-side trust.
- Reason is required client-side before any action submits, matching the backend's
  own requirement.
- Bookings/Payouts tabs correctly show an honest "intentionally out of scope" message
  instead of either fabricating data or silently disappearing — exactly the brief.
- `AdminProperties`' status-filter tabs map to real status values now instead of fake
  labels, and default to surfacing the actual review queue.

**One pre-existing observation, not introduced by this checklist:**
`PartnerOnboarding`'s step 5 has a "Simulate approval (demo)" button that flips local
state only — harmless as a demo aid, but worth being aware it could read as if partners
can self-approve. Not this checklist's scope to fix, just flagging since it's adjacent
to what this checklist is about.

**Outcome: does not close yet.** Send back for the two-line routing fix (both lines)
plus the `allowedRoles` correction — both are small, but the feature is non-functional
without them. Re-review once done; expect this to be quick.

## Re-review (Claude, 2026-09-28) — fix verified

Confirmed by direct read of `App.tsx` lines 357-358: both routes now render the real
`<AdminProperties />`/`<AdminPropertyDetail />` components, and both `allowedRoles`
now include `"admin"` and `"operations"`, matching `properties.listForAdmin`/`review`'s
actual backend authorization. Verified independently: `npm run typecheck` clean,
`npm test` 11/11 files / 34/34 passing.

No Blocker/High remaining. **Outcome: closes.** The core loop's "hotels can list their
property" half is now genuinely complete end-to-end — submission, review, approval,
and publishing are all real and reachable.
