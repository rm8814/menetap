# Menetap project status

Snapshot: 2026-09-28, after POC-A, POC-B, POC-C-Rewards, admin-quickwins,
admin-payments, and notification-sender review (Claude).

## Backend

The React/Vite app uses Convex for authentication, properties, rooms, availability,
bookings, partner applications, partner account status, audit logs, rewards, and
related operational data. `partnerAdmin.setAccountStatus` is server-authorized for
admin/operations roles, restricts targets to partner accounts, validates a reason,
updates status, and writes an audit log.

Admin-facing query/mutation functions for **properties/users/team/finance-aggregate**
listing are still mostly missing — full list in `docs/checklist-poc-b.md`'s "Backend
gaps flagged" section, not yet scoped into a checklist. **Disputes, support, and
moderation are now real** (`refunds.listPending`/`review`, `support.listForStaff`,
`properties.listPendingModeration`/`updatePhotoModeration`).

**Payment collection and commission pipeline is now real**, closing the critical gap
this section previously flagged: `payments.ts` (guest transfer submission, admin
verify/reject), `commissions.ts` (guarded calculation, triggered from both payment
paths), `payoutStatements.generate` (draft statement creation, settles commissions).
`platformConfig` holds the bank details and default commission rate (10%). **Not yet
production-usable:** the seeded bank account details are an explicit placeholder
(`'PENDING — REAL BANK DETAILS NEEDED'`) — real account info is a business input still
needed, not a code task. See `docs/checklist-admin-payments.md`'s review notes.

**Booking-related email now actually sends.** `convex/notifications.ts`'s `send`
action (Resend, same pattern as `ResendOTPPasswordReset.ts`) is triggered at all five
`bookingNotifications` queue sites (`bookings.ts` x3, `bookingStatus.ts`,
`payments.ts`). This closes what was the biggest remaining gap before Alpha — guests
previously got no email at all. See `docs/checklist-notification-sender.md`'s review
notes.

Rewards backend is real: `rewardsAccounts`/`rewardsLedger`/`rewardsConfig` tables,
`convex/rewards.ts` (earn/redeem/expire/admin functions), and a daily cron
(`convex/crons.ts`) sweep points on each account's 12-month anniversary. Redemption is
server-verified — `bookings.create` takes a `pointsToRedeem` count and independently
computes the discount from the guest's real balance and server-side config in the same
transactional mutation as the booking insert, so there's no client-trusted-discount
path and no window where points can be spent without a booking existing (fixed and
re-verified 2026-09-28, see `docs/checklist-poc-c-rewards.md`'s review notes).

## Frontend real/mock inventory

Guest search, property detail, room selection, checkout, confirmation, account
screens, legal/help pages, destinations, experiences, rentals, supplies, partner entry
points, and rewards routes are implemented in `app/src/App.tsx` and related
components. Guest checkout is Convex-backed for the booking mutation.

Admin console: `AdminPartnerDetail`, `AdminLogin`, disputes/support/moderation
(`AdminQuickOpsPage`), and the new payment verification screen (`AdminPaymentsPage`,
`/admin/payments`) are genuinely real. Properties/users/team/finance-aggregate/
reports/risk/announcements/settings/system screens still show an honest "not yet
available" state (`AdminUnavailable`) pending the backend work in
`docs/checklist-poc-b.md`'s gap list. The six `Legacy*` dead-code partner components
were deleted. ~15 now-unreferenced mock admin component definitions (their original
fake data) remain in `App.tsx` as dead code — flagged for a follow-up cleanup pass,
tracked in `docs/checklist-poc-b.md`'s review notes.

## Authentication

Convex Auth provides the guest password flow. `/en/login`, `/en/signup`, `/en/reset-password`, and equivalent `/id/...` paths open `AuthPanel` directly in the requested mode. Partner and admin routes have separate entry points and protected screens.

## Payments

The real booking path and Convex schema support only `pay_at_hotel` and
`manual_bank_transfer`. The guest `PaymentMethods` screen is still a local
card-management mock and does not represent a real supported gateway or stored-card
backend — it's now reachable from the account nav (POC-A fixed the dead link), so this
is more visible than before and worth cleaning up soon.

Rewards redemption's discount-trust issue is resolved — see Backend section above.

## SEO

`app/src/seo.ts` applies canonical URLs, language metadata, robots directives, Open Graph metadata, and route-level noindex rules. `app/public/robots.txt` disallows private operational routes and points to the sitemap. `app/scripts/generate-sitemap.mjs` generates public URLs from published, non-demo properties. The live files could not be reached from the verification environment, so live parity is unverified.

## Verification baseline

From `app/`, verified independently by Claude on 2026-09-28: `npm run typecheck`
passed; `npm test` passed with 10 test files and 33 tests (includes Rewards,
finance-math, and notification-template tests); `npm run build` passed. Vite emitted
an existing chunk-size warning for the main JavaScript bundle.

## Known gaps

- Live deployment SEO files need an external/live-browser spot-check (couldn't be
  reached from the verification environment).
- The account payment-methods screen is a local card mock inconsistent with the
  approved two-method booking model, and now reachable from the account nav.
- Admin properties/users/team/finance-aggregate/reports/risk/announcements/settings/
  system screens are honest but not functional — backend functions don't exist yet;
  full list in `docs/checklist-poc-b.md`.
- Bank transfer instructions are an explicit placeholder
  (`'PENDING — REAL BANK DETAILS NEEDED'`) — real Menetap bank account details are a
  business input still needed before manual-transfer bookings can go live.
- `AdminPaymentsPage`'s reject action sends a hardcoded canned reason instead of a
  real staff-typed note — backend supports a real reason, UI doesn't expose it yet.
- ~15 orphaned mock admin component definitions are dead code in `App.tsx`, no longer
  referenced by routing but not yet deleted.
- `rewards.redeemAtCheckout` is unused dead code since redemption moved into
  `bookings.create` — harmless, optional cleanup.
- `'adminPayments'` isn't in the `GuestScreen` type union; two `as GuestScreen` casts
  work around it instead of extending the union — one-line fix, optional.
- Two trivial test-coverage gaps in `notificationTemplates.test.ts` (one vacuous
  assertion, one untested fallback path) — see `docs/checklist-notification-sender.md`
  review notes. Not functional defects.
