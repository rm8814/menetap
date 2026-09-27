# Staging seed runbook

The repeatable Convex mutation `seed.seedDemo` creates the staging booking fixture:

- Kaliurang Heritage Villa in Greater Yogyakarta
- Deluxe room and Garden Suite room types
- Flexible rate plans in IDR
- 30 days of open availability per seeded room
- Two additional published properties with rooms, rates, and 30-day availability:
  - Prawirotaman Courtyard House
  - Kotagede Copper House
- MVP add-on services, including breakfast and transfer options

The mutation checks existing property/area and room names before inserting, so rerunning it does not duplicate the fixture. Run it only against the development or staging Convex deployment:

```powershell
npx convex run seed:seedDemo
```

After seeding, verify search, room availability, checkout, booking confirmation, cancellation, and partner reservation visibility. Never run the seed against production inventory.
