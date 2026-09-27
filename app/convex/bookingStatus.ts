import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { auth } from './auth';
import { requireRole } from './authorization';

const statuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'] as const;
const allowedTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['cancelled', 'completed', 'no_show'],
  cancelled: [], completed: [], no_show: [],
};

export const update = mutation({
  args: { bookingId: v.id('bookings'), status: v.union(...statuses.map(v.literal) as [ReturnType<typeof v.literal>, ...ReturnType<typeof v.literal>[]]), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, ['partner', 'support', 'operations', 'admin']);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error('Booking not found.');
    if (actor.role === 'partner') {
      const property = await ctx.db.get(booking.propertyId);
      if (!property || property.ownerUserId !== actor._id) throw new Error('Not authorized for this booking.');
    }
    const nextStatus = args.status as typeof statuses[number];
    if (!allowedTransitions[booking.status]?.includes(nextStatus)) throw new Error(`Cannot move booking from ${booking.status} to ${nextStatus}.`);
    const now = Date.now();
    await ctx.db.patch(args.bookingId, { status: nextStatus, updatedAt: now });
    await ctx.db.insert('bookingStatusHistory', { bookingId: args.bookingId, fromStatus: booking.status, toStatus: nextStatus, reason: args.reason?.trim().slice(0, 500), changedByUserId: await auth.getUserId(ctx) ?? undefined, createdAt: now, updatedAt: now });
    const property = await ctx.db.get(booking.propertyId); const owner = property?.ownerUserId ? await ctx.db.get(property.ownerUserId) : null;
    if (owner?.email && nextStatus !== booking.status) await ctx.db.insert('bookingNotifications', { bookingId: booking._id, type: 'cancellation_update', recipientEmail: owner.email, status: 'queued', createdAt: now, updatedAt: now });
    return { status: nextStatus };
  },
});
