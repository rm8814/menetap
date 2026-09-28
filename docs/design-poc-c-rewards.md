# POC-C design: Rewards

**Status: APPROVED (2026-09-28).** Ready for `docs/checklist-poc-c-rewards.md`.

First of four POC-C pillars, per the approved sequencing in `docs/POC.md`
(Rewards → Supplier marketplace → Rentals → Experiences). Guests collect points and
redeem them for free or discounted stays.

## What exists today

Nothing backend. `RewardsLanding` and `RewardsPage` in `App.tsx` are static marketing
copy with no Convex calls — confirmed by direct inspection. No rewards/points/ledger
table anywhere in `schema.ts`. This is a from-scratch design.

## Product behavior — decided (2026-09-28)

- Guests **earn** points when a booking reaches a completed state (not on booking
  creation — a cancelled/refunded stay shouldn't earn points).
- Guests **redeem** points against a future booking's total, at checkout, as a
  discount — not a separate cash-out or transfer-to-others mechanism.
- **Earn rate: 10 points per Rp 10,000 spent** (i.e. 1 point per Rp 1,000).
  **Redemption value: 1,000 points = Rp 100,000 discount** (i.e. Rp 100 per point).
  Net effect: a completed stay earns back 10% of its value in redeemable points — both
  numbers live in `rewardsConfig`, not hardcoded, so this can be tuned without a
  deploy.
- **Redemption can zero out an entire booking** — no cap. Guest just needs enough
  points to cover the full total.
- **Expiry: 12 months from membership (account) creation**, not per individual earn
  transaction. This is simpler to reason about than per-earn expiry, but means the
  *whole remaining balance* clears on the account's 12-month anniversary, not on a
  rolling per-point basis — see schema note below on how this is implemented, and the
  one assumption I made explicit rather than guessing silently.
- **Admin visibility/override: yes** — admin can view any guest's balance/ledger and
  make manual adjustments (goodwill grants, fraud corrections), each with a required
  reason, fully auditable.

## Proposed schema

```ts
// A single source of truth for a guest's point balance, updated only via ledger
// entries below — never written to directly, to keep balance = sum(ledger) always
// true and auditable (same principle as bookingStatusHistory's audit trail).
rewardsAccounts: defineTable({
  userId: v.id('users'),
  pointsBalance: v.number(),        // denormalized cache of the ledger sum, for fast reads
  memberSince: v.number(),          // anchor for the 12-month expiry cycle (account creation time)
  nextExpiryAt: v.number(),         // memberSince + 12 months, advanced each cycle by the sweep job
  ...timestamps,
}).index('by_user', ['userId']).index('by_next_expiry', ['nextExpiryAt']),

rewardsLedger: defineTable({
  userId: v.id('users'),
  bookingId: v.optional(v.id('bookings')),   // present for earn/redeem tied to a stay
  type: v.union(
    v.literal('earn'),
    v.literal('redeem'),
    v.literal('expire'),
    v.literal('adjustment'),        // manual admin correction, always with a reason
  ),
  points: v.number(),               // positive for earn, negative for redeem/expire
  reason: v.optional(v.string()),   // required for 'adjustment', optional otherwise
  adjustedByUserId: v.optional(v.id('users')), // set for 'adjustment' entries (which admin did it)
  ...timestamps,
}).index('by_user', ['userId']).index('by_booking', ['bookingId']),

rewardsConfig: defineTable({
  // single-row config table (or keyed by a constant id) — earn/redemption rates,
  // expiry window — admin-editable via the Admin Settings screen (POC-B)
  earnRatePointsPerIdr: v.number(),   // 0.001 (10 points per Rp 10,000)
  redeemValueIdrPerPoint: v.number(), // 100 (Rp 100,000 per 1,000 points)
  expiryMonths: v.number(),           // 12
  ...timestamps,
}),
```

**One assumption made explicit, not guessed silently:** "12 months since membership
creation" is implemented as a recurring anniversary sweep — on each 12-month
anniversary of `memberSince`, `rewards.expireStale` zeroes the guest's remaining
balance (writing an `expire` ledger entry for the full remaining amount) and advances
`nextExpiryAt` another 12 months. This means points earned early in a cycle and points
earned right before the anniversary expire at the same time (whole-balance reset), not
individually 12 months after each was earned. If you intended rolling per-point
expiry instead (each point expires 12 months after *it* was earned, independent of
others), say so and this changes to the original per-earn-entry `expiresAt` design —
flagging this now rather than building the wrong one.

## Proposed Convex functions

- `rewards.getAccount` (query) — current balance + upcoming expirations for the
  logged-in guest. Powers `RewardsPage`.
- `rewards.earnForBooking` (internal mutation, called from the booking-completion
  path, not guest-triggered) — writes an `earn` ledger entry + updates
  `rewardsAccounts.pointsBalance`.
- `rewards.redeemAtCheckout` (mutation, called from `Checkout`) — validates balance
  covers the requested redemption, writes a `redeem` ledger entry, returns the
  discount to apply to the booking total.
- `rewards.expireStale` (scheduled/cron function) — sweeps accounts whose
  `nextExpiryAt` has passed, zeroes the balance with an `expire` ledger entry, advances
  `nextExpiryAt`. Needs a Convex cron job (check whether one exists yet —
  `convex/http.ts` didn't show one; this may be the first).
- Admin: `rewards.getConfig` / `rewards.updateConfig` (admin-only mutation) for the
  Admin Settings screen (already in POC-B scope).
- Admin: `rewards.adminGetAccount` (query, any guest by userId) and
  `rewards.adminAdjust` (mutation — requires `reason`, writes an `adjustment` ledger
  entry with `adjustedByUserId` set) — for the admin visibility/override requirement.
  This needs an admin UI surface; POC-B's checklist doesn't include a rewards screen
  today, so this is new admin UI scope for the POC-C-rewards checklist, not a POC-B
  addition.

## Where this touches existing code

- `bookings.ts` — the completion path needs to call `rewards.earnForBooking`
  (need to confirm exactly where "completed" is set — likely `bookingStatus.ts`).
- `Checkout` in `App.tsx` — add a redemption input, call `rewards.redeemAtCheckout`
  before `bookings.create`, apply the returned discount to the total shown.
- `RewardsPage`/`RewardsLanding` — replace static copy with `rewards.getAccount` query.
- Admin Settings (POC-B) — add the rate/expiry config fields once `rewardsConfig`
  exists, so this isn't yet another mock admin field.

## Remaining open item

Only the expiry-model assumption flagged above (whole-balance anniversary reset vs.
rolling per-point expiry) needs your confirmation. Everything else is decided. Once
that's confirmed (or you're fine with the anniversary-reset default), the next
document is `docs/checklist-poc-c-rewards.md`.
