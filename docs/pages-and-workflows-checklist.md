# Menetap Pages and Workflows Checklist

## Status definitions

- `[x] Done` — implemented in React/Convex and covered by the current foundation checks.
- `[~] Partial` — a prototype, foundation, or first pass exists, but important production behavior or parity remains.
- `[ ] Not started` — no production implementation is currently available.

This checklist is the product-scope inventory. The `.dc.html` screens remain the visual source of truth, while React and Convex are the implementation targets.

## Public and guest pages

### Marketing and discovery

- `[~]` Homepage — React structure, responsive layout, mobile navigation, search widget, back-to-top control, trust content, stays, pricing explanation, experiences, and footer implemented; final visual parity and live browser QA remain.
- `[~]` Destination landing pages — localized React pages and all-destinations directory with unique content, properties, FAQs, internal links, and current visual scope complete; production SEO hardening and live browser QA remain.
- `[~]` Search results — Convex property query, loading/empty states, type filter, name sorting, responsive cards, and booking navigation implemented; map/list behavior, real filters, images, and full DC parity remain.
- `[~]` Hotel/property detail — Convex property data and room-navigation first pass implemented; gallery, amenities, reviews, policies, approved media, add-ons, and full parity remain.
- `[~]` Room selection — Convex room inventory query, availability states, room choice, and navigation implemented; rate plans, calendar, policies, price breakdown, and full parity remain.
- `[~]` Cancellation policy — DC reference exists; React production page and policy data integration remain.
- `[ ]` Experiences directory and detail pages.
- `[ ]` Rentals landing, search, detail, checkout, and confirmation workflows.
- `[ ]` Supply catalog, product detail, checkout, and confirmation workflows.

### Account and booking

- `[~]` Guest registration — Convex Auth email/password foundation and UI exist; end-to-end production verification remains.
- `[~]` Guest login — Convex Auth email/password foundation and session-aware header exist; full browser verification remains.
- `[~]` Password reset — UI, Resend integration, and token generation exist; secrets, delivery, and end-to-end verification remain.
- `[ ]` Guest account profile and preferences.
- `[~]` Checkout — guest details, pay-at-hotel booking mutation, validation, and summary exist; payment explanation, add-ons, exact pricing, and full parity remain.
- `[~]` Booking confirmation — loads booking reference data from Convex; full confirmation content and email delivery remain.
- `[ ]` Booking lookup without account using booking reference plus verified contact information.
- `[ ]` My trips and booking history.
- `[ ]` Saved stays.
- `[ ]` Rewards balance, earning, redemption, and rewards history.
- `[ ]` Payment methods.
- `[ ]` During-stay requests and support.
- `[ ]` Guest cancellation and refund request workflow.
- `[ ]` Help center and contact support workflow.

## Partner and property workflows

### Partner access and onboarding

- `[~]` Partner role model and authorization helpers — foundations exist in Convex.
- `[ ]` Partner invitation and account activation.
- `[ ]` Partner login and role-aware navigation.
- `[ ]` Partner onboarding welcome and checklist.
- `[ ]` Partner profile and contact details.
- `[ ]` Property registration and ownership verification.
- `[ ]` Property agreement and document submission.
- `[ ]` Property image/document upload workflow using the approved 4:3 WebP and private-PDF policy.
- `[ ]` Onboarding review, revision requests, approval, rejection, and resubmission.

### Property operations

- `[ ]` Partner dashboard overview.
- `[ ]` Property profile editing.
- `[ ]` Property media management and public approval.
- `[ ]` Room types and amenities.
- `[ ]` Rate plans, inclusions, cancellation policies, and pricing.
- `[ ]` Availability calendar and inventory updates.
- `[ ]` Reservation list and reservation detail.
- `[ ]` Guest requests and stay extensions.
- `[ ]` Partner services and add-on fulfillment.
- `[ ]` Partner payout statements and commission details.
- `[ ]` Partner support tickets and announcements.

## Vendor and service operations

- `[ ]` Vendor application and onboarding.
- `[ ]` Vendor profile and compliance documents.
- `[ ]` Vendor service catalog.
- `[ ]` Service area, schedule, capacity, and availability.
- `[ ]` Guest service order intake.
- `[ ]` Operations assignment and fulfillment tracking.
- `[ ]` Vendor order status updates.
- `[ ]` Service quality review and dispute workflow.
- `[ ]` Vendor payouts and statements.

## Support, operations, and finance

### Support

- `[ ]` Support queue and ticket list.
- `[ ]` Ticket detail, internal notes, assignment, and escalation.
- `[ ]` Guest, partner, vendor, and booking lookup with role restrictions.
- `[ ]` Cancellation, refund, and exception handling.
- `[ ]` Support macros, announcements, and help content management.

### Operations

- `[ ]` Operations dashboard.
- `[ ]` Reservation and availability exception queue.
- `[ ]` Housekeeping and stay-service task management.
- `[ ]` Transfer, breakfast, and add-on fulfillment.
- `[ ]` Partner onboarding review queue.
- `[ ]` Property content and media approval queue.
- `[ ]` Incident and escalation management.

### Finance

- `[ ]` Finance dashboard.
- `[ ]` Booking payment-status list.
- `[ ]` Manual bank-transfer review and verification.
- `[ ]` Refund and adjustment workflow.
- `[ ]` Commission calculation and reconciliation.
- `[ ]` Partner payout review, approval, and statement.
- `[ ]` Vendor payout review, approval, and statement.
- `[ ]` Finance reports and export controls.

## Administration and governance

- `[~]` Admin and superadmin role foundations — roles, authorization helpers, and audit helper exist.
- `[ ]` Admin login and protected navigation.
- `[ ]` User list, detail, suspension, and role assignment.
- `[ ]` Property approval and moderation.
- `[ ]` Partner detail and compliance review.
- `[ ]` Booking and dispute administration.
- `[ ]` Announcements management.
- `[ ]` Risk and fraud review.
- `[ ]` Reports and analytics dashboard.
- `[ ]` Support administration.
- `[ ]` System settings and environment configuration.
- `[ ]` Audit-log viewer with restricted access.
- `[ ]` Access review and staff session management.

## Cross-cutting workflows

- `[~]` Authentication and session lifecycle — guest auth foundation exists; staff role flows and production verification remain.
- `[~]` Role-based authorization — helper foundation exists; protected routes and allow/deny test coverage remain.
- `[~]` Audit logging — central helper and sensitive-event policy exist; broader staff workflow coverage remains.
- `[ ]` Notification preferences and transactional email delivery.
- `[ ]` Image conversion, media approval, private document storage, scanning, and signed URLs.
- `[ ]` Search indexing, SEO metadata, sitemap, canonical URLs, and structured data.
- `[ ]` Analytics events and consent handling.
- `[ ]` Error monitoring and uptime monitoring.
- `[ ]` Backup, restore, rollback, and incident-response drills.
- `[ ]` Data retention, deletion, export, and privacy-request workflows.

## Delivery priorities

1. Complete authentication, roles, protected routes, and security baselines.
2. Finish the guest booking funnel: search, property detail, room selection, checkout, confirmation, cancellation, and support.
3. Build partner onboarding, property content, inventory, rates, and reservations.
4. Add reliable operational services and fulfillment.
5. Add vendor commerce, finance, reporting, and broader administration.

## Maintenance rule

Update this checklist whenever a page or workflow changes status. Link implementation notes, tests, migrations, or deployment evidence in the relevant project documentation before marking a production workflow `[x] Done`.
