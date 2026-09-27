import { useState } from "react";
import { CalendarCheck, Compass, Footprints, Map, Mountain, Palette, Search, Star, Utensils, Waves } from "lucide-react";

const experienceIcons = { map: Map, utensils: Utensils, mountain: Mountain, palette: Palette, waves: Waves };

export function ExperiencesV2() {
  const [open, setOpen] = useState<number | null>(null);
  const cards = [
    ["ubud-batur", "Ubud", "Sunrise trek up Mount Batur with local guide", "mountain", "4.9", "Rp 350K"],
    ["yogyakarta-batik", "Yogyakarta", "Batik-making workshop with a master artisan", "palette", "4.8", "Rp 220K"],
    ["bali-cooking", "Bali", "Balinese cooking class & market tour", "utensils", "4.9", "Rp 280K"],
    ["komodo-snorkeling", "Labuan Bajo", "Komodo Island snorkeling day trip", "waves", "4.7", "Rp 650K"],
  ];
  const faqs = [
    ["Can I cancel a booked experience?", "Yes — most experiences offer free cancellation up to 24 hours before the start time."],
    ["Are the hosts verified?", "Every host is reviewed and verified by Menetap before their experience is listed."],
    ["Do I need to book in advance?", "Popular experiences fill up fast, especially on weekends."],
    ["Can I combine an experience with my stay booking?", "Yes, you can add experiences to an existing stay booking or book them separately."],
  ];
  return <main className="experiences-v2"><header className="experiences-v2-header"><div className="experiences-v2-header-inner"><a className="experiences-v2-brand" href="/en">menetap<span>.</span></a><nav><a href="/en/stays">Stays</a><a href="/en/rentals">Rentals</a><a className="active" href="/en/experiences">Experiences</a><a href="/en/rewards">Rewards</a></nav><div><a href="/en/login">Log in</a><a className="experiences-v2-signup" href="/en/signup">Join free</a></div></div></header><div className="experiences-v2-wrap">
    <section className="experiences-v2-hero"><div className="experiences-v2-badge"><Compass size={14}/>500+ local experiences across Indonesia</div><h1>Things to do, led by people who actually live there.</h1><p>Book tours, workshops, and activities hosted by local guides — from volcano sunrise treks to Balinese cooking classes. Free cancellation up to 24 hours before.</p><div><a className="primary-button" href="/en/experiences">Browse experiences</a><a className="outline-button" href="/en/partners">Host an experience</a></div></section>
    <section className="experiences-v2-section"><h2>Browse by category</h2><div className="experiences-v2-categories">{[["Tours & sightseeing","map"],["Food & drink","utensils"],["Outdoor & adventure","mountain"],["Culture & workshops","palette"],["Water activities","waves"]].map(([name, icon])=>{const Icon=experienceIcons[icon as keyof typeof experienceIcons];return <a href={`/en/experiences?category=${encodeURIComponent(name)}`} key={name}><div className="experiences-v2-icon"><Icon size={20}/></div><b>{name}</b></a>})}</div></section>
    <section className="experiences-v2-section"><div className="section-heading"><h2>Popular right now</h2><a href="/en/experiences">See all experiences →</a></div><div className="experiences-v2-grid">{cards.map(([id, city, title, icon, rating, price])=>{const Icon=experienceIcons[icon as keyof typeof experienceIcons];return <a href={`/en/experiences/detail?id=${id}`} key={title}><div className="experiences-v2-image"><Icon size={28}/></div><div><small>{city}</small><h3>{title}</h3><span><Star size={12}/> {rating}</span><b>{price}</b></div></a>})}</div></section>
    <section className="experiences-v2-section"><h2>How it works</h2><div className="experiences-v2-how">{[["1. Find your experience", "Filter by city, category, or date.", Search], ["2. Book your spot", "Reserve online with free cancellation up to 24 hours before.", CalendarCheck], ["3. Show up and go", "Meet your host at the listed point.", Footprints]].map(([title, body, Icon])=><article key={title as string}><Icon size={18}/><b>{title as string}</b><p className="muted">{body as string}</p></article>)}</div></section>
    <section className="experiences-v2-section"><h2>Frequently asked</h2>{faqs.map(([question, answer], index) => <article className="experiences-v2-faq" key={question}><button type="button" onClick={() => setOpen(open === index ? null : index)}><span>{question}</span><span>{open === index ? "−" : "+"}</span></button>{open === index && <p className="muted">{answer}</p>}</article>)}</section>
    <section className="experiences-v2-cta"><div><h2>Ready to explore something new?</h2><p className="muted">Book a local experience in minutes — pair it with your next stay.</p></div><a className="primary-button" href="/en/experiences">Browse experiences</a></section>
    <footer className="experiences-v2-footer"><span>© 2026 Menetap. All rights reserved.</span><span>Managed by <a href="https://upscale.asia" target="_blank" rel="noreferrer">UPSCALE</a></span></footer>
  </div></main>;
}
