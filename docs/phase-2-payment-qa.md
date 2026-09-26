# Phase 2 payment failure and recovery QA

## Pay at hotel

- Confirm booking succeeds without a gateway call.
- Confirm payment remains `unpaid` and confirmation states “Pay at hotel”.
- Confirm retrying checkout with the same idempotency key does not create another booking or payment.

## Manual bank transfer

- Confirm booking creates an `unpaid` payment and queued payment-instruction notification.
- Submit transfer evidence once; confirm it becomes `pending_verification`.
- Submit the same evidence twice; confirm no duplicate transfer record is created.
- Verify transfer as staff; confirm payment becomes `paid` and audit history is recorded.
- Reject transfer; confirm payment remains actionable and the guest can resubmit.

## External gateway deferral

Card-provider failure, timeout, webhook replay, and provider recovery tests are deferred because card payments are out of MVP scope.
