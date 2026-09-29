# POC-C design: Rentals — backend

**Status: APPROVED (2026-09-28).** Checklist: `docs/checklist-poc-c-rentals.md`.

Follows `docs/design-poc-c-rentals-ux.md` (approved). Same format as the Rewards and
Supplier backend designs: proposed schema, proposed functions, where it touches
existing code, then a checklist once approved.

## Recap of the binding decisions this design has to satisfy

1. Public browse (`RentalsV2`/`RentalSearch` stay public), reservation step gated to
   guests with a `status: 'confirmed'` booking whose `checkOut` hasn't passed.
2. Delivery/return dates may fall slightly outside strict stay dates — needs a
   concrete buffer (pinned down below, not left as "small").
3. Payment: manual bank transfer, same pattern as `payments.ts`/`supplyPayments.ts`.
4. Delivery-to-hotel and driver-included stay togglable add-ons with real surcharges,
   not always-on.
5. Menetap-managed fleet, not a vendor marketplace — no vendor/moderation layer.

## Pinning down the date buffer

Proposing **±1 day**: delivery can be requested from `checkIn - 1 day` through
`checkIn`, return from `checkOut` through `checkOut + 1 day`. Covers the stated case
(arriving the night before official check-in) without opening the reservation up to
dates unrelated to the stay. This is a product-judgment default, not a technical
constraint — flagging it as the design's proposal, easy to change to a different
number if you'd rather, but a concrete number is what's needed rather than "small."

## Proposed schema

Mirrors `roomTypes`/`availability` for the fleet+availability half (admin-managed
inventory, no vendor layer), and `manualBankTransfers`/`payments.ts` for the payment
half — deliberately not reusing `addOnServices`/`bookingAddOns` per the UX design's
reasoning.

```ts
vehicles: defineTable({
  type: v.union(v.literal('scooter'), v.literal('car')),
  name: v.string(), specs: v.string(),
  dailyRate: v.number(), currency: v.string(),
  driverSurcharge: v.optional(v.number()),    // per-day, if driver-included is offered for this vehicle
  deliverySurcharge: v.optional(v.number()),  // flat, per reservation
  active: v.boolean(),
  ...timestamps,
}).index('by_type_active', ['type', 'active']),

vehicleAvailability: defineTable({
  vehicleId: v.id('vehicles'), date: v.string(),
  totalUnits: v.number(), availableUnits: v.number(),
  ...timestamps,
}).index('by_vehicle_date', ['vehicleId', 'date']),

rentalReservations: defineTable({
  bookingId: v.id('bookings'),         // the stay this rental is attached to — the gate
  guestUserId: v.id('users'),
  vehicleId: v.id('vehicles'),
  deliveryDate: v.string(), returnDate: v.string(),
  driverIncluded: v.boolean(), deliveryIncluded: v.boolean(),
  totalAmount: v.number(), currency: v.string(),
  status: v.union(v.literal('reserved'), v.literal('confirmed'), v.literal('delivered'), v.literal('returned'), v.literal('cancelled')),
  paymentStatus: v.union(v.literal('unpaid'), v.literal('pending_verification'), v.literal('paid')),
  ...timestamps,
}).index('by_booking', ['bookingId']).index('by_guest', ['guestUserId']).index('by_status', ['status']),

rentalTransfers: defineTable({
  reservationId: v.id('rentalReservations'),
  reference: v.string(), amount: v.number(), transferredAt: v.string(),
  evidenceFileId: v.optional(v.id('_storage')),
  status: v.union(v.literal('submitted'), v.literal('verified'), v.literal('rejected')),
  reviewedBy: v.optional(v.id('users')),
  ...timestamps,
}).index('by_reservation', ['reservationId']).index('by_status', ['status']),
```

## Proposed Convex functions

### Public browse (no auth required, matches `sitemap.md`)

