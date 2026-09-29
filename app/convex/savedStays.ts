import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { auth } from './auth';

export const listMine = query({ args: {}, handler: async (ctx) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) return [];
  const saved = await ctx.db.query('savedStays').withIndex('by_user', (q) => q.eq('userId', userId)).collect();
  return Promise.all(saved.map(async (item) => {
    const property = await ctx.db.get(item.propertyId);
    if (!property) return { ...item, property: null, lowestPrice: undefined };
    const rates = await ctx.db.query('ratePlans').withIndex('by_property', (q) => q.eq('propertyId', property._id)).collect();
    const activeRates = rates.filter((rate) => rate.active).map((rate) => rate.price);
    return { ...item, property, lowestPrice: activeRates.length ? Math.min(...activeRates) : undefined };
  }));
} });

export const save = mutation({ args: { propertyId: v.id('properties') }, handler: async (ctx, args) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error('Sign in required.');
  const property = await ctx.db.get(args.propertyId);
  if (!property || property.status !== 'published') throw new Error('Property is not available.');
  const existing = await ctx.db.query('savedStays').withIndex('by_user_property', (q) => q.eq('userId', userId).eq('propertyId', args.propertyId)).first();
  if (existing) return existing._id;
  const now = Date.now();
  return ctx.db.insert('savedStays', { userId, propertyId: args.propertyId, createdAt: now, updatedAt: now });
} });

export const remove = mutation({ args: { propertyId: v.id('properties') }, handler: async (ctx, args) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error('Sign in required.');
  const existing = await ctx.db.query('savedStays').withIndex('by_user_property', (q) => q.eq('userId', userId).eq('propertyId', args.propertyId)).first();
  if (existing) await ctx.db.delete(existing._id);
  return { removed: true };
} });
