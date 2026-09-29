# POC-C design: Rentals — UI/UX

**Status: APPROVED (2026-09-28).** Ready for backend design.

Third of the four POC-C pillars, per the approved sequencing in `docs/POC.md`
(Rewards ✅ → Supplier marketplace ✅ → **Rentals** → Experiences). Scoped decision
already in `docs/POC.md`: motorbike/car rental, delivered to the hotel, **guest-only —
can't rent without staying**, enforced server-side, not just hidden in the UI.

## What already exists — messier than Supplier's single prototype

Three separate, overlapping rental UI files exist, only two of which are actually
routed:

- **`RentalsV2`** (`src/RentalsV2.tsx`) — the live landing page (`screen ===
  "rentalsLanding"`). Well-designed: hero, search form, a "fleet preview" grid, trust
  badges, and a CTA that already says almost exactly the right thing — "Already have a
  Menetap stay booked? Add a rental to your existing trip" linking to `/en/my-trips`.
  This prototype already anticipated the guest-gating decision in its copy, same as
  Supplier's "one supplier, one invoice" framing did.
- **`RentalSearch`** (`App.tsx`) — the live results/filter page (`screen ===
  "rentalSearch"`). Vehicle type filter, driver/delivery add-on checkboxes, price
  calculation shown live. **Its "Select vehicle" button has no `onClick` handler at
  all** — dead end, no checkout flow exists past this screen.
- **`RentalsLanding`** (`App.tsx`) — defined but **dead code**, not referenced by any
  route (confirmed by grep). Same recurring pattern as the orphaned admin mocks and
  old `Supply*` prototype — flag for the same cleanup pass, don't resurrect it.

No backend exists at all: no `rentals`/`vehicles` table in `schema.ts`, no Convex
functions, confirmed by direct search. This matches what was already known when
Rentals was scoped into the pillar sequence.

## Key structural difference from Supplier: browse is public, reserving isn't

Unlike Supplier (partner-only end to end), `docs/sitemap.md` already correctly
classifies `/en/rentals` as **public and indexable** — anyone can browse available
vehicles and see pricing, same as browsing hotel listings. The gate only applies at
the **reservation step**: a rental request can't be created without linking to an
active or upcoming stay. `RentalSearch`'s dead "Select vehicle" button is exactly
where that gate needs to live — the browse/search pages stay public, the "book this"
action requires the guest to have a real booking to attach it to.

## Not a marketplace — Menetap's own managed fleet

Also structurally different from Supplier: the copy says "Menetap-managed fleet," not
a network of independent vendors. This means no vendor-curation layer (no
`vendorProfiles`-equivalent, no moderation queue) — the fleet is admin-managed
inventory, closer in shape to how `roomTypes`/`availability` work for hotel rooms than
to Supplier's vendor-submission model. One admin surface (fleet + availability
management), not three user types.

## Considered and rejected: reusing `addOnServices`/`bookingAddOns`

The schema already has an add-on pattern (`addOnServices`/`bookingAddOns`) — checked
whether rentals should extend it rather than getting dedicated tables. **Rejected**:
that pattern is for simple flat-fee add-ons (early check-in, airport shuttle) with no
per-item inventory or date-based availability. Rentals need a real catalog (vehicle
type, daily rate, specs) and per-date availability tracking, much closer to how
`roomTypes`/`ratePlans`/`availability` model hotel rooms. Worth noting separately:
`bookingAddOns`/`addOnServices` are themselves currently **dormant** — nothing ever
creates a `bookingAddOns` row despite the table existing — that's a pre-existing gap,
not something this pillar needs to fix, but flagging so it's not mistaken for "the
add-on system already works, just reuse it."

## Proposed information architecture

### 1. Guest-facing: browse (public) → reserve (gated)

- **Landing** (`RentalsV2`, evolve in place) — keep the design, replace the hardcoded
  `vehicles` array with real fleet data. Public, no auth required, matches
  `sitemap.md`.
- **Search/results** (`RentalSearch`, evolve in place) — keep the design, replace
  hardcoded vehicles with real data filtered by type/date availability. Public browse
  stays public.
- **Reservation step** (new — where "Select vehicle" currently dead-ends) — this is
  where the gate lives. If the guest has no active/upcoming booking: show why they
  can't reserve yet and point at their stay (or at booking one) rather than silently
  hiding the button or failing with a generic error. If they do: let them pick which
  of their upcoming stays to attach the rental to (a guest could have more than one),
  confirm dates (constrained to within the stay's check-in/check-out window — a
  rental delivered before check-in or returned after check-out doesn't make sense),
  and submit.
- **Payment** — per the pattern established for both prior pillars, propose manual
  bank transfer, same as bookings/supply orders, verified by finance. Flagging as a
  decision to confirm, not assuming.
- **Order/reservation history** — a place to see past and upcoming rentals, likely
  surfaced in `MyTrips` (rentals are guest-facing, unlike Supplier's partner-facing
  order history) rather than a new top-level nav item.

### 2. Admin-facing: manage the fleet

- Fleet inventory management (vehicle type, specs, daily rate, active/inactive) —
  admin-managed, no vendor layer.
- Availability management per vehicle per date — mirrors how partner property
  availability already works (`availability.bulkUpdate`/`updateDay`/`calendar`),
  reusable pattern, not a new concept.
- A reservations queue for verifying payment and tracking fulfillment (delivered →
  returned), same shape as Supplier's admin screen (product moderation replaced by
  fleet management, since there's no vendor curation step here).

## Decisions locked in (2026-09-28)

1. **Gating rule:** a booking with `status: 'confirmed'` and `checkOut` in the future
   qualifies — no narrower day-count window. Covers both currently-staying and
   arriving-soon guests.
2. **Date buffer:** delivery/return may fall slightly outside strict stay dates (e.g.
   delivered the night before check-in) — not clamped exactly to
   `checkIn`/`checkOut`. Backend design needs to define the actual buffer size (e.g.
   ±1 day) rather than leaving it unbounded — flagging this as the one thing the
   backend design doc must pin down precisely, since "a small buffer" isn't itself a
   validation rule yet.
3. **Payment:** manual bank transfer, same pattern as bookings and supply orders —
   partner/guest transfers to Menetap, finance verifies via the same
   `payments.ts`-style flow used for the other two pillars.
4. **Delivery-to-hotel stays a togglable add-on**, not always-on — keep
   `RentalSearch`'s existing driver/delivery checkboxes and surcharge model as-is,
   just wire them to real pricing instead of hardcoded values.

## Next step

All open questions resolved. Ready for a backend schema design doc (mirroring
`docs/design-poc-c-rewards.md`/`docs/design-poc-c-supplier-backend.md`'s format):
`vehicles`/fleet inventory, per-date availability (reusing the `availability` table's
pattern), `rentalReservations` (with the server-side stay-gating check, the date
buffer from decision 2, and driver/delivery line items), and a parallel manual-transfer
payment table — then a checklist once approved.
