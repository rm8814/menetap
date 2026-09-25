# Menetap site-wide SEO implementation plan

Status: planning document. Items in this document are not implemented unless marked `[x]` in the project checklist.

Owner: Claude, acting as Menetap SEO specialist, copy specialist, and code reviewer.

## Objectives

- Make public Menetap pages discoverable and useful for guests searching for stays in Indonesia.
- Build destination and property visibility without thin, duplicated, misleading, or private content.
- Support English and Indonesian URLs consistently.
- Improve organic discovery without weakening booking UX, accessibility, security, or performance.

## URL and indexing policy

- Public languages use `/en` and `/id` prefixes.
- Destination routes use `/en/destinations/{city}` and `/id/destinations/{city}`.
- The directory uses `/en/destinations/all` and `/id/destinations/all`.
- Stays search uses `/en/stays` and `/id/stays` with query parameters.
- Jakarta means Jakarta city only; do not describe it as Greater Jakarta.
- Search states with dates, guests, filters, sorting, or map state should normally canonicalize to the clean stays route or be excluded from indexing.
- Private partner, vendor, finance, support, admin, account, checkout, booking, and unpublished inventory screens must not be indexed.

## Workstreams

### 1. Crawlability and rendering

- Decide on SSR or static pre-rendering for public marketing, destination, and property pages.
- Ensure primary public content is present in server HTML without requiring interaction.
- Update title, metadata, canonical, and H1 on every client-side route change.
- Return a real 404 for unknown destinations and properties.
- Keep public navigation as real crawlable links.

### 2. Metadata and canonical URLs

Create a route metadata source. Every public page needs a unique title, description, canonical URL, Open Graph metadata, and a safe fallback. Do not put unsupported prices, availability, ratings, or claims in metadata.

Examples:

- `Explore stays in Jakarta | Menetap`
- `Hotels and stays in Menteng, Jakarta | Menetap`
- `Prawirotaman stays, Yogyakarta | Menetap`

### 3. International SEO

- Add `hreflang="en"`, `hreflang="id"`, and `x-default` where appropriate.
- Keep equivalent English and Indonesian pages aligned in intent.
- Translate metadata, headings, FAQs, alt text, and CTA copy—not only URLs.
- Use self-referencing canonicals for each language route.
- Verify language switching preserves the equivalent route and query behavior.

### 4. Sitemap and robots

- Generate `sitemap.xml` from approved public routes and data.
- Include the homepage, all-destinations page, approved destination pages, approved public property pages, and approved editorial pages.
- Exclude query variants, private documents, dashboards, checkout, unpublished properties, and account pages.
- Add meaningful `lastmod` values only when content or inventory meaningfully changes.
- Add `robots.txt` with sitemap location and private-area rules.
- Block staging and preview environments from indexing.

### 5. Structured data

Use validated JSON-LD matching visible content:

- `Organization` and `WebSite` site-wide.
- `BreadcrumbList` on destinations, properties, rooms, and editorial pages.
- `ItemList` on the all-destinations directory and approved listing pages.
- `LodgingBusiness` or the most accurate lodging type on public properties.
- `Hotel`, `Room`, `Offer`, and `AggregateRating` only when current data is real and visible.
- `FAQPage` only for visible, genuine FAQs.

Validate with Google Rich Results Test and Schema Markup Validator.

### 6. Destination content

Each city page should have unique, useful content: a city-specific H1, introduction, accurate neighborhoods, who each area suits, practical access context, approved property examples, relevant experiences, useful FAQs, links to city/neighborhood searches, all destinations, and related destinations. Avoid mass-produced pages that only swap the city name.

Current destination coverage: Yogyakarta, Bantul, Bandung, Solo, Malang, Surabaya, Denpasar, Semarang, and Jakarta city.

### 7. Property SEO

- Index only published, complete, approved properties with reliable public content.
- Give each indexable property a stable readable slug and canonical URL.
- Use unique property copy, location, type, amenities, policies, photos, and visible review data.
- Remove unpublished, expired, private, internal, guest, and operational fields from public payloads and markup.
- Define a clear removal, redirect, or 404 policy for properties that leave the platform.

