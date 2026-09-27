import { useEffect } from 'react';
import type { ComponentType } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { applySeo, propertyPath } from './seo';
import { isProductionEnv } from './seoEnv';

type CityDestination = {
  city: string;
  headline: string;
  intro: string;
  areas: Array<[string, string]>;
  faqs: Array<[string, string]>;
};

const cities: Record<string, CityDestination> = {
  jakarta: { city: 'Jakarta', headline: 'City energy, neighborhood character, and stays close to what matters.', intro: 'Explore Jakarta through distinct urban neighborhoods, from heritage streets and creative districts to business hubs and coastal escapes.', areas: [['Menteng', 'Tree-lined streets, galleries, and a central base with a quieter rhythm.'], ['Kota Tua', 'Historic architecture, museums, and Jakarta’s old trading quarter.'], ['Sudirman', 'Business towers, dining, and practical access across the city.'], ['Kemang', 'Creative spaces, restaurants, and an easy evening scene.']], faqs: [['Which Jakarta area is best for a first visit?', 'Menteng is a comfortable central base, while Kota Tua suits guests who want history and museums close by.'], ['Is this page for Jakarta city?', 'Yes. This guide focuses on neighborhoods within Jakarta city rather than the wider Greater Jakarta region.']] },
  malang: { city: 'Malang', headline: 'Cooler days, creative cafés, and a gentle city pace.', intro: 'Malang is a relaxed base for highland escapes, heritage streets, and easy local food adventures.', areas: [['Klojen', 'Walkable cafés, heritage streets, and Malang’s lively city center.'], ['Batu', 'Mountain air, family attractions, and green weekend escapes.'], ['Ijen Boulevard', 'Tree-lined avenues, colonial character, and a quieter central stay.']], faqs: [['Which area is best for a first Malang visit?', 'Klojen keeps you close to cafés, heritage streets, and the city’s everyday rhythm.'], ['Is Batu part of Malang?', 'Batu is a separate city in the Malang area, known for cooler air and highland attractions.']] },
  surabaya: { city: 'Surabaya', headline: 'Big-city energy, heritage quarters, and food worth travelling for.', intro: 'Surabaya pairs a practical urban base with historic streets, waterfront walks, and a deep local food culture.', areas: [['Tunjungan', 'The city’s classic boulevard, shopping, dining, and evening energy.'], ['Darmo', 'Shady avenues, museums, and a more residential central-Surabaya feel.'], ['Kenjeran', 'Coastal air, open views, and a different side of the city.']], faqs: [['Where should I stay in Surabaya for a first trip?', 'Tunjungan is a convenient first base for central attractions, restaurants, and transport connections.'], ['What is Surabaya known for?', 'Surabaya is known for its historic neighborhoods, bold local food, and role as East Java’s major urban gateway.']] },
  denpasar: { city: 'Denpasar', headline: 'Local Bali, market mornings, and a gateway to the island.', intro: 'Choose Denpasar for everyday Balinese life, traditional markets, cultural landmarks, and practical access across southern Bali.', areas: [['Sanur', 'Calmer beach mornings, local dining, and an easygoing coastal rhythm.'], ['Renon', 'Open civic spaces, museums, and a convenient central base.'], ['Kesiman', 'Temple culture, traditional neighborhoods, and a more local atmosphere.']], faqs: [['Is Denpasar a good base for Bali?', 'Denpasar works well for guests who want local city life and practical access to Sanur, the airport, and southern Bali.'], ['Which Denpasar area feels most relaxed?', 'Sanur offers the most relaxed coastal rhythm, while Kesiman feels more residential and locally rooted.']] },
  semarang: { city: 'Semarang', headline: 'Old-town character, hillside views, and a generous food scene.', intro: 'Semarang brings together Dutch-era architecture, coastal city life, hillside neighborhoods, and a distinct Central Java food culture.', areas: [['Kota Lama', 'Restored heritage buildings, galleries, and atmospheric evening walks.'], ['Simpang Lima', 'Central shopping, dining, and easy city connections.'], ['Gajahmungkur', 'Hillside air, city views, and a quieter residential base.']], faqs: [['What is Semarang best known for?', 'Semarang is known for Kota Lama, coastal trading history, Central Javanese food, and its distinctive mix of old and new neighborhoods.'], ['Where is best for a weekend in Semarang?', 'Kota Lama is ideal for heritage walks, while Simpang Lima is practical for dining and central access.']] },
};

