import { internalMutation, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { auth } from './auth';
import { requireRole } from './authorization';

const anniversary = (from: number, months: number) => { const date = new Date(from); date.setUTCMonth(date.getUTCMonth() + months); return date.getTime(); };
const config = async (ctx: any) => { const row = await ctx.db.query('rewardsConfig').first(); if (!row) throw new Error('Rewards configuration is not available.'); return row; };

export const getAccount = query({ args: {}, handler: async (ctx) => {
  const userId = await auth.getUserId(ctx); if (!userId) throw new Error('Sign in required.');
  const account = await ctx.db.query('rewardsAccounts').withIndex('by_user', q => q.eq('userId', userId)).first();
  const cfg = await config(ctx);
  return { account, config: cfg };
} });

export const earnForBooking = internalMutation({ args: { bookingId: v.id('bookings') }, handler: async (ctx, args) => {
  const booking = await ctx.db.get(args.bookingId); if (!booking || booking.status !== 'completed' || !booking.guestUserId) return { earned: 0 };
  const existing = await ctx.db.query('rewardsLedger').withIndex('by_booking', q => q.eq('bookingId', args.bookingId)).filter(q => q.eq(q.field('type'), 'earn')).first(); if (existing) return { earned: existing.points };
  const cfg = await config(ctx); const points = Math.floor(booking.totalAmount * cfg.earnRatePointsPerIdr); if (points <= 0) return { earned: 0 };
  const now = Date.now(); let account = await ctx.db.query('rewardsAccounts').withIndex('by_user', q => q.eq('userId', booking.guestUserId!)).first();
  if (!account) { const id = await ctx.db.insert('rewardsAccounts', { userId: booking.guestUserId, pointsBalance: 0, memberSince: now, nextExpiryAt: anniversary(now, cfg.expiryMonths), createdAt: now, updatedAt: now }); account = await ctx.db.get(id); }
  await ctx.db.insert('rewardsLedger', { userId: booking.guestUserId, bookingId: args.bookingId, type: 'earn', points, createdAt: now, updatedAt: now }); await ctx.db.patch(account!._id, { pointsBalance: account!.pointsBalance + points, updatedAt: now }); return { earned: points };
} });

export const redeemAtCheckout = mutation({ args: { pointsToRedeem: v.number() }, handler: async (ctx, args) => {
  const userId = await auth.getUserId(ctx); if (!userId) throw new Error('Sign in required.'); if (!Number.isInteger(args.pointsToRedeem) || args.pointsToRedeem < 0) throw new Error('Enter a valid points amount.');
  const account = await ctx.db.query('rewardsAccounts').withIndex('by_user', q => q.eq('userId', userId)).first(); if (!account || args.pointsToRedeem > account.pointsBalance) throw new Error('Not enough Rewards points.'); const cfg = await config(ctx); const now = Date.now();
  // Booking creation performs the ledger write and balance update atomically with
  // the booking. This endpoint is a server-side validation/preview only.
  return { discountIdr: args.pointsToRedeem * cfg.redeemValueIdrPerPoint, pointsRedeemed: args.pointsToRedeem };
} });

export const expireStale = internalMutation({ args: {}, handler: async (ctx) => { const now = Date.now(); const accounts = await ctx.db.query('rewardsAccounts').withIndex('by_next_expiry', q => q.lte('nextExpiryAt', now)).collect(); const cfg = await config(ctx); let expired = 0; for (const account of accounts) { if (account.pointsBalance) await ctx.db.insert('rewardsLedger', { userId: account.userId, type: 'expire', points: -account.pointsBalance, reason: '12-month membership anniversary', createdAt: now, updatedAt: now }); await ctx.db.patch(account._id, { pointsBalance: 0, nextExpiryAt: anniversary(account.nextExpiryAt, cfg.expiryMonths), updatedAt: now }); expired++; } return { expired }; } });

export const adminGetAccount = query({ args: { userId: v.id('users') }, handler: async (ctx, args) => { await requireRole(ctx, ['admin', 'operations', 'support', 'finance']); const account = await ctx.db.query('rewardsAccounts').withIndex('by_user', q => q.eq('userId', args.userId)).first(); const ledger = await ctx.db.query('rewardsLedger').withIndex('by_user', q => q.eq('userId', args.userId)).order('desc').collect(); return { account, ledger }; } });
export const adminAdjust = mutation({ args: { userId: v.id('users'), points: v.number(), reason: v.string() }, handler: async (ctx, args) => { const actor = await requireRole(ctx, ['admin', 'operations', 'support', 'finance']); if (!Number.isInteger(args.points) || args.points === 0) throw new Error('Adjustment must be a non-zero whole number.'); const reason = args.reason.trim(); if (reason.length < 3) throw new Error('A reason is required.'); const now = Date.now(); const cfg = await config(ctx); let account = await ctx.db.query('rewardsAccounts').withIndex('by_user', q => q.eq('userId', args.userId)).first(); if (!account) { const id = await ctx.db.insert('rewardsAccounts', { userId: args.userId, pointsBalance: 0, memberSince: now, nextExpiryAt: anniversary(now, cfg.expiryMonths), createdAt: now, updatedAt: now }); account = await ctx.db.get(id); } if (account!.pointsBalance + args.points < 0) throw new Error('Adjustment cannot reduce balance below zero.'); await ctx.db.insert('rewardsLedger', { userId: args.userId, type: 'adjustment', points: args.points, reason, adjustedByUserId: actor._id, createdAt: now, updatedAt: now }); await ctx.db.patch(account!._id, { pointsBalance: account!.pointsBalance + args.points, updatedAt: now }); return { pointsBalance: account!.pointsBalance + args.points }; } });
export const getConfig = query({ args: {}, handler: async ctx => { await requireRole(ctx, ['admin', 'operations', 'finance']); return config(ctx); } });
export const updateConfig = mutation({ args: { earnRatePointsPerIdr: v.number(), redeemValueIdrPerPoint: v.number(), expiryMonths: v.number() }, handler: async (ctx, args) => { await requireRole(ctx, ['admin']); if (args.earnRatePointsPerIdr < 0 || args.redeemValueIdrPerPoint <= 0 || args.expiryMonths <= 0) throw new Error('Invalid Rewards configuration.'); const row = await config(ctx); await ctx.db.patch(row._id, { ...args, updatedAt: Date.now() }); return args; } });
