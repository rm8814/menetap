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
- Frontend: React, TypeScript, Tailwind CSS, and the Menetap design system.
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
- [x] Initialize a local Convex development deployment with `npx convex dev --once`.
- [x] Link the app to the Convex cloud project `anin-w/menetap`.
- [x] Configure the cloud development deployment URL in local environment configuration.
- [x] Pin Convex to a working package version (`1.45.0`) after resolving missing runtime files in `1.46.0`.
- [x] Initialize the local Git repository.
- [x] Add GitHub Actions app check workflow.
- [x] Create GitHub repository and configure local `origin` remote.
- [ ] Create the first commit and push the application to GitHub.
- [ ] Confirm Hostinger supports static frontend hosting, custom domains, HTTPS, and deployment access.
- [ ] Configure local development environment.
- [ ] Configure `.env.example` without secrets.
- [ ] Add application README and setup instructions.
- [ ] Establish code formatting and linting conventions.
- [ ] Add baseline automated test setup.

## Workstream 2 — Environments and deployment

- [ ] Define local, staging, and production environments.
- [ ] Define environment variables and secret ownership.
- [ ] Decide deployment method: Git/SSH or Hostinger deployment workflow.
- [ ] Configure staging deployment.
- [ ] Configure production deployment placeholder.
- [ ] Document database migration and rollback procedure.
- [ ] Document release checklist.

## Workstream 3 — Core architecture

- [ ] Define application modules.
  - [ ] Identity and access
  - [ ] Properties
  - [ ] Rooms and rates
  - [ ] Availability
  - [ ] Bookings
  - [ ] Payments and manual transfers
  - [ ] Add-ons
  - [ ] Support
  - [ ] Commissions
  - [ ] Audit logs
- [ ] Define route and controller conventions.
- [ ] Define service/action class conventions.
- [ ] Define validation and authorization conventions.
- [ ] Define booking and payment state transitions.
- [ ] Define error-handling and user-facing error states.

## Workstream 4 — Database foundation

- [ ] Create initial database schema.
- [ ] Create users and roles tables.
- [ ] Create properties and partner contacts tables.
- [ ] Create rooms, rate plans, and availability tables.
- [ ] Create bookings and booking-status-history tables.
- [ ] Create payments and manual-bank-transfers tables.
- [ ] Create add-on-services and booking-add-ons tables.
- [ ] Create commissions and audit-logs tables.
- [ ] Add indexes for search, dates, booking references, and statuses.
- [ ] Create seed data for development.

## Workstream 5 — Authentication and authorization

- [ ] Implement guest registration and login.
- [ ] Implement password reset.
- [ ] Define guest, partner, vendor, support, operations, finance, and admin roles.
- [ ] Add server-side authorization policies.
- [ ] Add role-aware navigation and route protection.
- [ ] Add audit events for sensitive access and account changes.

## Workstream 6 — Design-system implementation

- [ ] Map `_ds` design tokens into the React frontend.
- [ ] Implement Menetap typography and color variables.
- [ ] Implement base layout and responsive container.
- [ ] Implement buttons, inputs, cards, badges, tags, tables, and alerts.
- [ ] Implement focus, error, loading, empty, and permission-denied states.
- [ ] Verify mobile and desktop behavior.
- [ ] Preserve the design rules documented in `AGENTS.md`.

## Workstream 7 — Security and operations baseline

- [ ] Configure HTTPS expectations.
- [ ] Configure secure session and cookie settings.
- [ ] Configure CSRF protection.
- [ ] Configure request validation and rate limiting.
- [ ] Define upload restrictions for property images and documents.
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

## Immediate next task

Initialize the React/Vite application in `app/`, then connect it to a Convex development deployment and a private GitHub repository.
