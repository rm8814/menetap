import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';
import { recordAudit } from './audit';

export const listPending = query({ args: {}, handler: async (ctx) => { await requireRole(ctx, ['finance', 'operations', 'admin']); return ctx.db.query('refundRequests').withIndex('by_status', (q) => q.eq('status', 'pending')).take(100); } });

export function validateOverbookingNote(note: string) {
  const trimmed = note.trim();
  if (trimmed.length < 3 || trimmed.length > 500) throw new Error('A meaningful overbooking note is required.');
  return trimmed;
}

export const lookupBooking = query({ args: { reference: v.string() }, handler: async (ctx, args) => {
  await requireRole(ctx, ['finance', 'operations', 'admin']);
  const reference = args.reference.trim();
  if (!reference) return null;
  const booking = await ctx.db.query('bookings').withIndex('by_reference', (q) => q.eq('reference', reference)).first();
  if (!booking) return null;
  const [property, payments, history, refundRequests] = await Promise.all([
    ctx.db.get(booking.propertyId),
    ctx.db.query('payments').withIndex('by_booking', (q) => q.eq('bookingId', booking._id)).order('asc').collect(),
    ctx.db.query('bookingStatusHistory').withIndex('by_booking', (q) => q.eq('bookingId', booking._id)).order('asc').collect(),
    ctx.db.query('refundRequests').withIndex('by_booking', (q) => q.eq('bookingId', booking._id)).order('desc').collect(),
  ]);
  return { booking, property, payments, history, refundRequests };
} });

export const flagOverbooking = mutation({ args: { bookingId: v.id('bookings'), note: v.string() }, handler: async (ctx, args) => {
  await requireRole(ctx, ['finance', 'operations', 'admin']);
  const booking = await ctx.db.get(args.bookingId);
  if (!booking) throw new Error('Booking not found.');
  const note = validateOverbookingNote(args.note);
  await recordAudit(ctx, { action: 'booking.overbooking_flagged', entityType: 'booking', entityId: String(booking._id), metadata: { note } });
  return { flagged: true };
} });

export const review = mutation({
  args: { refundRequestId: v.id('refundRequests'), decision: v.union(v.literal('approve'), v.literal('reject')), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const reviewer = await requireRole(ctx, ['finance', 'operations', 'admin']);
    const request = await ctx.db.get(args.refundRequestId);
    if (!request || request.status !== 'pending') throw new Error('Refund request is no longer pending.');
    const status = args.decision === 'approve' ? 'approved' : 'rejected';
    const now = Date.now();
    await ctx.db.patch(args.refundRequestId, { status, reviewedByUserId: reviewer._id, reviewedAt: now, updatedAt: now });
    await recordAudit(ctx, { action: `payment.refund_${status}`, entityType: 'refundRequest', entityId: args.refundRequestId, metadata: { note: args.note?.trim().slice(0, 500) } });
    return { status };
  },
});
