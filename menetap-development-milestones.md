# Menetap Development Milestones

## Roadmap purpose

This roadmap takes Menetap from a high-fidelity product concept to a production deployment at `menetap.com`.

The recommended strategy is to launch the smallest trustworthy booking experience first, validate it with real hotel partners and guests, then progressively add stay extensions, partner operations, and vendor commerce.

## Product scope

Menetap serves three connected user groups:

- **Guests:** discover and book stays, then purchase services around the stay.
- **Partners:** hotels and property operators that need bookings, operations, and hospitality support.
- **Vendors:** third-party providers of guest services, operational services, and hospitality supplies.

## Delivery principles

- Launch a narrow, reliable core before expanding the marketplace.
- Treat availability, pricing, payment, cancellation, and payouts as first-class product areas.
- Keep the guest booking flow simple even as the underlying platform becomes more capable.
- Use real partner operations to validate assumptions early.
- Every milestone should produce a demonstrable and testable outcome.
- Do not onboard more service categories than the team can support operationally.

## Suggested release sequence

| Phase | Milestone | Primary outcome |
|---|---|---|
| 0 | Product alignment and validation | Confirm the first market, users, and launch assumptions |
| 1 | Platform foundation | Establish the production-ready technical base |
| 2 | Guest booking MVP | Guests can search, book, pay, and manage a reservation |
| 3 | Partner MVP | Hotels can manage inventory, rates, bookings, and basic performance |
| 4 | Stay extensions | Guests can purchase selected services around a stay |
| 5 | Partner services | Menetap/UPSCALE can deliver operational services to hotels |
| 6 | Vendor marketplace | Approved vendors can list, fulfill, and get paid |
| 7 | Beta, hardening, and launch readiness | Validate the complete system with controlled users |
| 8 | Production deployment and launch | Deploy Menetap.com and operate the live platform |
| 9 | Post-launch optimization | Improve conversion, retention, margins, and reliability |

## Milestone status

| Milestone | Status | Evidence / next action |
|---|---|---|
| Phase 0 — Product alignment and validation | **Paused** | Strategy and launch preparation completed; partner recruitment and field validation remain open. |
| Phase 1 — Platform foundation | **In progress** | Foundation checklist created; next: initialize Laravel application in `app/`. |
| Phase 2 — Guest booking MVP | Not started | Depends on MVP scope and platform foundation. |
| Phase 3 — Partner MVP | Not started | Depends on partner data model and booking workflow. |
| Phase 4 — Stay extensions | Not started | Depends on confirmed providers and fulfillment rules. |
| Phase 5 — Partner services | Not started | Depends on operational service packages. |
| Phase 6 — Vendor marketplace | Not started | Later-stage scope. |
| Phase 7 — Beta and launch readiness | Not started | Depends on production MVP. |
| Phase 8 — Production deployment | Not started | Target domain: `menetap.com`. |
| Phase 9 — Post-launch optimization | Not started | Begins after controlled launch. |

---

## Phase 0 — Product alignment and validation

**Goal:** Reduce strategic and operational uncertainty before building production software.

### Tasks

- Define the initial launch market.
  - Select the first geography or city cluster.
  - Define the initial hotel segment: independent hotels, boutique hotels, villas, or another focused segment.
  - Decide whether the first inventory is manually onboarded, integrated, or both.
- Define the MVP promise.
  - Confirm that the first guest promise is hotel booking with transparent pricing.
  - Select the first one to three stay extensions.
  - Define which services are explicitly out of scope for launch.
- Interview users.
  - Interview prospective guests about booking pain points and add-on needs.
  - Interview hotel operators about distribution, reservation, revenue, and operations problems.
  - Interview potential vendors about fulfillment, availability, pricing, and payout requirements.
- Define the operating model.
  - Decide who owns guest support.
  - Decide who owns refunds, cancellations, and service failures.
  - Define hotel and vendor onboarding responsibilities.
  - Define service-level expectations.
- Establish initial commercial assumptions.
  - Booking commission model.
  - Partner service pricing.
  - Vendor commission or margin model.
  - Payment and payout timing.
- Create the initial product backlog and prioritization framework.

### Deliverables

- Validated product brief
- Target customer profiles
- Initial service catalog
- MVP scope and exclusions
- Initial unit economics model
- Launch assumptions and risks register

### Exit criteria

- At least three to five target hotel partners agree to participate in the pilot.
- The first guest booking flow and first add-on category are clearly defined.
- Ownership of support, fulfillment, refunds, and payouts is documented.

---

