# Phase 2 launch checklist and rollback procedure

## Approval status

**Not approved for production yet.** Code-level validation is available, but production approval requires evidence from the configured staging Convex deployment and browser smoke test.

## Required staging evidence

- [ ] Seed the staging fixture with `npx convex run seed:seedDemo` against the staging deployment.
- [ ] Search for the seeded property with dates, adults, children, and child ages.
- [ ] Open the property, select a dated rate, complete guest details, and create a pay-at-hotel booking.
- [ ] Verify the confirmation reference, booking record, inventory decrement, payment record, audit event, and notification records.
- [ ] Repeat the booking lookup and verify the partner reservation view.
- [ ] Run the concurrent one-unit inventory claim described in `docs/phase-2-concurrency-qa.md`; exactly one claim must succeed.
- [ ] Run the duplicate checkout case; retries with one idempotency key must return one booking and one inventory decrement.

Record booking references, hold IDs, availability before/after, audit events, and notification IDs without recording guest secrets or payment credentials.

## Pre-launch gates

- [x] TypeScript typecheck passes.
- [~] Unit tests and production build pass; the current Windows sandbox returns `spawn EPERM` while Vite/Vitest starts child processes, so rerun outside the restricted runner.
- [~] Staging smoke test completed.
- [~] Inventory concurrency test completed.
- [ ] Production environment variables, Convex deployment, email delivery, monitoring, and rollback access verified.
- [ ] Business owner approves MVP scope: pay at hotel and manual bank transfer only.

Do not launch while any required staging evidence or production access check is unchecked.

## Rollback procedure

1. Disable new booking entry points or route traffic to the last known-good frontend deployment.
2. Do not delete booking, payment, inventory, hold, or audit records.
3. Stop or pause scheduled notification/payment workers if they are contributing to the incident.
4. Inspect recent `bookingStatusHistory`, audit events, holds, inventory, and notification failures.
5. Reconcile any affected reservations manually with operations and the property partner before changing status or inventory.
6. Restore the last known-good frontend and Convex function deployment using the hosting provider’s deployment history.
7. Re-run the staging smoke test and one-unit concurrency test before reopening bookings.
8. Document the incident, affected references, inventory corrections, customer communication, and follow-up fix.

Rollback is an operational recovery action, not a substitute for cancelling records or manually decrementing inventory without an audit trail.
