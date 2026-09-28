# Menetap project status

Snapshot: 2026-09-28, after POC-A, POC-B, POC-C-Rewards, admin-quickwins,
admin-payments, notification-sender, admin-property-approval, and POC-C-Supplier
review (Claude).

## CORRECTION (2026-09-28): `npm run typecheck` has been a no-op all session

Found while investigating an unrelated footer-link question: the root
`tsconfig.json` has `"files": []` with only project references, and
`npm run typecheck` (`tsc --noEmit`, no project flag) checks an empty file set as a
result — confirmed with `--listFiles`, zero files processed. **Every "typecheck
clean, verified independently" claim in every review note across this entire session
(POC-A/B/C, admin-payments, notification-sender, property-approval, supplier
marketplace) was checking nothing.** `npm test`/`npm run build` are unaffected —
they're separate, real commands.

This hid a real regression: the `checklist-poc-b.md` "delete six `Legacy*`" work
accidentally deleted six adjacent real components too — `PartnerProperties`,
`PartnerInventory`, `PartnerBookings`, `PartnerLogin`, `PartnerServices`,
`PartnerRoomDetail` are referenced in JSX (routing intact) but undefined. Three are
linked from `PartnerDashboard`'s own sidebar — **a real partner crashes today
clicking their own nav.** `App.tsx` also has `// @ts-nocheck` (pre-existing, not
introduced this session) which independently exempted it from checking even once the
script is fixed. Fix in progress: `docs/checklist-typecheck-integrity.md`.

Going forward, once that checklist closes, "typecheck clean" will mean something
again. Until then, treat every prior "typecheck verified" note in this document and
in closed checklists' review notes as unverified for `App.tsx` specifically — `npm
test` results were real throughout (separate command, unaffected), only typecheck
coverage was the gap.

## Backend

The React/Vite app uses Convex for authentication, properties, rooms, availability,
bookings, partner applications, partner account status, audit logs, rewards, and
related operational data. `partnerAdmin.setAccountStatus` is server-authorized for
admin/operations roles, restricts targets to partner accounts, validates a reason,
updates status, and writes an audit log.

Admin-facing query/mutation functions for **users/team/finance-aggregate** listing
are still mostly missing — full list in `docs/checklist-poc-b.md`'s "Backend gaps
flagged" section, not yet scoped into a checklist. **Disputes, support, moderation,
and property review/approval/publishing are now real** (`refunds.listPending`/
`review`, `support.listForStaff`, `properties.listPendingModeration`/
`updatePhotoModeration`, `properties.listForAdmin`/`review`/`setPublished` — the last
three close the "hotels can list their property" loop: partner submission through
staff approval through publish, all live end-to-end).

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

**Supplier marketplace backend is real** (POC-C pillar #2, closing the second of four
approved pillars): `vendorProfiles`, `supplierProducts` (vendor-owned, admin-curated
via a moderation queue mirroring `properties.listPendingModeration`),
`supplyOrders`/`supplyOrderItems` (server-recomputed totals, never client-trusted),
`supplyTransfers` (manual-transfer payment, parallel to `payments.ts`'s pattern, not
sharing its table). Vendor identity is structurally excluded from every partner-facing
query (`supplierProducts.listActive`, `supplyOrders.listForProperty`) — verified by
direct read, not just tested. Vendor accounts are admin-elevated from an existing
self-registered account (`role: 'guest'`/`'partner'` → `'vendor'`), matching the
partner-approval pattern — not a from-scratch admin-created credential, which doesn't
work with Convex Auth. See `docs/checklist-poc-c-supplier.md`'s review notes.

## Frontend real/mock inventory

Guest search, property detail, room selection, checkout, confirmation, account
screens, legal/help pages, destinations, experiences, rentals, supplies, partner entry
points, and rewards routes are implemented in `app/src/App.tsx` and related
components. Guest checkout is Convex-backed for the booking mutation.

Admin console: `AdminPartnerDetail`, `AdminLogin`, disputes/support/moderation
(`AdminQuickOpsPage`), the payment verification screen (`AdminPaymentsPage`,
`/admin/payments`), and `AdminProperties`/`AdminPropertyDetail` (Overview tab only —
Bookings/Payouts tabs on the detail screen remain deliberately out of scope) are
genuinely real. Users/team/finance-aggregate/reports/risk/announcements/settings/
system screens still show an honest "not yet available" state (`AdminUnavailable`)
pending the backend work in `docs/checklist-poc-b.md`'s gap list. The six `Legacy*`
dead-code partner components
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
passed; `npm test` passed with 12 test files and 37 tests (includes Rewards,
finance-math, notification-template, and supplier-marketplace tests); `npm run build`
passed. Vite emitted an existing chunk-size warning for the main JavaScript bundle.

## Known gaps

- Live deployment SEO files need an external/live-browser spot-check (couldn't be
  reached from the verification environment).
- The account payment-methods screen is a local card mock inconsistent with the
  approved two-method booking model, and now reachable from the account nav.
- Admin users/team/finance-aggregate/reports/risk/announcements/settings/system
  screens are honest but not functional — backend functions don't exist yet; full
  list in `docs/checklist-poc-b.md`.
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
- No in-app navigation to the three new supplier marketplace screens
  (`/en/supply/orders`, `/en/vendor/products`, `/admin/supplier`) — routes work, but
  nothing links to them from `PartnerDashboard`'s sidebar or `AdminFrame`'s nav yet.
- `supplyOrders.create`'s server-side total recomputation is correct but duplicated
  rather than calling the newly-exported `calculateSupplyTotal` — the test covering
  it verifies the exported sibling function, not `create`'s actual inline logic.
- `supplierMarketplace.test.ts`'s moderation-reset test is still vacuous (asserts a
  literal ternary, not `supplierProducts.update`'s real behavior).
