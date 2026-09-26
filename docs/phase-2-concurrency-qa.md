# Phase 2 concurrency and duplicate-checkout QA

## Duplicate checkout

1. Start one checkout with a fixed cart and guest email.
2. Submit the final action twice rapidly and retry once after a simulated network timeout.
3. Confirm the same idempotency key returns the same booking reference.
4. Confirm only one booking, payment record, notification set, and inventory decrement exist.

## Concurrent inventory claim

1. Seed one room unit for the same room and dates.
2. Open two checkout sessions with the same dates.
3. Create holds/submissions at the same time.
4. Confirm exactly one succeeds and the other receives an availability/hold-expired error.
5. Confirm inventory never becomes negative and no duplicate booking is created.
6. Release or expire the successful hold and confirm the unit returns exactly once.

## Required evidence

- Booking references and count
- Payment records and count
- Inventory availability before/after
- Hold status and expiry
- Audit events
- Notification records

Run this against staging after deploying Convex functions. Do not use production inventory for concurrency testing.
