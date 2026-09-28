import { internalMutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';

export const calculateForBooking = internalMutation({ args: { bookingId: v.id('bookings') }, handler: async (ctx, args) => {
  const existing = await ctx.db.query('commissions').withIndex('by_booking', q => q.eq('bookingId', args.bookingId)).first(); if (existing) return existing;
  const booking = await ctx.db.get(args.bookingId); if (!booking) throw new Error('Booking not found.'); const property = await ctx.db.get(booking.propertyId); const platform = await ctx.db.query('platformConfig').first(); if (!platform) throw new Error('Platform configuration is missing.');
  const ratePercent = property?.commissionPercentOverride ?? platform.defaultCommissionPercent; const amount = booking.totalAmount * ratePercent / 100; const now = Date.now();
  return ctx.db.insert('commissions', { bookingId: booking._id, propertyId: booking.propertyId, ratePercent, amount, currency: booking.currency, status: 'calculated', createdAt: now, updatedAt: now });
} });

export const listForProperty = query({ args: { propertyId: v.id('properties') }, handler: async (ctx, args) => { await requireRole(ctx, ['finance', 'operations', 'admin']); return ctx.db.query('commissions').withIndex('by_property', q => q.eq('propertyId', args.propertyId)).order('desc').collect(); } });
export const listAll = query({ args: {}, handler: async ctx => { await requireRole(ctx, ['finance', 'operations', 'admin']); return ctx.db.query('commissions').order('desc').take(500); } });
