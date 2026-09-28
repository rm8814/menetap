# Menetap — Proof of Concept & Roadmap

**Status: DRAFT — awaiting user approval. Do not create any `docs/checklist-*.md` file
against this plan until the user has approved it, or approved a specific milestone
within it.**

Milestones are named for what they are, not numbered: **POC → Alpha → Beta → Launch**.
What exists in the repo today, inherited with no documentation, is the **POC** — a
proof that the core concept (guests can search and book real hospitality inventory)
works, built on a real backend but with a half-finished, partly mocked frontend. This
doc's first job is finishing the POC honestly; only after that do Alpha/Beta/Launch
get scoped in detail.

This was written by reading the actual codebase line-by-line — `convex/schema.ts`,
every `convex/*.ts` function file, `src/App.tsx` in full, auth config, tests, env
config — as if inheriting the project cold with no documentation. Nothing below is
inferred from filenames or old docs; every claim has a file/line source. Where I
couldn't verify something, it's listed as an open question, not assumed.

## First goal for a live site — confirmed 2026-09-28

Before anything else: guests can search, book, and pay for a stay (pay-at-hotel or
manual bank transfer); hotel partners can list their property and manage their
bookings; **Menetap collects the payment and commission**, then remits the rest to the
partner. Nothing more than that for "live." This maps to **POC-A + POC-B + enough of
Alpha** to get one real partner and one real paying guest through the loop with real
legal docs — see the Milestones section below.

The four POC-C pillars (Rewards, Supplier marketplace, Rentals, Experiences) are
**not** part of this first goal, but the user has chosen to build Rewards in parallel
rather than deferring it (confirmed 2026-09-28) — so `docs/checklist-poc-c-rewards.md`
proceeds alongside POC-A/B, not blocked by them. This is a deliberate priority call,
not scope creep: if parallel work ever threatens the core loop's timeline or review
bandwidth, that tradeoff gets flagged, not silently absorbed.

## Product scope (per user, 2026-09-28)

Menetap is **community-powered hospitality**, not a hotel-booking-only site:

- **Core: hotel/villa/guesthouse/homestay booking** — guests search, book, pay, manage
  stays. This is what's actually built and real today (see below).
- **Experiences** — things to do around the guest's stay area, discoverable alongside
  the booking.
- **Motorbike/car rental, delivered to the hotel** — guest-only add-on: you cannot rent
  a vehicle without an active/upcoming stay. Not a standalone rental product.
- **Rewards** — guests collect and redeem points for free or discounted stays.
- **User types beyond guests:**
  - **Hotel partners** — curated property listings (already the main partner surface).
  - **Hospitality suppliers/vendors** — sell physical hospitality goods (dental kits,
    soap, linen, etc.) into the platform, presumably to partner properties or as
    guest-facing add-ons. Schema already reserves a `vendor` role in `users`, but no
    catalog/product table exists yet — this is new backend design, not wiring.

**This changes the earlier assessment:** Experiences, Rentals, and Rewards are not
"admin console mock UI to wire up" — they are front-end-only marketing pages with
**no backend data model at all** (confirmed: no Convex calls in `ExperiencesLanding.tsx`,
`ExperiencesV2.tsx`, `RentalsV2.tsx`; `schema.ts` has no rewards/loyalty table, no
vehicle-rental table, no supplier product catalog). Wiring them means designing new
schema, not just connecting existing tables. See "Core pillars beyond booking" below.

## Executive summary

The hotel-booking core is more real and better-designed than the rest of the product
lets on. The guest booking journey (search → property → rooms → checkout →
confirmation → my trips → cancel/refund) is genuinely wired end to end. The admin
console is 100% hardcoded mock UI with fake data arrays over a backend that already
supports it (wiring work). Experiences, Rentals, and Rewards are further behind than
that — they're UI concepts with no backend at all (design + build work). The supplier
marketplace doesn't exist beyond a reserved user role. All of this needs to be true
before "community-powered hospitality" is an honest description rather than a tagline.

## Verified findings

### Backend (`convex/`) — real, substantial, and coherently modeled

