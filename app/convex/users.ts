import { mutation, query } from './_generated/server';
import { auth } from './auth';
import { v } from 'convex/values';

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user || user.status === 'suspended') return null;
    return { id: user._id, email: user.email, name: user.name, phone: user.phone, role: user.role, status: user.status };
  },
});

export const updateProfile = mutation({
  args: { name: v.string(), phone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Sign in required.');
    const name = args.name.trim();
    const phone = args.phone?.trim();
    if (name.length < 2 || name.length > 120) throw new Error('Name must be between 2 and 120 characters.');
    if (phone && !/^\+?[0-9 ()-]{7,24}$/.test(phone)) throw new Error('Please enter a valid phone number.');
    await ctx.db.patch(userId, { name, phone: phone || undefined, updatedAt: Date.now() });
    return { updated: true };
  },
});
