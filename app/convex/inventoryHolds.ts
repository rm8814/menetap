import { mutation } from './_generated/server';
import { v } from 'convex/values';

const HOLD_MS = 10 * 60 * 1000;

export const create = mutation({
  args: { propertyId: v.id('properties'), roomTypeId: v.id('roomTypes'), checkIn: v.string(), checkOut: v.string(), quantity: v.number() },
  handler: async (ctx, args) => {
    if (!Number.isInteger(args.quantity) || args.quantity < 1 || args.quantity > 10) throw new Error('Invalid room quantity.');
    if (args.checkOut <= args.checkIn) throw new Error('Check-out must be after check-in.');
    const room = await ctx.db.get(args.roomTypeId);
    if (!room || room.propertyId !== args.propertyId || !room.active) throw new Error('Room type not found.');
    const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', args.roomTypeId).gte('date', args.checkIn).lt('date', args.checkOut)).collect();
    if (!nights.length || nights.some((night) => night.status !== 'open' || night.availableUnits < args.quantity)) throw new Error('This room is no longer available for the selected dates.');
    const now = Date.now();
    const token = `HLD-${now}-${Math.random().toString(36).slice(2, 10)}`;
    for (const night of nights) await ctx.db.patch(night._id, { availableUnits: night.availableUnits - args.quantity, updatedAt: now });
    const holdId = await ctx.db.insert('inventoryHolds', { token, propertyId: args.propertyId, roomTypeId: args.roomTypeId, checkIn: args.checkIn, checkOut: args.checkOut, quantity: args.quantity, expiresAt: now + HOLD_MS, status: 'active', createdAt: now, updatedAt: now });
    return { holdId, token, expiresAt: now + HOLD_MS };
  },
});

export const release = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const hold = await ctx.db.query('inventoryHolds').withIndex('by_token', (q) => q.eq('token', args.token)).first();
    if (!hold || hold.status !== 'active') return { released: false };
    const now = Date.now();
    const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', hold.roomTypeId).gte('date', hold.checkIn).lt('date', hold.checkOut)).collect();
    for (const night of nights) await ctx.db.patch(night._id, { availableUnits: Math.min(night.totalUnits, night.availableUnits + hold.quantity), updatedAt: now });
    await ctx.db.patch(hold._id, { status: hold.expiresAt <= now ? 'expired' : 'released', updatedAt: now });
    return { released: true };
  },
});

export const releaseExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db.query('inventoryHolds').withIndex('by_expiry', (q) => q.eq('status', 'active').lte('expiresAt', now)).take(100);
    let released = 0;
    for (const hold of expired) {
      const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', hold.roomTypeId).gte('date', hold.checkIn).lt('date', hold.checkOut)).collect();
      for (const night of nights) await ctx.db.patch(night._id, { availableUnits: Math.min(night.totalUnits, night.availableUnits + hold.quantity), updatedAt: now });
      await ctx.db.patch(hold._id, { status: 'expired', updatedAt: now });
      released += 1;
    }
    return { released };
  },
});
