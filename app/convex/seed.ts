import { mutation } from './_generated/server';

const demoProperties = [
  {
    name: 'Kaliurang Heritage Villa', type: 'villa' as const, segment: 'boutique' as const,
    description: 'A calm, carefully curated stay near the hills of Yogyakarta.',
    address: 'Kaliurang, Sleman', area: 'Greater Yogyakarta', city: 'Yogyakarta',
    amenities: ['Wi-Fi', 'Air conditioning', 'Breakfast available', 'Pool access'],
    rooms: [
      { name: 'Deluxe room', description: 'A comfortable room for two guests.', maxGuests: 2, units: 4, rate: 850000, amenities: ['Wi-Fi', 'Air conditioning', 'Breakfast available'] },
      { name: 'Garden Suite', description: 'A spacious suite with a quiet garden outlook.', maxGuests: 2, units: 2, rate: 890000, amenities: ['Wi-Fi', 'Air conditioning', 'Garden view', 'Pool access'] },
    ],
  },
  {
    name: 'Prawirotaman Courtyard House', type: 'guesthouse' as const, segment: 'upscale' as const,
    description: 'A leafy courtyard guesthouse in the heart of Prawirotaman, with thoughtful rooms, local breakfast, and an easy walk to cafés and galleries.',
    address: 'Jl. Prawirotaman II, Mergangsan', area: 'Prawirotaman', city: 'Yogyakarta',
    amenities: ['Wi-Fi', 'Air conditioning', 'Courtyard view', 'Breakfast available'],
    rooms: [{ name: 'Courtyard King Room', description: 'A quiet king room opening onto the shared tropical courtyard.', maxGuests: 2, units: 5, rate: 625000, amenities: ['Wi-Fi', 'Air conditioning', 'Courtyard view', 'Breakfast available'] }],
  },
  {
    name: 'Kotagede Copper House', type: 'homestay' as const, segment: 'boutique' as const,
    description: 'A restored Javanese home in historic Kotagede, pairing handmade details with a calm garden and generous family rooms.',
    address: 'Jl. Kemasan, Kotagede', area: 'Kotagede', city: 'Yogyakarta',
    amenities: ['Wi-Fi', 'Air conditioning', 'Garden view', 'Kitchenette', 'Breakfast available'],
    rooms: [{ name: 'Family Garden Room', description: 'A spacious family room with a private garden terrace and flexible bedding.', maxGuests: 4, units: 3, rate: 720000, amenities: ['Wi-Fi', 'Air conditioning', 'Garden view', 'Kitchenette', 'Breakfast available'] }],
  },
  {
    name: 'Dago Hillside Guesthouse', type: 'guesthouse' as const, segment: 'midscale' as const,
    description: 'A cool-air guesthouse in the hills above Bandung, close to cafés and viewpoints.',
    address: 'Jl. Dago Atas, Coblong', area: 'Dago', city: 'Bandung',
    amenities: ['Wi-Fi', 'Air conditioning', 'Mountain view', 'Breakfast available'],
    rooms: [{ name: 'Hillside Twin Room', description: 'A twin room with cool mountain air and a private balcony.', maxGuests: 2, units: 4, rate: 540000, amenities: ['Wi-Fi', 'Air conditioning', 'Mountain view'] }],
  },
  {
    name: 'Laweyan Batik House', type: 'homestay' as const, segment: 'boutique' as const,
    description: 'A heritage home in Solo’s historic batik quarter, with courtyard rooms and easy access to workshops and markets.',
    address: 'Jl. Dr. Rajiman, Laweyan', area: 'Laweyan', city: 'Solo',
    amenities: ['Wi-Fi', 'Air conditioning', 'Courtyard view', 'Breakfast available'],
    rooms: [{ name: 'Heritage Courtyard Room', description: 'A quiet room facing the shared batik-house courtyard.', maxGuests: 2, units: 3, rate: 480000, amenities: ['Wi-Fi', 'Air conditioning', 'Courtyard view', 'Breakfast available'] }],
  },
  {
    name: 'Ijen Boulevard Hotel', type: 'hotel' as const, segment: 'midscale' as const,
    description: 'A leafy-avenue city hotel in Malang, a short walk from cafés and colonial-era architecture.',
    address: 'Jl. Ijen Boulevard', area: 'Ijen Boulevard', city: 'Malang',
    amenities: ['Wi-Fi', 'Air conditioning', 'Free parking', 'Breakfast available'],
    rooms: [{ name: 'Superior Room', description: 'A well-lit room close to Malang’s tree-lined avenues.', maxGuests: 2, units: 6, rate: 460000, amenities: ['Wi-Fi', 'Air conditioning', 'Free parking'] }],
  },
  {
    name: 'Tunjungan City Hotel', type: 'hotel' as const, segment: 'midscale' as const,
    description: 'A practical, central hotel on Surabaya’s classic boulevard, close to dining and transport links.',
    address: 'Jl. Tunjungan', area: 'Tunjungan', city: 'Surabaya',
    amenities: ['Wi-Fi', 'Air conditioning', 'Free parking', 'Breakfast available'],
    rooms: [{ name: 'Standard Room', description: 'A compact, comfortable room in central Surabaya.', maxGuests: 2, units: 6, rate: 420000, amenities: ['Wi-Fi', 'Air conditioning'] }],
  },
  {
    name: 'Kota Lama Heritage Stay', type: 'guesthouse' as const, segment: 'boutique' as const,
    description: 'A restored Dutch-era building in Semarang’s old town, steps from galleries and evening walks.',
    address: 'Jl. Letjen Suprapto, Kota Lama', area: 'Kota Lama', city: 'Semarang',
    amenities: ['Wi-Fi', 'Air conditioning', 'Breakfast available'],
    rooms: [{ name: 'Heritage Double Room', description: 'A double room inside the restored old-town building.', maxGuests: 2, units: 4, rate: 510000, amenities: ['Wi-Fi', 'Air conditioning', 'Breakfast available'] }],
  },
];

