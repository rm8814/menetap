import { mutation, query } from './_generated/server';
import { auth } from './auth';
import { requireRole } from './authorization';
import { v } from 'convex/values';

const profileArgs = { businessName: v.string(), businessType: v.union(v.literal('individual'), v.literal('company')), taxIdLast4: v.optional(v.string()), payoutBankName: v.string(), payoutAccountName: v.string(), payoutAccountLast4: v.string(), payoutCurrency: v.literal('IDR') };

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return ctx.db.query('partnerProfiles').withIndex('by_user', (q) => q.eq('userId', userId)).first();
  },
});

export const save = mutation({
  args: profileArgs,
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'admin', 'operations']);
    const businessName = args.businessName.trim();
    const payoutBankName = args.payoutBankName.trim();
    const payoutAccountName = args.payoutAccountName.trim();
    const payoutAccountLast4 = args.payoutAccountLast4.trim();
    if (businessName.length < 2 || payoutBankName.length < 2 || payoutAccountName.length < 2 || !/^\d{4}$/.test(payoutAccountLast4)) throw new Error('Enter valid business and payout details. Only the last four account digits are accepted.');
    const existing = await ctx.db.query('partnerProfiles').withIndex('by_user', (q) => q.eq('userId', user._id)).first();
    const application = await ctx.db.query('partnerApplications').withIndex('by_user', (q) => q.eq('userId', user._id)).order('desc').first();
    if (!application) throw new Error('Submit a partner application first.');
    const now = Date.now();
    const data = { businessName, businessType: args.businessType, taxIdLast4: args.taxIdLast4?.replace(/\D/g, '').slice(-4) || undefined, payoutBankName, payoutAccountName, payoutAccountLast4, payoutCurrency: 'IDR' as const, payoutStatus: 'pending' as const, updatedAt: now };
    if (existing) { await ctx.db.patch(existing._id, data); return existing._id; }
    const id = await ctx.db.insert('partnerProfiles', { userId: user._id, applicationId: application._id, ...data, createdAt: now });
    await ctx.db.insert('auditLogs', { actorUserId: user._id, action: 'partner.payout_profile_saved', entityType: 'partnerProfile', entityId: String(id), metadata: { payoutBankName, payoutAccountLast4 }, createdAt: now, updatedAt: now });
    return id;
  },
});

export const reviewPayout = mutation({
  args: { profileId: v.id('partnerProfiles'), status: v.union(v.literal('verified'), v.literal('needs_review')), reason: v.string() },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, ['admin', 'finance', 'operations']);
    if (args.reason.trim().length < 3) throw new Error('A review reason is required.');
    await ctx.db.patch(args.profileId, { payoutStatus: args.status, updatedAt: Date.now() });
    await ctx.db.insert('auditLogs', { actorUserId: actor._id, action: `partner.payout_profile_${args.status}`, entityType: 'partnerProfile', entityId: String(args.profileId), metadata: { reason: args.reason.trim() }, createdAt: Date.now(), updatedAt: Date.now() });
    return { status: args.status };
  },
});
