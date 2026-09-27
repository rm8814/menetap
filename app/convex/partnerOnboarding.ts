import { mutation, query } from './_generated/server';
import { auth } from './auth';
import { requireRole } from './authorization';
import { v } from 'convex/values';

const draft = v.object({ propertyName: v.optional(v.string()), address: v.optional(v.string()), city: v.optional(v.string()), description: v.optional(v.string()) });

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return ctx.db.query('partnerOnboarding').withIndex('by_user', (q) => q.eq('userId', userId)).first();
  },
});

export const saveDraft = mutation({
  args: { currentStep: v.number(), completedSteps: v.array(v.number()), propertyDraft: draft },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'admin', 'operations']);
    if (args.currentStep < 1 || args.currentStep > 5 || args.completedSteps.some((step) => step < 1 || step > 5)) throw new Error('Invalid onboarding step.');
    const existing = await ctx.db.query('partnerOnboarding').withIndex('by_user', (q) => q.eq('userId', user._id)).first();
    const now = Date.now();
    const data = { currentStep: args.currentStep, completedSteps: Array.from(new Set(args.completedSteps)).sort(), propertyDraft: args.propertyDraft, status: 'draft' as const, validationErrors: [], updatedAt: now };
    if (existing) { await ctx.db.patch(existing._id, data); return existing._id; }
    return ctx.db.insert('partnerOnboarding', { userId: user._id, ...data, createdAt: now });
  },
});

export const complete = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ['partner', 'admin', 'operations']);
    const existing = await ctx.db.query('partnerOnboarding').withIndex('by_user', (q) => q.eq('userId', user._id)).first();
    if (!existing) throw new Error('Save onboarding details first.');
    const errors = [!existing.propertyDraft?.propertyName && 'Property name is required.', !existing.propertyDraft?.address && 'Address is required.', !existing.propertyDraft?.city && 'City is required.'].filter(Boolean) as string[];
    if (errors.length) { await ctx.db.patch(existing._id, { validationErrors: errors, updatedAt: Date.now() }); throw new Error(errors.join(' ')); }
    await ctx.db.patch(existing._id, { status: 'completed', validationErrors: [], completedSteps: [1, 2, 3, 4, 5], currentStep: 5, updatedAt: Date.now() });
    return { completed: true };
  },
});
