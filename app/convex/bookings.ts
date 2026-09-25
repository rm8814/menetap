import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: { propertyId: v.id('properties'), roomTypeId: v.id('roomTypes'), checkIn: v.string(), checkOut: v.string(), guestCount: v.number(), guestName: v.string(), guestEmail: v.string(), paymentMethod: v.union(v.literal('pay_at_hotel'), v.literal('manual_bank_transfer')) },
  handler: async (ctx, args) => {
    if (args.checkOut <= args.checkIn) throw new Error('Check-out must be after check-in.');
    const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', args.roomTypeId).gte('date', args.checkIn).lt('date', args.checkOut)).collect();
    if (nights.length === 0 || nights.some((night) => night.status !== 'open' || night.availableUnits < 1)) throw new Error('This room is not available for the selected dates.');
    const property = await ctx.db.get(args.propertyId);
    const room = await ctx.db.get(args.roomTypeId);
    if (!property || !room || room.propertyId !== args.propertyId) throw new Error('Property or room not found.');
    const now = Date.now();
    const reference = `MNP-${now.toString().slice(-8)}`;
    const totalAmount = nights.reduce((sum, night) => sum + night.rate, 0);
    const bookingId = await ctx.db.insert('bookings', { reference, propertyId: args.propertyId, roomTypeId: args.roomTypeId, checkIn: args.checkIn, checkOut: args.checkOut, guestCount: args.guestCount, guestName: args.guestName, guestEmail: args.guestEmail, totalAmount, currency: 'IDR', status: 'confirmed', paymentMethod: args.paymentMethod, paymentStatus: 'unpaid', createdAt: now, updatedAt: now });
    await ctx.db.insert('payments', { bookingId, method: args.paymentMethod, amount: totalAmount, currency: 'IDR', status: 'unpaid', createdAt: now, updatedAt: now });
    for (const night of nights) await ctx.db.patch(night._id, { availableUnits: night.availableUnits - 1, updatedAt: now });
    await ctx.db.insert('auditLogs', { action: 'booking.created', entityType: 'booking', entityId: bookingId, metadata: { reference }, createdAt: now, updatedAt: now });
    return { bookingId, reference };
  },
});

export const getByReference = query({ args: { reference: v.string() }, handler: async (ctx, args) => ctx.db.query('bookings').withIndex('by_reference', (q) => q.eq('reference', args.reference)).first() });
