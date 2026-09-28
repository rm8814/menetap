import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { recordAudit } from './audit';
import { childNightlyCharge } from './childPolicy';
import { auth } from './auth';
import { requireRole } from './authorization';
import { validateGuestBreakdown, validateMoney, validateStayDates } from './bookingValidation';
import { internal } from './_generated/api';

export const create = mutation({
  args: { propertyId: v.id('properties'), roomTypeId: v.id('roomTypes'), roomSelections: v.optional(v.array(v.object({ roomTypeId: v.id('roomTypes'), roomName: v.string(), quantity: v.number(), ratePlan: v.string(), roomAmount: v.number(), breakfastAmount: v.number() }))), checkIn: v.string(), checkOut: v.string(), guestCount: v.number(), childAges: v.optional(v.array(v.number())), holdToken: v.optional(v.string()), idempotencyKey: v.optional(v.string()), guestName: v.string(), guestEmail: v.string(), paymentMethod: v.union(v.literal('pay_at_hotel'), v.literal('manual_bank_transfer')), pointsToRedeem: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const guestName = args.guestName.trim();
    const guestEmail = args.guestEmail.trim().toLowerCase();
    if (guestName.length < 2 || guestName.length > 120) throw new Error('Please enter a valid guest name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail) || guestEmail.length > 200) throw new Error('Please enter a valid guest email.');
    validateStayDates(args.checkIn, args.checkOut);
    const childAges = args.childAges ?? [];
    validateGuestBreakdown(args.guestCount, childAges);
    if (args.idempotencyKey) {
      const previous = await ctx.db.query('bookings').withIndex('by_idempotency', (q) => q.eq('idempotencyKey', args.idempotencyKey)).first();
      if (previous) return { bookingId: previous._id, reference: previous.reference };
    }
    if (args.checkOut <= args.checkIn) throw new Error('Check-out must be after check-in.');
    const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', args.roomTypeId).gte('date', args.checkIn).lt('date', args.checkOut)).collect();
    let held = false;
    if (args.holdToken) {
      const hold = await ctx.db.query('inventoryHolds').withIndex('by_token', (q) => q.eq('token', args.holdToken!)).first();
      if (!hold || hold.status !== 'active' || hold.expiresAt <= Date.now() || hold.roomTypeId !== args.roomTypeId || hold.checkIn !== args.checkIn || hold.checkOut !== args.checkOut) throw new Error('Your room hold has expired. Please select the room again.');
      held = true;
    }
    if (!held && (nights.length === 0 || nights.some((night) => night.status !== 'open' || night.availableUnits < 1))) throw new Error('This room is no longer available for the selected dates.');
    const property = await ctx.db.get(args.propertyId);
    const room = await ctx.db.get(args.roomTypeId);
    if (!property || !room || room.propertyId !== args.propertyId) throw new Error('Property or room not found.');
    const now = Date.now();
    const guestUserId = await auth.getUserId(ctx) ?? undefined;
    const reference = `MNP-${now.toString().slice(-8)}`;
    const childCharge = childNightlyCharge(room.childPolicy, childAges);
    const grossAmount = nights.reduce((sum, night) => sum + night.rate + childCharge, 0);
    const pointsToRedeem = args.pointsToRedeem ?? 0;
    if (!Number.isInteger(pointsToRedeem) || pointsToRedeem < 0) throw new Error('Invalid Rewards points.');
    let discountIdr = 0;
    if (pointsToRedeem > 0) {
      if (!guestUserId) throw new Error('Sign in to redeem Rewards points.');
      const account = await ctx.db.query('rewardsAccounts').withIndex('by_user', q => q.eq('userId', guestUserId)).first();
      const rewardsConfig = await ctx.db.query('rewardsConfig').first();
      if (!account || !rewardsConfig || pointsToRedeem > account.pointsBalance) throw new Error('Not enough Rewards points.');
      discountIdr = pointsToRedeem * rewardsConfig.redeemValueIdrPerPoint;
    }
    if (discountIdr > grossAmount) throw new Error('Rewards points exceed the booking total.');
    const totalAmount = grossAmount - discountIdr;
    validateMoney(totalAmount, 'IDR');
    if (args.guestCount > room.maxGuests) throw new Error('This room cannot accommodate the selected number of guests.');
    await ctx.db.patch(args.roomTypeId, { updatedAt: now });
    const bookingId = await ctx.db.insert('bookings', { reference, idempotencyKey: args.idempotencyKey, propertyId: args.propertyId, roomTypeId: args.roomTypeId, checkIn: args.checkIn, checkOut: args.checkOut, guestCount: args.guestCount, childAges, childPolicySnapshot: room.childPolicy, guestName, guestEmail, totalAmount, currency: 'IDR', status: 'confirmed', paymentMethod: args.paymentMethod, paymentStatus: 'unpaid', createdAt: now, updatedAt: now });
    if (guestUserId) await ctx.db.patch(bookingId, { guestUserId });
    if (pointsToRedeem > 0 && guestUserId) {
      const account = await ctx.db.query('rewardsAccounts').withIndex('by_user', q => q.eq('userId', guestUserId)).first();
      if (!account || pointsToRedeem > account.pointsBalance) throw new Error('Not enough Rewards points.');
      await ctx.db.insert('rewardsLedger', { userId: guestUserId, bookingId, type: 'redeem', points: -pointsToRedeem, reason: 'Checkout redemption', createdAt: now, updatedAt: now });
      await ctx.db.patch(account._id, { pointsBalance: account.pointsBalance - pointsToRedeem, updatedAt: now });
    }
    const selections = args.roomSelections?.length ? args.roomSelections : [{ roomTypeId: args.roomTypeId, roomName: room.name, quantity: 1, ratePlan: 'Refundable', roomAmount: totalAmount, breakfastAmount: 0 }];
    for (const selection of selections) {
      if (selection.quantity < 1 || selection.quantity > 10) throw new Error('Invalid room quantity.');
      await ctx.db.insert('bookingRooms', { bookingId, ...selection, createdAt: now, updatedAt: now });
    }
    await ctx.db.insert('payments', { bookingId, method: args.paymentMethod, amount: totalAmount, currency: 'IDR', status: 'unpaid', createdAt: now, updatedAt: now });
    const confirmationNotificationId = await ctx.db.insert('bookingNotifications', { bookingId, type: 'booking_confirmation', recipientEmail: guestEmail, status: 'queued', createdAt: now, updatedAt: now });
    await ctx.scheduler.runAfter(0, internal.notifications.send, { notificationId: confirmationNotificationId });
    if (args.paymentMethod === 'manual_bank_transfer') { const paymentNotificationId = await ctx.db.insert('bookingNotifications', { bookingId, type: 'payment_instructions', recipientEmail: guestEmail, status: 'queued', createdAt: now, updatedAt: now }); await ctx.scheduler.runAfter(0, internal.notifications.send, { notificationId: paymentNotificationId }); }
    if (property.ownerUserId) {
      const owner = await ctx.db.get(property.ownerUserId);
      if (owner?.email) { const partnerNotificationId = await ctx.db.insert('bookingNotifications', { bookingId, type: 'partner_reservation', recipientEmail: owner.email, status: 'queued', createdAt: now, updatedAt: now }); await ctx.scheduler.runAfter(0, internal.notifications.send, { notificationId: partnerNotificationId }); }
    }
    await recordAudit(ctx, { action: 'payment.created', entityType: 'payment', entityId: bookingId, metadata: { method: args.paymentMethod, amount: totalAmount, currency: 'IDR' } });
    if (held) {
      const hold = await ctx.db.query('inventoryHolds').withIndex('by_token', (q) => q.eq('token', args.holdToken!)).first();
      if (hold) await ctx.db.patch(hold._id, { status: 'converted', updatedAt: now });
    } else {
      for (const night of nights) await ctx.db.patch(night._id, { availableUnits: night.availableUnits - 1, updatedAt: now });
    }
    await recordAudit(ctx, { action: 'booking.created', entityType: 'booking', entityId: bookingId, metadata: { reference } });
    return { bookingId, reference };
  },
});

export const getByReference = query({ args: { reference: v.string() }, handler: async (ctx, args) => ctx.db.query('bookings').withIndex('by_reference', (q) => q.eq('reference', args.reference)).first() });

export const lookup = query({ args: { reference: v.string(), guestEmail: v.string() }, handler: async (ctx, args) => {
  const booking = await ctx.db.query('bookings').withIndex('by_reference', (q) => q.eq('reference', args.reference.trim())).first();
  if (!booking || booking.guestEmail !== args.guestEmail.trim().toLowerCase()) return null;
  return booking;
} });

export const listMine = query({ args: {}, handler: async (ctx) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) return [];
  const bookings = await ctx.db.query('bookings').withIndex('by_guest', (q) => q.eq('guestUserId', userId)).order('desc').take(50);
  return Promise.all(bookings.map(async (booking) => ({ ...booking, propertyName: (await ctx.db.get(booking.propertyId))?.name ?? 'Menetap stay' })));
} });