`convex/schema.ts` defines 27 tables covering: users/roles/auth, partner applications/
agreements/profiles/onboarding, properties/room types/rate plans/rate overrides/
add-ons/availability, inventory holds (for concurrency-safe booking), bookings/booking
status history/booking rooms, payments, refund requests, manual bank transfers,
support requests/tickets, commissions, payout statements, partner announcements +
read-receipts, and audit logs. This is not a toy schema — it models real hospitality
operations (rate overrides per date, inventory holds with expiry, child pricing
policies with age bands, booking status history for auditability).

### Payments — no gateway, confirmed final: merchant-of-record via manual transfer

**Decided (2026-09-28):** no payment gateway. Two methods stay: `pay_at_hotel` and
`manual_bank_transfer`, where **Menetap is the merchant of record** — guests transfer
to Menetap's account (not the property's), Menetap verifies the transfer, then remits
to the partner minus commission on a schedule (booking.com's "collect" model, without
a card processor). This maps cleanly onto what's already in the schema:
`manualBankTransfers` (submitted → verified/rejected review workflow),
`commissions` (per-booking commission calc), and `payoutStatements` (periodic
partner remittance) already model exactly this flow. **No new payment schema needed**
— this is confirmation the existing design was right, plus a POC-B wiring target
(the admin Finance/Payouts screens that manage this today are mock).

### Auth — real

`@convex-dev/auth` with email+password (`convex/auth.ts`), password reset via Resend
OTP email (`ResendOTPPasswordReset.ts`). Not a mock login screen.

### Guest booking journey — real, wired to Convex

Verified via direct `useQuery`/`useMutation` calls against `api.*` in `src/App.tsx`:
search (`properties.listPublished`, `properties.searchSuggestions`), property detail
(`properties.get`, `rooms.listForProperty`, `properties.listPhotos`), room selection
(`rooms.listForProperty`, `services.listActive`), checkout (`bookings.create`),
confirmation/my trips (`bookings.getByReference`, `bookings.listMine`,
`bookings.requestCancellation`, `bookings.requestRefund`). This is the strongest,
most trustworthy part of the product today.

### Partner side — mostly real, with dead code to clean up

Real and Convex-wired: `PartnerOnboarding`, `PartnerDashboard`, `PartnerInventory`,
`PartnerBookings`, `PartnerProperties` (calls `partnerOnboarding.complete`,
`partnerDashboard.overview`, `availability.bulkUpdate`/`updateDay`/`calendar`,
`bookings.listForPartner`/`exportForPartner`, `properties.listMine`/`setPublished`,
`roomTypes.listForPartner`).

Dead code found: `LegacyPartnerAnnouncements`, `LegacyPartnerSupport`,
`LegacyPartnerPayouts`, `LegacyPartnerBookings`, `LegacyPartnerInventory`,
`LegacyPartnerDashboard` — six functions defined in `App.tsx` that are never routed to
anywhere (confirmed by grepping every `screen === "..."` render branch). These are
superseded duplicates left behind from an incomplete migration and should be deleted,
not maintained.

### Admin console — 100% mock, confirmed by direct inspection

Every one of these renders from hardcoded local arrays/`useState`, with real backend
tables already existing to support them: `AdminConsole`, `AdminProperties`,
`AdminPropertyDetail`, `AdminPartnerDetail`, `AdminGuestDetail`, `AdminUsers`,
`AdminTeam`, `AdminFinance`, `AdminOpsPage` (covers payouts/reports/disputes/
moderation/risk/support), `AdminAnnouncements`, `AdminSettings`, `AdminSystem`,
`AdminLogin`. Only one real Convex call exists anywhere in the admin surface
(`partnerAdmin.setAccountStatus`, likely in guest/partner detail). Commission %,
payout amounts, dispute lists, user lists, audit history — all fabricated inline
sample data (e.g. `AdminConsole`'s "change history" is a literal hardcoded array with
a fake entry dated "Today, 09:12"). This is not partially built; it's a visual
prototype of the admin console with zero backend wiring.

### Legal pages — copy, not legal documents

