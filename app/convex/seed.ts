import { mutation } from './_generated/server';

export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('properties').withIndex('by_area', (q) => q.eq('area', 'Greater Yogyakarta')).first();
    if (existing) return { propertyId: existing._id, created: false };

    const now = Date.now();
    const propertyId = await ctx.db.insert('properties', {
      name: 'Kaliurang Heritage Villa', type: 'villa', segment: 'boutique',
      description: 'A calm, carefully curated stay near the hills of Yogyakarta.',
      address: 'Kaliurang, Sleman', area: 'Greater Yogyakarta', city: 'Yogyakarta', country: 'Indonesia',
      status: 'published', verifiedAt: now, createdAt: now, updatedAt: now,
    });
    const roomTypeId = await ctx.db.insert('roomTypes', {
      propertyId, name: 'Deluxe room', description: 'A comfortable room for two guests.', maxGuests: 2, totalUnits: 4,
      amenities: ['Wi-Fi', 'Air conditioning', 'Breakfast available'], active: true, createdAt: now, updatedAt: now,
    });
    await ctx.db.insert('ratePlans', {
      propertyId, roomTypeId, name: 'Flexible rate', price: 850000, currency: 'IDR', includes: ['Room only'],
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in.', active: true, createdAt: now, updatedAt: now,
    });
    for (let offset = 0; offset < 30; offset += 1) {
      const date = new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
      await ctx.db.insert('availability', { propertyId, roomTypeId, date, totalUnits: 4, availableUnits: 4, rate: 850000, status: 'open', createdAt: now, updatedAt: now });
    }
    return { propertyId, roomTypeId, created: true };
  },
});
