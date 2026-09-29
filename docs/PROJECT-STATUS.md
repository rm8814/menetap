# Menetap project status

Snapshot: 2026-09-30 (guest-area real-data sweep, commits through `0101ab9`, folded
in; earlier sections dated 2026-09-28), after POC-A, POC-B, POC-C-Rewards, admin-quickwins,
admin-payments, notification-sender, admin-property-approval, and POC-C-Supplier
review (Claude).

## RESOLVED (2026-09-28): `npm run typecheck` was a no-op all session — now fixed

Found while investigating an unrelated footer-link question, and now fixed and
independently re-verified (`docs/checklist-typecheck-integrity.md`): the root
`tsconfig.json` had `"files": []` with only project references, so
`npm run typecheck` (`tsc --noEmit`, no project flag) checked an empty file set —
confirmed at the time with `--listFiles`, zero files processed. **Every "typecheck
clean, verified independently" claim in every review note before this fix (POC-A/B/C,
admin-payments, notification-sender, property-approval, supplier marketplace) was
checking nothing.** `npm test`/`npm run build` were unaffected throughout — separate,
real commands.

This had hidden a real regression: `checklist-poc-b.md`'s "delete six `Legacy*`" work
had accidentally deleted six adjacent real components too — `PartnerProperties`,
`PartnerInventory`, `PartnerBookings`, `PartnerLogin`, `PartnerServices`,
`PartnerRoomDetail` were referenced in JSX (routing intact) but undefined, and three
were linked from `PartnerDashboard`'s own sidebar — a real partner crashing on their
own nav. `App.tsx`'s pre-existing `// @ts-nocheck` independently exempted it from
checking even with the script fixed.

**Now fixed and verified independently, not just self-reported:** `package.json`'s
`typecheck` script points at `tsconfig.app.json` (confirmed with `--listFiles`, 284
files including `App.tsx` genuinely checked). All six components restored (plus
`PropertyField`, a dependency correctly caught along the way) from git history,
cross-checked against current Convex signatures. `@ts-nocheck` removed. All 10 real
type errors this surfaced are genuinely fixed — including `liveNightlyRates`, now a
properly-typed field on `rooms.ts`'s actual query return type rather than a fragile
narrow. `npm run typecheck` (clean), `npm run build` (exit 0, real Vite output), and
`npm test` (37/37) were all re-run independently by Claude and matched. "Typecheck
clean" means something again from this point forward.

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
`manual_bank_transfer`. The guest `PaymentMethods` screen (commit `571257c`) no longer
fakes card storage: it states Menetap doesn't store cards and lists real payment
history from `bookings.listMine`. Guest `GuestSettings` (`0101ab9`) reads/saves the
real profile via `users.current`/`users.updateProfile`; `SavedStays` and the property
Save button (`32ddd9f`) are Convex-backed; `MyTrips` (`fb79a35`) shows only real
bookings. Still hardcoded in the guest area: `BookingIssue` and `DuringStay` (fixed
"Kaliurang Heritage Villa"/`MTP-7X9K2Q` text, and `BookingIssue` says "Your card was
not charged" though no cards exist), and `MyTrips` action buttons ("Leave review",
"Download invoice", "Cancel", "View details") have no handlers.

Rewards redemption's discount-trust issue is resolved — see Backend section above.

## SEO

`app/src/seo.ts` applies canonical URLs, language metadata, robots directives, Open Graph metadata, and route-level noindex rules. `app/public/robots.txt` disallows private operational routes and points to the sitemap. `app/scripts/generate-sitemap.mjs` generates public URLs from published, non-demo properties. The live files could not be reached from the verification environment, so live parity is unverified.

## Verification baseline

From `app/`, verified independently by Claude on 2026-09-30: `npm run typecheck`
passed; `npm test` passed with 14 test files and 41 tests. `npm run build` was not
re-run on 2026-09-30 (last passed 2026-09-28, with an existing Vite chunk-size
warning for the main JavaScript bundle).

## Known gaps

- Live deployment SEO files need an external/live-browser spot-check (couldn't be
  reached from the verification environment).
- `AccountFrame`'s sidebar links "Payment methods" and "Settings" to `#`, so guests
  can't reach those (now real) screens from the account nav.
- SEO review 2026-09-30 found route-metadata gaps (property canonical, static
  `noindex` in `index.html`, rooms/checkout not noindexed) — see
  `docs/checklist-seo-public-routes.md`.
- Admin users/team/finance-aggregate/reports/risk/announcements/settings/system
  screens are honest but not functional — backend functions don't exist yet; full
  list in `docs/checklist-poc-b.md`.
- Bank transfer instructions are an explicit placeholder
  (`'PENDING — REAL BANK DETAILS NEEDED'`) — real Menetap bank account details are a
  business input still needed before manual-transfer bookings can go live.
- `AdminPaymentsPage`'s reject action sends a hardcoded canned reason instead of a
  real staff-typed note — backend supports a real reason, UI doesn't expose it yet.
- Unused `InfoCard` and `RetryState` helpers remain in `App.tsx` (not mocks; keep or
  delete). The orphaned mock admin/rewards/supply components were deleted 2026-09-30
  (~199 lines), re-verified with typecheck, 41/41 tests, and a clean build.
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
