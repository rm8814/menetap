import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';
import { recordAudit } from './audit';
import { auth } from './auth';
import { internal } from './_generated/api';

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

export const findReservations = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['support', 'operations', 'admin']);
    const search = args.search.trim().toLowerCase();
    if (!search) return [];
    const bookings = await ctx.db.query('bookings').withIndex('by_status').collect();
    return bookings.filter((booking) => [booking.reference, booking.guestName, booking.guestEmail].some((value) => value.toLowerCase().includes(search))).slice(0, 50);
  },
});

export const updateReservation = mutation({
  args: { bookingId: v.id('bookings'), status: v.union(v.literal('confirmed'), v.literal('cancelled'), v.literal('completed'), v.literal('no_show')), reason: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['support', 'operations', 'admin']);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error('Booking not found.');
    const now = Date.now();
    await ctx.db.patch(args.bookingId, { status: args.status, updatedAt: now });
    if (args.status === 'completed' && booking.status !== 'completed') await ctx.scheduler.runAfter(0, internal.rewards.earnForBooking, { bookingId: args.bookingId });
    if (args.status === 'completed' && booking.status !== 'completed' && booking.paymentMethod === 'pay_at_hotel') await ctx.scheduler.runAfter(0, internal.commissions.calculateForBooking, { bookingId: args.bookingId });
    await recordAudit(ctx, { action: 'support.reservation_updated', entityType: 'booking', entityId: args.bookingId, metadata: { reference: booking.reference, from: booking.status, to: args.status, reason: args.reason.trim().slice(0, 500) } });
    return { updated: true };
  },
});

export const createStayTicket = mutation({
  args: { bookingId: v.id('bookings'), subject: v.string(), description: v.string(), priority: v.union(v.literal('normal'), v.literal('high'), v.literal('urgent')) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Sign in required.');
    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.guestUserId !== userId) throw new Error('Booking not found.');
    if (booking.status !== 'confirmed') throw new Error('Stay requests are available for confirmed bookings only.');
    const subject = args.subject.trim();
    const description = args.description.trim();
    if (subject.length < 3 || subject.length > 160 || description.length < 10 || description.length > 4000) throw new Error('Please provide a clear request.');
    const now = Date.now();
    return ctx.db.insert('supportTickets', { createdByUserId: userId, bookingId: args.bookingId, propertyId: booking.propertyId, subject, description, priority: args.priority, status: 'open', ...{ createdAt: now, updatedAt: now } });
  },
});
