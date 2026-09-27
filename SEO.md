# Menetap SEO — plan and execution log

Owner: Claude, acting as Menetap SEO specialist per `CLAUDE.md`/`AGENTS.md`.

This file tracks SEO status and session-by-session execution. The detailed workstream plan, URL policy, schema targets, and phased checklist live in `docs/seo-implementation-plan.md` — update that file's checkboxes when a workstream item ships. This file is the running log of what was audited, what was found, what changed, and what's still open.

## Source of truth

- Implementation: `app/` (React/Vite + Convex). `.dc.html` prototype exports are reference only.
- Scope: public guest routes only — homepage, `/stays` search, `/stays/property/{id}` detail, `/destinations/*`, `/destinations/all`, and public editorial pages (about, help, rewards landing, etc.).
- Out of scope for indexing: partner, admin, support, payout, checkout, account, and other operational screens. Preserve existing noindex/canonical behavior for these.
- Metadata and structured data must reflect live property/room/rate/availability/policy data. Never generate SEO copy or schema from demo-only or hardcoded values.

## Current status

Foundation is partially in place: static site-wide metadata, hreflang alternates, Organization JSON-LD, robots handling for the search route, and canonical URLs are implemented in `app/index.html` and `app/src/App.tsx`. Route-aware metadata, per-page structured data, and real property data in guest-facing content are not yet implemented — see open findings below.

## Audit log

### 2026-09-27 — initial public-route SEO audit (`app/`)

Reviewed `app/index.html` and `app/src/App.tsx` (routing/meta effect at lines 184–196, `HotelDetail` at 3494, `SearchResults` around 3234–3494) plus `app/src/cityDestinations.tsx`.

**Blocker**
- Fabricated ratings/reviews shown on live, indexable pages: `HotelDetail` hardcodes `4.8 · 214 verified reviews` (`App.tsx:3546`); `SearchResults` hardcodes `rating="4.8"` on every card. Violates the no-unsupported-reviews rule and is a guest-trust/legal risk.
- Fabricated amenities and photo counts: `HotelDetail` uses a static 6-item amenity list regardless of the actual property (`App.tsx:3524-3531`), with fixed literal text "Show all 22 amenities →" (`:3602`) and "+18 photos" (`:3570`). Gallery renders literal `"Photo"` placeholder divs, not real images or alt text.
- Unconditional "Featured stay" badge on every property listing (`App.tsx:3542`) with no underlying criterion.

**High**
- No per-page `<title>` or `meta[name="description"]`. The route effect (`App.tsx:184-196`) only updates canonical URL and robots meta; every public page (property detail, destination pages, editorial pages) is served under the single static homepage title/description from `index.html`. This is duplicate-content exposure across all indexable routes.
- No per-page structured data. Only a single site-wide `Organization` JSON-LD block exists (`index.html:20`). No `LodgingBusiness`/`Hotel`, `BreadcrumbList`, or `ItemList` schema on property, destination, or directory pages.

**Medium**
- Open Graph tags (`og:title`, `og:description`, `og:url`) are static from `index.html` and never updated per route; shared links to a specific property or destination show the homepage OG card.

**Working well (verified, no action needed)**
- `CityDestinationLanding` (`cityDestinations.tsx`) has correct heading hierarchy (single H1, H2/H3), genuine FAQ content via `<details>/<summary>`, and descriptive internal link anchors.
- Canonical + `robots` handling correctly sets `noindex,follow` on the `/stays` search route while keeping marketing/destination routes indexable.
- `alt=` attribute count matches `<img>` count in `App.tsx` (14/14) — no missing alt text found in the current inventory.
- hreflang alternates (`en`, `id`, `x-default`) present in `index.html`.

**Maps to plan checklist:** these findings block Phase A "Route-aware metadata" and Phase B "Validated lodging schema" / "Property indexing eligibility" in `docs/seo-implementation-plan.md`.

### 2026-09-27 — fixes implemented and verified

