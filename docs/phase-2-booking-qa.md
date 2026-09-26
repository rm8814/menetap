# Phase 2 cancellation, refund, and responsive booking QA

## Cancellation windows

- Flexible/refundable rate: request before check-in → cancellation accepted and inventory restored once.
- Same rate at or after check-in → request rejected with a closed-window message.
- Non-refundable rate before check-in → cancellation/refund request rejected with strict-policy messaging.
- Already cancelled, completed, or no-show booking → repeated cancellation rejected or safely idempotent.
- Cancellation always creates an audit event and does not mark a payment refunded automatically.

## Refund calculations

- Refund request amount equals the recorded payment amount, not a client-provided amount.
- Refund request is queued for finance/operations review.
- Approval/rejection records reviewer, timestamp, decision, and reason.
- No refund is issued for a non-refundable rate or closed cancellation window.
- Unpaid pay-at-hotel bookings do not create a cash refund.
- Taxes and service fees are included in rates for the MVP; no extra fee line is refunded.

## Mobile journey

Test at 375px and 430px widths:

1. Homepage search destination, dates, adults, and children/ages.
2. Search results filters, sorting, empty state, and back navigation.
3. Property gallery, room selection, cart, add-ons, and date editor.
4. Checkout form, payment-method choice, summary, errors, and confirmation.
5. Verify no horizontal overflow, clipped modal, hidden CTA, or inaccessible control.

## Desktop journey

Test at 1280px and 1440px widths:

1. Search widget and results layout with filters and map/list controls.
2. Property detail gallery and room comparison.
3. Multi-room cart and exact checkout breakdown.
4. Payment choice, validation errors, confirmation, cancellation, and support actions.
5. Verify keyboard focus, readable line lengths, stable image/card dimensions, and visible primary actions.

Record screenshots, URL, viewport, test data, expected result, actual result, and severity for every failure. Run against staging before launch.
