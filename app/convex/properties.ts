import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireRole } from './authorization';

export const listPublished = query({
  args: { area: v.optional(v.string()), checkIn: v.optional(v.string()), checkOut: v.optional(v.string()), guests: v.optional(v.number()), childAges: v.optional(v.array(v.number())) },
  handler: async (ctx, args) => {
    const normalizedAreas: Record<string, string> = { Yogyakarta: 'Greater Yogyakarta', 'Greater Yogyakarta': 'Greater Yogyakarta' };
    const term = args.area?.trim().toLowerCase();
    const properties = await ctx.db.query('properties').withIndex('by_status', (q) => q.eq('status', 'published')).collect();
    const published = properties.filter((property) => {
      if (!term) return true;
      const normalized = normalizedAreas[args.area!.trim()]?.toLowerCase();
      return property.area.toLowerCase() === normalized || [property.name, property.area, property.city].some((value) => value.toLowerCase().includes(term));
    });
    if (!args.checkIn || !args.checkOut) return Promise.all(published.map(async (property) => {
      const rates = await ctx.db.query('ratePlans').withIndex('by_property', (q) => q.eq('propertyId', property._id)).collect();
      const activeRates = rates.filter((rate) => rate.active).map((rate) => rate.price);
      return { ...property, lowestPrice: activeRates.length ? Math.min(...activeRates) : undefined };
    }));
    return (await Promise.all(published.map(async (property) => {
      const rooms = await ctx.db.query('roomTypes').withIndex('by_property', (q) => q.eq('propertyId', property._id)).collect();
      for (const room of rooms.filter((item) => item.active && item.maxGuests >= (args.guests ?? 1))) {
        const nights = await ctx.db.query('availability').withIndex('by_room_date', (q) => q.eq('roomTypeId', room._id).gte('date', args.checkIn!).lt('date', args.checkOut!)).collect();
        if (nights.length > 0 && nights.every((night) => night.status === 'open' && night.availableUnits > 0)) return { ...property, lowestPrice: Math.min(...nights.map((night) => night.rate)) };
      }
      return null;
    }))).filter((property): property is NonNullable<typeof property> => property !== null);
  },
});

export const get = query({ args: { id: v.id('properties') }, handler: async (ctx, args) => ctx.db.get(args.id) });

export const listForAdmin = query({
  args: { status: v.optional(v.union(v.literal('draft'), v.literal('verification'), v.literal('approved'), v.literal('published'), v.literal('suspended'))) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['operations', 'admin']);
    const properties = args.status
      ? await ctx.db.query('properties').withIndex('by_status', (q) => q.eq('status', args.status!)).collect()
      : await ctx.db.query('properties').collect();
    return properties.map(({ name, area, city, status, ownerUserId, createdAt, _id }) => ({ _id, name, area, city, status, ownerUserId, createdAt }));
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    if (user.role === 'partner') return ctx.db.query('properties').withIndex('by_owner', (q) => q.eq('ownerUserId', user._id)).collect();
    return ctx.db.query('properties').order('desc').collect();
  },
});

export const createDraft = mutation({
  args: { name: v.string(), type: v.union(v.literal('hotel'), v.literal('villa'), v.literal('guesthouse'), v.literal('homestay')), description: v.string(), address: v.string(), area: v.string(), city: v.string(), country: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const name = args.name.trim();
    const description = args.description.trim();
    const address = args.address.trim();
    const area = args.area.trim();
    const city = args.city.trim();
    const country = args.country.trim();
    if ([name, description, address, area, city, country].some((value) => value.length < 2)) throw new Error('Complete all required property details.');
    const now = Date.now();
    return ctx.db.insert('properties', { ...args, name, description, address, area, city, country, status: 'draft', ownerUserId: user._id, createdAt: now, updatedAt: now });
  },
});

