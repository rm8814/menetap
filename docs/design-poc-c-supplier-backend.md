# POC-C design: Supplier marketplace — backend

**Status: APPROVED (2026-09-28).** Checklist: `docs/checklist-poc-c-supplier.md`.

Follows `docs/design-poc-c-supplier-ux.md` (approved). This is the schema/API design —
same format as `docs/design-poc-c-rewards.md`: proposed schema, proposed functions,
where it touches existing code, then a checklist once approved.

## Recap of the binding decisions this design has to satisfy

1. Hotel partners buy; vendors are admin-invited only, no public application.
2. **Vendor identity is never exposed to partners** — this is enforced at the query
   level below, not just hidden in the UI.
3. Payment: manual bank transfer, same pattern as booking payments, verified by
   finance.
4. Full fulfillment status tracking (placed → confirmed → shipped → delivered),
   updated by Menetap staff, not the vendor directly.

## Proposed schema

Mirrors existing patterns closely — `vendorProfiles` mirrors `partnerProfiles` (minus
the application-flow fields, since there's no application), `supplierProducts`'
moderation mirrors `propertyPhotos.moderationStatus`, `supplyOrders`/
`supplyOrderItems` mirrors `bookings`/`bookingRooms`, and `supplyTransfers` mirrors
`manualBankTransfers` — deliberately a **parallel table**, not a polymorphic extension
of `manualBankTransfers` itself, to avoid touching the already-reviewed booking
payment flow.

```ts
vendorProfiles: defineTable({
  userId: v.id('users'),               // the vendor's user account, role: 'vendor'
  businessName: v.string(),
  contactEmail: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  payoutBankName: v.string(), payoutAccountName: v.string(), payoutAccountLast4: v.string(),
  status: v.union(v.literal('active'), v.literal('suspended')),
  ...timestamps,
}).index('by_user', ['userId']),

supplierProducts: defineTable({
  vendorId: v.id('users'),
  name: v.string(), description: v.optional(v.string()), unit: v.string(),
  price: v.number(), currency: v.string(),
  category: v.union(v.literal('linen'), v.literal('housekeeping'), v.literal('guest_amenities'), v.literal('stationery')),
  moderationStatus: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),
  rejectionReason: v.optional(v.string()),
  active: v.boolean(),   // vendor/admin can deactivate without deleting
  ...timestamps,
}).index('by_vendor', ['vendorId']).index('by_moderation', ['moderationStatus']).index('by_category_active', ['category', 'active']),

supplyOrders: defineTable({
  propertyId: v.id('properties'), placedByUserId: v.id('users'),
  reference: v.string(),
  totalAmount: v.number(), currency: v.string(),
  status: v.union(v.literal('placed'), v.literal('confirmed'), v.literal('shipped'), v.literal('delivered'), v.literal('cancelled')),
  paymentStatus: v.union(v.literal('unpaid'), v.literal('pending_verification'), v.literal('paid')),
  deliveryAddress: v.string(), notes: v.optional(v.string()),
  ...timestamps,
}).index('by_property', ['propertyId']).index('by_status', ['status']),

supplyOrderItems: defineTable({
  supplyOrderId: v.id('supplyOrders'), supplierProductId: v.id('supplierProducts'),
  vendorId: v.id('users'),             // internal only — never returned to a partner query
  productName: v.string(), unit: v.string(),  // snapshotted at order time, same pattern as bookingRooms
  quantity: v.number(), unitPrice: v.number(), lineAmount: v.number(),
  ...timestamps,
}).index('by_order', ['supplyOrderId']).index('by_vendor', ['vendorId']),

supplyTransfers: defineTable({
  supplyOrderId: v.id('supplyOrders'),
  reference: v.string(), amount: v.number(), transferredAt: v.string(),
  evidenceFileId: v.optional(v.id('_storage')),
  status: v.union(v.literal('submitted'), v.literal('verified'), v.literal('rejected')),
  reviewedBy: v.optional(v.id('users')),
  ...timestamps,
}).index('by_order', ['supplyOrderId']).index('by_status', ['status']),
```

## Proposed Convex functions

### Vendor account creation (admin-invite-only)

- [ ] `vendorProfiles.adminCreate` (admin-only) — creates the `users` row
      (`role: 'vendor'`) and the `vendorProfiles` row together, then triggers the
      **existing** password-reset email flow (`ResendOTPPasswordReset`) so the vendor
      sets their own password on first login — reusing the existing mechanism instead
      of building a separate invite system.

### Vendor: manage own products

- [ ] `supplierProducts.listMine` (vendor-role, own `vendorId` only).
- [ ] `supplierProducts.create` / `.update` (vendor-role, own products only). Any edit
      to `price`/`name`/`description`/`category` resets `moderationStatus` to
      `'pending'` — re-review after a meaningful change, same principle as photo
      moderation resetting on re-upload.

### Admin: curate the catalog

- [ ] `supplierProducts.listPendingModeration` (staff-role) — mirrors
      `properties.listPendingModeration` exactly.
- [ ] `supplierProducts.moderate` (staff-role, approve/reject with reason) — mirrors
      `properties.updatePhotoModeration`.

### Partner: browse and buy — vendor identity excluded by construction

- [ ] `supplierProducts.listActive` (any authenticated partner) — **only returns**
      `_id, name, description, unit, price, currency, category` — no `vendorId`, ever.
      Filtered to `moderationStatus: 'approved'` and `active: true`.
- [ ] `supplyOrders.create` (partner-role) — args: `propertyId`, line items
      (`supplierProductId` + `quantity`), delivery address, notes. **Server
      recomputes `totalAmount` and each `lineAmount` from the real
      `supplierProducts.price` at order time** — never trusts a client-supplied total
      (same discipline as the Rewards `bookings.create` fix: no client-trusted money
      amounts). Snapshots `productName`/`unit`/`unitPrice` into `supplyOrderItems` so
      later price changes don't retroactively alter a placed order.
- [ ] `supplyOrders.listForProperty` (partner-role, own properties only) — order
      history. Also excludes `vendorId` (join `supplyOrderItems` but project it out).

### Payment — parallel to `payments.ts`, not shared with it

- [ ] `supplyPayments.submitManualTransfer` (partner-role, own order only) — same
      shape as `payments.submitManualTransfer`: reference/amount/date/evidence,
      inserts into `supplyTransfers` with `status: 'submitted'`, patches
      `supplyOrders.paymentStatus: 'pending_verification'`.
- [ ] `supplyPayments.listPendingTransfers` / `.verifyTransfer` (staff-role) — same
      shape as `payments.listPendingTransfers`/`.verifyTransfer`. Approve →
      `supplyOrders.paymentStatus: 'paid'`. Reject → queue a notification (extend
      `bookingNotifications`'s pattern, or a new minimal notification — flag which
      when this becomes a checklist item, don't decide silently here).

### Fulfillment status (staff-updated, per the decision)

- [ ] `supplyOrders.updateStatus` (staff-role only — not vendor, per the decision that
      Menetap staff tracks fulfillment manually with the vendor, vendor doesn't
      self-report) — progresses `status` through the union, reason optional.

## Where this touches existing code

- New files: `convex/vendorProfiles.ts`, `convex/supplierProducts.ts`,
  `convex/supplyOrders.ts`, `convex/supplyPayments.ts`. None of this touches
  `bookings.ts`/`payments.ts`/`commissions.ts` — fully additive, no risk to the
  already-reviewed core loop.
- `SupplyLanding`/`SupplyCatalog`/`SupplyCheckout`/`SupplyConfirmation` in `App.tsx`
  get real data per `docs/design-poc-c-supplier-ux.md`, moved under partner
  authorization, moved out of `docs/sitemap.md`'s public section.
- New admin screen(s) for product moderation and order fulfillment status — per the
  UX doc, reusing the `AdminQuickOpsPage`-style pattern rather than a new one.
- New partner dashboard nav item for order history (alongside Bookings/Inventory/
  Payouts).

## Deliberately deferred, not silently dropped

- **Vendor payout mechanism** (how Menetap actually pays vendors) — the UX/payment
  decision covers partner→Menetap collection, not Menetap→vendor remittance. This
  would naturally mirror `payoutStatements`' pattern (a `vendorPayoutStatements`
  table, generated from `supplyOrderItems` grouped by `vendorId`), but is out of scope
  for this pass — flagging so it's a known next step, not forgotten. Menetap can
  track and pay vendors manually/offline until this is built, same posture already
  taken for guest-facing manual processes elsewhere in this plan.
- **Rejected-transfer notification mechanism** — flagged inline above; decide at
  checklist time whether to extend `bookingNotifications` or add a parallel table.

## Next step

If approved, this becomes `docs/checklist-poc-c-supplier.md` — the third checklist in
the POC-C sequence (after Rewards ✅), covering schema, all four new function files,
the four evolved UI screens, the two new admin screens, and the partner dashboard nav
addition.
