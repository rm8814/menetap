# Menetap sitemap

This document is the complete application route inventory. It is not the XML sitemap file.

## Route legend

- **Indexable** — public, canonical content suitable for search.
- **Noindex** — functional or query-driven route; accessible to users but excluded from search.
- **Protected** — requires authentication or a staff/partner role; excluded from search.
- **Redirect/404** — not a standalone content page.

## Indexable public routes

### Localized entry points

- `/en` — Indexable
- `/id` — Indexable

### Public information and policy pages

- `/en/about` — Indexable
- `/en/careers` — Indexable
- `/en/help` — Indexable
- `/en/privacy` — Indexable
- `/en/terms` — Indexable
- `/en/cancellation` — Indexable

The same public information routes may use `/id` when Indonesian copy is available; routes without localized copy must canonicalize to the available English page rather than create a duplicate thin page.

### Destinations

- `/en/destinations/all` — Indexable
- `/id/destinations/all` — Indexable
- `/en/destinations/{city}` — Indexable
- `/id/destinations/{city}` — Indexable

Supported `{city}` values: `yogyakarta`, `bantul`, `sleman`, `bandung`, `solo`, `malang`, `surabaya`, `denpasar`, `semarang`, `jakarta`.

### Public product landing pages

- `/en/experiences` — Indexable
- `/en/rentals` — Indexable
- `/en/rewards` — Indexable
- `/en/partners` — Indexable

### Accommodation pages

- `/en/stays/property/{id}/{property-name}` — Indexable only for published, non-demo properties
- `/en/stays/property/{id}` — Legacy property URL; canonical redirect to the descriptive URL

## Functional public routes — noindex

- `/en/404-notfound` — Explicit 404 screen; noindex
- `/id/404-notfound` — Explicit 404 screen; noindex
- `/en/stays` and `/id/stays` — Search landing/results
- `/en/stays?destination={city}` — Destination-filtered search
- `/en/stays?checkIn={date}&checkOut={date}&adults={n}&children={n}` — Date/guest search
- `/en/experiences?category={category}` — Experience filter
- `/en/experiences/detail?id={experience}` — Experience detail prototype
- `/en/rentals/search?type={vehicle}` — Rental search
- `/en/rewards/dashboard` — Rewards account dashboard

## Guest transactional and account routes — protected/noindex

- `/en/checkout`
- `/en/guest-details`
- `/en/booking-confirmation`
- `/en/booking-issue`
- `/en/my-trips`
- `/en/saved-stays`
- `/en/payment-methods`
- `/en/settings`
- `/en/during-stay`
- `/en/supply/checkout`
- `/en/supply/confirmation`
- `/en/login`
- `/en/signup`
- `/en/reset-password`

Indonesian equivalents use the `/id` prefix where implemented.

## Partner routes — protected/noindex unless explicitly marked public

- `/en/supply` — Partner supplier marketplace landing
- `/en/supply/catalog` — Protected supplier catalog
- `/en/supply/catalog?category={category}` — Protected supplier filter
- `/en/supply/orders` — Protected supplier order history

- `/en/partners` — Public partner landing page
- `/en/partner-login`
- `/en/partner-onboarding`
- `/en/partner-dashboard`
- `/en/partner-room-detail`
- `/en/partner-services`
- `/en/partner-properties`
- `/en/partner-inventory`
- `/en/partner-bookings`
- `/en/partner-payouts`
- `/en/partner-support`
- `/en/partner-announcements`

## Admin routes — protected/noindex

- `/admin`
- `/admin/login`
- `/admin/properties`
- `/admin/property-detail`
- `/admin/partner-detail`
- `/admin/guest-detail`
- `/admin/users`
- `/admin/team`
- `/admin/finance`
- `/admin/payouts`
- `/admin/reports`
- `/admin/disputes`
- `/admin/moderation`
- `/admin/risk`
- `/admin/support`
- `/admin/announcements`
- `/admin/settings`
- `/admin/system`
- `/admin/access-denied`

## Redirects and non-pages

- `/` — Redirect/canonicalize to `/en`
- Any trailing-slash variant — Redirect to the no-trailing-slash URL
- Any URL with campaign, filter, search, pagination, or booking query parameters — Canonicalize to the clean route and remain noindex unless explicitly approved as a campaign landing page
- Unknown paths — 404/not-found response; never include in an indexable route list
- `/en/404-notfound` and `/id/404-notfound` — Explicit 404 pages; never include in the XML sitemap

## XML sitemap publication

`https://menetap.com/sitemap.xml`

The sitemap contains canonical, public URLs only. It must never contain query-string variants, trailing-slash duplicates, private account pages, transactional pages, partner/admin pages, demo inventory, or unpublished properties.

## Included URL families

### Core public pages

- `/en`
- `/id`
- `/en/about`
- `/en/careers`
- `/en/help`
- `/en/privacy`
- `/en/terms`
- `/en/cancellation`

### Destinations

- `/en/destinations/all`
- `/id/destinations/all`
- `/en/destinations/{city}`
- `/id/destinations/{city}`

Current destination slugs:

`yogyakarta`, `bantul`, `sleman`, `bandung`, `solo`, `malang`, `surabaya`, `denpasar`, `semarang`, `jakarta`

### Product landing pages

- `/en/experiences`
- `/en/rentals`
- `/en/rewards`
- `/en/partners`

### Properties

Only properties meeting all of the following conditions are included:

- `status === "published"`
- `isDemo !== true`
- Stable property URL with descriptive slug: `/en/stays/property/{id}/{property-name}`

## Excluded URL families

The following routes are excluded from the sitemap and should remain `noindex`:

- Search and query variants: `/en/stays`, `/id/stays`, and all URLs containing query parameters
- Checkout, guest details, confirmation, booking issue, and during-stay flows
- My trips, saved stays, payment methods, settings, and rewards dashboard
- Supply catalog, checkout, and confirmation routes
- Partner onboarding, login, dashboards, properties, inventory, bookings, payouts, support, and announcements
- Admin login, dashboards, operations, settings, and access-denied routes
- Experience detail URLs with query parameters
- Rental search URLs with query parameters
- Draft, verification, suspended, and demo properties

## Generation

The checked-in `app/public/sitemap.xml` contains the current static routes listed above plus eligible property URLs when the sitemap generator has been run against the production Convex deployment. It is intentionally not a hand-maintained list of every property; published inventory is generated from the database.

From `app/`, run:

```bash
npm run sitemap
```

The generator reads published property data from the configured Convex deployment and writes:

```text
app/public/sitemap.xml
```

Required environment variable:

```text
VITE_CONVEX_URL=<Convex deployment URL>
```

If the deployment cannot be reached, do not publish a property sitemap generated from stale or placeholder data. The static public routes may still be reviewed from `app/scripts/sitemap-lib.mjs`.

## Publishing and validation

Before publishing:

- Confirm every `<loc>` uses `https://menetap.com`.
- Confirm every URL is canonical and has no trailing slash except the domain root.
- Confirm there are no query strings, fragments, duplicate URLs, or demo property IDs.
- Request representative URLs and confirm HTTP 200 responses.
- Confirm each URL's canonical tag matches the sitemap URL.
- Confirm private/search/transactional pages are absent and return `noindex,follow` where applicable.
- Validate the XML structure and submit `https://menetap.com/sitemap.xml` in webmaster tools.

The sitemap is an availability hint, not an authorization mechanism. Robots rules, authentication, server redirects, and page-level metadata must independently protect excluded routes.
