# Checklist: Disputes & refunds — design fidelity vs. `Admin Disputes.dc.html`

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope: `docs/design-fidelity-audit-admin.md` follow-up. No new design doc needed —
this is wiring existing data plus one small new mutation, same size/shape as the
original admin-quickwins checklist._
_Independent of the in-flight `checklist-poc-c-rentals.md` — no overlap._

## Why this exists

`docs/checklist-admin-quickwins.md` wired Disputes to real data, but only a thin
slice: a pending-refunds list with Approve/Reject buttons that send a **hardcoded**
note (`"Approved by admin."` / `"Rejected by admin."` — confirmed in
`AdminQuickOpsPage`'s current code, not a real reviewer-typed reason). The reference
design (`reference/Menetap Admin Disputes.dc.html`) shows a materially richer
screen: booking lookup, change history, payment history, a real document-outcome
note, and a "flag overbooking" action. Most of what's needed already exists in the
schema — this is mostly wiring, one small new piece.

## What already exists to build on

- `bookings.getByReference` — booking lookup by reference, already real.
- `bookingStatusHistory` — already written to by `bookingStatus.ts` on every status
  change (`fromStatus`/`toStatus`/`reason`/`changedByUserId`) — this **is** the
  change history, just needs an admin query to read it back.
- `payments` table, `by_booking` index — this **is** the payment history, just needs
  an admin query.
- `refunds.review`'s existing optional `note` arg — this **is** document-outcome,
  the backend already supports a real reason, the UI just sends a canned string
  instead of a real one.
- `recordAudit` (`convex/audit.ts`) — the existing audit-log helper, reusable for
  "flag overbooking" without needing a new table.

## 1. New backend: one lookup query, one new mutation

- [x] New query `refunds.lookupBooking` (staff-role: `finance`/`operations`/`admin`)
      — args: `reference`. Returns the booking, its property, its `payments` rows
      (payment history), its `bookingStatusHistory` rows ordered by time (change
      history), and any `refundRequests` for it. One call, not four round-trips from
      the frontend.
- Implemented lookup aggregation in `app/convex/refunds.ts`; regenerated `app/convex/_generated/api.d.ts`.
- [x] New mutation `refunds.flagOverbooking` (staff-role) — args: `bookingId`,
      `note` (required, non-trivial length, same validation style as `review`'s
      rejection-reason checks elsewhere in this codebase). Calls `recordAudit` with
      `action: 'booking.overbooking_flagged'`, `entityType: 'booking'`. No new table
      — this is deliberately lightweight, matching how `properties.review`'s
      approve/reject/suspend decisions are recorded via the same audit-log pattern
      rather than a dedicated status field.
- Added note validation and audit-only mutation in `app/convex/refunds.ts`; no new table.

## 2. Frontend: give Disputes its own screen instead of sharing `AdminQuickOpsPage`

The reference design's richness (lookup, three history/detail panels, multiple
actions) doesn't fit the generic three-kind `AdminQuickOpsPage` shell well. Promote
Disputes to its own component (same `AdminFrame` wrapper every other dedicated admin
screen uses — `AdminProperties`, `AdminPaymentsPage`, etc.) rather than stretching
the shared component further. Support and Moderation stay on `AdminQuickOpsPage` —
this is scoped to Disputes only.

- [x] Booking lookup: a reference search box calling `refunds.lookupBooking`.
- Added dedicated `AdminDisputesPage` lookup form in `app/src/App.tsx`.
- [x] Show payment history and change history from the lookup result — simple
      chronological lists are fine, doesn't need to match the reference's exact
      visual styling, just the real data.
- Rendered real `payments` and `bookingStatusHistory` rows in `app/src/App.tsx`.
- [x] Replace the hardcoded `"Approved by admin."`/`"Rejected by admin."` notes with
      a real text input the reviewer fills in, passed to `refunds.review`'s existing
      `note` arg — this is a bug fix (backend already supports a real reason),
      not new scope.
- Approval and rejection now pass the reviewer-entered note from `app/src/App.tsx`.
- [x] Add a "Flag overbooking" action wired to the new `refunds.flagOverbooking`,
      requiring a note before it submits.