Implemented and verified in the running dev app (Chrome, `localhost:5174`) plus `npm run typecheck`, `npm test` (6 files / 15 tests, matches baseline), and `npm run build` (pre-existing `convex/bookingStatus.ts` / `convex/properties.ts` type errors confirmed present on `main` before this session's changes via `git stash` — not introduced by this work, left untouched as out of scope):

1. **Route metadata** — added a static screen → `{title, description}` map in `App.tsx`'s route effect, applied to `document.title`, `meta[name="description"]`, `og:title`, `og:description` for all static public guest screens (home, search, destinations, help, legal, etc.). `HotelDetail` and `CityDestinationLanding` (`cityDestinations.tsx`) each got their own effect setting real per-property / per-city title and description. Verified in-browser: homepage title is the site default, `/en/stays` is "Search stays | Menetap", and a real property page renders `"Kaliurang Heritage Villa, Greater Yogyakarta | Menetap"` with a matching meta description and OG title pulled from live Convex data.
2. **Fabricated ratings/reviews removed** — `HotelDetail`'s hardcoded "4.8 · 214 verified reviews" line, the "Featured stay" badge, and a previously-unaudited fabricated **Reviews section** further down the page (fake `4.8 (214)` rating plus two invented guest testimonials attributed to named "Rina" and "Dimas") were all removed and replaced with an honest "Guest reviews for this stay aren't available yet" state, since the Convex schema has no reviews/ratings table at all. `PropertyCard`'s `rating` prop is now optional and `SearchResults` no longer passes a fake `rating="4.8"` — cards render with no rating badge and real `property.amenities` (or none) instead of a hardcoded `["Free cancellation"]`.
3. **Real photos and amenities** — `HotelDetail` now queries `api.properties.listPhotos`, filters to `moderationStatus === "approved"`, and renders actual `<img src alt>` tags (falling back to "Photos coming soon" when none exist) instead of literal `"Photo"` placeholder divs and a fixed "+18 photos" claim. Amenities render from `property.amenities` with an honest fallback message when empty, instead of a fixed 6-item list and a fixed "Show all 22 amenities" link.
4. **`LodgingBusiness` JSON-LD** added to `HotelDetail`, populated from the real property's name, description, address, amenities, and approved photo URLs. Verified present and well-formed in the rendered page.
5. **Unsupported "Verified reviews only" trust claim** removed from the homepage `TrustStrip` and the property-detail trust row (replaced with "Secure payment") — same no-reviews-data-model reasoning as #2.
6. **Bug found and fixed while verifying (blocking, unrelated to SEO):** `convex/properties.ts`'s `listPublished` query validator didn't accept the `childAges` field the client always sends, which crashed the entire `/stays` search page for every guest with an `ArgumentValidationError` (visible in the browser console before the fix). Added `childAges: v.optional(v.array(v.number()))` to the validator and pushed with `npx convex dev --once` per the Convex codegen requirement in `AGENTS.md`. Confirmed search now renders results instead of the error boundary.

**Files changed:** `app/src/App.tsx`, `app/src/cityDestinations.tsx`, `app/convex/properties.ts`.

### 2026-09-27 — isDemo flag, seed expansion, real homepage/city data, breadcrumb + ItemList schema

Addressed the "Known issue" from the previous entry (fabricated homepage/city listings) plus a follow-up task list: durable demo flag, prod-only SEO exclusion, 7–8 property seed set, real homepage/city cards, breadcrumb/ItemList schema, smoke checks. Verified via `npm run typecheck`, `npm test` (7 files / 22 tests — 15 baseline + 7 new sitemap-logic tests), `npm run build`, `npx convex run seed:seedDemo`, and in-browser checks (Chrome, dev server) across `/en`, `/en/stays`, `/en/stays/property/{id}`, `/en/destinations/all`, `/en/destinations/malang`.

1. **Durable `isDemo` flag** — added `isDemo: v.optional(v.boolean())` to the `properties` table (`convex/schema.ts`). `convex/seed.ts` now sets `isDemo: true` on every seeded property and no longer relies on the old " (dummy)" name-suffix convention (removed it from display names — guest-facing pages no longer show "(dummy)" in a property name in any environment; the flag is the durable, queryable marker instead).
2. **Environment-gated SEO suppression, not data hiding** — added `src/seoEnv.ts` (`isProductionEnv()`, reads `VITE_APP_ENV`, documented in `.env.example`, defaults to *non-production* when unset so a missing env var fails closed). `properties.listPublished` is unchanged and still returns demo properties in every environment — they stay fully bookable/visible in local and staging, per the requirement. Only `HotelDetail`'s SEO surface is gated: when `isProductionEnv() && property.isDemo`, the page sets `robots: noindex,follow` and skips rendering both JSON-LD blocks (`LodgingBusiness` + `BreadcrumbList`) and the real og:description/title; the tab title still renders normally for staging/local QA. Verified both branches directly: with `VITE_APP_ENV` unset, a demo property page rendered `index,follow` + 2 JSON-LD scripts; with `VITE_APP_ENV=production` forced for one dev-server run, the same property rendered `noindex,follow` + 0 JSON-LD scripts.
3. **Seed set expanded 3 → 8** — `convex/seed.ts` rewritten around a `demoProperties` array (was 3 hand-copied insert blocks, now one idempotent loop) adding Bandung, Solo, Malang, Surabaya, and Semarang properties alongside the existing 3 Yogyakarta-area ones, each with property-level `amenities` (previously only room-level amenities existed, leaving `HotelDetail`'s real-amenities section empty for these). Ran `npx convex run seed:seedDemo` against the dev deployment: created 7, touched 1, confirmed all 8 return `isDemo: true, status: "published"` via `properties:listPublished`.
4. **Homepage hardcoded cards replaced with Convex data** — `Home`'s "Stays in {selectedCity}" grid, `FeaturedSection` ("Featured in Yogyakarta" — including its fake "Only 3 rooms left"/"Booked 8 times today" scarcity copy and fake badge), and `RecommendedSection` (renamed from "Recommended for you"/"Based on your recent searches" to the honest "More stays to explore"/"Across Menetap destinations" since there's no real personalization signal) all now query `api.properties.listPublished` and render real properties with loading/empty states, or render nothing (`FeaturedSection`/`RecommendedSection` return `null`) rather than an empty section shell. Verified in-browser: none of the five previously-fabricated property names appear anywhere on the homepage, no scarcity or fake-personalization strings found.
5. **City destination pages replaced with Convex data** — `cityDestinations.tsx`'s `CityDestinationLanding` (serves `/destinations/{malang,surabaya,denpasar,semarang,jakarta}`) dropped the fabricated `properties` tuples from its data model entirely and now queries `api.properties.listPublished({ area: data.city })` for the "Properties to compare" section, with an honest "Properties in {city} are being added" empty state for Denpasar and Jakarta (not seeded — outside the 8-property budget). Verified `/en/destinations/malang` now shows the real "Ijen Boulevard Hotel" instead of the fabricated "Batu Highland Villa" etc.
6. **`BreadcrumbList` + `ItemList` schema added**: `HotelDetail` (Home → Stays → {city} stays → property name), `CityDestinationLanding` (Home → All destinations → {city}, plus an `ItemList` of that city's real properties), and `AllDestinations` (Home → All destinations, plus an `ItemList` of all 10 destination pages). All verified present and well-formed via `JSON.parse` in the browser console on `/en/destinations/all` and `/en/destinations/malang`.
7. **Dynamic, demo-aware sitemap** — added `scripts/sitemap-lib.mjs` (pure URL-building/XML-rendering logic, unit-tested in `scripts/sitemap-lib.test.ts`: confirms demo and non-published properties are excluded, the noindex `/stays` route is never included, and the XML is well-formed) and `scripts/generate-sitemap.mjs` (Convex I/O — reads `VITE_CONVEX_URL`/`.env.local`, queries `properties:listPublished`, writes `public/sitemap.xml`). Added as `npm run sitemap`, deliberately **not** wired into `npm run build` so the build stays runnable offline for local typecheck/test/CI without Convex network access — production deploys should run `npm run sitemap` before `npm run build` once a production `VITE_CONVEX_URL` is available (needs adding to the Hostinger build step in `docs/deployment-environments.md` — not yet done, see next actions). Ran it against the dev deployment: correctly produced 0 property URLs (all 8 current properties are `isDemo: true`), proving the exclusion works end-to-end; static + destination routes populated correctly (25 URLs total, `/stays` correctly absent).

**Files changed:** `app/convex/schema.ts`, `app/convex/seed.ts`, `app/src/App.tsx`, `app/src/cityDestinations.tsx`, `app/src/seoEnv.ts` (new), `app/src/vite-env.d.ts`, `app/.env.example`, `app/package.json`, `app/scripts/sitemap-lib.mjs` (new), `app/scripts/sitemap-lib.test.ts` (new), `app/scripts/generate-sitemap.mjs` (new), `app/public/sitemap.xml` (generated).

**Observed but not made by this session:** `app/convex/bookingStatus.ts` and one line of `app/convex/properties.ts` (the `submitForReview` status check) showed up modified in `git status` with fixes to the two pre-existing `npm run build` type errors noted in the prior session's log. Neither edit came from this session's tool calls — flagging so it isn't mistaken for something this session did, in case it's in-progress work from elsewhere. The production build is clean now regardless.

## Known issue — still open

The homepage `PricingSection` ("Market average Rp 980,000 / Menetap rate Rp 890,000 / 9% below Yogyakarta market average today") is a static, non-live illustration of how pricing works, not tied to any real query. It wasn't in this round's task list, so it wasn't touched — flagging since it's the same category of issue as what was just fixed.

## Next actions

1. Wire `npm run sitemap` into the actual production deploy step (Hostinger build, or a GitHub Actions step before it) once a production `VITE_CONVEX_URL`/`VITE_APP_ENV=production` pair exists — see `docs/deployment-environments.md`. Until that's done, `public/sitemap.xml` only reflects whatever was last generated locally against the dev deployment.
2. Seed Denpasar and Jakarta properties (or accept the current "being added" empty state as a launch decision) if those destination pages need populated property comparisons before launch.
3. Localize route metadata for `/id` (currently English-only strings regardless of `language`).
4. Address the "Guest rating" filter in `SearchResults`' sidebar, which renders options ("4.5+ Excellent" etc.) with no `onToggle` handler — clickable but non-functional; found during a prior session's testing, not yet fixed.
5. Decide whether to fix `PricingSection`'s static illustrative numbers (see "Known issue" above).
6. Re-run this audit after the above land and confirm against `docs/seo-implementation-plan.md` Phase A/B/C checkboxes — several are now satisfiable (validated lodging schema, breadcrumb schema, property canonical routes).
