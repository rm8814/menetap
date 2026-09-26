# Workstream 7 operations runbook

## Repository controls completed

- Admin and partner route families must be rendered behind authenticated role gates before production launch.
- Convex authorization helpers now provide `getCurrentUser` and `requireRole` for server-side checks.
- Support intake validates and trims user input and applies a one-minute per-email cooldown.
- Booking creation validates dates, guest identity, guest count, room capacity, and email format server-side.
- The React entry point includes a recoverable error boundary with a safe user-facing fallback.
- Staff support access is exposed only through the protected `support.listForStaff` query.
- Pure policy tests cover property, booking, payment, and user role boundaries.
- Hostinger Apache deployments receive HTTPS redirect and baseline security headers through `app/public/.htaccess`.

## Production verification still required

- [ ] Confirm Hostinger applies `.htaccess` and verify HTTPS redirect, HSTS, CSP decision, and TLS renewal.
- [ ] Set `CONVEX_DEPLOY_KEY` in GitHub and run the production Convex deployment workflow.
- [ ] Configure production environment variables in Convex and Hostinger; never commit them.
- [ ] Configure scheduled Convex backups and complete a restore drill.
- [ ] Connect an error-monitoring provider and uptime check to the health endpoint.
- [ ] Configure production cookie/session settings in the Convex/Hostinger deployment and verify with browser security inspection.
- [ ] Add edge/WAF rate limits for authentication, booking creation, and password reset traffic.
- [ ] Configure upload scanning and private storage access before enabling partner uploads.
- [ ] Review rate limits with real traffic limits; add edge/WAF protection for auth and booking endpoints.
- [ ] Define log retention, redaction, and access ownership.

## Release checks

Run `npm run typecheck`, `npm run test`, `npm run build`, then manually smoke-test guest booking, partner access, admin access, payment status, support submission, and sign-out in staging before production.
