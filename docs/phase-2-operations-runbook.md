# Phase 2 booking operations runbook

## Booking and payment state transitions

### Booking

`pending → confirmed → completed`

Allowed exception paths:

- `pending → cancelled`
- `confirmed → cancelled`
- `confirmed → no_show`

`cancelled`, `completed`, and `no_show` are terminal states. Every transition requires an authorized actor, timestamp, optional reason, and `bookingStatusHistory` record.

### Payment

- Pay at hotel: booking is confirmed, payment remains `unpaid` until collected outside the platform.
- Manual bank transfer: payment starts `unpaid`, then becomes `pending_verification`, `paid`, or remains actionable after rejection.
- Refund: request is queued in `refundRequests`; finance/operations approve or reject; actual money movement is a separate provider/finance action.

Every payment creation, verification, rejection, refund request, approval, and failure must create an audit event. Never infer payment success from a browser redirect.

## Cancellation and refund enforcement

- Refundable rate: cancellation is accepted only before the check-in window closes.
- Non-refundable rate: cancellation/refund is rejected even before check-in.
- At or after check-in: cancellation/refund request is rejected unless operations applies an approved exception.
- Pay-at-hotel bookings have no cash refund because no platform payment was collected.
- Taxes and service fees are included in room rates for the MVP.
- Cancellation restores held/inventory units exactly once and emits an audit event.
- Refund approval does not itself claim that funds have been returned; mark processing only after finance/provider confirmation.

## Support and partner escalation ownership

### Guest support

Support owns first response, booking lookup, guest communication, and ticket triage. Support may update reservation status only with a reason and must escalate payment/refund decisions to finance or operations.

### Partner/property

The partner owns property readiness, room assignment, check-in, in-stay fulfillment, and property-level guest requests. Menetap operations owns platform availability, reservation integrity, and partner escalation.

### Finance

Finance owns manual-transfer verification, refund approval, payout reconciliation, and payment-provider exceptions.

### Operations/admin

Operations owns urgent service recovery, policy exceptions, no-show disputes, and incidents affecting multiple bookings. Admin owns access, policy configuration, and audit review.

### Suggested response targets

- Urgent in-stay safety/access issue: acknowledge immediately and escalate to operations.
- Same-day check-in failure: acknowledge within 15 minutes during coverage hours.
- Payment/refund question: acknowledge within 1 business hour.
- General booking/support issue: acknowledge within 4 business hours.

All targets are operational recommendations until a formal SLA is approved.
