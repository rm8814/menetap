import { query } from './_generated/server';
import { v } from 'convex/values';

export const listPublished = query({
  args: { area: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const properties = args.area ? await ctx.db.query('properties').withIndex('by_area', (q) => q.eq('area', args.area!)).collect() : await ctx.db.query('properties').withIndex('by_status', (q) => q.eq('status', 'published')).collect();
    return properties.filter((property) => property.status === 'published');
  },
});

export const get = query({ args: { id: v.id('properties') }, handler: async (ctx, args) => ctx.db.get(args.id) });
