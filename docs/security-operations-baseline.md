# Menetap Security and Operations Baseline

## Status

Foundation documented; external production configuration remains open. This document separates repository controls from Hostinger, Convex, provider, and account-owner tasks.

## Implemented repository controls

- Secrets are kept in environment variables; `.env.local` is local-only and `.env.example` contains names without values.
- Convex is the server-side authorization boundary. Roles and permission helpers live in `app/convex/roles.ts` and `app/convex/authorization.ts`.
- Sensitive operational changes have an audit-log foundation. Audit records must contain the actor, action, entity, timestamp, and minimal metadata; never passwords, tokens, or full payment details.
- Guest booking remains public by design, while staff and partner access requires authenticated, server-side authorization.
- The frontend provides loading, empty, error, success, and permission-denied states without exposing stack traces or secret values.
- Payment design avoids storing raw card data. The MVP supports pay-at-hotel and manual bank transfer workflows.
- Production changes require typecheck, tests, and a production build before promotion.

## HTTPS and browser security

Production requirements:

- `menetap.com` and any required subdomain must redirect HTTP to HTTPS.
- Hostinger SSL must be active and renewed automatically.
- Convex and any email/payment endpoints must use HTTPS.
- Production responses should include security headers where Hostinger permits them: `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`, and appropriate `Strict-Transport-Security`.
- Do not add third-party scripts, fonts, analytics, or embeds without reviewing their origin and Content Security Policy impact.

Owner: Hostinger/domain administrator. Verification: browser HTTPS check and a header scan against the production domain.

## Sessions, cookies, and CSRF

- Use Convex Auth session handling; do not store session tokens in local storage.
- Production cookies must be Secure, HttpOnly where applicable, and use an intentional SameSite policy.
- All state-changing Convex mutations must validate the authenticated identity and authorization server-side.
- HTTP actions that accept browser requests must validate origin and use an explicit CSRF strategy before accepting state-changing requests.
- Do not treat a hidden UI control or client-side role as authorization.

Owner: application and Convex maintainers. Verification: anonymous rejection test, role allow/deny tests, and authenticated mutation tests.

## Validation and rate limiting

- Validate all user-provided strings, dates, guest counts, IDs, emails, booking references, and uploaded metadata at the server boundary.
- Enforce check-in/check-out ordering, guest-count limits, availability, booking state transitions, and idempotency for booking mutations.
- Rate-limit login, password reset, booking lookup, contact forms, and other externally callable actions.
- Return generic authentication and password-reset responses that do not reveal whether an account exists.
- Never log passwords, reset tokens, access tokens, payment details, or unnecessary personal data.

Owner: Convex/application maintainers. Verification: validation tests and production monitoring of rejected requests.

## Upload restrictions

Approved policy for property media and documents:

### Property images

- Accept only `.jpg`, `.jpeg`, `.png`, and `.webp` uploads.
- Reject every other file type, including SVG, HTML, executable files, archives, and office documents.
- Require a strict 4:3 aspect ratio.
- Require a minimum size of 1600 × 1200px.
- Enforce a maximum size of 3 MB per file.
- Require at least 1 image per property and allow no more than 30 images per property.
- Convert accepted images to WebP before storage; serve the converted WebP asset publicly only after explicit approval.
- Strip EXIF metadata where practical.
- Validate the decoded image rather than trusting the client-provided extension or MIME type.

### Property documents

- Accept only PDF files.
- Enforce a maximum size of 3 MB per file.
- Allow no more than 4 documents per property.
- Reject every non-PDF type and validate the decoded file signature.
- Documents are private by default.

### Access and audit requirements

- Only the property owner, authorized partner staff, operations, support, finance, and administrators may access private documents according to role and owning property.
- Guests may access only explicitly approved public property images and public-facing documents.
- Use short-lived signed URLs for private downloads; never expose permanent storage paths.
- Generate storage keys server-side and never trust a client-provided path.
- Authorize every upload, replacement, download, and deletion by role and owning entity.
- Audit log every upload, replacement, download, and deletion with actor, property, file category, result, and timestamp. Do not log file contents or sensitive document data.
- Scan files before staff or guests can download them when scanning infrastructure is available.

Owner: Convex/storage and operations maintainers. Verification: accepted/rejected fixture files, image conversion and ratio tests, file-size/count tests, authorization tests, signed-URL expiry tests, and audit-log assertions.

## Backup and restore

- Configure Convex production backup/export capability before accepting production bookings.
- Document retention, backup frequency, encryption, access ownership, and restore responsibility.
- Test restoration using a non-production deployment and record the result.
- Keep release commit SHA, schema version, and deployment time with each production release.
- Do not use manual database edits for corrections; use reviewed migrations or explicit admin mutations.

Owner: Convex project owner and operations lead. Verification: recorded restore drill and recovery target.

## Logging and sensitive-data redaction

- Log structured operational events with timestamp, environment, request/operation name, result, and correlation/reference ID where useful.
- Redact passwords, OTPs, reset tokens, cookies, authorization headers, payment details, guest contact details, and precise location data unless strictly required.
- Keep audit logs separate from diagnostic logs and restrict access by role.
- Define retention and deletion rules before production traffic.
- Do not expose server stack traces or internal IDs in guest-facing errors.

Owner: application and operations maintainers. Verification: log review using representative auth, booking, payment, and error flows.

## Error monitoring and incident response

- Select an error-monitoring provider and configure production-only reporting after reviewing data handling.
- Attach release version and environment; avoid sending sensitive form values or raw request bodies.
- Define alerts for frontend failures, Convex errors, auth failures, booking mutation failures, email failures, and elevated rejected requests.
- Document incident ownership, severity, escalation, rollback, customer communication, and post-incident review.
- Verify that Hostinger rollback and Convex rollback/migration procedures are accessible to the operations owner.

Owner: operations lead. Verification: test event in a non-production environment and a documented rollback drill.

## Open external prerequisites

- [ ] Confirm Hostinger HTTPS redirect, SSL renewal, and security-header configuration.
- [ ] Configure Convex production deployment and deploy key.
- [ ] Configure production environment variables without committing secrets.
- [ ] Configure rate limiting for auth and public actions.
- [ ] Configure production backups and complete a restore drill.
- [ ] Select and configure error monitoring and uptime monitoring.
- [ ] Define log retention and access ownership.
- [x] Define upload policy before enabling property media/document uploads; implementation and infrastructure remain open.