export const updateDetails = mutation({
  args: { propertyId: v.id('properties'), name: v.string(), type: v.union(v.literal('hotel'), v.literal('villa'), v.literal('guesthouse'), v.literal('homestay')), description: v.string(), address: v.string(), area: v.string(), city: v.string(), country: v.string(), contactName: v.optional(v.string()), contactEmail: v.optional(v.string()), contactPhone: v.optional(v.string()), checkInFrom: v.optional(v.string()), checkOutBefore: v.optional(v.string()), latitude: v.optional(v.number()), longitude: v.optional(v.number()), timezone: v.string(), amenities: v.array(v.string()), houseRules: v.array(v.string()), cancellationPolicy: v.string(), childPolicy: v.optional(v.object({ acceptsChildren: v.boolean(), maxChildAge: v.number(), pricing: v.union(v.literal('free'), v.literal('flat'), v.literal('age_band')), flatRate: v.optional(v.number()), ageRates: v.optional(v.array(v.object({ maxAge: v.number(), nightlyRate: v.number() }))) })) },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error('Property not found.');
    if (user.role === 'partner' && property.ownerUserId !== user._id) throw new Error('Not authorized for this property.');
    if (!args.name.trim() || !args.description.trim() || !args.address.trim() || !args.city.trim() || !args.timezone.trim() || !args.cancellationPolicy.trim()) throw new Error('Complete the required property details and policies.');
    if ((args.latitude !== undefined && (args.latitude < -90 || args.latitude > 90)) || (args.longitude !== undefined && (args.longitude < -180 || args.longitude > 180))) throw new Error('Map coordinates are invalid.');
    const now = Date.now();
    const { propertyId: _propertyId, ...updates } = args;
    await ctx.db.patch(property._id, { ...updates, name: args.name.trim(), description: args.description.trim(), address: args.address.trim(), area: args.area.trim(), city: args.city.trim(), country: args.country.trim(), cancellationPolicy: args.cancellationPolicy.trim(), updatedAt: now });
    await ctx.db.insert('auditLogs', { actorUserId: user._id, action: 'property.details_updated', entityType: 'property', entityId: String(property._id), metadata: { fields: Object.keys(updates) }, createdAt: now, updatedAt: now });
    return { updated: true };
  },
});

export const submitForReview = mutation({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const property = await ctx.db.get(args.propertyId);
    if (!property || (user.role === 'partner' && property.ownerUserId !== user._id)) throw new Error('Not authorized for this property.');
    if (property.status !== 'draft') throw new Error('Only draft properties can be submitted.');
    const now = Date.now();
    await ctx.db.patch(property._id, { status: 'verification', updatedAt: now });
    await ctx.db.insert('auditLogs', { actorUserId: user._id, action: 'property.submitted_for_review', entityType: 'property', entityId: String(property._id), createdAt: now, updatedAt: now });
    return { status: 'verification' as const };
  },
});

export const review = mutation({
  args: { propertyId: v.id('properties'), decision: v.union(v.literal('approve'), v.literal('reject'), v.literal('suspend')), reason: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['admin', 'operations']);
    const property = await ctx.db.get(args.propertyId);
    if (!property || !['verification', 'approved', 'published'].includes(property.status)) throw new Error('Property is not reviewable in its current state.');
    const status = args.decision === 'approve' ? 'approved' : args.decision === 'reject' ? 'draft' : 'suspended';
    const now = Date.now();
    await ctx.db.patch(property._id, { status, verifiedAt: args.decision === 'approve' ? now : property.verifiedAt, updatedAt: now });
    const action = args.decision === 'approve' ? 'property.approved' : args.decision === 'reject' ? 'property.rejected' : 'property.suspended';
    await ctx.db.insert('auditLogs', { actorUserId: user._id, action, entityType: 'property', entityId: String(property._id), metadata: { reason: args.reason.trim() }, createdAt: now, updatedAt: now });
    return { status };
  },
});

