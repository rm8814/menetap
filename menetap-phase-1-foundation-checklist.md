# Menetap Phase 1 — Platform Foundation Checklist

## Status

**In progress — foundation planning and workspace setup started.**

Phase 0 is intentionally paused. Its remaining partner recruitment and validation tasks remain open and are not treated as complete.

### Environment check

- [x] Confirmed Node.js is available: v25.7.0.
- [x] Confirmed npm is available: v11.19.0.
- [x] Confirmed Windows `winget` is available for potential tool installation.
- [x] PHP/Composer are no longer required for the selected Convex/React stack.

**Previous blocker resolved by stack decision:** the project is no longer using Laravel/MySQL for the MVP foundation.

## Phase 1 objective

Establish a secure, maintainable, production-oriented technical foundation for the Menetap MVP on Hostinger-compatible infrastructure.

## Foundation decisions

- Application style: React/Vite frontend with Convex backend.
- Backend: Convex.
- Frontend: React, TypeScript, Vite, CSS, and the Menetap design system.
- Database: Convex document database.
- Hosting target: Hostinger static frontend hosting plus Convex Cloud.
- Source control and CI/CD: GitHub and GitHub Actions.
- Initial payment model: pay at hotel and manual bank transfer.
- Initial deployment domain: `menetap.com`.
- Production application workspace: `app/`.

## Workstream 1 — Application initialization

- [x] Create React/Vite application inside `app/`.
- [x] Create initial React/Vite/TypeScript application scaffold inside `app/`.
- [x] Add initial Menetap landing shell and design-system-aligned styles.
- [x] Add `.env.example`, `.gitignore`, and Convex backend placeholder.
- [x] Install npm dependencies and generate `package-lock.json`.
- [x] Run the first typecheck successfully.
- [x] Run the first production build successfully.
- [x] Migrate the initial guest flow structure from DC designs into React.
- [x] Initialize a local Convex development deployment with `npx convex dev --once`.
- [x] Link the app to the Convex cloud project `anin-w/menetap`.
- [x] Configure the cloud development deployment URL in local environment configuration.
- [x] Pin Convex to a working package version (`1.45.0`) after resolving missing runtime files in `1.46.0`.
- [x] Initialize the local Git repository.
- [x] Add GitHub Actions app check workflow.
- [x] Create GitHub repository and configure local `origin` remote.
- [x] Create the first commit and push the application to GitHub.
- [x] Confirm Hostinger supports static frontend hosting, custom domains, HTTPS, and GitHub-connected deployment configuration.
- [x] Configure local Convex development environment.
- [x] Configure `.env.example` without secrets.
- [x] Add application README and setup instructions.
- [x] Establish linting conventions and configure ESLint with the TypeScript parser and React rules.
- [x] Add baseline automated test setup with Vitest.
- [x] Verify ESLint passes after adding TypeScript-aware parsing, browser/runtime globals, and intentional rule exceptions.
- [x] Verify Vitest passes with 2 tests.

## Workstream 2 — Environments and deployment

- [x] Define local, preview, staging, and production environments.
- [x] Define environment variables and secret ownership.
- [x] Decide deployment method: GitHub `main` → Hostinger connected deployment workflow; Convex backend deployment through GitHub Actions.
- [ ] Configure staging deployment (staging branch and automated checks are ready; preview-host deployment is intentionally deferred).
- [x] Configure production deployment path; verified commits are pushed to GitHub `main` for Hostinger to publish, while live-site confirmation and Convex production credentials remain pending.
- [x] Document database migration and rollback procedure.
- [x] Document release environment rules in `docs/deployment-environments.md`.
- [x] Create the pages and workflows inventory in `docs/pages-and-workflows-checklist.md`.

## Workstream 3 — Core architecture

- [x] Define application modules and initial Convex files.
-  - [x] Identity and access
-  - [x] Properties
-  - [x] Rooms and rates
-  - [x] Availability
-  - [x] Bookings
-  - [x] Payments and manual transfers
-  - [x] Add-ons
-  - [x] Support
-  - [x] Commissions
-  - [x] Audit logs
- [x] Define route and controller conventions in `docs/architecture-conventions.md`.
- [x] Define service/action conventions in `docs/architecture-conventions.md`.
- [x] Define validation and authorization helper conventions.
- [x] Define booking and payment state transitions.
- [x] Define error-handling and user-facing error-state conventions in `docs/architecture-conventions.md`.

## Workstream 4 — Database foundation

