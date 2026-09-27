# Menetap Phase 3 — Partner MVP checklist

## Status

**Planned — partner-facing foundations exist, but the partner MVP is not launch-ready.**

Goal: let approved hotel partners onboard properties, maintain sellable inventory, manage reservations, and understand basic performance without engineering assistance.

Status keys: `[x]` complete, `[~]` partial/foundation, `[ ]` not complete.

## 1. Partner access and onboarding

- `[x]` Partner login and role-aware access foundation; partner routes remain server-gated by active role.
- `[x]` Partner registration and application form with property name and contact phone validation.
- `[~]` Partner email verification and approval state; applications are held in `pending_email` until the account has an email verification timestamp, then move to review, while admin/operations approval promotes the user to the partner role. Provider-level verification email delivery still needs staging verification.
- `[~]` Admin/operations review, approve, reject, suspend, and reinstate workflow is implemented server-side with audit events and wired into the admin partner review screen; staging verification remains.
- `[x]` Partner terms acceptance and versioned agreement record; application submission stores the accepted version and timestamp.
- `[~]` Payout profile and required business details are modeled with ownership checks, masked account storage, review status, and audit events; onboarding UI and finance verification remain.
- `[~]` Persistent onboarding progress, drafts, validation, and completion state are implemented in Convex; existing onboarding screen still needs to submit live drafts.
- `[x]` Permission-policy test proving a partner cannot access another partner’s resource; server mutations also enforce owner/role checks.

## 2. Property profile management

- `[~]` Property creation and seeded property records; repeatable seeded fixtures exist and partners can create ownership-scoped draft properties, while the property editor and approval/publish UI remain.
- `[~]` Property name, type, description, contact, and operating details are validated by the property details mutation; editor wiring remains.
- `[~]` Address, city, area, map coordinates, and timezone are modeled and validated; editor wiring remains.
- `[~]` Property photo records support upload references, ordering, alt text, and moderation states; storage picker and admin moderation UI remain.
- `[~]` Amenities and house rules are stored through the property details mutation; editor controls remain.
- `[~]` Check-in, check-out, cancellation, and child policies are modeled and validated; partner policy editor remains.
- `[~]` Publish/unpublish and admin review states are enforced by server mutations with audit events; admin and partner lifecycle UI wiring remains.
- `[~]` Server validation and permission errors are implemented; draft/loading/empty/retry presentation still needs full browser QA.
- `[x]` Audit history for profile and policy changes is queryable per property with tenant authorization.

## 3. Room types and inventory

- `[x]` Room type records and partner ownership authorization; partners can list, create, edit, archive, and update child policies only for their own properties.
- `[~]` Create, edit, archive, and restore room types are implemented as authorized Convex mutations; partner room editor controls still need wiring.
- `[~]` Capacity, adult/child occupancy, bed configuration, size, view, and amenities are structured and validated in room type mutations; editor controls and guest-facing detail rendering remain.
- `[~]` Room photos support an authorized four-image gallery with ordering and required accessible alt text; room editor upload controls remain.
- `[~]` Unit count and inventory calendar API supports ownership-scoped date reads and validated daily unit/rate/status updates; calendar UI wiring remains.
- `[ ]` Date-specific availability editing.
- `[~]` Bulk availability update over a date range is implemented server-side; calendar bulk-edit controls remain.
- `[x]` Closed dates and stop-sell controls are represented by validated `closed` availability state.
- `[x]` Inventory conflict detection uses expected-version timestamps, transactional Convex mutations, and ownership checks.
- `[x]` Change history records actor, timestamp, old values, and new values for daily and range updates.

## 4. Rates and restrictions

- `[~]` Rate plan records and live guest-facing rate reads.
- `[~]` Create, edit, archive, and restore rate plans are implemented with property/room ownership authorization; partner rate editor wiring remains.
- `[~]` Refundable and non-refundable policy configuration is structured and validated on rate plans; partner editor controls remain.
- `[~]` Base nightly rate and included-tax/fee disclosure are modeled through rate-plan pricing and included-fee text; editor UI remains.
- `[~]` Child pricing and eligibility are enforced by the existing room child-policy model; partner configuration UI remains.
- `[~]` Breakfast and room-level add-on configuration is available through authorized room add-on mutations; editor UI remains.
- `[x]` Minimum stay, maximum stay, booking window, and advance-purchase restrictions are validated on rate plans.
- `[x]` Date-specific rate overrides are supported.
- `[~]` Bulk calendar rate update has server-side preview confirmation and range application; calendar UI remains.
- `[x]` Effective-date validation prevents invalid ranges and negative/invalid prices.
- `[x]` Rate and restriction changes create audit events.

