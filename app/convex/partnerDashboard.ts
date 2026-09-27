import { query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';

export const overview = query({
  args: { from: v.string(), to: v.string(), propertyId: v.optional(v.id('properties')) },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const properties = user.role === 'partner' ? await ctx.db.query('properties').withIndex('by_owner', (q) => q.eq('ownerUserId', user._id)).collect() : await ctx.db.query('properties').withIndex('by_status', (q) => q.eq('status', 'published')).collect();
    const scoped = properties.filter((property) => !args.propertyId || property._id === args.propertyId);
    const rows:any[] = []; for (const property of scoped) rows.push(...await ctx.db.query('bookings').withIndex('by_property', (q) => q.eq('propertyId', property._id)).collect());
    const bookings = rows.filter((booking) => booking.checkIn < args.to && booking.checkOut > args.from);
    const arrivals = bookings.filter((booking) => booking.checkIn >= args.from && booking.checkIn < args.to);
    const departures = bookings.filter((booking) => booking.checkOut >= args.from && booking.checkOut < args.to);
    const roomNights = bookings.filter((booking) => !['cancelled', 'no_show'].includes(booking.status)).reduce((total, booking) => total + Math.max(1, Math.round((new Date(`${booking.checkOut}T00:00:00Z`).getTime() - new Date(`${booking.checkIn}T00:00:00Z`).getTime()) / 86400000)), 0);
    const gross = bookings.filter((booking) => booking.status !== 'cancelled').reduce((total, booking) => total + booking.totalAmount, 0);
    const cancelled = bookings.filter((booking) => booking.status === 'cancelled').length;
    let availableRoomNights = 0; for (const property of scoped) { const rooms = await ctx.db.query('roomTypes').withIndex('by_property', (q) => q.eq('propertyId', property._id)).collect(); for (const room of rooms) availableRoomNights += room.totalUnits * Math.max(0, Math.round((new Date(`${args.to}T00:00:00Z`).getTime() - new Date(`${args.from}T00:00:00Z`).getTime()) / 86400000)); }
    return { propertyCount: scoped.length, arrivals: arrivals.length, departures: departures.length, bookingCount: bookings.length, roomNights, grossBookingValue: gross, cancellationCount: cancelled, occupancy: availableRoomNights ? Math.min(100, Math.round((roomNights / availableRoomNights) * 100)) : null, currency: 'IDR', freshness: Date.now(), dataComplete: scoped.length > 0 && availableRoomNights > 0 };
  },
});
