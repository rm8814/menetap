import { internalAction, internalMutation, internalQuery, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';
import { internal } from './_generated/api';
import { Resend as ResendAPI } from 'resend';
import { buildNotificationTemplate, shouldSendNotification } from './notificationTemplates';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const loadForSend = internalQuery({ args: { notificationId: v.id('bookingNotifications') }, handler: async (ctx, args) => { const notification = await ctx.db.get(args.notificationId); if (!notification) return null; const booking = await ctx.db.get(notification.bookingId); const property = booking ? await ctx.db.get(booking.propertyId) : null; const platformConfig = notification.type === 'payment_instructions' ? await ctx.db.query('platformConfig').first() : null; return { notification, booking, property, platformConfig }; } });
export const markSent = internalMutation({ args: { notificationId: v.id('bookingNotifications'), providerId: v.string() }, handler: async (ctx, args) => { const row = await ctx.db.get(args.notificationId); if (!row || row.status !== 'queued') return false; await ctx.db.patch(row._id, { status: 'sent', sentAt: Date.now(), providerId: args.providerId, updatedAt: Date.now() }); return true; } });
export const markFailed = internalMutation({ args: { notificationId: v.id('bookingNotifications'), error: v.string() }, handler: async (ctx, args) => { const row = await ctx.db.get(args.notificationId); if (!row || row.status !== 'queued') return false; await ctx.db.patch(row._id, { status: 'failed', error: args.error.slice(0, 1000), updatedAt: Date.now() }); return true; } });

export const send = internalAction({ args: { notificationId: v.id('bookingNotifications') }, handler: async (ctx, args) => { const data = await ctx.runQuery(internal.notifications.loadForSend, { notificationId: args.notificationId }); if (!data || !shouldSendNotification(data.notification.status) || !data.booking) return { skipped: true }; try { const template = buildNotificationTemplate({ type: data.notification.type, notification: data.notification, booking: data.booking, property: data.property, platformConfig: data.platformConfig }); const resend = new ResendAPI(env.AUTH_RESEND_KEY); const { data: sent, error } = await resend.emails.send({ from: env.AUTH_RESEND_FROM ?? 'Menetap <onboarding@resend.dev>', to: [data.notification.recipientEmail], subject: template.subject, text: template.text }); if (error) throw new Error(error.message); await ctx.runMutation(internal.notifications.markSent, { notificationId: args.notificationId, providerId: sent?.id ?? 'resend-accepted' }); return { sent: true }; } catch (error) { await ctx.runMutation(internal.notifications.markFailed, { notificationId: args.notificationId, error: error instanceof Error ? error.message : 'Notification send failed.' }); return { sent: false }; } } });

export const listDeliveryFailures = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['support', 'operations', 'admin']);
    return ctx.db.query('bookingNotifications').withIndex('by_status', (q) => q.eq('status', 'failed')).order('desc').take(100);
  },
});

export const getForBooking = query({
  args: { bookingId: v.id('bookings') },
  handler: async (ctx, args) => { await requireRole(ctx, ['support', 'operations', 'admin']); return ctx.db.query('bookingNotifications').withIndex('by_booking', (q) => q.eq('bookingId', args.bookingId)).collect(); },
});
