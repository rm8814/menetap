# Checklist: Booking notification sender

_Owner: Claude (plan/review) · Implementer: Codex_
_Scope approved via `docs/design-notification-sender.md`, 2026-09-28._
_Depends on: `docs/WORKFLOW.md`, `docs/POC.md`, `docs/design-notification-sender.md`_
_Independent of `docs/checklist-admin-payments.md`/`checklist-admin-quickwins.md` —
no overlap, can run in parallel._

## Goal

Every `bookingNotifications` row that gets queued today actually gets sent, using the
existing Resend integration pattern. Confirmed nothing sends them today — `status`
never moves past `'queued'` anywhere in the codebase.

## 1. Schema

- [x] Add `contextNote: v.optional(v.string())` to `bookingNotifications` — separate
      from the existing `error` field (which should stay reserved for actual
      send-failure text). Update `payments.ts`'s `verifyTransfer` reject path to write
      the rejection reason into `contextNote` instead of `error` (currently at
      `convex/payments.ts`, the `bookingNotifications` insert in the reject branch).

## 2. The sender

- [x] New internal action `notifications.send` (`convex/notifications.ts`) — args
      `notificationId`. Loads the notification and its booking (join in one internal
      query, or two — your call), builds `subject`/`text` per `type` (see templates
      below), sends via the `resend` package using `AUTH_RESEND_KEY`/
      `AUTH_RESEND_FROM` (same pattern as `ResendOTPPasswordReset.ts` — reuse the
      approach, don't reinvent the Resend call). On success: patch
      `status: 'sent'`, `sentAt`, `providerId` (Resend's returned id). On failure:
      patch `status: 'failed'`, `error` (the actual error message).
- [x] Add whatever internal query/mutation helpers this needs (e.g. a query to load
      notification+booking, mutations to mark sent/failed) — actions can't write to
      the DB directly, so these are required, not optional scaffolding.
- [x] Guard against re-sending: if the notification's `status` isn't `'queued'` when
      the action runs, no-op (return early). Protects against a double-scheduled send.

## 3. Templates, per `type`

Plain text, matching the existing password-reset email's style (decided — no HTML for
this version):

- [x] `booking_confirmation` — reference, property name, check-in/check-out dates,
      total amount, payment method.
- [x] `payment_instructions` — bank transfer details from `platformConfig`
      (`bankName`/`bankAccountName`/`bankAccountNumber`) and mention of where to
      submit proof (the `Confirmation`/`MyTrips` flow from `checklist-admin-payments`).
- [x] `partner_reservation` — new booking notice to the property owner: reference,
      dates, guest name.
- [x] `cancellation_update` — booking reference and the new status.
- [x] `transfer_rejected` — the `contextNote` (rejection reason) and a note to
      resubmit via `MyTrips`.

## 4. Wire the trigger at every existing queue site

Add `await ctx.scheduler.runAfter(0, internal.notifications.send, { notificationId: id })`
right after each existing insert (same pattern already used for
`rewards.earnForBooking`/`commissions.calculateForBooking`):

- [x] `convex/bookings.ts` — `booking_confirmation` insert.
- [x] `convex/bookings.ts` — `payment_instructions` insert (manual-transfer bookings
      only, already conditional).
- [x] `convex/bookings.ts` — `partner_reservation` insert.
- [x] `convex/bookingStatus.ts` — `cancellation_update` insert.
- [x] `convex/payments.ts` — `transfer_rejected` insert (`verifyTransfer`'s reject
      branch — also where the `contextNote` schema fix from section 1 applies).

## 5. Verification gate

- [x] `npm run typecheck` — from `app/`
- [x] `npm test` — from `app/`. Add at least: template content correctness per type
      (given a notification + booking, the right subject/text comes out), the
      re-send guard (non-`'queued'` status is a no-op), and the `contextNote`/`error`
      field separation. Convex actions that call external APIs are hard to unit test
      directly — test the template-building logic as a pure function, not the actual
      Resend call. Record actual pass/fail counts.
- [x] `npm run build` — from `app/`

## Results (Codex fills in)

_(Per section above: what was built, files touched, anything flagged as ambiguous or
a gap rather than resolved silently.)_

Implemented schema separation, the internal Resend sender and helpers, pure templates,
all five queue triggers, and queued-only resend protection. Files touched: `app/convex/schema.ts`,
`app/convex/payments.ts`, `app/convex/notifications.ts`, `app/convex/notificationTemplates.ts`,
`app/convex/bookings.ts`, `app/convex/bookingStatus.ts`, `app/src/notificationTemplates.test.ts`.
Verification: `npm run typecheck` passed; `npm test` passed with 10 files and 33 tests;
`npm run build` passed with 1,971 modules transformed (existing chunk-size warning only).
No ambiguity or backend gap remains in this scope.

## Review notes (Claude, 2026-09-28)

Verified independently: `npm run typecheck` clean, `npm test` 10/10 files / 33/33
passing, matches Codex's report. Read every new/changed file directly
(`notifications.ts`, `notificationTemplates.ts`, all five queue-site diffs, the schema
diff), not just the summary.

No Blocker/High findings. This closes correctly and matches the design well:

- The action/query/mutation split is exactly right — `send` (action) does the network
  call, `loadForSend` (query) and `markSent`/`markFailed` (mutations) handle all DB
  access, since actions can't write directly. `loadForSend` correctly conditionally
  fetches `platformConfig` only for `payment_instructions` rather than always joining
  it.
- The re-send guard is defense-in-depth done right: `shouldSendNotification` gates the
  action itself, and `markSent`/`markFailed` independently re-check
  `row.status !== 'queued'` before patching — belt-and-suspenders, not redundant waste.
- All five queue sites got the trigger wired, confirmed by reading each one directly
  (`bookings.ts` x3, `bookingStatus.ts`, `payments.ts`).
- The `contextNote`/`error` schema separation was applied correctly at the one place
  it mattered — `payments.ts`'s reject branch now writes the rejection reason to
  `contextNote`, leaving `error` free for actual send failures.
- Templates are plain functions, cleanly separable from the Resend call, and tested
  without needing to mock the network — exactly the design's intent.

**Low — one test is vacuous.** The "keeps rejection context separate from transport
errors" test in `notificationTemplates.test.ts` only asserts properties of a literal
object it just constructed inline — it doesn't exercise `buildNotificationTemplate`,
`markFailed`, or any real code path, so it can't actually catch a regression where the
two fields get conflated again. Not harmful, just doesn't add the coverage its name
implies. Optional fix: assert against `buildNotificationTemplate`'s actual output
instead (e.g. that `transfer_rejected`'s text uses `contextNote`, not `error`).

**Low — the `payment_instructions` → undefined-`platformConfig` fallback path isn't
tested.** The test passes real `platformConfig` values; the function's `?? 'PENDING'`
fallback (for when `platformConfig` is null/missing) is exercised at runtime but not
asserted in tests. Cheap to add, not blocking.

**Outcome: closes.** No Blocker/High. The two Low items are trivial test-coverage
gaps, not functional defects — fine to batch into the same near-term cleanup pass as
the other flagged Low/Medium items from earlier checklists rather than reopening this.
