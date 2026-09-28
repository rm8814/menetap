# Design: Admin backend — payment collection, commission, and payout pipeline

**Status: APPROVED (2026-09-28).** Ready for a checklist (or two — see note at the end
on splitting Part 1 from Part 2).

Follow-on from `docs/checklist-poc-b.md`'s review: POC-B correctly made every admin
screen honest instead of fabricated, but that surfaced that most admin backend
functions don't exist. This doc scopes what actually needs building, prioritized
against your **first live-site goal** (`docs/POC.md`): guests book, partners list and
manage bookings, Menetap collects payment and commission.

## Part 1 — Quick wins: already real, just need frontend wiring (no design needed)

Checked directly against the code — these three `AdminOpsPage` kinds have working,
admin-usable backend functions today. They don't belong in this design doc; they
should go straight into a small implementation checklist, since there's nothing to
design:

- **Disputes/refunds** — `refunds.listPending` (query) and `refunds.decide`
  (mutation, approve/reject) already exist, already admin-role-gated.
- **Support** — `support.listForStaff`, `support.findReservations`,
  `support.updateReservation`, `support.createStayTicket` already exist, already
  global (not per-property) and admin-usable.
- **Moderation** — `properties.updatePhotoModeration` already exists and works; the
  only missing piece is a query to list *all* pending-moderation photos across
  properties (today `listPhotos` is per-property only) — a small addition, not a
  design problem.

**Recommendation:** wire these three `AdminOpsPage` kinds now, in parallel with the
work below — they're not blocked by anything in Part 2.

## Part 2 — The actual critical path: payment collection and commission don't exist

This is more fundamental than "admin console is mock" — it's that **the manual bank
transfer flow has no guest-side submission and nothing ever creates a `commissions` or
`payoutStatements` record**, anywhere in the codebase (confirmed: `manualBankTransfers`
is referenced only in `schema.ts`, nowhere else). Right now, if a guest chooses
`manual_bank_transfer` at checkout, there is no way for them to tell Menetap they've
paid, and no way for finance to verify it, calculate commission, or generate a payout.
**This blocks the first live-site goal entirely, independent of admin UI polish.**

### 2a. Guest-side: submit transfer proof

- [ ] New mutation `payments.submitManualTransfer` — args: `bookingId`, `reference`,
      `amount`, `transferredAt`, `evidenceFileId` (optional, `_storage` upload).
      Inserts into `manualBankTransfers` with `status: 'submitted'`. Guest-callable,
      but only for their own booking (check `booking.guestUserId === auth.getUserId()`
      or match by `guestEmail` for guest checkouts without an account).
- [ ] New guest-facing screen/step (likely on `Confirmation` or a new "Complete
      payment" screen reachable from `MyTrips`) — shows transfer instructions and the
      submission form. **Decided:** a single Menetap company bank account, shown to
      every guest regardless of property (not per-property) — stored in
      `platformConfig` (bank name, account name, account number), admin-editable.

### 2b. Admin/finance-side: verify transfers

- [ ] New query `payments.listPendingTransfers` — all `manualBankTransfers` with
      `status: 'submitted'`, staff-role-gated (`finance`/`operations`/`admin`).
- [ ] New mutation `payments.verifyTransfer` (`transferId`, decision
      approve/reject, note) — on approve: patches `manualBankTransfers.status`,
      `booking.paymentStatus: 'paid'`, `payments.status: 'paid'`, and triggers
      commission calculation (2c). On reject: patches status, booking stays
      `unpaid`/`pending_verification`; guest is notified — see 2e below.
- [ ] **Decided:** new dedicated `AdminOpsPage kind="payments"` screen, consistent
      with how payouts/disputes/support already work as their own kinds — not folded
      into `AdminFinance`.

### 2c. Commission calculation

- [ ] **Schema gap:** no commission rate exists anywhere — not on `properties`, not
      in a platform config table. Add `platformConfig` (singleton, mirrors
      `rewardsConfig`'s pattern — and now also holds the bank transfer instructions
      from 2a) with `defaultCommissionPercent`, and an optional
      `commissionPercentOverride` field on `properties` for per-property overrides
      (matches the original `AdminConsole` mock's "platform default + property
      override" concept exactly — so this isn't new product thinking, just building
      what was already envisioned). **Decided: default rate is 10%.**
- [ ] New internal mutation `commissions.calculateForBooking` — triggered when a
      booking's payment is confirmed paid (either via `verifyTransfer` above, or for
      `pay_at_hotel`, on completion via `support.updateReservation` same pattern as
      Rewards' `earnForBooking`). Computes `amount = booking.totalAmount * rate`,
      inserts into `commissions` with `status: 'calculated'`.
- [ ] Admin query `commissions.listForProperty` / `commissions.listAll` for finance
      visibility.

### 2d. Payout statement generation

- [ ] `partnerOperations.payoutStatements` (read) and `.reviewPayout` (status
      transition) already exist — but nothing ever *creates* a `payoutStatements` row.
- [ ] New admin mutation `payoutStatements.generate` (`propertyId`, `periodStart`,
      `periodEnd`) — sums `commissions` for that property/period into a draft
      statement (`grossAmount`, `commissionAmount`, `payableAmount`), using
      `partnerProfiles.payoutBankName`/`payoutAccountName`/`payoutAccountLast4`
      (already real) for the remittance details shown to finance.
- [ ] Decide: manual admin-triggered generation per period (simpler, matches Alpha's
      "no calendar constraint, quality over speed" posture) vs. a scheduled monthly
      cron (more automated, more to get right). **Recommend manual-trigger for
      Alpha**, automate later once the manual process is proven.

### 2e. Rejection notification

- [ ] **Decided:** email via the existing `bookingNotifications` pattern (same table/
      approach already used for confirmation emails). On `verifyTransfer` reject,
      queue a `bookingNotifications` row (new `type` value, e.g.
      `'transfer_rejected'`) with the rejection reason and a link back to resubmit.
      Reuses the existing Resend-backed sending path — no new email infrastructure.

## Part 3 — Lower priority, not on the critical path

These don't block "guests book, partners manage, Menetap collects payment/commission"
— defer past the first live-site goal unless you say otherwise:

- Admin properties/users/team listing (operational visibility, not payment-blocking)
- Commission/featured-placement/curated-collections marketing tools in `AdminConsole`
- Risk & fraud signals
- Announcements admin CRUD
- Platform settings (beyond the commission-rate field already covered in 2c)
- System health

## Decisions locked in (2026-09-28)

1. Bank transfer instructions: single Menetap company account, `platformConfig`.
2. Default commission: 10%, `platformConfig.defaultCommissionPercent`.
3. Verification UI: new dedicated `AdminOpsPage kind="payments"`.
4. Rejected transfers: email via `bookingNotifications`, reusing the existing pattern.

## Next step

All open questions resolved — no remaining blockers to writing a checklist. Given the
size of Part 2 (new `platformConfig` table, four+ new Convex functions across a new
`payments.ts`, `commissions.ts` additions, `payoutStatements.generate`, a new guest
screen, a new admin screen, and the notification hook), recommend splitting into two
checklists rather than one large one:

- `docs/checklist-admin-quickwins.md` — Part 1 (refunds/support/moderation wiring),
  small and independent, can start immediately.
- `docs/checklist-admin-payments.md` — Part 2 (the actual payment/commission/payout
  pipeline), the real critical-path work.

Part 3 stays deferred, no checklist yet.
