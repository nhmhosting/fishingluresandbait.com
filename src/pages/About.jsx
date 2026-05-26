import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

function About() {
  const s = useSiteSettings();

  return (
    <>
      <SEO
        title={s.seo_about_title}
        description={s.seo_about_description}
        canonical="/about-us"
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>About Us - Fishing Lures & Bait Shop</h1>
          <p>{s.about_header_subtitle}</p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-intro">
            <h2 className="section-title">What We Do - Fishing Tackle & Bait Supply</h2>
            <div className="about-intro-content">
              <p className="lead-text">
                {s.about_what_we_do}
              </p>
              <div className="made-in-usa">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
                <span>{s.about_made_in_usa}</span>
              </div>
            </div>
          </div>

          <div className="rust-callout">
            <div className="rust-callout-content">
              <h3>{s.about_slogan}</h3>
              <p>Cast & Catch Outdoors LLC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Cards Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </div>
              <h3>Our Mission</h3>
              <p>{s.about_mission_text}</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <h3>Custom Fabrication</h3>
              <p>{s.about_fabrication_text}</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3>Customer Service</h3>
              <p>{s.about_customer_service_text}</p>
              <div className="mission-contact">
                <a href={`tel:${s.contact_phone_sales}`}><strong>{s.contact_phone_sales}</strong></a>
                <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="capabilities-section">
        <div className="container">
          <h2 className="section-title">Our Capabilities</h2>
          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="capability-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v10M1 12h6m6 0h10"></path>
                </svg>
              </div>
              <h3>Custom Painted Lures</h3>
              <p>{s.about_fiber_laser_text}</p>
            </div>
            <div className="capability-card">
              <div className="capability-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3>Premium Bait Selection</h3>
              <p>{s.about_plasma_text}</p>
            </div>
            <div className="capability-card">
              <div className="capability-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <h3>Custom Orders</h3>
              <p>{s.about_custom_fab_text}</p>
            </div>
            <div className="capability-card">
              <div className="capability-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <h3>Expert Knowledge</h3>
              <p>{s.about_expert_text}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{s.about_years_experience}</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-item">
              <Link to="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="stat-number">{s.about_products_count}</span>
                <span className="stat-label">Products Available</span>
              </Link>
            </div>
            <div className="stat-item">
              <span className="stat-number">{s.about_brands_count}</span>
              <span className="stat-label">Major Brands Covered</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Made in America</span>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="brands-section">
        <div className="container">
          <h2 className="section-title">Categories We Specialize In</h2>
          <div className="brands-grid">
            {[
              { nameKey: 'brand_bluebird_name', fullKey: 'brand_bluebird_full', catKey: 'brand_bluebird_categories' },
              { nameKey: 'brand_thomas_name', fullKey: 'brand_thomas_full', catKey: 'brand_thomas_categories' },
              { nameKey: 'brand_international_name', fullKey: 'brand_international_full', catKey: 'brand_international_categories' },
              { nameKey: 'brand_collins_name', fullKey: 'brand_collins_full', catKey: 'brand_collins_categories', noteKey: 'brand_collins_note' },
              { nameKey: 'brand_carpenter_name', catKey: 'brand_carpenter_categories' },
              { nameKey: 'brand_wayne_name', catKey: 'brand_wayne_categories' },
            ].map((brand, idx) => {
              const brandName = s[brand.nameKey] || '';
              const brandFull = brand.fullKey ? s[brand.fullKey] : '';
              const brandNote = brand.noteKey ? s[brand.noteKey] : '';
              const cats = (s[brand.catKey] || '').split(',').map(c => c.trim()).filter(Boolean);
              if (!brandName) return null;
              return (
                <div className="brand-card" key={idx}>
                  <h3><Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>{brandName}</Link></h3>
                  {brandFull && <p style={{ fontSize: '13px', color: '#666', marginTop: '-8px', marginBottom: '12px' }}>{brandFull}</p>}
                  {brandNote && <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', marginBottom: '12px' }}>{brandNote}</p>}
                  <ul>
                    {cats.map((cat, i) =>
                      cat === 'Custom Fabrication Available'
                        ? <li key={i}><Link to="/contact">{cat}</Link></li>
                        : <li key={i}>{cat}</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Catch More Fish?</h2>
          <p>Browse our catalog of 75+ fishing lures, live bait, and tackle or contact us for custom lure orders</p>
          <div className="cta-buttons">
            <Link to="/shop" className="btn btn-primary">Shop Lures & Bait</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
