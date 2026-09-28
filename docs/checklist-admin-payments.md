# Checklist: Payment collection, commission, and payout pipeline

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope approved via `docs/design-admin-backend.md` (Part 2), 2026-09-28._
_Independent of `docs/checklist-admin-quickwins.md`; that scope was not touched._

## Goal

Guests can submit manual transfer proof, finance can verify it, verified payments
create commissions, and finance can generate partner payout statements.

## 1. Schema

- [x] Added `platformConfig), property commission override, and transfer-rejected notification type.
  Updated `app/convex/schema.ts`.
- [x] Seeded one platform config row.
  `app/convex/seed.ts` uses the explicit placeholder `PENDING — REAL BANK DETAILS NEEDED` for bank name, account name, and account number, with the approved default commission rate of 10%; real bank details are not available in this environment and must be supplied before live use.

## 2. Guest-side transfer proof

- [x] Added `payments.submitManualTransfer` with existing reference-plus-email guest authorization pattern.
  Added `app/convex/payments.ts); account-owned bookings use auth identity and guest-checkout bookings match booking email.
- [x] Added `payments.getInstructions` and guest confirmation submission UI.
  Added platform instructions query and transfer-reference/amount/date form to `Confirmation) in `app/src/App.tsx`.
- [x] Added submitted/pending-verification state.
  Submission patches booking payment status and creates a `manualBankTransfers` row with status `submitted).

## 3. Finance verification

- [x] Added pending-transfer query and verify/reject mutation.
  `payments.listPendingTransfers` and `payments.verifyTransfer` are staff-role-gated in `app/convex/payments.ts).
- [x] Added dedicated payments admin screen.
  Added `/admin/payments) routing and `AdminPaymentsPage) with real approve/reject actions in `app/src/App.tsx`.
- [x] Implemented state transitions.
  Approval marks transfer, booking, and payment paid and triggers commission calculation; rejection marks transfer rejected, leaves booking unpaid, and queues the rejection notification.

## 4. Commission calculation

- [x] Added guarded internal commission calculation.
  Added `app/convex/commissions.ts); existing `by_booking` commission rows prevent double calculation, property override wins over the 10% platform default.
- [x] Hooked both payment paths.
  Manual transfer approval schedules calculation; pay-at-hotel completion schedules calculation from `app/convex/support.ts).
- [x] Added finance visibility queries.
  Added `commissions.listForProperty` and `commissions.listAll`.

## 5. Rejection notification

- [x] Queued `transfer_rejected) through the existing `bookingNotifications) table pattern.
  `app/convex/payments.ts` stores the rejection reason in the queued notification record; no second email pipeline was created.
- [x] Recorded sender-path gap.
  The repository has no general booking-notification Resend sender; only the password-reset Resend provider exists. The notification is correctly queued, but actual delivery requires the existing sender path to be extended before live Alpha.

## 6. Payout statement generation

- [x] Added manual staff-triggered `payoutStatements.generate`.
  Added `app/convex/payoutStatements.ts); it sums calculated commissions for the property/period, creates a draft, and marks those commissions settled.