## Phase 1 — Platform foundation

**Goal:** Build the foundation required for secure, maintainable product development.

### Tasks

- Establish the application architecture.
  - Choose frontend and backend stack.
  - Define web, API, database, background-job, and admin boundaries.
  - Define environments: local, development, staging, and production.
- Set up the codebase and engineering workflow.
  - Initialize repositories and branch strategy.
  - Configure formatting, linting, type checking, and testing.
  - Add CI checks for pull requests.
  - Document local development and deployment procedures.
- Design the core data model.
  - Users and roles.
  - Hotels/properties.
  - Room types and units.
  - Availability and rate plans.
  - Reservations.
  - Payments, refunds, and payouts.
  - Services, vendors, and orders.
  - Audit events and support cases.
- Implement identity and access control.
  - Guest account.
  - Partner account.
  - Vendor account.
  - Admin and support roles.
  - Role-based permissions.
- Establish security basics.
  - Secrets management.
  - Secure session handling.
  - Input validation.
  - Rate limiting.
  - Audit logging.
  - Backup and recovery policy.
- Set up observability.
  - Application error tracking.
  - Structured logs.
  - Uptime monitoring.
  - Product analytics events.

### Deliverables

- Running development and staging environments
- Initial database schema
- Authentication and role model
- CI pipeline
- Technical architecture documentation
- Security and backup baseline

### Exit criteria

- A test user can sign in under each supported role.
- A test property, room, rate, and reservation can be created through the API or admin tools.
- Deployments to staging are repeatable.

---

## Phase 2 — Guest booking MVP

**Goal:** Enable a guest to discover a property and complete a reliable room booking.

### Guest experience tasks

- Build the public landing page.
  - Destination search.
  - Dates and guest count.
  - Primary booking call to action.
  - Menetap and UPSCALE positioning.
- Build search results.
  - Location, dates, and guest filters.
  - Sort options.
  - Price display.
  - Availability status.
  - Responsive mobile layout.
- Build hotel detail pages.
  - Property overview.
  - Photos.
  - Amenities.
  - Policies.
  - Room types.
  - Price and availability.
  - Location and basic transport information.
- Build room selection.
  - Rate plan selection.
  - Occupancy rules.
  - Cancellation policy display.
  - Price breakdown.
- Build checkout.
  - Guest details.
  - Contact information.
  - Payment method.
  - Terms and cancellation acknowledgement.
  - Final price confirmation.
- Build post-booking experience.
  - Confirmation page.
  - Confirmation email.
  - Booking reference.
  - Trip detail page.
  - Cancellation request flow.
- Add account basics.
  - Registration and login.
  - Password reset.
  - Profile details.
  - Booking history.

### Commerce and operations tasks

- Implement availability search.
- Implement temporary inventory hold during checkout.
- Implement reservation creation and state transitions.
- Integrate the selected payment provider.
- Implement payment success, failure, timeout, and retry states.
- Implement cancellation and refund rules for the initial product.
- Send transactional email notifications.
- Add basic support tooling for locating and updating reservations.

### Quality tasks

- Test search and pricing across mobile and desktop.
- Test duplicate checkout attempts.
- Test payment failure and recovery.
- Test cancellation edge cases.
- Test timezone and date handling.
- Test accessibility for the core booking flow.

### Exit criteria

- A guest can complete a real or sandbox booking end to end.
- The hotel/partner receives the reservation reliably.
- The guest receives a confirmation and can view the booking.
- Payment, cancellation, and support paths are documented and tested.

---

## Phase 3 — Partner MVP

**Goal:** Give hotel partners enough control to supply and manage reliable inventory.

### Partner onboarding

- Build partner registration and application flow.
- Create property profile setup.
  - Property information.
  - Address and location.
  - Photos.
  - Amenities.
  - Policies.
  - Contact details.
- Add admin review and approval workflow.
- Add partner terms and payout details.

### Inventory and rates

- Create room types.
- Configure room capacity and bed information.
- Configure availability.
- Configure base rates and rate plans.
- Configure restrictions.
  - Minimum stay.
  - Closed dates.
  - Stop sell.
  - Booking window.
- Add bulk calendar updates where practical.

### Reservation operations

- Partner reservation list.
- Reservation detail page.
- New booking notifications.
- Reservation status updates.
- Guest contact and special-request visibility.
- Cancellation and no-show status handling.

### Reporting

- Booking count and gross booking value.
- Occupancy overview where data is available.
- Revenue overview.
- Upcoming arrivals and departures.
- Exportable reservation report.