- [x] Create initial Convex schema.
- [x] Add published-property queries for guest search and property detail.
- [x] Add room inventory query for property detail to room selection.
- [x] Add real booking mutation with availability validation and inventory decrement.
- [x] Connect checkout to Convex booking creation.
- [x] Load booking confirmation data from Convex.
- [x] Seed one Greater Yogyakarta demo property with 30 days of availability.
- [x] Create users and roles model.
- [x] Create properties and partner contacts model.
- [x] Create rooms, rate plans, and availability model.
- [x] Create bookings and booking-status-history model.
- [x] Create payments and manual-bank-transfers model.
- [x] Create add-on-services and booking-add-ons model.
- [x] Create commissions and audit-logs model.
- [x] Add indexes for search, dates, booking references, and statuses.
- [x] Create idempotent development seed data for the Greater Yogyakarta property, room inventory, 30-day availability, and MVP add-on services.

## Workstream 5 — Authentication and authorization

- [x] Implement guest registration and login with Convex Auth email/password provider.
- [ ] Implement password reset; UI and Resend integration are present, but delivery secrets and end-to-end verification remain.
- [x] Define guest, partner, vendor, support, operations, finance, and admin roles.
- [x] Add authorization helper foundations.
- [ ] Add role-aware navigation and route protection; authenticated session state and reusable `RoleGate` are present, but protected staff routes are not yet built.
- [x] Add the central audit-event recording helper and retain required sensitive-event policy in `docs/authentication-authorization.md`; broader staff-event coverage will expand with staff workflows.

## Workstream 6 — Design-system implementation

- [x] Map initial `_ds` design direction into the React frontend.
- [x] Implement Menetap typography and color variables.
- [x] Implement base layout and responsive container.
- [x] Implement initial buttons, inputs, and status primitives.
- [x] Implement initial guest-flow layouts: homepage, search, detail, rooms, checkout, confirmation.
- [x] Implement focus, error, loading, empty, success, and permission-denied states across the frontend foundation.
- [x] Verify responsive behavior through CSS breakpoints and production build review; detailed pixel comparison against every DC screen remains ongoing.
- [x] Preserve the design rules documented in `AGENTS.md`; current React tokens, typography, responsive layout, focus states, hover motion, and surface treatment follow the Menetap design rules.
- [x] Implement a reusable `PropertyCard` pattern across homepage stay sections and search results with photography, property type, identity, location, ratings, amenities, pricing, badges, and booking actions.
- [x] Document and implement homepage/search-widget refinements: local-date defaults, click-to-select calendar inputs, outside-click guest-selector dismissal, trust-strip typography, footer controls, and aligned price-alert controls.

## Workstream 7 — Security and operations baseline

- [x] Document HTTPS, session, CSRF, validation, uploads, backup, logging, and monitoring requirements in `docs/security-operations-baseline.md`.
- [ ] Configure HTTPS expectations.
- [ ] Configure secure session and cookie settings.
- [ ] Configure CSRF protection.
- [ ] Configure request validation and rate limiting.
- [x] Define upload restrictions for property images and documents in `docs/security-operations-baseline.md`; implementation and scanning infrastructure remain open.
- [ ] Define backup and restore process.
- [ ] Define log retention and sensitive-data redaction.
- [ ] Configure application error monitoring.

## Workstream 8 — Observability and scheduled work

- [ ] Define core analytics events.
- [ ] Define structured application logging.
- [ ] Define uptime and error monitoring.
- [ ] Define Cron Jobs for reminders, stale availability, manual transfer follow-up, and reports.
- [ ] Document how scheduled tasks are tested locally and in staging.

## Phase 1 exit criteria

Phase 1 is complete when:

- [ ] The React/Vite application runs locally from `app/`.
- [ ] A staging deployment is repeatable.
- [ ] The database schema and migrations exist.
- [ ] Role-based authentication and authorization work.
- [ ] The design-system foundation is implemented.
- [ ] Security, backup, logging, and monitoring baselines are documented.
- [ ] A test user, property, room, rate, and booking can be created in development.
- [ ] Phase 2 guest-booking MVP work can begin without reworking the foundation.

## Immediate next tasks

- [x] Add a compact in-place search widget to the top of search results.
- [x] Style the results-page widget as a full pill with free-text destination input and icon-only search action.
- [x] Hide mini-widget labels visually without removing accessibility semantics, and right-align its search action.
- [x] Refine mini-widget destination inset, remove the pre-search divider, and center the search icon.
- [x] Place the search-results back link below the mini widget and above the page heading.
- [x] Add data-backed destination suggestions for published properties and areas, with exact-property routing from both widgets and city-filter fallback.
- [x] Align amenity tag geometry with the verified-rating pill reference while retaining violet status styling.
- [x] `npm run typecheck` and `npm run lint` pass for the compact search widget change.
- [~] `npm test -- --run` could not start in the restricted Windows environment (`spawn EPERM` while loading Vitest config).

1. Confirm the latest `main` deployment is live on `menetap.com` and verify the homepage booking controls in a real browser.
2. Complete production Convex credentials, staging deployment configuration, and security/observability baselines before production traffic.
3. Add deeper validation and authorization tests for booking, role, and sensitive operational flows.
