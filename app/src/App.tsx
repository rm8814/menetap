export function App() {
  return (
    <main className="shell">
      <nav className="nav" aria-label="Main navigation">
        <a className="wordmark" href="/" aria-label="Menetap home">menetap<span>.</span></a>
        <div className="nav-links">
          <a href="#stays">Stays</a>
          <a href="#rentals">Rentals</a>
          <a href="#experiences">Experiences</a>
          <a href="#partners">List your property</a>
        </div>
        <a className="login" href="#login">Log in</a>
      </nav>

      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">Curated stays in Indonesia</p>
        <h1 id="hero-title">Find your stay.<br /><em>Stay better.</em></h1>
        <p className="hero-copy">Transparent prices, carefully selected properties, and everything you need around the stay.</p>
        <div className="search-card" role="search">
          <label>Where are you going?<input placeholder="Greater Yogyakarta" /></label>
          <label>Check in<input placeholder="Add dates" /></label>
          <label>Guests<input placeholder="2 guests" /></label>
          <button type="button">Search stays</button>
        </div>
      </section>

      <section className="status-card" aria-label="Application status">
        <span className="status-dot" />
        <span>Menetap application foundation initialized</span>
        <span className="status-note">Convex connection: next step</span>
      </section>
    </main>
  );
}
