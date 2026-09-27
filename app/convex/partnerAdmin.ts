import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';

export const listApplications = query({
  args: { status: v.optional(v.union(v.literal('pending_email'), v.literal('pending_review'), v.literal('approved'), v.literal('rejected'))) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin', 'operations']);
    return args.status ? ctx.db.query('partnerApplications').withIndex('by_status', (q) => q.eq('status', args.status!)).collect() : ctx.db.query('partnerApplications').collect();
  },
});

export const setAccountStatus = mutation({
  args: { userId: v.id('users'), status: v.union(v.literal('active'), v.literal('suspended')), reason: v.string() },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, ['admin', 'operations']);
    const target = await ctx.db.get(args.userId);
    if (!target || target.role !== 'partner') throw new Error('Only partner accounts can be suspended or reinstated.');
    const reason = args.reason.trim();
    if (reason.length < 3) throw new Error('A reason is required.');
    const now = Date.now();
    await ctx.db.patch(target._id, { status: args.status, updatedAt: now });
    await ctx.db.insert('auditLogs', { actorUserId: actor._id, action: args.status === 'suspended' ? 'partner.suspended' : 'partner.reinstated', entityType: 'user', entityId: String(target._id), metadata: { reason }, createdAt: now, updatedAt: now });
    return { status: args.status };
  },
});

export const agreementsForUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin', 'operations']);
    return ctx.db.query('partnerAgreements').withIndex('by_user', (q) => q.eq('userId', args.userId)).collect();
  },
});
