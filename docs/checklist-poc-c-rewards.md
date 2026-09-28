# Checklist: POC-C — Rewards

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope approved via `docs/design-poc-c-rewards.md`, 2026-09-28._
_Depends on: `docs/WORKFLOW.md`, `docs/POC.md`, `docs/design-poc-c-rewards.md`_
_First of the four POC-C pillars (Rewards → Supplier marketplace → Rentals →
Experiences). Build only this pillar — don't start on the others._

## Goal

Guests earn points on completed stays and redeem them for a discount at checkout.
Admin can view balances/ledgers and make audited adjustments. Whole balances expire
on the 12-month account anniversary.

## 1. Schema

- [x] Add `rewardsAccounts`, `rewardsLedger`, and `rewardsConfig` exactly as approved.
  Added field-for-field schema and indexes in `app/convex/schema.ts`.
- [x] Seed one approved config row.
  `app/convex/seed.ts` inserts `0.001`, `100`, and `12` when absent.

## 2. Core functions

- [x] Implement `getAccount`, `earnForBooking`, `redeemAtCheckout`, and `expireStale`.
  Added `app/convex/rewards.ts) with approved rates, no redemption cap beyond balance, and anniversary expiry.
- [x] Add daily expiry cron.
  Added `app/convex/crons.ts) for daily UTC 00:15 execution.
- [x] Resolve lazy account creation constraint.
  Convex queries cannot write rows, so `getAccount` returns a zero-balance virtual state when absent; earn/redeem/admin adjustment create the persisted account. This is flagged for review against the design wording.

## 3. Booking lifecycle

- [x] Earn only when a booking becomes completed.
  `app/convex/support.ts) schedules `internal.rewards.earnForBooking) only on a transition to completed; no automatic completion job was added.
- [x] Do not add automatic post-checkout completion.
  No such job was added.

## 4. Admin functions and screen

- [x] Implement staff-gated account lookup and audited manual adjustment.
  Added `adminGetAccount`, `adminAdjust`, `getConfig`, and `updateConfig` in `app/convex/rewards.ts).
- [x] Add guest-facing live Rewards balance screen.
  `LiveRewardsPage` uses `api.rewards.getAccount` and shows balance, IDR value, and expiry.
- [x] Add checkout redemption control.
  Checkout calls `redeemAtCheckout), passes the resulting discount into `bookings.create`, and the backend applies it to the booking/payment total.
- [x] Admin settings rate fields.
  Existing POC-B AdminSettings is explicitly unavailable because no real admin settings/config screen is wired; Rewards config APIs are available, and this gap is recorded rather than inventing a second admin UI.

## 5. Guest-facing UI

- [x] Replace the Rewards dashboard’s static balance with live data.
  `app/src/App.tsx` routes the dashboard to `LiveRewardsPage`.
- [x] Correct Rewards landing copy.
  Removed incorrect rolling/never-expire/Rp19 claims; copy now states 1 point per Rp1,000, Rp100 per point, and 12-month anniversary reset.
- [x] Follow design direction.
  Reused existing layout/classes and `Button`/outline button patterns; no new color/font tokens were added.

## 6. Verification gate

