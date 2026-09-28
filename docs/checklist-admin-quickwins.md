# Checklist: Admin quick wins — disputes, support, moderation

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope approved via `docs/design-admin-backend.md` (Part 1), 2026-09-28._
_Independent of `docs/checklist-admin-payments.md`; that scope was not touched._

## Goal

Wire disputes, support, and moderation to real backend data. Payouts, reports, and risk remain out of scope and unavailable.

## 1. Disputes/refunds

- [x] Wire the disputes screen to the pending-refund query and decision mutation.
  Added `refunds.listPending` and approve/reject actions using the existing mutation name `refunds.review` (the codebase has no `refunds.decide` export). Files: `app/src/App.tsx`.
- [x] Pending rows update after approval/rejection.
  Convex query invalidation removes reviewed rows; loading, empty, and error feedback are included. File: `app/src/App.tsx`.

## 2. Support

- [x] Wire support to `support.listForStaff` and resolve its table scope.
  Confirmed `listForStaff` covers `supportRequests) only. The screen represents guest-submitted `supportRequests); broader `supportTickets) are not mixed in because they require a separate workflow. Files: `app/src/App.tsx`, `app/convex/support.ts`.
- [x] Show real guest contact requests.
  The list is sourced from `support.listForStaff` with no fabricated rows. File: `app/src/App.tsx`.

## 3. Moderation

- [x] Add `properties.listPendingModeration`.
  Added a staff-role-gated query over pending `propertyPhotos). `roomPhotos) has no moderationStatus field, so it is intentionally excluded. File: `app/convex/properties.ts`.
- [x] Wire moderation list and actions.
  Added live pending-photo rows with approve/reject actions using `properties.updatePhotoModeration). File: `app/src/App.tsx`.
- [x] Verify update behavior.
  Query invalidation refreshes the list after moderation; loading, empty, and error states are included. File: `app/src/App.tsx`.

## 4. Cleanup while touching this area

- [x] Replace fabricated data for the three real kinds and document the cleanup approach.
  Split the real three kinds into a new `AdminQuickOpsPage); left the old six-kind `AdminOpsPage) config dead for the still-unavailable POC-B kinds. File: `app/src/App.tsx`.
- [x] Follow the approved design direction.
  Reused existing AdminFrame/card/button classes and tokens; added no new colors, fonts, or button styles. File: `app/src/App.tsx`.

## Verification gate

- [x] `npm run typecheck` — passed.
- [x] `npm test` — 8 test files and 25 tests passed.
- [x] `npm run build` — passed with the existing Vite chunk-size warning.

## Results (Codex fills in)

Disputes use `refunds.listPending`/`refunds.review); support uses `support.listForStaff` and represents `supportRequests) only; moderation uses the new staff-gated `properties.listPendingModeration` plus `updatePhotoModeration). The component was split: `AdminQuickOpsPage` handles the three real kinds while the old dead config remains for out-of-scope unavailable kinds. Files touched: `app/src/App.tsx`, `app/convex/properties.ts), and this checklist. `docs/checklist-admin-payments.md` was not touched.

## Review notes (Claude, 2026-09-28)

Verified independently: `npm run typecheck` clean, `npm test` 9/9 files / 29/29
passing. Confirmed via direct read that `AdminQuickOpsPage` (disputes/moderation/
support) is actually routed in place of `AdminUnavailable` for those three screens,
with the same role restrictions the original mock config had.

No Blocker/High findings. One correction on my part, not a Codex defect: the
checklist told Codex to wire `refunds.decide` — that function doesn't exist, the real
one is `refunds.review`. Codex used the correct real name and explicitly flagged the
discrepancy rather than either guessing or silently going along with a wrong
instruction — exactly the right call.

**Low — Support screen only covers `supportRequests`, not `supportTickets`; correctly
flagged rather than silently merged, but the two-table split (`supportRequests` for
guest contact-form messages, `supportTickets` for the fuller ticket schema with SLA/
priority/assignment) isn't resolved, just documented.** `supportTickets` (priority,
assignment, SLA due dates) has no admin surface at all yet — not this checklist's job
to fix, but worth remembering when `AdminFinance`/reporting eventually needs it.

**Verified correct:**
- Disputes: real `refunds.listPending`/`refunds.review`, rows update after action.
- Moderation: new `properties.listPendingModeration` query correctly staff-gated,
  scoped to `propertyPhotos` only — the decision to exclude `roomPhotos` (no
  `moderationStatus` field on that table) is accurate, not an oversight.
- Cleanup: split into a new `AdminQuickOpsPage` for the three real kinds rather than
  patching the old six-kind mock in place — cleaner than I expected, avoids mixing
  real and still-fake config in one function. The old `AdminOpsPage` remains dead code
  for `payouts`/`reports`/`risk`, consistent with what POC-B already left as flagged
  debt — not new debt from this checklist.

**Outcome: closes.** No Blocker/High. The `supportTickets` split is worth a note for
whoever eventually designs the fuller support/ticketing admin surface, not a reason to
hold this open.

