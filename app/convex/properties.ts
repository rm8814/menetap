import { query } from './_generated/server';
import { v } from 'convex/values';

export const listPublished = query({
  args: { area: v.optional(v.string()), checkIn: v.optional(v.string()), checkOut: v.optional(v.string()), guests: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const normalizedAreas: Record<string, string> = { Yogyakarta: 'Greater Yogyakarta', 'Greater Yogyakarta': 'Greater Yogyakarta' };
    const area = args.area ? normalizedAreas[args.area] ?? args.area : undefined;
    const properties = area ? await ctx.db.query('properties').withIndex('by_area', (q) => q.eq('area', area)).collect() : await ctx.db.query('properties').withIndex('by_status', (q) => q.eq('status', 'published')).collect();
    const published = properties.filter((property) => property.status === 'published');
    if (!args.checkIn || !args.checkOut) return Promise.all(published.map(async (property) => {
      const rates = await ctx.db.query('ratePlans').withIndex('by_property', (q) => q.eq('propertyId', property._id)).collect();
      const activeRates = rates.filter((rate) => rate.active).map((rate) => rate.price);
      return { ...property, lowestPrice: activeRates.length ? Math.min(...activeRates) : undefined };
    }));
    return (await Promise.all(published.map(async (property) => {
      const rooms = await ctx.db.query('roomTypes').withIndex('by_property', (q) => q.eq('propertyId', property._id)).collect();
      for (const room of rooms.filter((item) => item.active && item.maxGuests >= (args.guests ?? 1))) {
        const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', room._id).gte('date', args.checkIn!).lt('date', args.checkOut!)).collect();
        if (nights.length > 0 && nights.every((night) => night.status === 'open' && night.availableUnits > 0)) return { ...property, lowestPrice: Math.min(...nights.map((night) => night.rate)) };
      }
      return null;
    }))).filter((property): property is NonNullable<typeof property> => property !== null);
  },
});

export const get = query({ args: { id: v.id('properties') }, handler: async (ctx, args) => ctx.db.get(args.id) });