- [x] Confirmed compatibility with existing payout read/review functions.
  Generated rows use the existing `payoutStatements) schema consumed by `partnerOperations.payoutStatements) and `reviewPayout).
- [x] Returned partner payout details for remittance.
  Generation returns `payoutBankName`, `payoutAccountName`, and `payoutAccountLast4` from the partner profile; remittance remains manual as approved.
- [x] Chose manual generation for Alpha.
  No monthly cron was added; generation is an explicit finance/admin mutation.

## Verification gate

- [x] `npm run typecheck` — passed.
- [x] `npm test` — 9 test files, 29 tests passed, including default/override commission math, double-calculation guard, and transfer approve/reject transitions.
- [x] `npm run build` — passed with the existing Vite chunk-size warning.

## Results (Codex fills in)

Built the critical-path payment, commission, and payout backend/UI in
`app/convex/schema.ts`, `seed.ts`, `payments.ts`, `commissions.ts`,
`payoutStatements.ts`, `support.ts`, `properties.ts), and `app/src/App.tsx),
plus `app/src/financeMath.ts) and its tests. Bank details are intentionally
placeholder-only and must be replaced with real Menetap account information before
live use. Transfer rejection is queued through `bookingNotifications); the
repository lacks a general Resend booking-notification sender, so actual email
delivery remains a flagged integration gap. `docs/checklist-admin-quickwins.md`
was not touched.

## Review notes (Claude, 2026-09-28)

Verified independently: `npm run typecheck` clean, `npm test` 9/9 files / 29/29
passing, matches Codex's report. Read every new file (`payments.ts`, `commissions.ts`,
`payoutStatements.ts`, the `schema.ts`/`support.ts` diffs, the guest/admin UI wiring)
directly, not just the summary.

No Blocker findings — this is careful, well-scoped work, including two things Codex
flagged honestly rather than building around or hiding:
- The placeholder bank details (`'PENDING — REAL BANK DETAILS NEEDED'`) are exactly
  what was asked for — obvious, not fake-looking-real. **This means the guest transfer
  flow is not usable in production until real bank account details are provided** —
  not a code defect, a real business input still needed before Alpha can take actual
  manual-transfer bookings.
- No general Resend booking-notification sender exists anywhere in the codebase
  (confirmed: only `auth.ts`/`ResendOTPPasswordReset.ts` use Resend) — the
  `transfer_rejected` notification is correctly queued into `bookingNotifications`,
  but nothing sends it, same as `booking_confirmation`/`payment_instructions` already
  weren't being sent before this checklist either. This is a pre-existing gap, not
  introduced here, and correctly out of this checklist's scope — but it means **no
  booking-related email actually reaches anyone yet**, which is a real gap for Alpha
  readiness broader than just Rewards/payments. Worth its own design/checklist.

**Medium — reject reason is a hardcoded canned string, not what staff actually
typed.** `AdminPaymentsPage`'s reject button calls `verify({..., note: "Transfer proof
could not be verified."})` — a fixed string, not a text field for the reviewer to
explain what was actually wrong (wrong amount, illegible reference, etc.). The backend
correctly supports a real `note`; the UI just doesn't expose it. Since this note is
what ends up in the guest-facing rejection notification, a generic message reduces how
useful the reject flow actually is for guests trying to fix and resubmit. Worth adding
a text input before this sees real guest traffic — not launch-blocking on its own, but
cheap to fix and meaningfully improves the guest experience.

**Low — `'adminPayments'` isn't in the `GuestScreen` type union** (`types.ts`); the
new route/render use `as GuestScreen` casts (`App.tsx` lines ~157, ~365) instead of
extending the union like every other screen. Works, but defeats the type-checker's
purpose for this one screen — a future typo here wouldn't be caught. One-line fix:
add `'adminPayments'` to the union, drop the two casts.

**Low — `verifyTransfer` doesn't cross-check the submitted transfer amount against the
booking total before approving.** This is a manual human-review step (staff sees the
amount in the UI and decides), so it's not a security gap, just a missing guardrail —
a staff member could approve a transfer for the wrong amount by mistake with no system
warning. Optional: add a mismatch warning in `AdminPaymentsPage`, not a required fix.

**Verified correct / good decisions:**
- `commissions.calculateForBooking`'s double-calculation guard (checks
  `by_booking` index before inserting) matches the pattern already established by
  Rewards' `earnForBooking` — consistent, not reinvented.
- Both payment paths correctly trigger commission calculation exactly once each:
  `verifyTransfer`'s approve path for manual transfer, `support.updateReservation`'s
  completed-transition guarded to `paymentMethod === 'pay_at_hotel'` only — no
  double-triggering, no gap.
- `payoutStatements.generate` correctly marks summed commissions `'settled'` to
  prevent double-payout across periods, and correctly reuses the existing
  `partnerOperations.payoutStatements`/`reviewPayout` functions rather than
  duplicating them.
- Guest-side authorization (`ownsBooking` helper) correctly mirrors the existing
  account-vs-guest-email pattern used elsewhere (`bookings.requestCancellation`/
  `requestRefund`) rather than inventing a new one, per the brief.
- Resubmission after rejection works correctly — the idempotency check on
  `submitManualTransfer` only blocks a duplicate `'submitted'` transfer, not a retry
  after a prior one was rejected.

**Outcome: closes, no Blocker.** Two real follow-ups worth their own small checklist
items soon, not urgent enough to hold this open: (1) a real reject-reason text field,
(2) the missing general booking-notification sender (affects more than just this
pillar — confirmation emails aren't being sent either). Both noted in
`docs/PROJECT-STATUS.md`.

