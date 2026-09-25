# Menetap DC → React Design Migration Tracker

## Source of truth

The `.dc.html` screens in the project root are the visual and interaction source of truth. The React application in `app/` is the production implementation target, and Convex is the data/backend source of truth.

## Guest booking funnel

| Screen | DC source | React status | Notes |
|---|---|---|---|
| Homepage | `Menetap Homepage.dc.html` | Expanded first pass | Search, destination pills, trust strip, featured stays, pricing transparency, experiences, and footer implemented; detailed pixel comparison still pending. |
| Search results | `Menetap Search Results.dc.html` | Functional first pass | Connected to published Convex properties; empty state included. |
| Hotel detail | `Menetap Hotel Detail.dc.html` | Functional first pass | Connected to Convex property data; image/gallery parity pending. |
| Room selection | `Menetap Room Selection.dc.html` | Functional first pass | Connected to Convex room inventory. |
| Checkout | `Menetap Checkout.dc.html` | Functional first pass | Creates real pay-at-hotel booking; add-ons and exact DC layout pending. |
| Confirmation | `Menetap Booking Confirmation.dc.html` | Functional first pass | Loads booking reference from Convex. |

## Next migration groups

- [ ] Match homepage sections pixel-by-pixel: destinations, trust strip, featured stays, pricing transparency, recommendations, experiences, and footer.
- [ ] Match search results cards, filters, sorting, map/list behavior, and mobile layout.
- [ ] Match hotel detail gallery, amenities, policies, reviews, and add-on presentation.
- [ ] Match room selection rate cards, date calendar, and policies.
- [ ] Match checkout details, add-on selection, payment explanation, and validation states.
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