### 8. Search-result policy

- Treat search results primarily as a conversion experience, not unlimited indexable combinations.
- Canonicalize or noindex arbitrary date, guest, filter, sort, and map variants.
- Link from destination pages to useful city and neighborhood searches.
- Normalize and encode city query values consistently.
- Do not generate thin pages from arbitrary destination input.

### 9. Internal linking

Use this hierarchy where factually appropriate:

`Homepage → All destinations → City → Neighborhood → Property/Search`

Use descriptive anchors such as `Hotels in Menteng` or `Stays in Kota Tua`. Add breadcrumbs, related destinations, and links to approved non-empty pages. Audit for broken and orphan links after releases.

### 10. Images and accessibility

- Use descriptive filenames and meaningful alt text.
- Store optimized public images as WebP/AVIF where practical.
- Keep approved 4:3 card/destination imagery consistent.
- Include intrinsic dimensions to prevent layout shift.
- Lazy-load below-the-fold images and prioritize the first meaningful hero image.
- Do not ship `Photo` as final production alt text.
- Keep private documents outside public image sitemaps and indexes.

### 11. Performance and UX

- Measure Core Web Vitals on mobile and desktop.
- Reduce JavaScript required before public content appears.
- Preload only the real LCP image and critical fonts.
- Prevent layout shift in images, cards, sticky search, and map/list transitions.
- Preserve semantic headings, labels, focus states, contrast, and keyboard operation.
- Test slow network, mobile viewport, and reduced-motion behavior.

### 12. Copy governance

Write for guest intent: where to stay, which area fits, what is available, and how to compare. Prefer specific useful facts over generic travel claims. Never invent attractions, neighborhoods, reviews, prices, facilities, rankings, or availability. Keep city/region boundaries accurate and review English and Indonesian copy for natural language.

### 13. Measurement

Document and configure:

- Google Search Console and sitemap submission.
- Analytics events for organic landing, destination selection, search, property view, and booking start.
- Monitoring for indexing, coverage, Core Web Vitals, and enhancements.
- Monthly crawls for broken links, duplicate titles, missing metadata, canonical errors, and orphan pages.
- Reporting for impressions, clicks, CTR, indexed pages, destination engagement, and booking conversion.

## Phased implementation checklist

### Phase A — foundation

- [ ] Route-aware metadata.
- [ ] Canonicals and `hreflang`.
- [ ] Correct 404 handling.
- [ ] Index/noindex rules for screens and query variants.
- [ ] Sitemap and robots.txt.
- [ ] Staging blocked from indexing.

### Phase B — public content and schema

- [ ] SSR or static pre-rendering for public pages.
- [ ] Organization, WebSite, BreadcrumbList, and ItemList schema.
- [ ] Validated lodging schema for approved properties.
- [ ] Visible FAQ schema where eligible.
- [ ] Unique metadata and content briefs for every destination.

### Phase C — property discovery

- [ ] Property indexing eligibility and stable slugs.
- [ ] Property canonical routes and metadata.
- [ ] Image alt text, dimensions, and optimized formats.
- [ ] Property-to-destination and neighborhood links.
- [ ] Private/unpublished data excluded from public payloads.

### Phase D — performance and measurement

- [ ] Core Web Vitals improvements.
- [ ] Search Console and analytics documentation.
- [ ] Automated SEO smoke checks.
- [ ] Full crawl before launch.
- [ ] Monthly SEO review ownership and reporting.

## Claude implementation rules

Before implementing an item, Claude must read `AGENTS.md`, `claude.md`, and this plan; inspect the route source, current data source, and matching DC reference; classify the work; avoid exposing private or unsupported content; update the project checklist; run relevant typecheck/lint/build/browser checks; and report URLs, metadata/schema changes, tests, and remaining risks.

## Definition of done

A public SEO page has clear intent, unique useful copy, crawlable and canonical routing, correct localization, metadata and structured data matching visible content, accessible optimized imagery, no private data exposure, checked mobile/error states, and updated documentation.
