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

export const list = query({
  args: { roomTypeId: v.id('roomTypes') },
  handler: async (ctx, args) => { await ownedRoom(ctx, args.roomTypeId); return (await ctx.db.query('roomPhotos').withIndex('by_room', (q) => q.eq('roomTypeId', args.roomTypeId)).collect()).sort((a, b) => a.sortOrder - b.sortOrder); },
});

export const add = mutation({
  args: { roomTypeId: v.id('roomTypes'), storageId: v.optional(v.id('_storage')), url: v.optional(v.string()), altText: v.string() },
  handler: async (ctx, args) => {
    const { user } = await ownedRoom(ctx, args.roomTypeId);
    const photos = await ctx.db.query('roomPhotos').withIndex('by_room', (q) => q.eq('roomTypeId', args.roomTypeId)).collect();
    if (photos.length >= 4) throw new Error('A room gallery can contain at most four photos.');
    if (!args.storageId && !args.url) throw new Error('A photo upload or URL is required.');
    if (args.altText.trim().length < 3) throw new Error('Describe the room photo for guests using screen readers.');
    const now = Date.now();
    const id = await ctx.db.insert('roomPhotos', { roomTypeId: args.roomTypeId, storageId: args.storageId, url: args.url, altText: args.altText.trim(), sortOrder: photos.length, createdAt: now, updatedAt: now });
    await ctx.db.insert('auditLogs', { actorUserId: user._id, action: 'room.photo_added', entityType: 'roomType', entityId: String(args.roomTypeId), metadata: { photoId: String(id) }, createdAt: now, updatedAt: now });
    return id;
  },
});

export const remove = mutation({
  args: { photoId: v.id('roomPhotos') },
  handler: async (ctx, args) => { const photo = await ctx.db.get(args.photoId); if (!photo) throw new Error('Photo not found.'); await ownedRoom(ctx, photo.roomTypeId); await ctx.db.delete(photo._id); return { removed: true }; },
});
