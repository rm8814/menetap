# Checklist: SEO for public routes and slugs

Source: Claude review 2026-09-30 of `app/src/seo.ts`, `app/src/App.tsx` (routing + property
screen), `app/index.html`, `app/public/robots.txt`, `app/scripts/sitemap-lib.mjs`.
Verification from static read only; no live-browser or Search Console evidence.
Baseline: `npm run typecheck` clean, `npm test` 41/41 (2026-09-30).

## Items (for Codex)

- [ ] **Property page sets canonical, og:url, hreflang** (Medium/High). The `hotel`
  screen effect (`App.tsx` ~3534-3564) sets title/description/og/robots but never calls
  `applySeo`, and the screen-meta effect (~257) has no `hotel` entry. On a direct load of
  `/en/stays/property/<id>/<slug>` the canonical stays `https://menetap.com/en` (from
  `index.html`), telling Google the property is a duplicate of the homepage. Fix: call
  `applySeo` (with the property title/description) for the `hotel` screen; keep the
  demo-suppression branch. Verify: load a property URL, `link[rel=canonical]` equals that
  URL.
- [ ] **Rooms and checkout URLs are indexable in production** (Medium).
  `privatePrefixes` in `seo.ts` only matches `/checkout` at the path start, but the real
  routes are `/stays/property/<id>/<slug>/rooms` and `.../checkout`. They're only noindexed
  today because they carry a query string. Add a suffix rule (`/checkout` and `/rooms` at the
  end of a `/stays/property/...` path) to `isNoindexRoute`, and a matching robots.txt
  `Disallow` (`/*/checkout`). Add a unit test for both.
- [ ] **Static `noindex` in `index.html` line 10** (Medium, launch blocker for SEO).
  Google may honour raw-HTML `noindex` and never run the JS that switches it to
  `index,follow`. Make the static tag production-aware (Vite `transformIndexHtml` keyed on
  `VITE_APP_ENV`) so production ships `index,follow`, and everything else stays noindex.
  Also make `index.html`'s `og:description` ("Curated stays and everything around them.")
  match the meta description.
- [ ] **Non-production staging can become indexable** (Low). The property effect sets
  `robots: index,follow` whenever the property isn't demo, regardless of `isProductionEnv()`.
  Route it through `isNoindexRoute`/`applySeo` (same change as item 1).
- [ ] **Sitemap slug differs from app slug** (Medium). `sitemap-lib.mjs` re-implements
  slugging without the `NFKD` accent strip and with a `"stay"` fallback, while
  `seo.ts`'s `slugify` strips accents and falls back to `""`. A name like "Café Kaliurang"
  gives `caf-kaliurang` in the sitemap but `cafe-kaliurang` as the canonical path. Share one
  `slugify`, and give it a non-empty fallback so `propertyPath` never ends in `/`.
  Add a test using an accented name.
- [ ] **Sitemap is EN-only for properties and info pages** (Low, decide). `/id` has
  destination pages but no localized property or info URLs; matches `docs/sitemap.md`'s
  "canonicalize to English" rule, so only confirm hreflang points property pages at the EN
  URL.
- [ ] **Screen meta effect ignores language changes** (Low). The effect at `App.tsx` ~343
  depends on `[screen]` only, so toggling EN/ID on the same screen leaves the old title and
  description. Add `language` to the deps.
- [ ] **Placeholder slug in navigation** (Low). Search and home cards call
  `propertyPath(id, "stay")` on click (`App.tsx` ~426, ~456) and rely on the property
  effect's `replaceState` to correct it, adding a wrong history entry until data loads. Pass
  the real name (as `PropertyCard`'s `href` already does).

## Slug work re-verified (2026-09-30)

- `propertyPath` = `/stays/property/<encoded id>/<slug>`; route regexes in `App.tsx`
  ~116-119 correctly separate property, `/rooms`, `/checkout` and
  `/booking-confirmation/<code>`.
- Property page corrects a wrong/missing slug with `replaceState` — works, see the
  placeholder-slug item.
- `PropertyCard` renders a real `<a href>` with modifier-key handling; destination pages
  link with `propertyPath(property._id, property.name)`.
- Confirmation is noindex (`/booking-confirmation` in `privatePrefixes` + robots `Disallow`).
- Sitemap excludes demo and non-published properties (`isSeoEligibleProperty`).

## Related guest-copy findings (not SEO)

- `BookingIssue` says "Your card was not charged" and shows a fixed reference; Menetap
  takes no cards. Replace with the real booking reference and pay-at-hotel/bank-transfer
  wording.
- `DuringStay` is hardcoded ("Kaliurang Heritage Villa", dates, `MTP-7X9K2Q`, a phone
  number). Wire to a real booking or show an empty state.
- `AccountFrame` nav links "Payment methods" and "Settings" to `#`.
- `MyTrips` buttons ("Leave review", "Download invoice", "Cancel", "View details") do nothing;
  remove or wire them.

## Review notes

_Append Codex follow-up and Claude re-review here._
