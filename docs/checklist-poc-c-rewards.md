# Checklist: POC-C — Rewards

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope approved via `docs/design-poc-c-rewards.md`, 2026-09-28._
_Depends on: `docs/WORKFLOW.md`, `docs/POC.md`, `docs/design-poc-c-rewards.md`_
_First of the four POC-C pillars (Rewards → Supplier marketplace → Rentals →
Experiences). Build only this pillar — don't start on the others._

## Goal

Guests earn points on completed stays and redeem them for a discount at checkout.
Admin can view any guest's balance/ledger and make manual adjustments. Points reset to
zero on each account's 12-month anniversary. Replace `RewardsLanding`/`RewardsPage`'s
static copy with the real thing.

## 1. Schema

- [ ] Add `rewardsAccounts`, `rewardsLedger`, `rewardsConfig` to `convex/schema.ts`
      exactly as specified in `docs/design-poc-c-rewards.md`'s "Proposed schema"
      section (field-for-field — flag here, don't silently change, if something
      doesn't compile as written).
- [ ] Seed a single `rewardsConfig` row: `earnRatePointsPerIdr: 0.001`,
      `redeemValueIdrPerPoint: 100`, `expiryMonths: 12`.

## 2. Core functions (`convex/rewards.ts`, new file)

- [ ] `getAccount` (query) — current user's balance + `nextExpiryAt`. Create the
      `rewardsAccounts` row lazily on first call if one doesn't exist yet for this
      user (`memberSince: now`, `nextExpiryAt: now + 12 months`, `pointsBalance: 0`).
- [ ] `earnForBooking` (internal mutation, `bookingId` arg) — computes points from
      `booking.totalAmount * rewardsConfig.earnRatePointsPerIdr`, writes an `earn`
      ledger entry, updates `pointsBalance`.
- [ ] `redeemAtCheckout` (mutation, `pointsToRedeem` arg) — validates
      `pointsToRedeem <= pointsBalance`, writes a `redeem` ledger entry (negative
      points), updates balance, returns the IDR discount
      (`pointsToRedeem * redeemValueIdrPerPoint`) for `Checkout` to apply. No cap
      besides the balance itself (can zero out a booking).
- [ ] `expireStale` (internal mutation, called by cron) — queries `rewardsAccounts` by
      `nextExpiryAt <= now` via the `by_next_expiry` index, for each: writes an
      `expire` ledger entry for `-pointsBalance`, sets `pointsBalance: 0`, advances
      `nextExpiryAt` by 12 months.
- [ ] Add the cron job calling `expireStale` on a daily schedule (check `convex/`
      for whether `crons.ts` exists yet — per the design doc, this may be the first
      scheduled function in this codebase; if Convex cron setup needs anything beyond
      adding the job itself, flag it rather than guessing at project-wide cron config).

## 3. Hook into the booking lifecycle

- [ ] **Confirmed finding:** the only place a booking transitions to `'completed'`
      today is `support.updateReservation` (`convex/support.ts` ~line 42), a manual
      staff-only mutation — there is no automatic post-checkout completion job.
      Call `rewards.earnForBooking` from inside `support.updateReservation` when
      `args.status === 'completed'`.
- [ ] **Do not** build an automatic "mark completed after checkout date passes" job as
      part of this checklist — that's a separate, unscoped decision (would affect
      booking lifecycle generally, not just rewards). If you think it's needed for
      rewards to work in practice, flag it back rather than building it silently.

## 4. Admin functions and screen

- [ ] `adminGetAccount` (query, `userId` arg, staff-role-gated) — balance + full
      ledger for one guest.
- [ ] `adminAdjust` (mutation, `userId`, `points`, `reason` required, staff-role-gated)
      — writes an `adjustment` ledger entry with `adjustedByUserId` set, updates
      balance.
- [ ] Add a rewards section to `AdminGuestDetail` (already real Convex data per
      `docs/checklist-poc-b.md`) showing balance/ledger and an adjustment form — this
      is new admin UI scope, not a POC-B item, per the design doc.
- [ ] Add the rate/expiry fields (`earnRatePointsPerIdr`, `redeemValueIdrPerPoint`,
      `expiryMonths`) to `AdminSettings` (POC-B, already being wired to real config)
      so these become admin-editable rather than requiring a deploy to change.

## 5. Guest-facing UI

- [ ] `RewardsPage` — replace static copy with `rewards.getAccount`: show balance,
      points value in IDR, next expiry date.
- [ ] `RewardsLanding` — can stay largely marketing copy, but any numbers shown
      (e.g. "earn X% back") must match `rewardsConfig`'s actual values, not be
      independently hardcoded.
- [ ] `Checkout` — add a redemption control (how many points to apply / a "use all
      points" toggle), call `redeemAtCheckout`, apply the returned discount to the
      displayed total before `bookings.create`.
- [ ] Follow `docs/POC.md`'s "Design & visual direction" — use existing `--color-*`/
      `--font-*` tokens and `Button`/`ds-button*`, no new hardcoded colors/fonts.

## 6. Verification gate

- [ ] `npm run typecheck` — from `app/`
- [ ] `npm test` — from `app/`. Add at least: earn calculation correctness, redemption
      balance validation (can't redeem more than available), expiry sweep zeroing a
      balance and advancing `nextExpiryAt`. Record actual pass/fail counts.
- [ ] `npm run build` — from `app/`

## Results (Codex fills in)

_(Per section above: what was built, files touched, anything flagged as a gap rather
than built silently.)_

## Review notes

_(Claude fills this in after reviewing completed work — Blocker/High/Medium/Low.)_
