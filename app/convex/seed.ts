import { mutation } from './_generated/server';

export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('properties').withIndex('by_area', (q) => q.eq('area', 'Greater Yogyakarta')).first();
    const now = Date.now();
    let propertyId = existing?._id;
    let roomTypeId;
    if (!existing) {
      propertyId = await ctx.db.insert('properties', {
        name: 'Kaliurang Heritage Villa', type: 'villa', segment: 'boutique',
        description: 'A calm, carefully curated stay near the hills of Yogyakarta.',
        address: 'Kaliurang, Sleman', area: 'Greater Yogyakarta', city: 'Yogyakarta', country: 'Indonesia',
        status: 'published', verifiedAt: now, createdAt: now, updatedAt: now,
      });
      roomTypeId = await ctx.db.insert('roomTypes', {
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
    } else {
      const room = await ctx.db.query('roomTypes').withIndex('by_property', (q) => q.eq('propertyId', existing._id)).first();
      roomTypeId = room?._id;
    }

    const serviceSeeds = [
      ['Airport shuttle', 'airport_shuttle', 'Yogyakarta Transfer Co.', 180000, 'One-way airport transfer for up to four guests.'],
      ['Train station transfer', 'train_transfer', 'Jogja Transfer Co.', 90000, 'One-way transfer to or from Yogyakarta Station.'],
      ['Breakfast package', 'breakfast', 'Kaliurang Heritage Villa', 75000, 'Local breakfast served at the property.'],
      ['Early check-in', 'early_check_in', 'Kaliurang Heritage Villa', 100000, 'Subject to room readiness on arrival.'],
      ['Late check-out', 'late_check_out', 'Kaliurang Heritage Villa', 150000, 'Late departure until 3 PM, subject to availability.'],
      ['Travel insurance', 'travel_insurance', 'Menetap Protection', 50000, 'Basic trip protection for the booked stay.'],
    ] as const;
    let servicesCreated = 0;
    for (const [name, category, providerName, price, description] of serviceSeeds) {
      const service = await ctx.db.query('addOnServices').withIndex('by_category', (q) => q.eq('category', category)).first();
      if (!service) {
        await ctx.db.insert('addOnServices', { name, category, description, providerName, price, currency: 'IDR', active: true, createdAt: now, updatedAt: now });
        servicesCreated += 1;
      }
    }
    return { propertyId, roomTypeId, created: !existing, servicesCreated };
  },
});
