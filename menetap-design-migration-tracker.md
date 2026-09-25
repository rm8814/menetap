# Menetap DC → React Design Migration Tracker

## Source of truth

The `.dc.html` screens in the project root are the visual and interaction source of truth. The React application in `app/` is the production implementation target, and Convex is the data/backend source of truth.

## Guest booking funnel

| Screen | DC source | React status | Notes |
|---|---|---|---|
| Homepage | `Menetap Homepage.dc.html` | Full structural parity pass | Homepage now follows the DC section hierarchy and visual language across topbar, hero, five-field search, assurances, destinations, stays, trust strip, featured cards, pricing, experiences, and footer; typography and guest-selector refinements are documented below; final screenshot-level pixel tuning remains possible. |
| Search results | `Menetap Search Results.dc.html` | Functional responsive pass | Connected to published Convex properties; loading, empty, filtering, sorting, and mobile states included. |
| Hotel detail | `Menetap Hotel Detail.dc.html` | Functional first pass | Connected to Convex property data; image/gallery parity pending. |
| Room selection | `Menetap Room Selection.dc.html` | Functional responsive pass | Connected to Convex room inventory; loading and empty states included. |
| Checkout | `Menetap Checkout.dc.html` | Functional first pass | Creates real pay-at-hotel booking; add-ons and exact DC layout pending. |
| Confirmation | `Menetap Booking Confirmation.dc.html` | Functional first pass | Loads booking reference from Convex. |

## Documented implementation refinements

- Homepage typography follows the `AGENTS.md` hierarchy: 48px display, 39px page headings, 24px section headings, 18px card headings, 14px body/navigation text, 12px labels, and 11px supporting metadata.
- Trust-strip assurances (“Verified reviews only”, “Instant confirmation”, “Flexible cancellation”, and “Menetap Rewards on every stay”) use 12px text.
- The price-alert email input and “Alert me” button share the same row height.
- Hotel/property cards now use one reusable `PropertyCard` pattern across homepage stay sections and search results, carrying photography, type, identity, location, rating, amenities, price, scarcity/featured badges, and a “View rooms” action where applicable.
- Property cards use 11px property-type labels and 12px location text.
- Footer bottom-row text, language switcher, and “Managed by UPSCALE” capsule use 14px type.
- The destination field starts empty, uses the placeholder “Try hotel name, city, keyword…”, and has its native datalist indicator hidden.
- Check-in and check-out use a single visible Lucide calendar icon with the native picker retained; dates are click-to-select, keyboard editing is blocked, check-in defaults to the local current date, and checkout defaults to the following local date.
- The guest selector uses an explicit responsive popup layout with vertically stacked guest rows, right-aligned quantity controls, tighter counter spacing, and outside-click dismissal. The Done button was removed.
- Search results include client-side stay-type filtering, name sorting, filter-aware counts, and a no-match state.
- `npm run typecheck` passes. Browser screenshot verification remains pending while no browser surface is available in the current session.

## Next migration groups

- [x] Match homepage sections structurally and visually: destinations, trust strip, featured stays, pricing transparency, recommendations, experiences, and footer.
- [x] Match homepage topbar and footer structure, typography, spacing, controls, surfaces, and responsive behavior to the DC reference, including the exact logo font treatment.
- [ ] Match search results cards, filters, sorting, map/list behavior, and mobile layout. (Client-side type filter and name sorting added; visual/map parity remains.)
- [ ] Match hotel detail gallery, amenities, policies, reviews, and add-on presentation.
- [ ] Match room selection rate cards, date calendar, and policies.
- [ ] Match checkout details, add-on selection, payment explanation, and validation states.
- [x] Add shared loading, empty, success, error, and permission-state primitives to the React foundation.
- [x] Add responsive mobile refinements for navigation, forms, cards, detail, and checkout layouts.
- [x] Extract shared state and access primitives for guest and future staff screens.
- [ ] Migrate partner onboarding.
- [ ] Migrate partner dashboard.
- [ ] Migrate admin console and admin property management.
- [ ] Migrate finance, payouts, disputes, moderation, risk, support, reports, and settings.

## Verification standard

Each screen is complete only when:

- [ ] Desktop layout matches the DC reference.
- [ ] Mobile layout matches the DC reference.
- [ ] Typography, spacing, color, borders, shadows, and radii are aligned.
- [ ] Loading, empty, error, success, and permission states are covered.
- [ ] Interactions map to real React state or Convex data.
- [ ] Typecheck and production build pass.
- [ ] The screen is manually compared against its DC reference.
