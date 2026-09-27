import { describe, expect, it } from 'vitest';
import { buildSitemapUrls, isSeoEligibleProperty, renderSitemapXml, STATIC_ROUTES } from './sitemap-lib.mjs';

const published = { _id: 'p1', status: 'published', isDemo: false };
const demoPublished = { _id: 'p2', status: 'published', isDemo: true };
const draft = { _id: 'p3', status: 'draft', isDemo: false };

describe('isSeoEligibleProperty', () => {
  it('accepts published, non-demo properties', () => {
    expect(isSeoEligibleProperty(published)).toBe(true);
  });
  it('rejects demo properties even when published', () => {
    expect(isSeoEligibleProperty(demoPublished)).toBe(false);
  });
  it('rejects non-published properties', () => {
    expect(isSeoEligibleProperty(draft)).toBe(false);
  });
});

describe('buildSitemapUrls', () => {
  it('includes only the real property, not the demo one', () => {
    const urls = buildSitemapUrls([published, demoPublished, draft]);
    const locs = urls.map((url) => url.loc);
    expect(locs).toContain('https://menetap.com/en/stays/property/p1/stay');
    expect(locs).not.toContain('https://menetap.com/en/stays/property/p2');
    expect(locs).not.toContain('https://menetap.com/en/stays/property/p3');
  });

  it('never includes the noindex search route', () => {
    const urls = buildSitemapUrls([]);
    expect(urls.some((url) => url.loc.endsWith('/stays'))).toBe(false);
  });

  it('includes every static route that is not marked noindex', () => {
    const urls = buildSitemapUrls([]);
    const expected = STATIC_ROUTES.filter((route) => !route.noindex).length;
    const staticUrlCount = urls.filter((url) => !url.loc.includes('/destinations/') || url.loc.endsWith('/destinations/all')).length;
    expect(staticUrlCount).toBe(expected);
  });
});

describe('renderSitemapXml', () => {
  it('produces well-formed, parseable XML with one <url> per entry', () => {
    const xml = renderSitemapXml([{ loc: 'https://menetap.com/en' }]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<loc>https://menetap.com/en</loc>');
    expect(xml.match(/<url>/g)?.length).toBe(1);
  });
});