export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let created = 0;
    let propertiesTouched = 0;
    let servicesCreated = 0;
    let firstPropertyId;
    let firstRoomTypeId;

    for (const item of demoProperties) {
      const existing = await ctx.db.query('properties').withIndex('by_area', (q) => q.eq('area', item.area)).first();
      let propertyId = existing?._id;
      if (existing) {
        propertiesTouched += 1;
        if (existing.name !== item.name || !existing.isDemo || !existing.amenities?.length) {
          await ctx.db.patch(existing._id, { name: item.name, isDemo: true, amenities: item.amenities, updatedAt: now });
        }
      } else {
        propertyId = await ctx.db.insert('properties', {
          name: item.name, type: item.type, segment: item.segment, description: item.description,
          address: item.address, area: item.area, city: item.city, country: 'Indonesia', amenities: item.amenities,
          status: 'published', isDemo: true, verifiedAt: now, createdAt: now, updatedAt: now,
        });
        created += 1;
      }
      if (!propertyId) continue;
      if (!firstPropertyId) firstPropertyId = propertyId;
      const existingRooms = await ctx.db.query('roomTypes').withIndex('by_property', (q) => q.eq('propertyId', propertyId!)).collect();
      for (const room of item.rooms) {
        let roomTypeId = existingRooms.find((candidate) => candidate.name === room.name)?._id;
        if (!roomTypeId) {
          roomTypeId = await ctx.db.insert('roomTypes', {
            propertyId, name: room.name, description: room.description, maxGuests: room.maxGuests, totalUnits: room.units,
            amenities: room.amenities, active: true, createdAt: now, updatedAt: now,
          });
          await ctx.db.insert('ratePlans', {
            propertyId, roomTypeId, name: 'Flexible rate', price: room.rate, currency: 'IDR', includes: ['Room only'],
            cancellationPolicy: 'Free cancellation up to 24 hours before check-in.', active: true, createdAt: now, updatedAt: now,
          });
          for (let offset = 0; offset < 30; offset += 1) {
            const date = new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
            await ctx.db.insert('availability', { propertyId, roomTypeId, date, totalUnits: room.units, availableUnits: room.units, rate: room.rate, status: 'open', createdAt: now, updatedAt: now });
          }
        }
        if (!firstRoomTypeId) firstRoomTypeId = roomTypeId;
      }
    }

    const serviceSeeds = [
      ['Airport shuttle', 'airport_shuttle', 'Yogyakarta Transfer Co.', 180000, 'One-way airport transfer for up to four guests.'],
      ['Train station transfer', 'train_transfer', 'Jogja Transfer Co.', 90000, 'One-way transfer to or from Yogyakarta Station.'],
      ['Breakfast package', 'breakfast', 'Kaliurang Heritage Villa', 75000, 'Local breakfast served at the property.'],
      ['Early check-in', 'early_check_in', 'Kaliurang Heritage Villa', 100000, 'Subject to room readiness on arrival.'],
      ['Late check-out', 'late_check_out', 'Kaliurang Heritage Villa', 150000, 'Late departure until 3 PM, subject to availability.'],
      ['Travel insurance', 'travel_insurance', 'Menetap Protection', 50000, 'Basic trip protection for the booked stay.'],
    ] as const;
    for (const [name, category, providerName, price, description] of serviceSeeds) {
      const service = await ctx.db.query('addOnServices').withIndex('by_category', (q) => q.eq('category', category)).first();
      if (!service) {
        await ctx.db.insert('addOnServices', { name, category, description, providerName, price, currency: 'IDR', active: true, createdAt: now, updatedAt: now });
        servicesCreated += 1;
      }
    }
    return { propertyId: firstPropertyId, roomTypeId: firstRoomTypeId, created, propertiesTouched, servicesCreated };
  },
});
