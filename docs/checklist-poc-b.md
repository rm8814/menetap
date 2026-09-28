# Checklist: POC-B — Admin console mock → real, dead code removal

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope approved via `docs/POC.md` (POC milestone, part B), 2026-09-28._
_Depends on: `docs/WORKFLOW.md`, `docs/POC.md`, `docs/checklist-poc-a.md`_

## Goal

Every `Admin*` screen either reads/writes real Convex data, or is explicitly marked
and hidden as not-yet-available. No screen fabricates data (hardcoded arrays standing
in for real records) or fakes a write action (a "Save"/"Publish" button that only
flips local state). Full admin scope — nothing deferred, per the approved decision in
`docs/POC.md`. Follow the site-wide design direction in `docs/POC.md`'s "Design &
visual direction" section while touching these screens (use existing `--color-*`/
`--font-*`/`--radius-*` tokens and `Button`/`ds-button*`, don't hardcode hex/font
strings or hand-roll new button styles).

## 1. Delete dead code first

- [ ] Delete `LegacyPartnerAnnouncements`, `LegacyPartnerSupport`,
      `LegacyPartnerPayouts`, `LegacyPartnerBookings`, `LegacyPartnerInventory`,
      `LegacyPartnerDashboard` from `App.tsx`. Confirm via grep that none of the six
      are referenced anywhere (a `screen === "..."` branch or otherwise) before
      deleting — if one turns out to be reachable, stop and flag it instead of
      deleting silently.

## 2. Wire each admin screen — one item per screen, check off independently

For each screen below: replace hardcoded local arrays/`useState` with real
`useQuery`/`useMutation` calls against the named tables/functions (existing ones;
only add a new narrowly-scoped Convex function if genuinely needed, and flag it in
the results section rather than inventing it silently).

- [ ] `AdminConsole` — commission %, featured placements, curated collections. If no
      existing table models "curated collections" or "featured status," flag this as
      a backend gap rather than inventing a new table unprompted.
- [ ] `AdminProperties` — `properties` table (status, area, city, owner).
- [ ] `AdminPropertyDetail` — `properties`, `roomTypes`, `ratePlans`, `availability`,
      `propertyPhotos` for the detail/moderation view.
- [ ] `AdminPartnerDetail` — `partnerProfiles`, `partnerApplications`,
      `partnerAgreements`.
- [ ] `AdminGuestDetail` — `users`, `bookings` (guest's booking history). Confirm and
      document the existing `partnerAdmin.setAccountStatus` call found in POC-A here if
      it lives on this screen.
- [ ] `AdminUsers` — `users` table (role, status, filtering by role).
- [ ] `AdminTeam` — `users` filtered to staff roles (`support`/`operations`/
      `finance`/`admin`).
- [ ] `AdminFinance` — `commissions`, `payoutStatements`.
- [ ] `AdminOpsPage kind="payouts"` — `payoutStatements`.
- [ ] `AdminOpsPage kind="reports"` — confirm what data this should show; if nothing
      in schema supports it yet, flag rather than fabricate a report source.
- [ ] `AdminOpsPage kind="disputes"` — `refundRequests`.
- [ ] `AdminOpsPage kind="moderation"` — `propertyPhotos.moderationStatus` (and
      `roomPhotos` if applicable).
- [ ] `AdminOpsPage kind="risk"` — flag: no obvious existing table models fraud/risk
      signals; likely needs a genuine backend gap flag, not invented data.
- [ ] `AdminOpsPage kind="support"` — `supportTickets`, `supportRequests`.
- [ ] `AdminAnnouncements` — `partnerAnnouncements` (create/edit/publish).
- [ ] `AdminSettings` — flag which settings have a real home today (none confirmed) vs.
      need a new, narrowly-scoped Convex table/function — do not invent broad settings
      infrastructure without flagging scope first.
- [ ] `AdminSystem` — confirm what "system health" should mean here; likely no real
      data source exists yet — flag rather than fabricate uptime/status numbers.
- [ ] `AdminLogin` — confirm this already works for real (it calls Convex Auth per
      earlier inspection) — verify, don't just assume.
- [ ] `AdminAccessDenied` — static is fine here; this is a permission-denied state, not
      a data screen. No change needed unless copy needs updating.

## 3. Every fake write action becomes real or is removed

- [ ] Audit every "Save"/"Publish"/similar button across the screens above. Each one
      either calls a real mutation now, or is removed/disabled with an honest "not yet
      available" state — never left silently faking success.

## Results (Codex fills in)

_(Per screen: what was wired, what was flagged as a backend gap, files touched.)_

## Backend gaps flagged (fill in as found, don't build silently)

_(List any screen above where no existing Convex table/function covers what the UI
needs — Claude decides whether to design new schema or cut scope, same rule as
POC-C.)_

## Verification gate

- [ ] `npm run typecheck` — from `app/`
- [ ] `npm test` — from `app/`, record actual pass/fail counts
- [ ] `npm run build` — from `app/`

## Review notes

_(Claude fills this in after reviewing completed work — Blocker/High/Medium/Low.)_