- [ ] `vehicles.listActive` — `_id, type, name, specs, dailyRate, currency,
      driverSurcharge, deliverySurcharge` for `active: true` vehicles. Powers
      `RentalsV2`/`RentalSearch`.
- [ ] `vehicleAvailability.forDateRange` — availability check for a type/date range,
      to show real availability instead of hardcoded "8 left"/"4 left" counts.

### Guest: reserve (the gated step)

- [ ] `rentalReservations.create` — args: `bookingId`, `vehicleId`, `deliveryDate`,
      `returnDate`, `driverIncluded`, `deliveryIncluded`. Server-side, in order:
      1. Load the booking, verify `guestUserId === auth.getUserId()` (or matching
         guest email for account-less checkouts, same pattern as
         `payments.ownsBooking`).
      2. **The gate**: `booking.status === 'confirmed'` and `booking.checkOut >=
         today` — reject otherwise with a clear message, not a generic error.
      3. Validate `deliveryDate`/`returnDate` fall within the ±1 day buffer of
         `booking.checkIn`/`checkOut` (the pinned-down rule above).
      4. **Recompute `totalAmount` server-side** from `vehicle.dailyRate × days` plus
         `driverSurcharge`/`deliverySurcharge` if selected — never trust a
         client-supplied amount, same discipline as `bookings.create`'s Rewards fix
         and `supplyOrders.create`.
      5. Decrement `vehicleAvailability` for the reserved date range (mirrors how
         room booking holds inventory — check `inventoryHolds`/`availability`'s
         existing decrement pattern rather than inventing a new one).
- [ ] `rentalReservations.listMine` — a guest's reservations, past and upcoming, for
      surfacing in `MyTrips` per the UX design (not a new top-level nav item).

### Payment — parallel to `payments.ts`/`supplyPayments.ts`

- [ ] `rentalPayments.submitManualTransfer` / `.listPendingTransfers` /
      `.verifyTransfer` — same shape as the other two pillars' payment files. Approve
      → `rentalReservations.paymentStatus: 'paid'`.

### Admin: fleet, availability, fulfillment

- [ ] `vehicles.create`/`.update` (admin-only) — fleet management.
- [ ] `vehicleAvailability.bulkUpdate`/`.updateDay`/`.calendar` — **reuse the exact
      function names and shape from `availability.ts`** applied to vehicles instead
      of rooms, since the UX design explicitly called this out as a reusable pattern.
- [ ] `rentalReservations.updateStatus` (admin-only) — reserved → confirmed →
      delivered → returned / cancelled.
- [ ] `rentalReservations.listForAdmin` — all reservations, for the fulfillment/
      payment-verification screen (same shape as `supplyOrders.listForAdmin`, which
      didn't exist until the supplier checklist's review caught it missing — building
      it in from the start here instead of discovering the gap later).

## Where this touches existing code

- New files: `convex/vehicles.ts`, `convex/vehicleAvailability.ts`,
  `convex/rentalReservations.ts`, `convex/rentalPayments.ts`. Fully additive — no
  changes to `bookings.ts`/`payments.ts`/`commissions.ts`.
- `RentalsV2`/`RentalSearch` in `App.tsx` get real data per the UX design; the dead
  `RentalsLanding` gets deleted (not resurrected) as part of the same pass, same
  cleanup discipline as the old `Supply*` prototype.
- `RentalSearch`'s dead "Select vehicle" button gets the actual reservation step
  wired — this is the core of the work.
- `MyTrips` gets a rentals section using `rentalReservations.listMine`.
- New admin screen(s): fleet/availability management and a reservations/payment
  queue — same `AdminQuickOpsPage`-style pattern already established.

## Next step

If approved, this becomes `docs/checklist-poc-c-rentals.md` — schema, all four new
function files, evolving `RentalsV2`/`RentalSearch`, the new reservation step, `MyTrips`
integration, and the admin fleet/availability/fulfillment screen.
