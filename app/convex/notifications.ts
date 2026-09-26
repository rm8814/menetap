import { query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';

export const listDeliveryFailures = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['support', 'operations', 'admin']);
    return ctx.db.query('bookingNotifications').withIndex('by_status', (q) => q.eq('status', 'failed')).order('desc').take(100);
  },
});

export const getForBooking = query({
  args: { bookingId: v.id('bookings') },
  handler: async (ctx, args) => { await requireRole(ctx, ['support', 'operations', 'admin']); return ctx.db.query('bookingNotifications').withIndex('by_booking', (q) => q.eq('bookingId', args.bookingId)).collect(); },
});
