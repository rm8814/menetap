// Generates public/sitemap.xml from live, published, non-demo properties plus the
// static marketing/destination routes. Run before a production build so the
// deployed dist/ picks up the regenerated file (Vite copies public/ as-is).
//
// Requires VITE_CONVEX_URL (or CONVEX_URL) pointed at the deployment to read from.
// Intentionally not wired into `npm run build` — that command must stay usable
// offline for local typecheck/test/build verification without Convex network access.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { buildSitemapUrls, renderSitemapXml } from "./sitemap-lib.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Plain node (not Vite) doesn't load .env.local automatically; read it directly
// so `npm run sitemap` works the same way locally as it will in CI/deploy.
function loadEnvLocal() {
  const envPath = resolve(rootDir, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2];
  }
}
loadEnvLocal();

const convexUrl = process.env.VITE_CONVEX_URL ?? process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("generate-sitemap: set VITE_CONVEX_URL (or CONVEX_URL) to the deployment to read from.");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);
const properties = await client.query(api.properties.listPublished, {});
const urls = buildSitemapUrls(properties);
const xml = renderSitemapXml(urls);

const outPath = resolve(rootDir, "public/sitemap.xml");
writeFileSync(outPath, xml);
console.log(`generate-sitemap: wrote ${urls.length} URLs to ${outPath}`);