export const listForPartner = query({ args: { status: v.optional(v.union(v.literal('pending'), v.literal('confirmed'), v.literal('cancelled'), v.literal('completed'), v.literal('no_show'))), search: v.optional(v.string()), checkIn: v.optional(v.string()) }, handler: async (ctx, args) => {
  const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
  const properties = user.role === 'partner' ? await ctx.db.query('properties').withIndex('by_owner', (q) => q.eq('ownerUserId', user._id)).collect() : await ctx.db.query('properties').withIndex('by_status', (q) => q.eq('status', 'published')).collect();
  const rows = [];
  for (const property of properties) rows.push(...await ctx.db.query('bookings').withIndex('by_property', (q) => q.eq('propertyId', property._id)).order('desc').take(100));
  const search = args.search?.trim().toLowerCase(); return rows.filter((booking) => (!args.status || booking.status === args.status) && (!args.checkIn || booking.checkIn === args.checkIn) && (!search || `${booking.reference} ${booking.guestName} ${booking.guestEmail}`.toLowerCase().includes(search))).sort((a, b) => b.createdAt - a.createdAt).slice(0, 100);
} });

export const getForPartner = query({ args: { bookingId: v.id('bookings') }, handler: async (ctx, args) => { const user = await requireRole(ctx, ['partner', 'operations', 'admin']); const booking = await ctx.db.get(args.bookingId); if (!booking) return null; const property = await ctx.db.get(booking.propertyId); if (user.role === 'partner' && property?.ownerUserId !== user._id) throw new Error('Not authorized for this booking.'); const room = await ctx.db.get(booking.roomTypeId); const payment = await ctx.db.query('payments').withIndex('by_booking', (q) => q.eq('bookingId', booking._id)).first(); const notes = await ctx.db.query('partnerReservationNotes').withIndex('by_booking', (q) => q.eq('bookingId', booking._id)).collect(); return { booking, property, room, payment, notes }; } });