### Exit criteria

- A partner can onboard a property without engineering assistance.
- A partner can manage initial availability and rates.
- A partner can receive, view, and act on reservations.
- Menetap operations can audit changes and resolve common booking issues.

---

## Phase 4 — Stay extensions

**Goal:** Increase guest value and Menetap revenue by adding useful services around the room booking.

### Initial service selection

Prioritize services that are operationally simple and strongly related to the stay:

- Breakfast
- Airport transfer
- Early check-in or late checkout
- Car or motorbike rental
- One carefully selected local experience category

### Tasks

- Define service catalog model.
  - Service type.
  - Provider.
  - Price.
  - Availability.
  - Service area.
  - Cutoff time.
  - Cancellation policy.
- Add services to the guest journey.
  - Hotel detail page.
  - Checkout.
  - Confirmation page.
  - Trip detail page.
  - During-stay experience.
- Add service order management.
  - Order status.
  - Confirmation.
  - Fulfillment owner.
  - Guest instructions.
  - Exception handling.
- Add service payments and refunds.
- Add provider notifications.
- Add guest reminders.
- Track add-on attach rate and fulfillment quality.

### Exit criteria

- Guests can purchase at least one add-on without disrupting the room booking flow.
- The responsible partner or vendor receives the order.
- Cancellations, refunds, and service failures have documented handling procedures.

---

## Phase 5 — Partner services powered by UPSCALE

**Goal:** Turn Menetap into a meaningful operating and growth platform for hotel partners.

### Service areas

- Central reservation service
- Revenue management
- Housekeeping and turnover cleaning
- Photography and listing optimization
- Guest communication support
- Property setup and content management

### Tasks

- Create partner service catalog and packages.
- Build service request workflow.
  - Request creation.
  - Scope and quote.
  - Approval.
  - Assignment.
  - Delivery.
  - Completion confirmation.
- Define operational SLAs.
- Assign internal or external service teams.
- Add service tickets and activity history.
- Add recurring service schedules where needed.
- Add invoicing and payment tracking.
- Add partner satisfaction and service-quality feedback.
- Add performance reports showing business impact.

### Exit criteria

- A partner can request and track a service.
- Operations can assign, deliver, and close the service.
- Commercial terms, billing, and service-level expectations are clear.
- At least one service has a repeatable delivery playbook.

---

## Phase 6 — Vendor marketplace

**Goal:** Create a controlled network of approved vendors for guest services, hotel operations, and hospitality supplies.

### Vendor onboarding

- Vendor registration and application.
- Business verification.
- Service or product catalog setup.
- Coverage area and operating hours.
- Pricing and availability.
- Bank and payout details.
- Terms, quality standards, and service-level agreements.

### Vendor operations

- Vendor dashboard.
- New order notifications.
- Accept, reject, or request clarification.
- Fulfillment status updates.
- Proof of fulfillment where appropriate.
- Issue and cancellation handling.
- Payout statement.

### Supply marketplace

- Product catalog for amenities and hotel supplies.
- Search and category browsing.
- Minimum order quantities.
- Delivery and fulfillment rules.
- Purchase order workflow.
- Partner reorder capability.

### Trust and quality

- Vendor approval states.
- Ratings or internal quality score.
- Service incident tracking.
- Vendor suspension and reinstatement.
- Backup provider process for critical services.

### Exit criteria

- Approved vendors can receive and fulfill orders.
- Menetap can track quality, disputes, commissions, and payouts.
- Vendors do not enter the marketplace without verification and clear accountability.

---

## Phase 7 — Beta, hardening, and launch readiness

**Goal:** Validate the complete system with controlled real-world usage before public launch.

### Beta setup

- Select a limited set of hotel partners.
- Load verified inventory and rates.
- Invite a controlled group of guests.
- Select a small number of approved service providers.
- Establish a daily operating review.

### Product hardening

- Resolve critical booking and payment defects.
- Test peak search and checkout load.
- Test failed provider responses and delayed confirmations.
- Verify cancellation and refund accuracy.
- Verify emails, notifications, and reminders.
- Verify role permissions and data isolation.
- Test mobile browsers and supported desktop browsers.
- Complete accessibility review for core journeys.

### Business readiness

- Finalize legal documents.
  - Terms of service.
  - Privacy policy.
  - Cancellation policy.
  - Partner agreement.
  - Vendor agreement.
- Finalize pricing, commissions, and payout rules.
- Prepare support scripts and escalation matrix.
- Prepare partner onboarding materials.
- Prepare vendor quality checklist.
- Prepare incident response and business continuity plan.
- Configure analytics dashboards.

