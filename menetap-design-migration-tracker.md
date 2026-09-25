# Menetap DC → React Design Migration Tracker

## Source of truth

The `.dc.html` screens in the project root are the visual and interaction source of truth. The React application in `app/` is the production implementation target, and Convex is the data/backend source of truth.

## Guest booking funnel

| Screen | DC source | React status | Notes |
|---|---|---|---|
| Homepage | `Menetap Homepage.dc.html` | Topbar/footer parity pass | Homepage topbar and footer now closely mirror the DC reference structure, spacing, language control, link columns, sticky treatment, and mobile behavior; remaining homepage sections still need detailed pixel comparison. |
| Search results | `Menetap Search Results.dc.html` | Functional responsive pass | Connected to published Convex properties; loading and empty states included. |
| Hotel detail | `Menetap Hotel Detail.dc.html` | Functional first pass | Connected to Convex property data; image/gallery parity pending. |
| Room selection | `Menetap Room Selection.dc.html` | Functional responsive pass | Connected to Convex room inventory; loading and empty states included. |
| Checkout | `Menetap Checkout.dc.html` | Functional first pass | Creates real pay-at-hotel booking; add-ons and exact DC layout pending. |
| Confirmation | `Menetap Booking Confirmation.dc.html` | Functional first pass | Loads booking reference from Convex. |

## Next migration groups

- [ ] Match homepage sections pixel-by-pixel: destinations, trust strip, featured stays, pricing transparency, recommendations, experiences, and footer.
- [x] Match homepage topbar and footer structure, typography, spacing, controls, surfaces, and responsive behavior to the DC reference.
- [ ] Match search results cards, filters, sorting, map/list behavior, and mobile layout.
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
