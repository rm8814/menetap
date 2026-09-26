import { query } from './_generated/server';
import { v } from 'convex/values';
import { validateChildAges } from './childPolicy';

export const listForProperty = query({ args: { propertyId: v.id('properties'), checkIn: v.optional(v.string()), checkOut: v.optional(v.string()), guests: v.optional(v.number()), childAges: v.optional(v.array(v.number())) }, handler: async (ctx, args) => {
  const rooms = await ctx.db.query('roomTypes').withIndex('by_property', (q) => q.eq('propertyId', args.propertyId)).filter((q) => q.eq(q.field('active'), true)).collect();
  if (!args.checkIn || !args.checkOut) return Promise.all(rooms.map(async (room) => ({ ...room, ratePlans: (await ctx.db.query('ratePlans').withIndex('by_room_type', (q) => q.eq('roomTypeId', room._id)).collect()).filter((plan) => plan.active) })));
  const available = [];
  for (const room of rooms.filter((item) => item.maxGuests >= (args.guests ?? 1))) {
    try { validateChildAges(room.childPolicy, args.childAges ?? []); } catch { continue; }
    const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', room._id).gte('date', args.checkIn!).lt('date', args.checkOut!)).collect();
    const plans = (await ctx.db.query('ratePlans').withIndex('by_room_type', (q) => q.eq('roomTypeId', room._id)).collect()).filter((plan) => plan.active);
    if (nights.length > 0 && nights.every((night) => night.status === 'open' && night.availableUnits > 0) && plans.length > 0) {
      available.push({ ...room, ratePlans: plans, liveNightlyRates: nights.map((night) => ({ date: night.date, rate: night.rate })) });
    }
  }
  return available;
} });
