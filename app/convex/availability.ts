import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';

async function ownedRoom(ctx: any, roomTypeId: any) {
  const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
  const room = await ctx.db.get(roomTypeId);
  if (!room) throw new Error('Room type not found.');
  const property = await ctx.db.get(room.propertyId);
  if (user.role === 'partner' && property?.ownerUserId !== user._id) throw new Error('Not authorized for this room.');
  return { user, room };
}

export const calendar = query({
  args: { roomTypeId: v.id('roomTypes'), from: v.string(), to: v.string() },
  handler: async (ctx, args) => { await ownedRoom(ctx, args.roomTypeId); return ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', args.roomTypeId).gte('date', args.from).lt('date', args.to)).collect(); },
});

export const updateDay = mutation({
  args: { roomTypeId: v.id('roomTypes'), date: v.string(), totalUnits: v.number(), availableUnits: v.number(), rate: v.number(), status: v.union(v.literal('open'), v.literal('closed')), expectedUpdatedAt: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { user, room } = await ownedRoom(ctx, args.roomTypeId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date) || args.totalUnits < 0 || args.availableUnits < 0 || args.availableUnits > args.totalUnits || args.rate < 0) throw new Error('Invalid inventory values.');
    if (args.totalUnits > room.totalUnits) throw new Error('Daily units cannot exceed the room type unit count.');
    const existing = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', args.roomTypeId).eq('date', args.date)).first();
    if (existing && args.expectedUpdatedAt !== undefined && existing.updatedAt !== args.expectedUpdatedAt) throw new Error('Inventory changed in another session. Refresh the calendar and try again.');
    const now = Date.now();
    const data = { propertyId: room.propertyId, roomTypeId: args.roomTypeId, date: args.date, totalUnits: args.totalUnits, availableUnits: args.availableUnits, rate: args.rate, status: args.status, updatedAt: now };
    if (existing) await ctx.db.patch(existing._id, data); else await ctx.db.insert('availability', { ...data, createdAt: now });
    await ctx.db.insert('auditLogs', { actorUserId: user._id, action: 'inventory.day_updated', entityType: 'roomType', entityId: String(args.roomTypeId), metadata: { date: args.date, old: existing ? { totalUnits: existing.totalUnits, availableUnits: existing.availableUnits, rate: existing.rate, status: existing.status } : null, new: { totalUnits: args.totalUnits, availableUnits: args.availableUnits, rate: args.rate, status: args.status } }, createdAt: now, updatedAt: now });
    return { updated: true };
  },
});

export const bulkUpdate = mutation({
  args: { roomTypeId: v.id('roomTypes'), from: v.string(), to: v.string(), totalUnits: v.number(), availableUnits: v.number(), rate: v.number(), status: v.union(v.literal('open'), v.literal('closed')) },
  handler: async (ctx, args) => {
    const { user, room } = await ownedRoom(ctx, args.roomTypeId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.from) || !/^\d{4}-\d{2}-\d{2}$/.test(args.to) || args.from >= args.to) throw new Error('Invalid date range.');
    if (args.totalUnits < 0 || args.totalUnits > room.totalUnits || args.availableUnits < 0 || args.availableUnits > args.totalUnits || args.rate < 0) throw new Error('Invalid bulk inventory values.');
    const existing = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', args.roomTypeId).gte('date', args.from).lt('date', args.to)).collect();
    const byDate = new Map(existing.map((item) => [item.date, item]));
    const start = new Date(`${args.from}T00:00:00Z`); const end = new Date(`${args.to}T00:00:00Z`); const now = Date.now(); let updated = 0;
    for (const cursor = new Date(start); cursor < end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const date = cursor.toISOString().slice(0, 10); const old = byDate.get(date); const data = { propertyId: room.propertyId, roomTypeId: args.roomTypeId, date, totalUnits: args.totalUnits, availableUnits: args.availableUnits, rate: args.rate, status: args.status, updatedAt: now };
      if (old) await ctx.db.patch(old._id, data); else await ctx.db.insert('availability', { ...data, createdAt: now }); updated++;
    }
    await ctx.db.insert('auditLogs', { actorUserId: user._id, action: 'inventory.range_updated', entityType: 'roomType', entityId: String(args.roomTypeId), metadata: { from: args.from, to: args.to, days: updated, old: existing.map((item) => ({ date: item.date, availableUnits: item.availableUnits, rate: item.rate, status: item.status })), new: { totalUnits: args.totalUnits, availableUnits: args.availableUnits, rate: args.rate, status: args.status } }, createdAt: now, updatedAt: now });
    return { updated };
  },
});

export const history = query({
  args: { roomTypeId: v.id('roomTypes') },
  handler: async (ctx, args) => { await ownedRoom(ctx, args.roomTypeId); return ctx.db.query('auditLogs').withIndex('by_entity', (q) => q.eq('entityType', 'roomType').eq('entityId', String(args.roomTypeId))).order('desc').collect(); },
});
