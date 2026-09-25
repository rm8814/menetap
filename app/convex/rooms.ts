import { query } from './_generated/server';
import { v } from 'convex/values';

export const listForProperty = query({ args: { propertyId: v.id('properties') }, handler: async (ctx, args) => ctx.db.query('roomTypes').withIndex('by_property', (q) => q.eq('propertyId', args.propertyId)).filter((q) => q.eq(q.field('active'), true)).collect() });
