import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: { name: v.string(), email: v.string(), bookingReference: v.optional(v.string()), message: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('supportRequests', { ...args, status: 'open', createdAt: now, updatedAt: now });
    return { id };
  },
});
