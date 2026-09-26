# Menetap Phase 2 — Guest booking MVP checklist

## Status

**Ready to start — prototype screens exist, production booking reliability is not complete.**

Goal: enable a guest to discover a property, select a room, complete a reliable booking, and manage the resulting trip.

Status keys: `[x]` complete, `[~]` partial/prototype, `[ ]` not complete.

## 1. Discovery and search

- `[x]` Public homepage, destination directory, and destination landing pages.
- `[~]` Search widget with destination, dates, adults, and children inputs.
- `[~]` Search results with property query, responsive cards, sorting, empty, and loading states.
- `[x]` Search term matching across property name, area, city, dates, adults, and children is wired through the published-property query.
- `[~]` Production-grade date/guest/filter query model; child ages are now collected and URL-persisted, while age-based pricing/eligibility remains to be enforced server-side.
- `[x]` Apply property-controlled child age eligibility and nightly age-band pricing server-side.
- `[~]` Persist partner child-policy edits through the authorized Convex mutation; the existing partner room editor still needs to be connected to a real room ID and mutation call.
- `[x]` Snapshot the applied child policy on each booking for auditability.
- `[~]` Search availability and pricing from live inventory for dated searches; rate-plan aggregation and production pricing rules remain.
- `[~]` Responsive mobile and desktop states exist; formal seeded and edge-case QA remains.
- `[ ]` Canonical/noindex behavior for search query variants.

## 2. Property and room selection

- `[~]` Property detail page with gallery, amenities, reviews, policies, rooms, and location.
- `[~]` Room selection with rate plans, cancellation display, room cart, add-ons, and responsive layout.
- `[ ]` Live date-specific availability and rate-plan pricing.
- `[ ]` Temporary inventory hold while checkout is in progress.
- `[ ]` Exact taxes, fees, discounts, add-on, and total calculations.
- `[ ]` Enforce occupancy, room quantity, child-age, and add-on rules server-side.
- `[ ]` Prevent stale availability and duplicate room reservations.

## 3. Checkout and payment

- `[~]` Checkout guest details, contact fields, terms acknowledgement, and booking summary.
- `[x]` Pay-at-hotel booking mutation with availability validation and inventory decrement.
- `[~]` Manual bank-transfer payment option foundation.
- `[ ]` Payment provider integration or confirmed MVP payment scope.
- `[ ]` Payment success, failure, timeout, retry, and webhook state transitions.
- `[ ]` Idempotency for duplicate checkout submissions.
- `[ ]` Final server-calculated price confirmation before reservation creation.
- `[ ]` Payment, cancellation, and refund audit events.

## 4. Reservation lifecycle

- `[~]` Convex booking record, reference, payment record, and audit event.
- `[~]` Confirmation page loads booking data by reference.
- `[ ]` Authenticated guest booking ownership and trip access.
- `[ ]` Booking lookup using reference plus verified contact information.
- `[ ]` Confirmation email and transactional delivery monitoring.
- `[ ]` Reservation status transitions: pending, confirmed, cancelled, completed, no-show.
- `[ ]` Guest cancellation and refund-request workflow.
- `[ ]` Partner notification and reservation visibility.
- `[ ]` Support workflow for locating and updating reservations.

## 5. Guest account basics

- `[~]` Registration and login UI with Convex Auth.
- `[~]` Password reset UI and Resend integration.
- `[ ]` Production email delivery and end-to-end auth verification.
- `[ ]` Guest profile and contact details.
- `[ ]` My Trips and booking history.
- `[ ]` Saved stays.
- `[ ]` Payment methods, if retained in MVP scope.
- `[ ]` During-stay requests and support.

## 6. Reliability, security, and accessibility

- `[ ]` Validate date, timezone, guest, room, pricing, and currency edge cases.
- `[ ]` Test duplicate checkout and concurrent inventory claims.
- `[ ]` Test payment failure and recovery paths.
- `[ ]` Test cancellation windows and refund calculations.
- `[ ]` Test mobile and desktop booking journeys.
- `[ ]` Keyboard, focus, label, contrast, and screen-reader review.
- `[ ]` Verify no private guest/payment data leaks into logs or analytics.
- `[ ]` Add error, empty, loading, permission-denied, and retry states to production flows.

## 7. Documentation and release

- `[ ]` Document booking and payment state transitions.
- `[ ]` Document cancellation and refund policy enforcement.
- `[ ]` Document support and partner escalation ownership.
- `[ ]` Seed a repeatable staging property, room, rate, and availability window.
- `[ ]` Complete staging smoke test from search through confirmation.
- `[ ]` Run production-like load/concurrency checks on inventory claims.
- `[ ]` Approve Phase 2 launch checklist and rollback procedure.

## Phase 2 exit criteria

- `[ ]` A guest can complete a real or sandbox booking end to end.
- `[ ]` Inventory cannot be oversold under concurrent checkout attempts.
- `[ ]` The guest receives a booking reference and confirmation notification.
- `[ ]` The guest can view, support, and cancel an eligible booking.
- `[ ]` The partner can reliably see the reservation.
- `[ ]` Payment, cancellation, refund, and support paths are documented and tested.
- `[ ]` Core booking flow passes mobile, desktop, accessibility, and failure-state QA.

## Out of scope for initial Phase 2

- Partner operations expansion beyond reservation visibility.
- Vendor marketplace and supply commerce.
- Rentals workflows.
- Advanced rewards redemption.
- Experiences ordering and fulfillment.