export const addPartnerNote = mutation({ args: { bookingId: v.id('bookings'), note: v.string() }, handler: async (ctx, args) => { const user = await requireRole(ctx, ['partner', 'operations', 'admin']); const booking = await ctx.db.get(args.bookingId); const property = booking ? await ctx.db.get(booking.propertyId) : null; if (!booking || !property || (user.role === 'partner' && property.ownerUserId !== user._id)) throw new Error('Not authorized for this booking.'); if (args.note.trim().length < 2) throw new Error('Note is required.'); const now = Date.now(); return ctx.db.insert('partnerReservationNotes', { bookingId: booking._id, propertyId: property._id, authorUserId: user._id, note: args.note.trim().slice(0, 1000), createdAt: now, updatedAt: now }); } });

export const exportForPartner = mutation({ args: { search: v.optional(v.string()), status: v.optional(v.union(v.literal('pending'), v.literal('confirmed'), v.literal('cancelled'), v.literal('completed'), v.literal('no_show'))) }, handler: async (ctx, args) => { const user = await requireRole(ctx, ['partner', 'operations', 'admin']); const properties = user.role === 'partner' ? await ctx.db.query('properties').withIndex('by_owner', (q) => q.eq('ownerUserId', user._id)).collect() : await ctx.db.query('properties').withIndex('by_status', (q) => q.eq('status', 'published')).collect(); const rows:any[]=[]; for (const property of properties) rows.push(...await ctx.db.query('bookings').withIndex('by_property', (q) => q.eq('propertyId', property._id)).collect()); const search = args.search?.toLowerCase(); const filtered = rows.filter((b:any)=>(!args.status||b.status===args.status)&&(!search||`${b.reference} ${b.guestName} ${b.guestEmail}`.toLowerCase().includes(search))); const now=Date.now(); await recordAudit(ctx,{action:'partner.reservations_exported',entityType:'property',entityId:'partner',metadata:{count:filtered.length}}); return filtered.map((b:any)=>({reference:b.reference,guestName:b.guestName,guestEmail:b.guestEmail,checkIn:b.checkIn,checkOut:b.checkOut,status:b.status,totalAmount:b.totalAmount,currency:b.currency})); } });

