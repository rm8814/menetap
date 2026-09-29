import { isProductionEnv } from './seoEnv';

export const SITE_URL = 'https://menetap.com';

export function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export function propertyPath(id: string, name: string) {
  return `/stays/property/${encodeURIComponent(id)}/${slugify(name)}`;
}

const privatePrefixes = [
  '/admin', '/partner-', '/partner/', '/checkout', '/guest-details', '/booking-',
  '/booking-confirmation', '/during-stay', '/my-trips', '/saved-stays', '/payment-methods',
  '/settings', '/rewards/dashboard', '/supply/checkout', '/supply/confirmation', '/supply/catalog',
];

export function normalizePath(pathname: string) {
  const path = pathname.replace(/\/+/g, '/');
  if (path === '/') return '/en';
  const withoutTrailingSlash = path.replace(/\/$/, '');
  return /^\/(en|id)$/.test(withoutTrailingSlash) ? withoutTrailingSlash : withoutTrailingSlash || '/en';
}

export function isNoindexRoute(pathname: string, search = window.location.search) {
  const path = normalizePath(pathname);
  // privatePrefixes are language-agnostic (e.g. "/admin"), but real paths carry an
  // /en or /id prefix (e.g. "/en/admin/properties") — strip it before matching, or
  // every private route below would silently fail to noindex in production.
  const pathWithoutLang = path.replace(/^\/(en|id)(?=\/|$)/, '') || '/';
  return !isProductionEnv() || Boolean(search) || path === '/en/stays' || path === '/id/stays' ||
    privatePrefixes.some((prefix) => pathWithoutLang === prefix || pathWithoutLang.startsWith(`${prefix}/`));
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function applySeo({ title, description, language }: { title: string; description: string; language: 'EN' | 'ID' }) {
  const canonicalPath = normalizePath(window.location.pathname);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const noindex = isNoindexRoute(window.location.pathname);
  document.documentElement.lang = language === 'ID' ? 'id' : 'en';
  document.title = title;
  setMeta('description', description);
  setMeta('viewport', 'width=device-width, initial-scale=1.0');
  setMeta('robots', noindex ? 'noindex,follow' : 'index,follow');
  setMeta('og:type', 'website', true);
  setMeta('og:site_name', 'Menetap', true);
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('twitter:card', 'summary', false);
  setMeta('twitter:title', title, false);
  setMeta('twitter:description', description, false);
  setLink('canonical', canonicalUrl);
  setLink('alternate', `${SITE_URL}/en`);
  const alternates = document.head.querySelectorAll<HTMLLinkElement>('link[rel="alternate"]');
  alternates.forEach((link) => {
    if (link.hreflang === 'en') link.href = `${SITE_URL}/en`;
    if (link.hreflang === 'id') link.href = `${SITE_URL}/id`;
    if (link.hreflang === 'x-default') link.href = `${SITE_URL}/en`;
  });
  return { canonicalUrl, noindex };
}

export function setJsonLd(id: string, value: unknown) {
  let script = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(value);
}

export function applyGlobalStructuredData() {
  setJsonLd('organization-schema', { '@context': 'https://schema.org', '@type': 'Organization', name: 'Menetap', url: SITE_URL });
  setJsonLd('website-schema', { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Menetap', url: SITE_URL, potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/en/stays?destination={search_term_string}`, 'query-input': 'required name=search_term_string' } });
}