`LegalPage` (terms/privacy), `CancellationPolicy`, `CompanyPage` (about/careers) are
static JSX strings embedded directly in `App.tsx`. They read like real policy text but
are undated/unversioned in any meaningful sense (one hardcoded "Last updated:
September 1, 2026" string) and have not been through legal review. Not legally binding
in their current form for a company taking real payments.

### Frontend architecture — a real maintainability risk

Nearly the entire product (guest + partner + admin, ~60 screen-level functions) lives
in one `src/App.tsx` at ~5,000 lines. Manual `screen === "x"` string-based routing, no
router library, no per-page files, minimal shared components (`components/Button.tsx`
is essentially the only one). This isn't blocking today but will actively slow down
the POC's admin build-out if not addressed — every new wired screen adds to the same
file.

### Test coverage — thin

6 test files, 87 total lines (`authorization`, `bookingValidation`, `childPolicy`,
`csrf`, `observability`, `types`). These are narrow unit tests of isolated logic — no
integration test exercises the actual booking flow end-to-end. Fine as a baseline to
keep green, not sufficient evidence that the booking flow is regression-safe.

### SEO foundation — real, purpose-built

`src/seo.ts`, `src/seoEnv.ts`, `src/analytics.ts`, and `scripts/generate-sitemap.mjs`
exist with an explicit `isDemo` flag pattern (properties marked `isDemo: true` are
excluded from indexing/sitemap/structured data without being hidden from the app
itself, per `.env.example` comments). This is a deliberately-designed mechanism, not
an afterthought — worth preserving and extending rather than replacing.

### Design & visual direction — a real system already exists, inconsistently applied

`src/styles.css` already defines a token system in `:root`: `--color-bg` (#f7f6ff),
`--color-surface` (#fff), `--color-ink` (#0c0a1e), `--color-muted`/`--color-subtle`,
`--color-primary` (#7229ff, purple), `--color-primary-hover` (#5b20d5),
`--color-secondary` (#00caef, cyan), `--color-border` (#e5e2f5), a radius scale
(`--radius-sm/md/lg`), and motion tokens (`--ease-standard`, `--duration-fast`).
Typography is Plus Jakarta Sans for display/headings (`--font-display`) and JetBrains
Mono for body/UI text (`--font-mono`/base `font-family`) — matching what `CLAUDE.md`
already specifies. There's one shared component, `Button` (`ds-button`/
`ds-button-outline`/`ds-button-secondary` classes).

**The problem isn't a missing design system — it's that the tokens aren't consistently
used.** The same purple shows up as `var(--color-primary)` in some rules and as the
literal `#7229ff` in dozens of others (found across admin, experiences, supply, and
rewards CSS); several rules use `'JetBrains Mono', monospace` as a literal string
instead of `var(--font-mono)`; `!important` is scattered through page-specific overrides
(e.g. `.rewards-landing-page`) rather than the base classes being right in the first
place. This is exactly the kind of drift that produces visibly inconsistent UI as more
screens get built in POC-B/POC-C — worth fixing as we touch each area, not deferred to
a future redesign.

**Site-wide direction, effective immediately for all new/touched UI:**

- Use the existing `--color-*`, `--font-*`, `--radius-*`, and motion tokens from
  `:root` — never a literal hex/font-family string in new or edited CSS. If a needed
  color/spacing isn't tokenized yet, add it as a token, don't hardcode it.
- Use `Button` (`ds-button*`) for every button; don't hand-roll new button styles
  per-page the way `.supply-primary`, `.rewards-landing-cta button`, etc. currently do.
  Consolidating these into `ds-button` variants is in-scope cleanup wherever POC-B/C
  touches a screen that has one.
- Purple (`--color-primary`) is the primary action/brand color; cyan
  (`--color-secondary`) is a secondary accent (seen in gradients, stat highlights) —
  keep this pairing consistent, don't introduce new brand colors per feature.
- This applies across guest, partner, and admin surfaces alike — the admin console
  being wired up in POC-B should look like it belongs to the same product, not a
  separate internal tool.

**Named exceptions — pages allowed deliberate custom treatment:**

- **404** (`not-found-*` classes) — already has its own illustration (animated dashed
  route line, drifting ticket icon, gradient-clipped giant number). This is a good
  precedent for what an intentional exception looks like: still uses the same color
  tokens and fonts, just with unique layout/motion for the moment.
- Any other exception must be **explicit and named here**, not accidental — if a page
  needs a genuinely different treatment (e.g. a future marketing/landing "moment"),
  Claude flags it for approval rather than one-off styling quietly proliferating in
  `styles.css` the way it appears to have already.

**Review criterion (added to `CLAUDE.md`):** design/visual consistency is now a
standing code-review check, same tier as accessibility — hardcoded colors/fonts where a
token exists, or a new bespoke button/card style where `ds-button`/existing patterns
would do, is a Medium finding unless the page is a named exception above.

## Milestones

### POC (current milestone) — finish proving the concept honestly

Goal: turn today's half-real, half-mocked prototype into a genuine proof of concept —
every screen either does what it visually claims, or is explicitly marked and hidden
as not-yet-available. No new features, no scale, no real users yet. Two parts:

**POC-A: Ground truth close-out** (small — most discovery is already done above)

- Confirm the one live admin→Convex call (`partnerAdmin.setAccountStatus`) — which
  screen, does it actually work end-to-end.
- Confirm current live SEO state on menetap.com matches what `seo.ts`/sitemap script
  intend (spot-check robots.txt, sitemap.xml, a few rendered pages).
- **Build real routes for `/en/login`, `/en/signup`, `/en/reset-password`** (decided
  2026-09-28) — `docs/sitemap.md` documents these but they don't exist; guest auth is
  currently modal-only (`AuthPanel`, opened via `setAuthOpen`), with no pathname
  handling for any of the three. Add deep-linkable routes that open `AuthPanel` in the
  right mode on load. This also fixes the 404 page's `/en/login` link, which is
  currently dead.
- Fix the account sidebar's dead `href="#"` links for "Payment methods" and "Settings"
  (`AccountFrame`, `App.tsx` ~line 4606) — the routes/screens themselves work, the nav
  just doesn't point to them.
- Decide and record the answer to the payment-model open question below — this gates
  Alpha scope.
- Run typecheck/test/build and record actual baseline numbers in a fresh
  `docs/PROJECT-STATUS.md`.

**POC-B: Admin console — mock → real, plus dead code removal** (the largest,
clearest-scoped piece of work here, because the backend already supports it — this is
wiring, not backend design)

- Delete the six `Legacy*` dead-code components.
- Wire each `Admin*` screen to its corresponding real Convex tables/functions:
  properties/users/teams (existing tables), finance/payouts (`commissions`,
  `payoutStatements`), disputes/moderation/risk/support (`supportTickets`,
  `refundRequests`, `propertyPhotos.moderationStatus`), announcements
  (`partnerAnnouncements`), settings/system (new, narrowly-scoped Convex functions
  only if genuinely needed — flag before building).
- Any admin action currently faked (e.g. "Save"/"Publish" buttons that just flip local
  state) either becomes a real mutation or is removed from the UI until it can be.

**POC-C: Core pillars beyond booking — design, then decide sequencing**

Experiences, Rentals, and Rewards have no backend. Before Codex builds any of these,
Claude designs the schema/API shape for each (mirroring the rigor already in
`schema.ts`) and brings it back for approval — same rule as everything else here: no
checklist without approved scope first.

- **Rentals is guest-gated by product rule** — "can't rent without staying" needs to be
  enforced server-side (tie a rental request to an active/upcoming `bookings` record),
  not just hidden in the UI.
- **Rewards** needs a points ledger tied to `users`/`bookings` (earn on stay, redeem
  against a future booking's rate) — schema doesn't exist yet.
- **Experiences** needs a listing model (likely similar shape to `addOnServices` but
  its own table, since it's discovery/browsing, not just a per-stay add-on) plus a way
  to associate experiences with a destination/area.
- **Supplier marketplace** (dental kits, soap, linen) — scoped (2026-09-28): **hotel
  partners buy, Menetap curates.** So the catalog is admin-curated (vendors don't
  self-list without approval — vendor submits, Menetap/admin approves what's sellable,
  similar to `propertyPhotos.moderationStatus`'s approve/reject pattern already in the
  schema), and the buyer-side is the partner console (a partner property orders
  supplies), not a guest-facing feature. This needs: a `vendorProfiles` table (mirrors
  `partnerProfiles`), a curated `supplierProducts` catalog with moderation status, and
  `supplyOrders` placed by partners against it — new tables, but the shape follows
  existing partner/property patterns closely.

**Pillar sequencing for Alpha — approved 2026-09-28.** Build **one pillar at a time**,
not all four in parallel, so each gets a real design + review pass instead of three or
four half-finished systems at once. Order:

1. **Rewards** — drives repeat bookings, and the "earn on stay, redeem against a
   future booking" loop reuses the booking flow that's already real.
2. **Supplier marketplace** — now that it's scoped, it's B2B (partner-to-Menetap-to-
   vendor) and doesn't touch guest-facing UI at all, so it can be built without
   competing for attention with guest-facing polish.
3. **Rentals** — guest-gated, simpler than a full marketplace, but needs real
   logistics thinking (who delivers the vehicle, insurance/liability) beyond just data
   model — worth scoping carefully rather than rushing.
4. **Experiences** — lowest urgency: it's discovery/content, not a transaction the
   business depends on, and can lean on the SEO/destination-page work already planned
   for Beta.

This work does not block POC-A/POC-B closing, but it must happen before Alpha claims
"community-powered hospitality" is real rather than aspirational.

**Exit criteria:** `docs/PROJECT-STATUS.md` exists with zero hedged language and the
payment-model decision recorded (done — see above); no admin screen fabricates data or
fakes a write action; the six `Legacy*` components are deleted; each POC-C pillar has
either an approved schema design or an explicit "deferred past Alpha" decision — no
pillar stays silently unaddressed.

### Alpha — real properties, real bookings, real partners

- **Recruit alpha partners** — no candidate properties/partners lined up yet. This is
  a real step, not assumed: identify target properties (likely starting in the
  destinations already built out — Yogyakarta/Sleman/Bandung/Solo/Bantul — since those
  landing pages already exist), pitch/onboard a small number through the existing
  partner application flow, get them through `partnerOnboarding` for real.
- Exercise the full booking → payment (Menetap-collects manual transfer / pay-at-hotel)
  → confirmation → cancellation/refund → commission → payout path with real
  transactions for those partners.
- Legal documents (terms, privacy, cancellation policy, partner agreement, supplier
  agreement once that pillar exists) drafted as real binding text by Claude; you source
  outside legal review separately before anything goes live as binding.
- Build whichever POC-C pillars were approved for this milestone (see POC-C above) —
  sequencing depends on what got approved, not assumed here.
- Address the `App.tsx` monolith at least for anything touched this milestone (split
  newly-real admin screens into their own files rather than adding more to the
  5,000-line file) — not a full rewrite, but stop making it worse.

**Exit criteria:** at least one real booking completed end-to-end with real money (or
confirmed real pay-at-hotel/bank-transfer flow) and real property data, admin console
usable to manage it for real, at least one recruited alpha partner live, no Blocker/High
review findings open.

### Beta — limited public access

- Full public-route SEO coverage using the existing `isDemo`-aware foundation, applied
  to real (not seed) inventory at scale.
- Observability for booking/payment failures and partner onboarding drop-off
  (`src/observability.ts` already exists — extend, don't replace).
- Support flow real and staffed (`supportTickets`/`supportRequests` already modeled).
- Legal documents finalized and versioned for real.
- Expand test coverage to cover the booking flow end-to-end, not just isolated units.

**Exit criteria:** comfortable inviting public guests without babysitting every
booking manually.

### Launch — full deployment

- All seed/demo data removed or clearly partitioned from production data.
- Complete legal document set, Indonesia-specific disclosures included.
- Final full-site SEO, accessibility, and security pass.
- Deployment/rollback runbook confirmed for Hostinger production.

**Exit criteria:** fully real, fully legal, willing to market publicly without caveats.

## Decisions locked in (2026-09-28)

1. **Payment model** — no gateway. `pay_at_hotel` / `manual_bank_transfer` stays,
   Menetap acts as merchant of record for the transfer path (collect-and-remit, no
   card processor). See Payments section above.
2. **Legacy dead code** — delete the six `Legacy*` components in POC-B.
3. **Admin console priority** — full scope, all of it, in POC-B. No admin surface
   deferred.
4. **Legal review** — Claude drafts all legal documents; user sources outside
   legal/counsel review separately before anything is treated as binding.
5. **Alpha partners** — none recruited yet. "Recruit alpha partners" is now an
   explicit Alpha milestone step (see above).
6. **Timeline** — no calendar constraint. Fully quality-gated.

## Still open — need your input

None. All decisions locked; pillar sequencing (Rewards → Supplier marketplace →
Rentals → Experiences) approved 2026-09-28. Design work is proceeding one pillar at a
time in that order — see `docs/design-poc-c-rewards.md` for the first.
