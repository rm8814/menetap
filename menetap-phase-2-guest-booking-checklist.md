# Menetap Phase 2 — Guest booking MVP checklist

## Status

**In progress — discovery, live availability, child policy, and reservation safeguards are implemented; payment, guest account, and production QA remain.**

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
- `[x]` Search and room selection read live date-specific availability and active rate plans; production taxes, fees, and dynamic pricing rules remain.
- `[~]` Responsive mobile and desktop states exist; formal seeded and edge-case QA remains.
- `[x]` Canonical/noindex behavior for search query variants: search states canonicalize to the clean localized stays route and use `noindex,follow`.

## 2. Property and room selection

- `[~]` Property detail page with gallery, amenities, reviews, policies, rooms, and location.
- `[~]` Room selection with rate plans, cancellation display, room cart, add-ons, and responsive layout.
- `[x]` Live date-specific availability and active rate-plan pricing, displayed for the selected stay dates.
- `[~]` Temporary inventory hold foundation implemented with expiry, explicit release, and cleanup mutations; checkout token conversion and scheduled cleanup wiring remain.
- `[x]` Exact room, child, discount, and add-on totals are calculated with taxes/service fees included in rates, and checkout receives and persists the full room cart breakdown.
- `[~]` Enforce occupancy, room quantity, and child-age rules server-side; add-on quantity and multi-room booking rules remain.
- `[x]` Prevent stale availability and duplicate room reservations with server-side rechecks, expiring hold consumption, and idempotent booking retries.

## 3. Checkout and payment

- `[~]` Checkout guest details, contact fields, payment-method choice, terms acknowledgement, and full cart booking summary.
- `[x]` Pay-at-hotel booking mutation with availability validation and inventory decrement.
- `[~]` Manual bank-transfer payment option foundation.
- `[x]` Confirmed MVP payment scope: pay at hotel and manual bank transfer; card/payment-provider integration is deferred.
- `[ ]` Payment success, failure, timeout, retry, and webhook state transitions.
- `[x]` Idempotency for duplicate checkout submissions.
- `[~]` Final server-side booking validation is present; full multi-room/add-on total reconciliation before reservation creation remains.
- `[x]` Payment creation, cancellation, and refund-request audit events; refund execution remains an operations-controlled action.

## 4. Reservation lifecycle

- `[~]` Convex booking record, reference, payment record, and audit event.
- `[~]` Confirmation page loads booking data by reference.
- `[x]` Authenticated bookings store guest ownership and expose owner-scoped `listMine` and `getMine` queries; guest reference confirmation remains separate.
- `[~]` Booking lookup using reference plus normalized guest email is available through `bookings.lookup`; the confirmation UI still needs to migrate from reference-only lookup and add stronger OTP/contact verification.
- `[~]` Confirmation and payment-instruction notification records plus staff failure monitoring are implemented; Resend dispatch, webhook updates, retries, and production alerts remain.
- `[x]` Reservation status transitions with valid-state rules, role/property authorization, audit history, and reasons.
- `[~]` Guest cancellation and refund-request workflow enforces refundable/non-refundable and check-in windows; finance/operations approval queue and audit events are implemented, while actual payment-provider refund execution remains.
- `[~]` Partner reservation notification queue and owner-scoped reservation query are implemented; partner UI wiring and email dispatch remain.
- `[~]` Support can search reservations by reference, guest name, or email and update status with an audit reason; support UI wiring and transition-rule reuse remain.

## 5. Guest account basics

- `[~]` Registration and login UI with Convex Auth.
- `[~]` Password reset UI and Resend integration.
- `[ ]` Production email delivery and end-to-end auth verification.
- `[~]` Authenticated profile/contact update mutation with validation is implemented; account settings UI wiring remains.
- `[~]` My Trips and booking history use authenticated owner-scoped Convex data with property names, status tabs, search, totals, references, dates, and guest counts; trip-detail action wiring remains.
- `[~]` Authenticated saved-stay persistence with owner-scoped list/save/remove mutations is implemented; Saved Stays UI migration from demo state remains.
- `[x]` Payment methods are explicitly out of scope for the MVP; payment is pay-at-hotel first, with manual bank transfer as fallback and no stored payment credentials.
- `[~]` Authenticated during-stay ticket mutation validates guest booking ownership and confirmed status; the during-stay UI still needs to submit live tickets and show ticket history.

## 6. Reliability, security, and accessibility

- `[x]` Validate date-only/timezone-safe dates, stay length, guest/child breakdown, room capacity, non-negative IDR pricing, and currency edge cases.
- `[~]` Idempotency and transactional hold protections are implemented; duplicate-submit and concurrent-claim QA is documented in `docs/phase-2-concurrency-qa.md` and requires a staging Convex run.
- `[~]` MVP pay-at-hotel/manual-transfer failure and recovery QA is documented in `docs/phase-2-payment-qa.md`; transfer submission/verification mutations and staging execution remain.
- `[~]` Cancellation-window and refund-calculation cases are documented in `docs/phase-2-booking-qa.md`; staging execution remains.
- `[~]` Mobile and desktop booking journey cases are documented in `docs/phase-2-booking-qa.md`; browser QA execution remains.
- `[~]` Accessibility review checklist is documented in `docs/phase-2-accessibility-qa.md`; keyboard and screen-reader execution remains.
- `[~]` Audit and analytics sinks now redact sensitive keys; staging browser/provider payload review remains.
- `[~]` Loading, empty, error, and permission-denied states exist across search, confirmation, checkout, auth, and protected staff routes; reusable retry state is added, while full browser-flow coverage remains.

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