export function CityDestinationLanding({
  slug,
  language,
  setLanguage,
  Footer,
}: {
  slug: string;
  language: 'EN' | 'ID';
  setLanguage: (language: 'EN' | 'ID') => void;
  Footer: ComponentType<{ language: 'EN' | 'ID'; setLanguage: (language: 'EN' | 'ID') => void }>;
}) {
  const data = cities[slug];
  const properties = useQuery(api.properties.listPublished, data ? { area: data.city } : 'skip');
  const visibleProperties = properties?.filter((property) => !isProductionEnv() || !property.isDemo) ?? [];

  useEffect(() => {
    if (!data) return;
    const title = `Stays in ${data.city} | Menetap`;
    const description = data.intro.slice(0, 160);
    document.title = title;
    applySeo({ title, description, language });
    const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attrName, attrValue); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
  }, [data, language]);

  if (!data) return null;
  const prefix = `/${language.toLowerCase()}`;

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://menetap.com/en' },
      { '@type': 'ListItem', position: 2, name: 'All destinations', item: 'https://menetap.com/en/destinations/all' },
      { '@type': 'ListItem', position: 3, name: data.city },
    ],
  };
  // Demo/seed inventory is usable in QA but must never be advertised to search
  // engines as real accommodation inventory.
  const seoProperties = properties?.filter((property) => !property.isDemo) ?? [];
  const itemListData = isProductionEnv() && seoProperties.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: seoProperties.map((property, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: property.name,
          url: `https://menetap.com/en/stays/property/${property._id}`,
        })),
      }
    : null;

  return (
    <>
      <main className="destination-landing page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
        {itemListData && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }} />
        )}
        <p className="eyebrow">Explore {data.city}</p>
        <h1>{data.headline}</h1>
        <p className="destination-intro">{data.intro}</p>
        <div className="destination-actions">
          <a href={`${prefix}/stays?destination=${encodeURIComponent(data.city)}`}>Explore {data.city} stays</a>
          <a href={`${prefix}/destinations/all`}>All destinations</a>
        </div>
        <section className="destination-area-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stay by area</p>
              <h2>Find your {data.city} base</h2>
            </div>
          </div>
          <div className="destination-area-grid">
            {data.areas.map(([name, description]) => (
              <a className="destination-area-card" href={`${prefix}/stays?destination=${encodeURIComponent(name)}`} key={name}>
                <strong>{name}</strong>
                <p>{description}</p>
                <span>Browse {name} stays →</span>
              </a>
            ))}
          </div>
        </section>
        <section className="destination-properties">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Places to start</p>
              <h2>Properties to compare</h2>
            </div>
            <a href={`${prefix}/stays?destination=${encodeURIComponent(data.city)}`}>See all {data.city} stays →</a>
          </div>
          {properties === undefined ? (
            <p className="muted">Finding stays in {data.city}…</p>
          ) : visibleProperties.length ? (
            <div className="destination-property-grid">
              {visibleProperties.slice(0, 3).map((property) => (
                <article key={property._id}>
                  <div className="property-image">{property.type}</div>
                  <div>
                    <h3>{property.name}</h3>
                    <p>{property.area}</p>
                    <a href={`${prefix}${propertyPath(property._id, property.name)}`}>View availability →</a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">Properties in {data.city} are being added — check back soon.</p>
          )}
        </section>
        <section className="destination-faq">
          <p className="eyebrow">{data.city} travel questions</p>
          <h2>Plan the practical details</h2>
          {data.faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
          <details>
            <summary>Can I compare {data.city} stays by dates?</summary>
            <p>Yes. Set your dates and guest count in the stays search to compare live availability and prices.</p>
          </details>
        </section>
        <nav className="destination-internal-links" aria-label={`${data.city} travel links`}>
          <a href={`${prefix}/destinations/all`}>All destinations</a>
          <a href={`${prefix}/stays?destination=${encodeURIComponent(data.city)}`}>All {data.city} stays</a>
          {data.areas.map(([name]) => (
            <a href={`${prefix}/stays?destination=${encodeURIComponent(name)}`} key={name}>{name} stays</a>
          ))}
        </nav>
        <nav className="destination-related-links" aria-label="Related Menetap links">
          <a href={`${prefix}/experiences`}>Experiences</a>
          <a href={`${prefix}/rentals`}>Rentals</a>
          <a href={`${prefix}/destinations/all`}>Nearby destinations</a>
        </nav>
      </main>
      <Footer language={language} setLanguage={setLanguage} />
    </>
  );
}
