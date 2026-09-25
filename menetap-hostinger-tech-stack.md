# Menetap Hostinger + Convex MVP Technical Stack

## Decision status

**Recommended for MVP planning.** This document records the recommended technology stack for deploying Menetap's first production MVP on Hostinger shared hosting.

## Recommendation

Use a Convex-backed web application:

> React/Vite + TypeScript + Convex + GitHub + Hostinger static hosting

This stack is optimized for rapid MVP development, real-time workflows, Git-based collaboration, and Menetap's first 20-property pilot.

## Technology choices

| Layer | Choice | Purpose |
|---|---|---|
| Backend | Convex | Database, queries, mutations, actions, scheduled functions |
| Language | TypeScript | Frontend and Convex backend code |
| Database | Convex document database | Users, properties, rooms, availability, bookings, payments |
| Frontend | React + Vite | Guest, partner, vendor, and admin interfaces |
| Styling | Tailwind CSS | Responsive UI and design-system implementation |
| Authentication | Convex-compatible auth provider | Login, registration, password reset, sessions |
| Scheduled work | Convex scheduled functions and cron jobs | Reminders, expiry checks, reports, maintenance |
| Source control | GitHub | Repository, issues, pull requests, branch protection, history |
| CI/CD | GitHub Actions + Convex CLI | Type checks, tests, builds, preview and production deployment |
| Email | Transactional email provider | Booking and partner notifications |
| File storage | Convex Storage initially | Property photos and documents |
| Analytics | Plausible, Matomo, or Google Analytics | Acquisition and conversion measurement |
| Error tracking | Sentry or server logging | Runtime and production issue monitoring |

## Application areas

- Guest website: homepage, search, property details, room selection, checkout, and trips.
- Partner portal: property profile, rooms, rates, availability, reservations, and guest requests.
- Admin console: property approval, listing moderation, bookings, payments, commissions, and support.
- Service operations: transfer orders, breakfast orders, add-ons, and fulfillment.

## Initial database tables

`users`, `roles`, `properties`, `property_contacts`, `property_documents`, `room_types`, `rate_plans`, `availability`, `bookings`, `booking_guests`, `booking_status_history`, `payments`, `manual_bank_transfers`, `commissions`, `add_on_services`, `booking_add_ons`, `service_providers`, `support_tickets`, and `audit_logs`.

Availability must be date-specific with fields for property, room type, date, total units, available units, rate, and status. This supports the requirement that each live property maintains the next 30 days of availability.

## MVP payment model

- Primary method: guest pays at the hotel.
- Alternative: manual bank transfer handled by Menetap.
- Menetap records transfer reference, amount, date, evidence, and verification status.
- No payment gateway is required for the MVP.
- Add a payment gateway after booking, reconciliation, and refund rules are validated.

## Hosting architecture

`menetap.com` → React/Vite static frontend on Hostinger → Convex Cloud backend/database, Convex Storage, scheduled functions, email, and HTTPS/SSL.

Use Convex scheduled functions and cron jobs for booking reminders, availability checks, expired manual payment requests, partner reminders, daily reports, failed email retries, cleanup, and operational follow-ups.

## Avoid in the first shared-hosting MVP

- MongoDB or PostgreSQL hosted directly on Hostinger
- Redis-dependent architecture
- Kubernetes or microservices
- WebSockets and heavy always-running workers
- Next.js server deployment
- Separate React frontend unless it is only a static build
- PMS, channel-manager, or RMS integrations
- Payment gateway integration before the workflow is validated

## Hostinger frontend constraints

Hostinger will serve the built static frontend. Convex will handle backend compute, database resources, scheduled work, and real-time updates. This avoids requiring a persistent Node.js server on shared hosting.

## Security requirements

- Store secrets in environment variables, never in source control.
- Use HTTPS everywhere and framework password hashing.
- Enforce server-side authorization for admin, partner, vendor, finance, and support routes.
- Do not store raw card data.
- Validate uploaded images and documents.
- Rate-limit authentication and sensitive actions.
- Audit booking, payment, refund, availability, commission, and access changes.
- Back up the database and verify restoration procedures.
- Avoid logging passwords, payment data, access tokens, or unnecessary personal data.

## Deployment checklist

- [ ] Confirm Hostinger supports static frontend hosting, custom domains, HTTPS, and deployment access.
- [ ] Create the Convex project and development/production deployments.
- [ ] Create the private GitHub repository.
- [ ] Configure GitHub Actions and Convex deploy keys.
- [ ] Create local, staging, and production configuration.
- [ ] Configure `menetap.com` DNS and HTTPS.
- [ ] Create the production MySQL database and restricted credentials.
- [ ] Configure application secrets, SMTP, and sender-domain authentication.
- [ ] Configure image/document storage.
- [ ] Configure Cron Jobs and backups.
- [ ] Configure monitoring and error logging.
- [ ] Run production smoke tests.
- [ ] Verify guest booking, partner reservations, payment status, confirmation email, cancellation, and support workflows.
- [ ] Verify rollback procedures.

## Upgrade path

1. Hostinger static frontend + Convex Free
2. Convex paid plan as usage grows
3. Hostinger Cloud or VPS for greater frontend/build control
4. External object storage, payment, messaging, and search services
5. Convex self-hosting or a separate backend only if required by scale, compliance, cost, or control

Keep the React/Convex application modular so storage, email, payments, and backend services can be changed independently later.

## Decision summary

For the Greater Yogyakarta pilot, use a React/Vite TypeScript frontend hosted on Hostinger, with Convex as backend and database, and GitHub as source control and CI/CD. Keep payment manual, inventory onboarding assisted, and operations auditable.
