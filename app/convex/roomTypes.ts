import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';

const childPolicy = v.object({
  acceptsChildren: v.boolean(),
  maxChildAge: v.number(),
  pricing: v.union(v.literal('free'), v.literal('flat'), v.literal('age_band')),
  flatRate: v.optional(v.number()),
  ageRates: v.optional(v.array(v.object({ maxAge: v.number(), nightlyRate: v.number() }))),
});

export const updateChildPolicy = mutation({
  args: { roomTypeId: v.id('roomTypes'), policy: childPolicy },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const room = await ctx.db.get(args.roomTypeId);
    if (!room) throw new Error('Room type not found.');
    if (user.role === 'partner') {
      const property = await ctx.db.get(room.propertyId);
      if (!property || property.ownerUserId !== user._id) throw new Error('Not authorized for this property.');
    }
    if (args.policy.maxChildAge < 0 || args.policy.maxChildAge > 17) throw new Error('Maximum child age must be between 0 and 17.');
    if (args.policy.pricing === 'flat' && (args.policy.flatRate ?? -1) < 0) throw new Error('Flat child rate cannot be negative.');
    if (args.policy.pricing === 'age_band' && (!args.policy.ageRates?.length || args.policy.ageRates.some((band) => band.maxAge < 0 || band.maxAge > args.policy.maxChildAge || band.nightlyRate < 0))) throw new Error('Age-band rates are invalid.');
    await ctx.db.patch(args.roomTypeId, { childPolicy: args.policy, updatedAt: Date.now() });
    return { updated: true };
  },
});

async function ownedRoom(ctx: any, roomTypeId: any) {
  const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
  const room = await ctx.db.get(roomTypeId);
  if (!room) throw new Error('Room type not found.');
  if (user.role === 'partner') {
    const property = await ctx.db.get(room.propertyId);
    if (!property || property.ownerUserId !== user._id) throw new Error('Not authorized for this property.');
  }
  return { user, room };
}

export const listForPartner = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const property = await ctx.db.get(args.propertyId);
    if (!property || (user.role === 'partner' && property.ownerUserId !== user._id)) throw new Error('Not authorized for this property.');
    return ctx.db.query('roomTypes').withIndex('by_property', (q) => q.eq('propertyId', args.propertyId)).collect();
  },
});

export const create = mutation({
  args: { propertyId: v.id('properties'), name: v.string(), description: v.string(), maxGuests: v.number(), adultCapacity: v.optional(v.number()), childCapacity: v.optional(v.number()), bedConfiguration: v.optional(v.string()), sizeSquareMeters: v.optional(v.number()), view: v.optional(v.string()), totalUnits: v.number(), amenities: v.array(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const property = await ctx.db.get(args.propertyId);
    if (!property || (user.role === 'partner' && property.ownerUserId !== user._id)) throw new Error('Not authorized for this property.');
    if (args.name.trim().length < 2 || args.description.trim().length < 2 || args.maxGuests < 1 || args.totalUnits < 1 || (args.adultCapacity !== undefined && args.adultCapacity < 1) || (args.childCapacity !== undefined && args.childCapacity < 0) || (args.sizeSquareMeters !== undefined && args.sizeSquareMeters <= 0)) throw new Error('Complete valid room details.');
    const now = Date.now();
    return ctx.db.insert('roomTypes', { propertyId: args.propertyId, name: args.name.trim(), description: args.description.trim(), maxGuests: args.maxGuests, adultCapacity: args.adultCapacity, childCapacity: args.childCapacity, bedConfiguration: args.bedConfiguration?.trim(), sizeSquareMeters: args.sizeSquareMeters, view: args.view?.trim(), totalUnits: args.totalUnits, amenities: args.amenities, active: true, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: { roomTypeId: v.id('roomTypes'), name: v.string(), description: v.string(), maxGuests: v.number(), adultCapacity: v.optional(v.number()), childCapacity: v.optional(v.number()), bedConfiguration: v.optional(v.string()), sizeSquareMeters: v.optional(v.number()), view: v.optional(v.string()), totalUnits: v.number(), amenities: v.array(v.string()) },
  handler: async (ctx, args) => {
    const { room } = await ownedRoom(ctx, args.roomTypeId);
    if (args.name.trim().length < 2 || args.description.trim().length < 2 || args.maxGuests < 1 || args.totalUnits < 1 || (args.adultCapacity !== undefined && args.adultCapacity < 1) || (args.childCapacity !== undefined && args.childCapacity < 0) || (args.sizeSquareMeters !== undefined && args.sizeSquareMeters <= 0)) throw new Error('Complete valid room details.');
    await ctx.db.patch(room._id, { name: args.name.trim(), description: args.description.trim(), maxGuests: args.maxGuests, adultCapacity: args.adultCapacity, childCapacity: args.childCapacity, bedConfiguration: args.bedConfiguration?.trim(), sizeSquareMeters: args.sizeSquareMeters, view: args.view?.trim(), totalUnits: args.totalUnits, amenities: args.amenities, updatedAt: Date.now() });
    return { updated: true };
  },
});

export const setActive = mutation({
  args: { roomTypeId: v.id('roomTypes'), active: v.boolean() },
  handler: async (ctx, args) => { const { room } = await ownedRoom(ctx, args.roomTypeId); await ctx.db.patch(room._id, { active: args.active, updatedAt: Date.now() }); return { active: args.active }; },
});

export const archive = mutation({
  args: { roomTypeId: v.id('roomTypes') },
  handler: async (ctx, args) => { const { room } = await ownedRoom(ctx, args.roomTypeId); await ctx.db.patch(room._id, { active: false, updatedAt: Date.now() }); return { archived: true }; },
});

export const restore = mutation({
  args: { roomTypeId: v.id('roomTypes') },
  handler: async (ctx, args) => { const { room } = await ownedRoom(ctx, args.roomTypeId); await ctx.db.patch(room._id, { active: true, updatedAt: Date.now() }); return { restored: true }; },
});
