# POC-C design: Supplier marketplace — UI/UX

**Status: APPROVED (2026-09-28).** Ready for backend design.

Second of four POC-C pillars, per the approved sequencing in `docs/POC.md`
(Rewards ✅ → **Supplier marketplace** → Rentals → Experiences). Scoped decision from
`docs/POC.md`: **hotel partners buy, Menetap curates.**

This is a UI/UX-first design (screens, flows, information architecture), not a
backend schema pass — that follows once this is approved, similar to how Rewards had
its design approved before the checklist, but split into two steps here since there's
an existing prototype worth evaluating on its own terms first.

## What already exists — a real head start, with one important mismatch

`App.tsx` already has a complete, polished prototype: `SupplyLanding`, `SupplyHeader`,
`SupplyCatalog`, `SupplyCheckout`, `SupplyConfirmation`, with matching CSS
(`.supply-*` classes in `styles.css`). It's well-designed — category browsing, a
persistent cart (localStorage), a checkout form, an order confirmation with a
reference number. The visual direction ("Menetap-fulfilled — one supplier, one
invoice," "Managed by UPSCALE") is consistent with branding already used elsewhere
(`PartnerLanding` also references UPSCALE) — not something to invent, something to
keep.

**The mismatch:** this prototype assumes a partner-buyer model in its copy (`SupplyHeader`
links to "Partner dashboard," the checkout form defaults to a property name and
address), which is actually consistent with the approved decision — but **the routes
have zero authorization**. `screen === "supplyLanding"`/`"supplyCatalog"`/
`"supplyCheckout"`/`"supplyConfirmation"` render with no `ProtectedScreen` wrapper at
all — confirmed by reading the routing table directly. Anyone, logged in or not, can
browse and "checkout." It's also currently marked as a **public, indexable route** in
`docs/sitemap.md` (`/en/supply — Public partner/vendor landing page; review before
indexing`) — which contradicts "hotel partners buy," the same way every other
partner-only surface (`partner-dashboard`, `partner-inventory`, etc.) is protected and
noindexed. This needs to move under partner authorization, not stay public.

## Proposed information architecture

Three distinct user-facing surfaces, not one:

### 1. Partner-facing: browse and buy (evolves the existing prototype)

- **Supply landing** (`/en/partner-dashboard/supply` or similar — moves under the
  partner route namespace, not a standalone `/en/supply`) — category browse, same
  visual shape as today's `SupplyLanding`, but behind partner auth.
- **Catalog** — same category-filtered grid as today's `SupplyCatalog`, but sourced
  from a real (admin-curated) product list instead of the hardcoded `supplyProducts`
  array, and the cart ties to the authenticated partner, not `localStorage` alone
  (keep `localStorage` for cross-session convenience if you like, but the source of
  truth on submit must be server-side).
- **Checkout** — same shape as today's `SupplyCheckout`, but the "Deliver to" section
  auto-fills from the partner's actual real property (via `properties.listMine`,
  already real), not a hardcoded "Kaliurang Heritage Villa" default. Multi-property
  partners need a property selector, matching the pattern already used in
  `PartnerDashboard`'s property switcher.
- **Confirmation** — same shape as today's `SupplyConfirmation`, with a real order
  reference instead of the current client-generated one.
- **Order history** — new: a place in the partner dashboard nav (alongside Bookings/
  Inventory/Payouts) to see past supply orders and reorder — the existing
  confirmation screen's "Order more" link is a good start, but there's currently no
  history view at all.

### 2. Vendor-facing: submit products for curation (doesn't exist yet)

**Decided (2026-09-28): admin-invite-only, no public application flow.** Nothing today
lets a vendor submit anything — the `vendor` role exists in `schema.ts`'s `users`
table but has no UI anywhere. This simplifies the scope from what was originally
sketched:

- **No public "become a vendor" page, no self-serve application** — admin creates the
  vendor's account directly (a lightweight equivalent of `AdminUsers`/invite, not a
  `PartnerOnboarding`-style multi-step public flow). Revisit a public entry point later
  if vendor volume ever grows past what admin-invite can handle.
- **Vendor product management** — the one real vendor-facing screen needed: a simple
  list/add/edit view for a vendor's own products, each with a moderation status
  (pending/approved/rejected), mirroring how `propertyPhotos.moderationStatus` already
  works for partner property photos. Reached only after admin has created the
  account/login — same access model as `AdminLogin`'s staff-only pattern, not a public
  signup.

### 3. Admin-facing: curate the catalog (extends the moderation pattern from
   `checklist-admin-quickwins.md`)

