import { mutation } from './_generated/server';
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
