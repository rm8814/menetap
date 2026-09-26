import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';
import { recordAudit } from './audit';

export const listPending = query({ args: {}, handler: async (ctx) => { await requireRole(ctx, ['finance', 'operations', 'admin']); return ctx.db.query('refundRequests').withIndex('by_status', (q) => q.eq('status', 'pending')).take(100); } });

export const review = mutation({
  args: { refundRequestId: v.id('refundRequests'), decision: v.union(v.literal('approve'), v.literal('reject')), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const reviewer = await requireRole(ctx, ['finance', 'operations', 'admin']);
    const request = await ctx.db.get(args.refundRequestId);
    if (!request || request.status !== 'pending') throw new Error('Refund request is no longer pending.');
    const status = args.decision === 'approve' ? 'approved' : 'rejected';
    const now = Date.now();
    await ctx.db.patch(args.refundRequestId, { status, reviewedByUserId: reviewer._id, reviewedAt: now, updatedAt: now });
    await recordAudit(ctx, { action: `payment.refund_${status}`, entityType: 'refundRequest', entityId: args.refundRequestId, metadata: { note: args.note?.trim().slice(0, 500) } });
    return { status };
  },
});
