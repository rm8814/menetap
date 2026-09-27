# Phase 3 partner QA checklist

## Automated checks

- Tenant ownership is enforced on property, room, rate-plan, inventory, photo, reservation, support, payout, and dashboard queries/mutations.
- Partner mutations use server-side `requireRole` and owner checks; UI guards are not treated as security boundaries.
- Date-only values use `YYYY-MM-DD`; inventory validates ranges, non-negative units/rates, capacity, and stale `updatedAt` versions.
- Rate plans reject negative prices, invalid restriction values, and reversed effective ranges.
- Booking creation has idempotency-key handling and inventory rechecks.
- `npm run typecheck`, `npm test`, and `git diff --check` are required before release.

## Staging execution

- [ ] Use two partner accounts with different properties and confirm each cannot read or mutate the other’s properties, rooms, rates, inventory, reservations, reports, payouts, tickets, or announcements.
- [ ] Attempt each protected mutation with a guest, another partner, and an unauthenticated session; confirm denial.
- [ ] Test timezone boundaries around midnight in `Asia/Jakarta`, date-range inclusivity, leap dates, currency display, room capacity, and bulk date updates.
- [ ] Edit the same availability day and rate override concurrently; one stale write must be rejected and no negative inventory may result.
- [ ] Retry room/rate/property submissions with the same client request and confirm no duplicate records.
- [ ] Test partner workflows on supported mobile and desktop browsers.
- [ ] Complete keyboard navigation, visible focus, form labels, contrast, and screen-reader review.
- [ ] Inspect logs and analytics payloads for guest contact data, payment data, payout details, tax identifiers, and business secrets.
- [ ] Verify monitoring alerts, backup completion, incident ownership, and partner-operation rollback access.

Record only non-sensitive evidence: account role, property IDs, mutation result, timestamps, and audit-event IDs.
