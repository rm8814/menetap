# Design fidelity audit: admin console vs. `/reference` `.dc.html` files

**Status: findings only — no checklist yet, one urgent conflict needs your input
before the in-flight Rentals checklist proceeds.**

16 reference files uploaded to `/reference`, all admin screens. Extracted each file's
distinctive content and the canonical sidebar structure, compared against the actual
implemented admin console.

## The canonical sidebar IA (from every reference file's shared nav)

```
Commerce:       Commission · Properties · Rentals · Suppliers · Payouts · Finance
People:         Users · Team
Trust & safety: Moderation · Disputes & refunds · Risk & fraud
Communication:  Support inbox · Announcements
Insights:       Reports · System health
Account:        Settings
```

**Current implementation doesn't match this**: `AdminFrame`'s `nav` array is a flat
list with no section grouping, and has a "Payments" entry that isn't part of this IA
at all (checked `Admin Payouts.dc.html` and `Admin Finance.dc.html` — neither
references guest-payment/transfer verification; it doesn't appear to have a home in
the original design). This needs reconciling but isn't urgent — see recommendation
at the end.

## URGENT — Rentals reference conflicts with the approved design, and Rentals is mid-checklist right now

`Admin Rentals.dc.html` shows a **"Fleet operators"** stat alongside "Active
vehicles" and "Pending review," with a Vehicle/Type/Status/Listed/View table — the
same shape as `Admin Suppliers.dc.html`'s vendor-moderation pattern (Supplier/Items/
Status/Joined/View, "Active suppliers"/"Pending review"). This implies the original
design intended **third-party fleet operators who list vehicles for admin approval**
— structurally like the Supplier marketplace's vendor model.

This directly contradicts `docs/design-poc-c-rentals-ux.md`'s explicit call: **"Not a
marketplace — Menetap's own managed fleet... no vendor-curation layer."** That
decision was based on the guest-facing copy already in `RentalsV2.tsx` ("Menetap-
managed fleet," confirmed still there verbatim). **The two design sources genuinely
disagree** — I'm not resolving this silently.

**Decided (2026-09-29): keep Menetap-managed fleet.** Matches the guest-facing copy
and the already-approved design. The reference's "Fleet operators" language is
treated as an unreconciled leftover from earlier exploratory design, not a directive
to rearchitect — the admin `Admin Rentals.dc.html` reference's *content* (vehicle
listing shape, columns) can still inform how `RentalAdmin` looks, just without a
vendor/operator-approval layer behind it. `docs/checklist-poc-c-rentals.md` proceeds
as currently scoped (fix the typecheck/build Blocker); no design rework needed.

## Per-screen summary (reference content vs. current state)

| Screen | Reference shows | Current state |
|---|---|---|
| Commission (`/admin`) | Platform default rate, Featured Stay surcharge, curated collections, per-property override table | `AdminUnavailable`. Backend partially exists now (`properties.commissionPercentOverride`, `platformConfig.defaultCommissionPercent`) — could be wired, wasn't scoped into any checklist yet |
| Properties | Property/Status/Rooms/Joined/View | Real, close match — `Rooms` column is a static dash, no real room-count query wired |
| Rentals | Vehicle/Type/Status/Listed, "Fleet operators" stat | Real (mid-review) but built as flat lists, not this table shape — **and the fleet-operator conflict above** |
| Suppliers | Supplier/Items/Status/Joined/View, "Active suppliers" stat | Real (closed) but built as flat product-moderation + payment lists, not this vendor-listing table shape |
| Payouts | Property/Gross/Net payout/Status, payout queue | `AdminUnavailable`. Backend exists now (`payoutStatements.generate`, `partnerOperations.payoutStatements`/`reviewPayout`) — not wired |
| Finance | Transaction ledger (Date/Party/Type/Gross/Fee/Status), tax filing summary | `AdminUnavailable`. Partial backend (`commissions.listAll`) covers the ledger; filing/tax summary has no backend at all |
| Users | Guest/Partner tabs, Trips/Spend/Commission owed, Activate/Suspend/Reset PW | `AdminUnavailable`. No backend — known gap in `checklist-poc-b.md` |
| Team | Invite member, roles, audit trail | `AdminUnavailable`. No backend |
| Moderation | Approve/Reject/**Request corrections** (three states) | Real, but only Approve/Reject exist — schema (`propertyPhotos.moderationStatus`) has no "corrections requested" state |
| Disputes & refunds | Booking lookup, approve/deny, **document outcome, flag overbooking, change history, payment history** | Real, but much thinner — just a pending-list with approve/reject, missing the lookup/investigation tooling |
| Risk & fraud | Risk flags, investigate/dismiss | `AdminUnavailable`. No backend — explicitly deferred in `design-admin-backend.md` |
| Support inbox | (little distinctive static text extracted) | Real, not compared in detail this pass |
| Announcements | Audience targeting, compose, send broadcast | `AdminUnavailable`. `partnerAnnouncements` table exists (partner-read-only), no admin create/publish API |
| Reports | Report/Period/Download, gross revenue | `AdminUnavailable`. No backend |
| System health | Active alerts, inventory sync errors, stale rates, security events | `AdminUnavailable`. No backend, no monitoring integration |
| Settings | Booking policy fees, notification preferences, change password | `AdminUnavailable`. `platformConfig` covers bank details/commission %, not this screen's actual content (fees, notifications, security) — different scope than what got built |

## Recommendation

Given the scope (16 screens, several already-closed checklists whose content doesn't
match the reference shape), I'd sequence this as:

1. **Resolve the Rentals fleet-operator conflict first** — it's blocking a decision
   on the in-flight checklist.
2. Sidebar restructure (grouped sections, correct labels, decide where payment
   verification actually belongs) — small, mechanical, do it once regardless of
   pillar answer.
3. Content-fidelity fixes for **already-closed** real screens (Properties, Moderation,
   Disputes, Suppliers) — bring them in line with the reference table shapes/actions,
   each probably its own small checklist.
4. New backend+UI work for still-placeholder screens (Commission, Payouts, Finance
   have partial backend now and are the cheapest wins; Users/Team/Risk/Announcements/
   Reports/System/Settings need backend design first, same process as every pillar so
   far).

Not attempting all of this in one pass — want your read on the Rentals conflict
first, since that's actively blocking the checklist in front of us.
