import { query } from './_generated/server';
import { v } from 'convex/values';

export const listForProperty = query({ args: { propertyId: v.id('properties'), checkIn: v.optional(v.string()), checkOut: v.optional(v.string()), guests: v.optional(v.number()) }, handler: async (ctx, args) => {
  const rooms = await ctx.db.query('roomTypes').withIndex('by_property', (q) => q.eq('propertyId', args.propertyId)).filter((q) => q.eq(q.field('active'), true)).collect();
  if (!args.checkIn || !args.checkOut) return rooms;
  const available = [];
  for (const room of rooms.filter((item) => item.maxGuests >= (args.guests ?? 1))) {
    const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', room._id).gte('date', args.checkIn!).lt('date', args.checkOut!)).collect();
    if (nights.length > 0 && nights.every((night) => night.status === 'open' && night.availableUnits > 0)) available.push(room);
  }
  return available;
} });