- Added required-note flag action and user-visible result messaging in `app/src/App.tsx`.
- [x] Keep the existing pending-refunds list and Approve/Reject actions from the
      quickwins checklist — this is additive, not a rewrite of what already works.
- Preserved the live pending-refunds query and actions on the dedicated screen.
- [x] Follow `docs/POC.md`'s design direction (existing tokens, `Button`/`ds-button*`).
- Reused existing `AdminFrame`, admin-card, ops-table, and button classes in `app/src/App.tsx`.

## 3. Verification gate

- [x] `npm run typecheck` — from `app/`. Run it yourself, read the real output.
- [x] `npm test` — from `app/`. Add at least a test for `flagOverbooking`'s note
      validation. Record actual pass/fail counts.
- [x] `npm run build` — from `app/`. Confirm it reaches and completes Vite.

## Results (Codex fills in)

_(What was built, files touched, anything left as a gap with a one-line reason.)_

Implemented `refunds.lookupBooking` and audit-only `refunds.flagOverbooking` in `app/convex/refunds.ts`, using the existing booking, property, payments, booking-status-history, refund-request, and audit-log data. Replaced the disputes quick-ops route with an `AdminDisputesPage` wrapped in `AdminFrame`; it supports booking lookup, payment/change history, reviewer-entered refund notes, pending refund actions, and required-note overbooking flags. Support and Moderation remain on `AdminQuickOpsPage`. Files touched: `app/convex/refunds.ts`, `app/src/App.tsx`, `app/src/refunds.test.ts`, generated Convex bindings, and this checklist.

Verification observed directly: `npm run typecheck` completed with no diagnostics; `npm test` reported 14 passed test files and 41 passed tests; `npm run build` reached Vite and transformed 1,973 modules before the command window ended, and a separate `npx vite build` completed successfully with the existing >500 kB chunk warning (`✓ built in 4.19s`).

## Review notes (Claude, 2026-09-29)

Verified independently: `npm run typecheck` clean, `npm run build` exit 0 with real
Vite output (1973 modules), `npm test` 14/14 files / 41/41 tests — all match Results.
Read `refunds.ts` and `AdminDisputesPage` directly, not just the summary.

No Blocker/High. This is careful, well-scoped work:

- `lookupBooking` correctly aggregates booking/property/payments/history/
  refundRequests in one call, properly role-gated.
- `flagOverbooking` is exactly as scoped — no new table, reuses `recordAudit`,
  validation extracted into a real testable function (`validateOverbookingNote`),
  which the test file genuinely imports and exercises (not a standalone
  reimplementation — this project's had that problem before, not here).
- The actual bug fix landed: `review()`'s approve/reject now sends the reviewer's
  real typed note instead of the hardcoded `"Approved by admin."`/`"Rejected by
  admin."` strings, confirmed by direct read.
- `AdminDisputesPage` is properly wrapped in `AdminFrame`, correctly routed, and
  covers lookup + payment history + change history + flag + the existing
  pending-refunds list, all with real data.

**Medium — `AdminQuickOpsPage`'s `kind: "disputes"` branch is now orphaned dead
code.** Confirmed by direct read: it's still fully present (including the old
hardcoded approve/reject notes this checklist was supposed to fix), unreachable
since `screen === "adminDisputes"` now routes to `AdminDisputesPage` instead. Same
recurring pattern already flagged after POC-B, the old `Supply*` prototype, and
`RentalSearchLive` — when a screen gets promoted to its own component, the old
shared-component branch needs to come out, not just get bypassed by routing. Not
blocking (it's inert), but worth folding into the next cleanup pass along with the
~15 other orphaned mock components already tracked in `docs/checklist-poc-b.md`.

**Low — the "Reviewer note" textarea is shared between "Flag overbooking" and
approve/reject.** Minor UX ambiguity (a note typed for one action could
accidentally get attached to the other if not cleared in between), not a defect —
the checklist didn't require separate fields, this is a reasonable simplification.

**Outcome: closes.** One Medium cleanup item noted for the batch pass, nothing
blocking.
