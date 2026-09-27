// Gates SEO-sensitive behavior (indexing, structured data, sitemap inclusion) so demo/seed
// content never reaches production search results while staying fully usable in local and
// staging environments. Defaults to "not production" when unset, so a missing env var fails
// closed (safe) rather than accidentally indexing demo listings.
export const isProductionEnv = (): boolean => import.meta.env.VITE_APP_ENV === "production";
