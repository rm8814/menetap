# Design: Booking notification sender

**Status: APPROVED (2026-09-28).** Ready for a checklist.

Follow-on from `docs/checklist-admin-payments.md`'s review: no booking-related email
is ever actually sent to anyone. Confirmed by reading the code — `bookingNotifications`
rows get queued in five places (`bookings.ts` x3, `bookingStatus.ts`, `payments.ts`)
with `status: 'queued'`, but nothing ever sends them or moves them past that status.
`convex/notifications.ts` already has admin-facing read queries
(`listDeliveryFailures`, `getForBooking`) — the visibility layer exists, the sender
doesn't. This predates the payments work; it's been true since booking confirmation
emails were first modeled.

**This affects guest trust in the core loop, not just Rewards/payments** — a guest who
books today gets no confirmation email at all. Worth prioritizing alongside, not after,
the payment/commission work for the first live-site goal.

## What exists to build on

`convex/ResendOTPPasswordReset.ts` is a clean, working pattern: imports `Resend` from
the `resend` npm package (already a dependency), reads `AUTH_RESEND_KEY`/
`AUTH_RESEND_FROM` from env, calls `resend.emails.send(...)`, throws on error. This
design reuses that pattern rather than inventing a new email integration.

## Proposed design

### Trigger

Convex mutations can't make outbound network calls (Resend's API), only Convex
**actions** can. So: each of the five existing `insert('bookingNotifications', ...)`
call sites gets one added line —
`await ctx.scheduler.runAfter(0, internal.notifications.send, { notificationId: id })`
— scheduling the actual send immediately after queueing, same pattern already used for
`rewards.earnForBooking` and `commissions.calculateForBooking`.

### The sender

New internal action in `convex/notifications.ts`:

```ts
export const send = internalAction({
  args: { notificationId: v.id('bookingNotifications') },
  handler: async (ctx, args) => {
    const notification = await ctx.runQuery(internal.notifications.getOne, { notificationId: args.notificationId });
    if (!notification || notification.status !== 'queued') return;
    const booking = await ctx.runQuery(internal.bookings.getInternal, { bookingId: notification.bookingId });
    if (!booking) { /* mark failed, no booking to reference */ return; }
    const { subject, text } = buildContent(notification, booking); // see templates below
    try {
      const resend = new ResendAPI(env.AUTH_RESEND_KEY);
      const { data, error } = await resend.emails.send({ from: env.AUTH_RESEND_FROM ?? '...', to: [notification.recipientEmail], subject, text });
      if (error) throw new Error(error.message);
      await ctx.runMutation(internal.notifications.markSent, { notificationId: args.notificationId, providerId: data?.id });
    } catch (err) {
      await ctx.runMutation(internal.notifications.markFailed, { notificationId: args.notificationId, error: String(err) });
    }
  },
});
```

(Rough sketch, not final code — exact Convex action/query/mutation split TBD by
whoever implements, but this is the shape: action does the network call, two small
internal mutations do the DB writes since an action itself can't write directly.)

### Templates, per `type`

- `booking_confirmation` — reference, property name, dates, total, payment method.
- `payment_instructions` — bank transfer details (from `platformConfig`, now that it
  exists) and a link to submit proof.
- `partner_reservation` — notify the property owner a new booking came in.
- `cancellation_update` — booking reference and new status.
- `transfer_rejected` — the reason (see schema note below) and a resubmit link.

Plain-text is fine for a first version (matches the existing password-reset email's
style) — HTML templates can come later if you want richer formatting.

### Schema cleanup: separate rejection reason from send-failure error

`payments.ts`'s `verifyTransfer` currently stores the rejection note in
`bookingNotifications.error` — a field meant for send-failure text, not template
content. This should be its own field (e.g. `contextNote: v.optional(v.string())`) so
`error` stays reserved for actual delivery failures, and the sender can read
`contextNote` when building the `transfer_rejected` email body. Small schema addition,
fixes a real (if minor) semantic overload flagged in the payments checklist review.

### Failure visibility

`notifications.listDeliveryFailures` already exists and is admin-usable — once the
sender writes real `status: 'failed'` rows with a real `error` message on Resend
failures, that query becomes immediately useful without any further work. No new
admin UI strictly required for a first version, though wiring it to a real screen
(rather than leaving it callable-but-unused) would be a natural follow-up.

## Decisions locked in (2026-09-28)

1. **From-address:** reuse `AUTH_RESEND_FROM` — no reason to split transactional vs.
   security email yet; one-line change later if it's ever needed.
2. **Retry policy:** manual, via the existing `notifications.listDeliveryFailures`
   admin query — no automatic retry cron. Build one only if failed sends actually
   accumulate in practice.
3. **Plain text**, matching the existing password-reset email's style. HTML templates
   are a swap-in later without touching the sending logic, since the template
   function is already isolated for exactly that reason.