### Exit criteria

- Beta bookings complete successfully at an acceptable rate.
- No unresolved critical security, payment, or data-integrity issue remains.
- The team can support guests, partners, and vendors during live operations.
- Go-live approval is documented.

---

## Phase 8 — Production deployment and launch

**Goal:** Deploy Menetap safely to `menetap.com` and begin live operations.

### Infrastructure and domain tasks

- Provision production hosting and database.
- Configure production secrets and environment variables.
- Configure CDN, caching, and asset delivery.
- Configure DNS for `menetap.com`.
- Configure SSL/TLS certificates.
- Configure production email delivery.
- Configure payment provider production credentials.
- Configure storage for property photos and documents.
- Configure backups and retention.
- Configure monitoring, alerting, and uptime checks.

### Release tasks

- Create production release candidate.
- Run database migrations against a production copy or validated staging data.
- Load approved hotels, room types, policies, and rates.
- Verify payment webhooks and transactional email domains.
- Run smoke tests in production.
- Verify guest booking, partner reservation, admin support, and cancellation flows.
- Confirm rollback procedure.
- Freeze non-critical changes during launch window.

### Launch tasks

- Publish the production site.
- Open selected inventory for bookings.
- Activate support coverage.
- Monitor bookings, payment events, errors, and response times.
- Conduct launch-day partner and vendor check-ins.
- Record incidents and decisions in a launch log.

### Deployment acceptance checklist

- `https://menetap.com` resolves correctly.
- SSL is valid and HTTPS redirects work.
- Guest can search and complete a booking.
- Partner receives and can view the booking.
- Payment status is recorded correctly.
- Confirmation email is delivered.
- Cancellation and refund workflows work.
- Monitoring and alerts are active.
- Backups have completed successfully.
- Support escalation contacts are available.

### Launch exit criteria

- Menetap is live for the controlled launch audience.
- First production bookings are successfully fulfilled.
- No critical launch incident is active.
- The team has a documented 7-day stabilization plan.

---

## Phase 9 — Post-launch optimization

**Goal:** Improve the economics, reliability, and usefulness of the platform using real behavior and operational data.

### First 7 days

- Review every booking and service order manually where necessary.
- Monitor payment failures and cancellation requests.
- Review support tickets and partner feedback.
- Fix launch-blocking usability issues.
- Confirm payout and reconciliation accuracy.

### First 30 days

- Analyze search-to-book conversion.
- Analyze add-on attach rate.
- Analyze partner activation and inventory freshness.
- Identify the most common support issues.
- Improve onboarding and booking copy.
- Improve pricing and service presentation.
- Interview early guests, partners, and vendors.

### First 90 days

- Expand inventory carefully.
- Add the next highest-value stay extension.
- Introduce partner performance reporting.
- Improve automated reconciliation and payout operations.
- Formalize vendor quality scoring.
- Review unit economics by customer and service category.
- Prioritize retention and repeat booking features.

---

## Cross-functional workstreams

These workstreams run across multiple phases:

### Product and design

- Maintain user journeys for guests, partners, vendors, admins, and support.
- Keep the design system consistent.
- Conduct usability testing at every major release.

### Engineering

- Maintain code quality, tests, documentation, and release discipline.
- Monitor performance, security, reliability, and technical debt.

### Operations

- Define real-world fulfillment playbooks.
- Own exceptions, refunds, disputes, and escalations.

### Commercial

- Recruit and activate hotel partners.
- Recruit and qualify vendors.
- Monitor commission, service pricing, and contribution margin.

### Legal and compliance

- Review contracts, consumer terms, privacy, payments, tax, and marketplace obligations for each launch geography.

## Recommended first release boundary

The first public release should include:

- Hotel search and detail pages
- Room selection and transparent pricing
- Guest checkout and payment
- Booking confirmation and trip management
- Basic partner inventory and reservation management
- One or two operationally reliable add-ons
- Admin support and reconciliation tools

The first release should not require the full vendor marketplace, complete hotel operations suite, or every planned service category. Those capabilities should be added after the core booking and fulfillment loop is reliable.

## Definition of success for the initial launch

Menetap has achieved a successful initial launch when:

1. Guests can reliably book a real stay.
2. Hotels receive accurate reservations and see clear commercial value.
3. Add-on services can be fulfilled without damaging trust.
4. Support can resolve common issues quickly.
5. Payments, refunds, and partner payouts reconcile correctly.
6. The team has enough data to decide what to build next.
