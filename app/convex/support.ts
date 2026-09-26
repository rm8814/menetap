import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';

export const create = mutation({
  args: { name: v.string(), email: v.string(), bookingReference: v.optional(v.string()), message: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();
    if (name.length < 2 || name.length > 120) throw new Error('Please enter a valid name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new Error('Please enter a valid email.');
    if (message.length < 10 || message.length > 4000) throw new Error('Please enter a message between 10 and 4000 characters.');
    const recent = await ctx.db.query('supportRequests').withIndex('by_email', q => q.eq('email', email)).collect();
    if (recent.some(request => Date.now() - request.createdAt < 60_000)) throw new Error('Please wait a minute before sending another request.');
    const now = Date.now();
    const id = await ctx.db.insert('supportRequests', { name, email, bookingReference: args.bookingReference?.trim(), message, status: 'open', createdAt: now, updatedAt: now });
    return { id };
  },
});

export const listForStaff = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['support', 'operations', 'admin']);
    return ctx.db.query('supportRequests').withIndex('by_status').order('desc').take(100);
  },
});
