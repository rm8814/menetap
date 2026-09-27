import { mutation, query } from './_generated/server';
import { auth } from './auth';
import { requireRole } from './authorization';
import { v } from 'convex/values';

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query('partnerApplications').withIndex('by_user', (q) => q.eq('userId', userId)).order('desc').first();
  },
});

export const submit = mutation({
  args: { propertyName: v.string(), contactPhone: v.string(), agreementVersion: v.string(), acceptedTerms: v.boolean(), businessName: v.string(), businessType: v.union(v.literal('individual'), v.literal('company')), taxIdLast4: v.optional(v.string()), payoutBankName: v.string(), payoutAccountName: v.string(), payoutAccountLast4: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Sign in required.');
    const user = await ctx.db.get(userId);
    if (!user?.email) throw new Error('Add an email address before applying.');
    if (user.role !== 'guest' && user.role !== 'partner') throw new Error('This account cannot apply for partner access.');
    const propertyName = args.propertyName.trim();
    const contactPhone = args.contactPhone.trim();
    const businessName = args.businessName.trim();
    const payoutBankName = args.payoutBankName.trim();
    const payoutAccountName = args.payoutAccountName.trim();
    const payoutAccountLast4 = args.payoutAccountLast4.trim();
    const agreementVersion = args.agreementVersion.trim();
    if (!args.acceptedTerms || !agreementVersion) throw new Error('Accept the current Partner Terms before applying.');
    if (propertyName.length < 2 || propertyName.length > 160) throw new Error('Enter a valid property name.');
    if (!/^\+?[0-9 ()-]{7,24}$/.test(contactPhone)) throw new Error('Enter a valid contact phone number.');
    if (businessName.length < 2 || payoutBankName.length < 2 || payoutAccountName.length < 2 || !/^\d{4}$/.test(payoutAccountLast4)) throw new Error('Enter valid business and payout details. Only the last four account digits are accepted.');
    const existing = await ctx.db.query('partnerApplications').withIndex('by_user', (q) => q.eq('userId', userId)).order('desc').first();
    if (existing?.status === 'pending_email' && user.emailVerificationTime) {
      await ctx.db.patch(existing._id, { status: 'pending_review', updatedAt: Date.now() });
      return await ctx.db.get(existing._id);
    }
    if (existing && ['pending_email', 'pending_review', 'approved'].includes(existing.status)) return existing;
    const now = Date.now();
    const status = user.emailVerificationTime ? 'pending_review' : 'pending_email';
    const id = await ctx.db.insert('partnerApplications', { userId, propertyName, contactPhone, status, createdAt: now, updatedAt: now });
    await ctx.db.insert('partnerAgreements', { userId, applicationId: id, agreementType: 'partner_terms', version: agreementVersion, acceptedAt: now, createdAt: now, updatedAt: now });
    await ctx.db.insert('partnerProfiles', { userId, applicationId: id, businessName, businessType: args.businessType, taxIdLast4: args.taxIdLast4?.replace(/\D/g, '').slice(-4) || undefined, payoutBankName, payoutAccountName, payoutAccountLast4, payoutCurrency: 'IDR', payoutStatus: 'pending', createdAt: now, updatedAt: now });
    return await ctx.db.get(id);
  },
});

export const listForReview = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin', 'operations']);
    return ctx.db.query('partnerApplications').withIndex('by_status', (q) => q.eq('status', 'pending_review')).collect();
  },
});

export const review = mutation({
  args: { applicationId: v.id('partnerApplications'), decision: v.union(v.literal('approve'), v.literal('reject')), rejectionReason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const reviewer = await requireRole(ctx, ['admin', 'operations']);
    const application = await ctx.db.get(args.applicationId);
    if (!application || application.status !== 'pending_review') throw new Error('Application is not awaiting review.');
    const now = Date.now();
    const nextStatus = args.decision === 'approve' ? 'approved' : 'rejected';
    await ctx.db.patch(application._id, { status: nextStatus, reviewedBy: reviewer._id, reviewedAt: now, rejectionReason: args.decision === 'reject' ? args.rejectionReason?.trim() : undefined, updatedAt: now });
    if (args.decision === 'approve') await ctx.db.patch(application.userId, { role: 'partner', status: 'active', updatedAt: now });
    return { status: nextStatus };
  },
});
