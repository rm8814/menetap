# Menetap DC → React Design Migration Tracker

## Source of truth

The `.dc.html` screens in the project root are the visual and interaction source of truth. The React application in `app/` is the production implementation target, and Convex is the data/backend source of truth.

## Guest booking funnel

| Screen | DC source | React status | Notes |
|---|---|---|---|
| Homepage | `Menetap Homepage.dc.html` | Full structural parity pass | Homepage now follows the DC section hierarchy and visual language across topbar, hero, five-field search, assurances, destinations, stays, trust strip, featured cards, pricing, experiences, and footer; typography and guest-selector refinements are documented below; final screenshot-level pixel tuning remains possible. |
| Search results | `Menetap Search Results.dc.html` | Functional responsive pass | Connected to published Convex properties; loading, empty, property-type and nightly-price filtering, sorting, DC-style list cards, desktop/mobile List and Map toggles, filter sidebar, and responsive behavior included. Facility/rating data and full screenshot-level parity remain. |
| Hotel detail | `Menetap Hotel Detail.dc.html` | Functional first pass | Connected to Convex property data; image/gallery parity pending. |
| Room selection | `Menetap Room Selection.dc.html` | Functional responsive pass | Connected to Convex room inventory; loading and empty states included. |
| Checkout | `Menetap Checkout.dc.html` | Functional first pass | Creates real pay-at-hotel booking; add-ons and exact DC layout pending. |
| Confirmation | `Menetap Booking Confirmation.dc.html` | Functional first pass | Loads booking reference from Convex. |

## Documented implementation refinements

- Homepage typography follows the `AGENTS.md` hierarchy: 48px display, 39px page headings, 24px section headings, 18px card headings, 14px body/navigation text, 12px labels, and 11px supporting metadata.
- The topbar “Stays” navigation item now routes directly to the React search-results screen.
- Search results now show the count in the page heading as “Found X stays in [city]” and no longer repeat the count on the right.
- Search-results List/Map controls now use equal-width, centered pills.
- Search-results “Sort by” now appears inline before its selector.
- Search-results List/Map toggle height now matches the topbar language selector.
- Search-results List/Map pill labels use 13px type.
- Search-results List/Map control now uses the same natural height and box model as the topbar language selector.
- Search-result URLs now restore the Search Results screen after a browser refresh instead of returning to the homepage.
- List/Map and language controls now share the same CSS declarations for height, padding, line-height, and typography.
- List/Map and language controls now use explicit 32px outer and 24px inner heights to prevent browser line-height differences.
- Search-results “Sort by” label and selector now use 13px type.
- Search-results List/Map control and Sort by selector are aligned inline in the results toolbar.
- Hotel-card amenity pills use explicit DC-style padding and line-height.
- Hotel-card amenity pills were softened with a lighter violet surface and inline alignment.
- Hotel-card amenity pills now use equal padding on all four sides.
- Fixed the more-specific hotel-card pill rule so the equal-padding treatment is actually applied.
- Search-result location text beneath property names now uses a plain transparent treatment without a background pill.
- Hotel-card amenity tags now use fully rounded capsule pills.
- Hotel-card amenity pills use 3px vertical and 8px horizontal padding.
- Normalized the shared tag rule so the rendered capsule padding is not overridden by a later global selector.
- Search-result amenity pills now have an explicit isolated card rule for width, height, padding, radius, font, and background.
- Search-result amenity pills now use 1px vertical and 10px horizontal padding.
- Replaced overlapping tag selectors with a dedicated `amenity-pill` class and one authoritative style rule.
- Finalized amenity tags against the DC reference: compact rectangular violet tags with 3px/8px padding and 4px radius.
- Locked the final DC padding with an explicit cascade override: `padding: 3px 8px`.
- Trust-strip assurances (“Verified reviews only”, “Instant confirmation”, “Flexible cancellation”, and “Menetap Rewards on every stay”) use 12px text.
- The price-alert email input and “Alert me” button share the same row height.
- Hotel/property cards now use one reusable `PropertyCard` pattern across homepage stay sections and search results, carrying photography, type, identity, location, rating, amenities, price, scarcity/featured badges, and a “View rooms” action where applicable.
- Property cards use 11px property-type labels and 12px location text.
- Footer bottom-row text, language switcher, and “Managed by UPSCALE” capsule use 14px type.
- The destination field starts empty, uses the placeholder “Try hotel name, city, keyword…”, and has its native datalist indicator hidden.
- Check-in and check-out use a single visible Lucide calendar icon with the native picker retained; dates are click-to-select, keyboard editing is blocked, check-in defaults to the local current date, and checkout defaults to the following local date.
- The guest selector uses an explicit responsive popup layout with vertically stacked guest rows, right-aligned quantity controls, tighter counter spacing, and outside-click dismissal. The Done button was removed.
- Search results include client-side stay-type filtering, name sorting, filter-aware counts, and a no-match state.
- Search results now begin with a compact reusable search widget for revising destination, dates, and guests in place.
- The results-page search widget uses a full-pill surface, keeps destination as free text with the homepage placeholder, and uses an icon-only accessible search action.
- `npm run typecheck` passes. Browser screenshot verification remains pending while no browser surface is available in the current session.

## Next migration groups

- [x] Match homepage sections structurally and visually: destinations, trust strip, featured stays, pricing transparency, recommendations, experiences, and footer.
- [x] Match homepage topbar and footer structure, typography, spacing, controls, surfaces, and responsive behavior to the DC reference, including the exact logo font treatment.
- [ ] Match search results cards, filters, sorting, map/list behavior, and mobile layout. (Property-type and nightly-price filters now use Convex data; name sorting, DC-style list cards, responsive sidebar, mobile filter drawer, and map preview state are added; facility/rating data and full map parity remain.)
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