## 5. Reservation operations

- `[x]` Partner reservation query foundation and booking notification records.
- `[~]` Reservation list supports status filters including upcoming, in-house, completed, cancelled, and no-show; partner UI remains demo-backed.
- `[x]` Search by booking reference, guest name, email, and check-in date.
- `[x]` Authorized reservation detail returns room, guest, dates, price, payment, property, and partner notes.
- `[x]` Guest contact and operational notes are limited to authorized partner/property contexts.
- `[~]` New-booking, cancellation/status, and payment notification records are created; modification and delivery provider wiring remain.
- `[~]` Partner actions use the existing valid status transition mutation, with operational notes and export; room assignment remains.
- `[x]` Valid status transitions and partner/property authorization are enforced server-side.
- `[x]` Reservation export applies permission checks and records an audit event.
- `[~]` Backend not-found and authorization errors exist; partner reservation UI empty/loading/retry states remain.

## 6. Partner dashboard and reporting

- `[x]` Partner dashboard shell and navigation.
- `[x]` Upcoming arrivals and departures are returned in the live overview metrics.
- `[x]` Booking count, room nights, gross booking value, and cancellation count are calculated server-side.
- `[x]` Occupancy overview is returned when availability data is complete, with an incomplete-data explanation otherwise.
- `[x]` Revenue overview defines gross booking value before commission and net payout after finance adjustments.
- `[x]` Date-range filtering and property filtering are supported by the dashboard query and UI.
- `[~]` Reservation export is live; revenue export remains a finance/reporting UI task.
- `[x]` Freshness timestamp and incomplete-data explanation are displayed.
- `[~]` Dashboard permission and tenant isolation are enforced by the query; dedicated dashboard browser tests remain.

## 7. Support, operations, and payout readiness

- `[x]` Support reservation lookup and status-update foundation.
- `[~]` Partner support tickets now have ownership, priority, status, and SLA timestamps; partner support UI remains.
- `[x]` Escalation path to operations, finance, and admin is represented on tickets with server-side role permissions.
- `[~]` Partner announcement inbox and read state are implemented; announcement publishing UI remains.
- `[~]` Payout statement foundation includes payable status and review fields; statement generation and commission aggregation remain.
- `[x]` Payout hold/release states and finance review permissions are enforced.
- `[x]` Reconciliation query links reservations, payments, refunds, and payout-facing booking amounts.
- `[x]` Support, payout, and reconciliation actions create audit records where mutations occur.

## 8. Security, reliability, and quality

- `[~]` Tenant isolation is enforced across the partner data mutations and queries; two-account staging verification remains.
- `[x]` Partner mutations authorize server-side through role and ownership checks.
- `[~]` Timezone, date-range, currency, capacity, and bulk-update validations are implemented; staging edge-case execution remains.
- `[~]` Concurrent availability and rate edit protections are implemented; staging concurrency execution remains.
- `[x]` Duplicate booking submission/idempotency handling exists; partner-specific retry execution remains.
- `[ ]` Test mobile and desktop partner workflows.
- `[ ]` Complete keyboard, focus, labels, contrast, and screen-reader review.
- `[~]` Sensitive-data redaction protections exist; staging logs and analytics payload review remains.
- `[~]` Rollback and operations procedures are documented; monitoring, alerts, and backup execution remain.

## Phase 3 exit criteria

- `[~]` An approved partner can complete onboarding without engineering assistance; persistent drafts, validation, and completion exist, but staging end-to-end verification remains.
- `[~]` A partner can publish a property with room/rate/policy/inventory foundations; full UI wiring and staging verification remain.
- `[~]` A partner can update inventory and rates with conflict checks and audit history; concurrent staging testing remains.
- `[~]` A partner can receive, find, understand, and act on a reservation; live UI is wired, while notification delivery and staging verification remain.
- `[~]` Menetap operations have reservation, support, payout, and reconciliation foundations; operational scenario testing remains.
- `[~]` Basic dashboard and payout reporting is permission-scoped; statement generation and reconciliation accuracy require staging data verification.
- `[ ]` Partner workflows pass mobile, desktop, accessibility, security, and failure-state QA.

## Out of scope for initial Phase 3

- Channel-manager or external PMS integrations.
- Automated revenue-management recommendations.
- Multi-property enterprise hierarchy beyond the minimum ownership model.
- Full housekeeping and maintenance operations.
- Vendor marketplace and supply commerce.
- Advanced payout automation before reconciliation is proven.
