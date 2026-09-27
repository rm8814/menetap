// Pure sitemap-building helpers shared by generate-sitemap.mjs and its test.
// No I/O here so the logic (what gets included/excluded) can be unit-tested
// without a network call or a running Convex deployment.

export const STATIC_ROUTES = [
  { path: "/en", changefreq: "daily" },
  { path: "/id", changefreq: "daily" },
  { path: "/en/stays", changefreq: "daily", noindex: true },
  { path: "/id/stays", changefreq: "daily", noindex: true },
  { path: "/en/destinations/all", changefreq: "weekly" },
  { path: "/id/destinations/all", changefreq: "weekly" },
  { path: "/en/help", changefreq: "monthly" },
];

export const DESTINATION_SLUGS = [
  "yogyakarta",
  "bantul",
  "sleman",
  "bandung",
  "solo",
  "malang",
  "surabaya",
  "denpasar",
  "semarang",
  "jakarta",
];

// Real, published properties only — never a demo/seed listing, and never a
// property still in draft/verification/suspended status.
export function isSeoEligibleProperty(property) {
  return property.status === "published" && !property.isDemo;
}

export function buildSitemapUrls(properties) {
  const urls = STATIC_ROUTES.filter((route) => !route.noindex).map((route) => ({
    loc: `https://menetap.com${route.path}`,
    changefreq: route.changefreq,
  }));
  for (const lang of ["en", "id"]) {
    for (const slug of DESTINATION_SLUGS) {
      urls.push({ loc: `https://menetap.com/${lang}/destinations/${slug}`, changefreq: "weekly" });
    }
  }
  for (const property of properties.filter(isSeoEligibleProperty)) {
    urls.push({ loc: `https://menetap.com/en/stays/property/${property._id}`, changefreq: "daily" });
  }
  return urls;
}

export function renderSitemapXml(urls) {
  const entries = urls
    .map((url) => `  <url><loc>${url.loc}</loc>${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ""}</url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