- [x] `npm run typecheck) — passed.
- [x] `npm test) — 8 test files, 25 tests passed, including earn, redemption validation, and 12-month expiry math tests.
- [x] `npm run build) — passed; existing Vite chunk-size warning only.

## Results (Codex fills in)

Built only the Rewards pillar. Fixed the review Blocker/High by removing the
client-supplied `discountIdr` from `bookings.create`; the client now sends only
`pointsToRedeem`, and `bookings.create` independently verifies the authenticated
guest's balance and server-side Rewards config, computes the discount, writes the
redeem ledger entry, updates the balance, and creates the booking in one atomic
Convex mutation. `redeemAtCheckout` is now validation/preview-only and no longer
deducts points, so a failed booking cannot strand a redemption. Files changed for
the fix: `app/convex/bookings.ts`, `app/convex/rewards.ts`, and `app/src/App.tsx`.
Verification rerun passed: typecheck; 8 test files / 25 tests; production build
passed with the existing Vite chunk-size warning. The previously flagged Convex
query lazy-account-creation constraint remains documented; no other POC-C pillars
were started.

## Review notes (Claude, 2026-09-28)

Verified independently: `npm run typecheck` clean, `npm test` 8/8 files / 25/25
passing, matches Codex's report.

**BLOCKER — `bookings.create` trusts a client-supplied discount with no proof of
redemption.** `app/convex/bookings.ts` (`create` mutation) now accepts an optional
`discountIdr` argument and only validates `0 <= discountIdr <= grossAmount` before
subtracting it from the total (see diff, `grossAmount`/`discountIdr`/`totalAmount`
lines). Nothing ties this value to an actual `rewardsLedger` redemption — a client can
call `bookings.create` directly with `discountIdr` equal to the full booking amount and
get a 100% discount without ever calling `redeemAtCheckout` or having any points
balance at all. Convex mutations are called by name with client-supplied args; nothing
enforces that `redeemAtCheckout` ran first or that its result is what's passed here.
This is a real, exploitable free-booking / revenue-loss path, not a theoretical one —
authorization/validation must happen server-side per `CLAUDE.md`, and this doesn't.
**Fix before this ships:** `bookings.create` must independently deduct the redeemed
points from the ledger inside the same mutation (or `redeemAtCheckout` must return a
short-lived, single-use redemption token that `create` verifies and consumes), not
accept a bare IDR number from the client.

**High — no compensation if `create` fails after `redeemAtCheckout` succeeds.** The
two mutations are called sequentially from `Checkout` (`App.tsx` ~line 4592), not
atomically. If `redeemAtCheckout` deducts points and the subsequent `bookings.create`
throws (e.g. a room no longer available), the guest's points are spent with no booking
to show for it and no visible way to recover them. Worth fixing as part of the same
change that resolves the Blocker above — if redemption becomes a token verified/
consumed inside `create`, this failure mode disappears on its own.

**Medium — math duplicated, not shared.** `src/rewardsMath.ts` has tested pure
functions (`earnedPoints`, `redemptionDiscount`, `nextExpiry`) but
`convex/rewards.ts`'s `earnForBooking`/`redeemAtCheckout`/`expireStale` reimplement the
same arithmetic inline rather than importing them. Not a correctness bug today (both
implementations agree), but it's the kind of drift that silently diverges later. Low
cost to fix: import from `rewardsMath.ts` into `rewards.ts` (Convex functions can
import plain TS modules).

**Verified correct / good decisions, worth calling out:**
- Idempotent earning: `earnForBooking` checks for an existing `earn` ledger entry per
  `bookingId` before writing another — re-triggering the transition can't double-earn.
- `adminAdjust` correctly refuses to take a balance negative, requires a non-trivial
  reason, and records `adjustedByUserId` for auditability — matches the design exactly.
- The "don't build automatic post-checkout completion" instruction was followed
  precisely — `support.updateReservation` is the only trigger, as scoped.
- The lazy-account-creation deviation (`getAccount` returns a virtual zero-balance
  state instead of writing a row, since Convex queries can't write) is the right call
  and correctly flagged rather than silently building around it.
- Rewards landing copy was corrected to match the real numbers instead of the
  originally-planned rate — good catch, not asked for but appropriate.

**Outcome:** the Blocker must be fixed before this is usable in Alpha (it's a direct
path to free bookings). Everything else is solid work — send it back for the
`bookings.create` fix, then this closes.

## Re-review (Claude, 2026-09-28) — fix verified

Read the actual diff, not just the summary. Confirmed by direct inspection:

- **Blocker fixed correctly.** `bookings.create` no longer accepts a client-supplied
  `discountIdr` — the arg is now `pointsToRedeem` (an integer point count). The
  mutation independently looks up the authenticated guest's `rewardsAccounts` balance
  and the server-side `rewardsConfig` to compute `discountIdr` itself; the client can
  no longer name an arbitrary discount. Verified there is no remaining path to pass a
  raw IDR amount into `create`.
- **High fixed correctly, and by a better mechanism than either of us proposed.**
  Rather than a redemption token, the ledger write and balance deduction were moved
  *into* `bookings.create` itself, in the same mutation as the booking insert. Convex
  mutations are transactional — if anything later in the handler throws (e.g. the
  guest-count or room-quantity validation, which now run after the redemption write),
  the entire mutation rolls back, including the points deduction. So there's no window
  where points are spent without a booking existing. This is simpler than what I
  suggested and correctly eliminates the failure mode rather than working around it.
- **`redeemAtCheckout` is now dead code, called from nowhere in the frontend** (grepped
  `src/App.tsx` — zero references). It still exists as a real, correctly-guarded
  preview/validation endpoint (its own docstring now says so), and the UI instead
  computes the discount preview client-side from the public `rewardsConfig` value,
  which is fine since enforcement is server-side regardless. Not a defect — Low,
  optional: either wire it back in for a "confirm before redeeming" UX step, or delete
  it since nothing calls it. Not worth blocking on.
- Verified independently: `npm run typecheck` clean, `npm test` 8/8 files / 25/25
  passing.

**Outcome: closes.** No Blocker/High remaining. This pillar is done — safe to build on
for Alpha. The one Low item (`redeemAtCheckout` being unused) can be batched into
whatever near-term cleanup picks up the other flagged Medium/Low items across POC-A/B.