export const setPublished = mutation({
  args: { propertyId: v.id('properties'), published: v.boolean(), reason: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const property = await ctx.db.get(args.propertyId);
    if (!property || (user.role === 'partner' && property.ownerUserId !== user._id)) throw new Error('Not authorized for this property.');
    if (args.published && property.status !== 'approved') throw new Error('Only approved properties can be published.');
    if (args.reason.trim().length < 3) throw new Error('A reason is required.');
    const now = Date.now();
    await ctx.db.patch(property._id, { status: args.published ? 'published' : 'approved', updatedAt: now });
    await ctx.db.insert('auditLogs', { actorUserId: user._id, action: args.published ? 'property.published' : 'property.unpublished', entityType: 'property', entityId: String(property._id), metadata: { reason: args.reason.trim() }, createdAt: now, updatedAt: now });
    return { status: args.published ? 'published' as const : 'approved' as const };
  },
});

export const auditHistory = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const property = await ctx.db.get(args.propertyId);
    if (!property || (user.role === 'partner' && property.ownerUserId !== user._id)) throw new Error('Not authorized for this property.');
    return ctx.db.query('auditLogs').withIndex('by_entity', (q) => q.eq('entityType', 'property').eq('entityId', String(args.propertyId))).order('desc').collect();
  },
});

export const addPhoto = mutation({
  args: { propertyId: v.id('properties'), storageId: v.optional(v.id('_storage')), url: v.optional(v.string()), altText: v.string(), sortOrder: v.number() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['partner', 'operations', 'admin']);
    const property = await ctx.db.get(args.propertyId);
    if (!property || (user.role === 'partner' && property.ownerUserId !== user._id)) throw new Error('Not authorized for this property.');
    if (!args.storageId && !args.url) throw new Error('A photo upload or URL is required.');
    if (args.altText.trim().length < 3 || args.sortOrder < 0) throw new Error('Photo alt text and ordering are required.');
    const now = Date.now();
    return ctx.db.insert('propertyPhotos', { propertyId: args.propertyId, storageId: args.storageId, url: args.url, altText: args.altText.trim(), sortOrder: args.sortOrder, moderationStatus: 'pending', createdAt: now, updatedAt: now });
  },
});

export const listPhotos = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => ctx.db.query('propertyPhotos').withIndex('by_property', (q) => q.eq('propertyId', args.propertyId)).collect().then((photos) => photos.sort((a, b) => a.sortOrder - b.sortOrder)),
});

export const updatePhotoModeration = mutation({
  args: { photoId: v.id('propertyPhotos'), status: v.union(v.literal('approved'), v.literal('rejected')), rejectionReason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['admin', 'operations']);
    const photo = await ctx.db.get(args.photoId);
    if (!photo) throw new Error('Photo not found.');
    await ctx.db.patch(photo._id, { moderationStatus: args.status, rejectionReason: args.status === 'rejected' ? args.rejectionReason?.trim() : undefined, updatedAt: Date.now() });
    return { reviewedBy: user._id, status: args.status };
  },
});

export const listPendingModeration = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin', 'operations']);
    const photos = await ctx.db.query('propertyPhotos').withIndex('by_moderation', (q) => q.eq('moderationStatus', 'pending')).collect();
    return Promise.all(photos.map(async (photo) => ({ photo, property: await ctx.db.get(photo.propertyId) })));
  },
});

export const searchSuggestions = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const query = args.query.trim().toLowerCase();
    if (!query) return [];
    const properties = (await ctx.db.query('properties').withIndex('by_status', (q) => q.eq('status', 'published')).collect());
    const matches = properties.filter((property) => [property.name, property.area, property.city].some((value) => value.toLowerCase().includes(query)));
    const suggestions = matches.flatMap((property) => [
      property.name.toLowerCase().includes(query) ? { kind: 'property' as const, id: property._id, label: property.name, detail: `${property.area}, ${property.city}` } : null,
      property.area.toLowerCase().includes(query) || property.city.toLowerCase().includes(query) ? { kind: 'area' as const, id: property.area, label: property.area, detail: property.city } : null,
    ]).filter((suggestion): suggestion is NonNullable<typeof suggestion> => Boolean(suggestion));
    return Array.from(new Map(suggestions.map((suggestion) => [`${suggestion.kind}:${suggestion.label.toLowerCase()}`, suggestion])).values()).slice(0, 8);
  },
});