- A moderation-style queue for pending vendor product submissions — visually and
  structurally like `AdminQuickOpsPage kind="moderation"` (approve/reject with a
  reason), not a new pattern.
- A live catalog management view (what's currently sellable, by category) — smaller
  scope, could piggyback on the same screen as the moderation queue rather than being
  a separate one.

## Decided: Menetap is the intermediary, vendor identity never shown to partners

**Decided (2026-09-28):** hotels never see which vendor fulfills their order. Menetap
collects payment from the partner and separately pays the vendor — Menetap is the
merchant of record for supply orders, same architectural pattern as guest bookings
(`platformConfig`'s collect-and-remit model, `commissions`/`payoutStatements`).

This is a real, binding UI constraint, not just a business-logic detail:
- **Every partner-facing screen (catalog, cart, checkout, confirmation, order
  history) must never render a vendor name, vendor contact, or any vendor-identifying
  field.** The product listing shows what it is and what it costs — not who supplies
  it.
- This actually validates the existing prototype's copy almost exactly as written:
  "Menetap-fulfilled — one supplier, one invoice" already frames Menetap as the single
  counterparty. Keep that framing; it was accidentally already right.
- Only the **admin** curation/catalog screens (and vendor's own product management
  screen, scoped to their own products) need vendor identity — never anything
  partner-facing.
- Backend implication for the design that follows: `supplyOrders` needs an internal
  reference to which vendor(s) fulfill each line item (for Menetap's own operations
  and for paying vendors), but any partner-facing query must project that field out
  entirely — not just hide it in the UI, actually exclude it at the query level, the
  same discipline already used for guest-vs-admin data elsewhere in this codebase.

## What to keep vs. change from the existing prototype

**Keep as-is (good design, don't redo):** category grid layout, product card shape
(image/name/unit/price/quantity stepper), checkout two-column layout (form +
summary), confirmation screen's success state, the "Menetap-fulfilled, one invoice"
positioning, UPSCALE branding references.

**Change:**
- Move all four routes under partner authorization (`ProtectedScreen`,
  `allowedRoles={["partner", "operations", "admin"]}`, matching other partner
  screens) and out of `docs/sitemap.md`'s public/indexable section into the
  protected/noindex partner routes section, alongside `partner-dashboard` etc.
- Replace the hardcoded `supplyProducts` array with real catalog data.
- Replace the hardcoded checkout defaults ("Kaliurang Heritage Villa," "Anin Wida")
  with the authenticated partner's real data.
- Add the three missing surfaces above (order history, vendor submission, admin
  curation) that don't exist in any form today.

**Design-system consistency note** (per `docs/POC.md`'s "Design & visual direction"):
`.supply-*` CSS currently hardcodes hex colors and font strings the same way flagged
elsewhere in the codebase — worth converting to the existing `--color-*`/`--font-*`
tokens as this gets rebuilt, not preserved as-is.

## Decisions locked in (2026-09-28)

1. **Vendor onboarding:** admin-invite-only, no public application flow.
2. **Menetap is the intermediary; vendor identity is never shown to partners** —
   Menetap collects payment and pays vendors separately. See dedicated section above.
3. **Payment mechanism: manual bank transfer, same as bookings.** A partner pays
   Menetap upfront via manual transfer, finance verifies it — reuses `payments.ts`'s
   existing `submitManualTransfer`/`listPendingTransfers`/`verifyTransfer` pattern
   rather than building a new payout-statement-deduction mechanism. Update the
   existing prototype's "Billed with your monthly Menetap statement" copy to match
   (it implied a deduction model that isn't what was decided) — an "await bank
   transfer" state on the confirmation/order-history screen instead, matching how a
   guest booking's `Confirmation` already handles the equivalent state.
4. **Full fulfillment status tracking**, not just "placed" — `supplyOrders` needs a
   real status progression (placed → confirmed → shipped → delivered, mirroring the
   union-of-literals pattern already used for `bookings.status`/
   `manualBankTransfers.status` elsewhere in `schema.ts`), and the partner-facing
   order history screen needs to actually surface it, not just show a static
   "order placed" confirmation. Status updates are admin/Menetap-side actions (who
   updates status — Menetap staff manually tracking with the vendor, not the vendor
   directly, consistent with vendor identity/access staying admin-mediated).

## Next step

All decisions resolved. Ready for a backend schema design doc (mirroring
`docs/design-poc-c-rewards.md`'s format: proposed schema, proposed Convex functions,
where it touches existing code, then a checklist) — `vendorProfiles`,
`supplierProducts` (with moderation status), `supplyOrders` (with the full status
union and a manual-transfer payment reference), plus the three UI surfaces this doc
scoped (partner buy flow evolution, vendor product management, admin curation).