export const getMine = query({ args: { bookingId: v.id('bookings') }, handler: async (ctx, args) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) return null;
  const booking = await ctx.db.get(args.bookingId);
  return booking?.guestUserId === userId ? booking : null;
} });

export const requestCancellation = mutation({
  args: { reference: v.string(), guestEmail: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const booking = await ctx.db.query('bookings').withIndex('by_reference', (q) => q.eq('reference', args.reference.trim())).first();
    if (!booking || booking.guestEmail !== args.guestEmail.trim().toLowerCase()) throw new Error('Booking not found.');
    if (booking.status === 'cancelled') return { status: 'cancelled' as const };
    if (booking.status !== 'confirmed' && booking.status !== 'pending') throw new Error('This booking cannot be cancelled.');
    const roomLines = await ctx.db.query('bookingRooms').withIndex('by_booking', (q) => q.eq('bookingId', booking._id)).collect();
    if (roomLines.some((line) => line.ratePlan === 'Non-refundable')) throw new Error('This booking uses a non-refundable rate and cannot be cancelled for a refund.');
    if (new Date(`${booking.checkIn}T00:00:00`).getTime() <= Date.now()) throw new Error('The cancellation window has closed.');
    const now = Date.now();
    const guestUserId = await auth.getUserId(ctx) ?? undefined;
    await ctx.db.patch(booking._id, { status: 'cancelled', updatedAt: now });
    const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', booking.roomTypeId).gte('date', booking.checkIn).lt('date', booking.checkOut)).collect();
    for (const night of nights) await ctx.db.patch(night._id, { availableUnits: Math.min(night.totalUnits, night.availableUnits + 1), updatedAt: now });
    await recordAudit(ctx, { action: 'booking.cancelled', entityType: 'booking', entityId: booking._id, metadata: { reference: booking.reference, reason: args.reason?.trim().slice(0, 500) } });
    return { status: 'cancelled' as const };
  },
});

export const requestRefund = mutation({
  args: { reference: v.string(), guestEmail: v.string(), reason: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db.query('bookings').withIndex('by_reference', (q) => q.eq('reference', args.reference.trim())).first();
    if (!booking || booking.guestEmail !== args.guestEmail.trim().toLowerCase()) throw new Error('Booking not found.');
    if (booking.status !== 'confirmed' && booking.status !== 'cancelled') throw new Error('This booking is not eligible for a refund request.');
    const roomLines = await ctx.db.query('bookingRooms').withIndex('by_booking', (q) => q.eq('bookingId', booking._id)).collect();
    if (roomLines.some((line) => line.ratePlan === 'Non-refundable')) throw new Error('This booking uses a non-refundable rate and is not eligible for a refund.');
    if (new Date(`${booking.checkIn}T00:00:00`).getTime() <= Date.now()) throw new Error('The refund window has closed.');
    const payment = await ctx.db.query('payments').withIndex('by_booking', (q) => q.eq('bookingId', booking._id)).first();
    const now = Date.now();
    const requestId = await ctx.db.insert('refundRequests', { bookingId: booking._id, amount: payment?.amount ?? booking.totalAmount, reason: args.reason.trim().slice(0, 500), status: 'pending', createdAt: now, updatedAt: now });
    await recordAudit(ctx, { action: 'payment.refund_requested', entityType: 'refundRequest', entityId: requestId, metadata: { reference: booking.reference, amount: payment?.amount ?? booking.totalAmount } });
    return { status: 'refund_requested' as const, paymentStatus: payment?.status ?? 'unpaid' };
  },
});
