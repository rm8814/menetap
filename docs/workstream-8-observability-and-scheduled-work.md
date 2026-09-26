# Workstream 8 — Observability and scheduled work

## Analytics events

The privacy-safe event taxonomy is defined in `app/src/observability.ts`:

`search_submitted` → `search_result_viewed` → `property_viewed` → `room_selected` → `checkout_started` → `payment_method_selected` → `booking_created`.

Support and operational events include `support_request_submitted`. Do not send names, emails, phone numbers, payment details, booking references, or precise location data to analytics.

The current sink logs only in development. Connect an approved analytics provider after consent, retention, and CSP review.

## Structured logging

Use `logClientError` for client failures and keep server audit events in Convex `auditLogs`. Production logging must redact passwords, OTPs, tokens, cookies, authorization headers, payment details, and unnecessary guest contact data. Add a provider-specific transport only after selecting retention and access ownership.

## Uptime and errors

- [ ] Point an uptime monitor at the public frontend and Convex health query.
- [ ] Connect an error-monitoring provider to the error boundary and server failures.
- [ ] Configure alert thresholds, on-call ownership, and incident retention.

## Scheduled jobs

Required jobs once production scheduling is enabled:

- Daily: stale availability reconciliation and expired pending-transfer follow-up.
- Hourly: booking reminder eligibility and check-in/check-out reminders.
- Daily: partner payout report and operations digest.
- Weekly: audit-log retention review and failed-job report.

Jobs must be idempotent, bounded by a time window, auditable, and safe to retry. Each job should use an internal Convex mutation/action and record a run identifier, start/end time, result, and failure reason.

## Verification workflow

Run `npm run typecheck`, `npm run test`, and `npm run build`. In staging, trigger each job against seeded data, retry it, confirm no duplicate booking/add-on/payment effects, inspect audit logs, and verify failure alerts before enabling production schedules.
