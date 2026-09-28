import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';

export const adminCreate = mutation({
  args: { email: v.string(), businessName: v.string(), contactPhone: v.optional(v.string()), payoutBankName: v.string(), payoutAccountName: v.string(), payoutAccountLast4: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin']);
    const email = args.email.trim().toLowerCase();
    if (!email || args.businessName.trim().length < 2) throw new Error('Vendor email and business name are required.');
    const existing = await ctx.db.query('users').withIndex('email', (q) => q.eq('email', email)).first();
    if (!existing || !['guest', 'partner'].includes(existing.role)) throw new Error('Vendor must first create a normal Menetap account with this email.');
    const now = Date.now();
    const userId = existing._id;
    await ctx.db.patch(userId, { name: args.businessName.trim(), role: 'vendor', status: 'active', updatedAt: now });
    const profileId = await ctx.db.insert('vendorProfiles', { userId, businessName: args.businessName.trim(), contactEmail: email, contactPhone: args.contactPhone?.trim(), payoutBankName: args.payoutBankName.trim(), payoutAccountName: args.payoutAccountName.trim(), payoutAccountLast4: args.payoutAccountLast4.trim(), status: 'active', createdAt: now, updatedAt: now });
    return { userId, profileId, passwordResetRequired: true };
  },
});
