import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

const categories = [
  {
    id: 'bluebird',
    name: 'Custom Painted',
    fullName: 'Custom Painted Lures',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 3.5-2 6.5-5 8l-1 3H9l-1-3C5 18.5 3 15.5 3 11a9 9 0 0 1 9-9z"/>
        <line x1="9" y1="11" x2="15" y2="11"/>
        <line x1="12" y1="8" x2="12" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'thomas',
    name: 'Live Bait',
    fullName: 'Live Bait Selection',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12c0-4 2-7 5-7s4 3 4 7-1 7-4 7-5-3-5-7z"/>
        <path d="M12 12c1-3 3-5 5-5 1.5 0 3 1 4 3"/>
        <path d="M17 10c1 1 2 2.5 2 4"/>
      </svg>
    ),
  },
  {
    id: 'international',
    name: 'Soft Plastics',
    fullName: 'Soft Plastic Baits',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12c2-6 6-8 10-8s7 3 8 8"/>
        <path d="M20 12c-1 5-4 8-8 8s-8-3-8-8"/>
        <path d="M8 12c1-2 2-3 4-3s3 1 4 3"/>
      </svg>
    ),
  },
  {
    id: 'collins',
    name: 'Hard Baits',
    fullName: 'Hard Bait Lures',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="10" cy="12" rx="7" ry="4"/>
        <path d="M17 12l4-4"/>
        <path d="M17 12l4 4"/>
        <circle cx="6" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'universal',
    name: 'Terminal Tackle',
    fullName: 'Hooks, Sinkers & More',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c0 0 0 4-4 6"/>
        <path d="M12 3c0 0 0 4 4 6"/>
        <path d="M12 9v8"/>
        <path d="M9 17c0 2 1.5 3 3 3s3-1 3-3"/>
      </svg>
    ),
  },
];

function Home() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const featuredSectionRef = useRef(null);
  const s = useSiteSettings();

  // Fetch featured products after the section is close to view so homepage images do not compete with above-the-fold loading
  useEffect(() => {
    let cancelled = false;
    let hasLoaded = false;

    async function fetchFeatured() {
      if (hasLoaded) return;
      hasLoaded = true;
      try {
        const response = await fetch('/api/products/featured?limit=8');
        if (response.ok) {
          const data = await response.json();
          if (!cancelled && data.products && data.products.length > 0) {
            setFeaturedProducts(data.products);
          }
        }
      } catch (err) {
        // Keep section empty if the API is unavailable
      }
    }

    if (!('IntersectionObserver' in window) || !featuredSectionRef.current) {
      const timer = window.setTimeout(fetchFeatured, 1500);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          fetchFeatured();
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(featuredSectionRef.current);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  // Split hero title on "think of us!" for the styled span
  const heroTitleParts = s.home_hero_title.split('think of us!');
  const hasThinkOfUs = heroTitleParts.length > 1;

  return (
    <>
      <SEO
        title={s.seo_home_title}
        description={s.seo_home_description}
        canonical="/"
      />
      {/* Hero Section */}
      <h1 className="visually-hidden">Custom Bus &amp; Truck Panels – School Bus Body Panels, Rust Repair Parts &amp; Custom Fabrication in Ohio</h1>
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <p className="hero-subtitle">{s.home_hero_subtitle}</p>
            <h1 className="hero-title">
              {hasThinkOfUs ? (
                <>{heroTitleParts[0]}<br /><span>think of us!</span></>
              ) : (
                s.home_hero_title
              )}
            </h1>
            <p className="hero-description">{s.home_hero_description}</p>
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="home-brands-section">
        <div className="container">
          <h2 className="section-title">What We Carry</h2>
          <div className="home-brands-grid">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`home-brand-card home-brand-${cat.id}`}
              >
                <div className="home-brand-icon">
                  {cat.icon}
                </div>
                <span className="home-brand-name">{cat.name}</span>
                {cat.fullName && (
                  <span className="home-brand-subtitle">{cat.fullName}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section" ref={featuredSectionRef}>
        <div className="container">
          <h2 className="section-title">Featured Lures & Bait</h2>
          <div className="featured-products-wrapper">
            <div className="featured-products-container">
              <div className="featured-products-grid">
                {featuredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="about-section">
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="section-title">{s.home_mission_title}</h2>
            <p style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--gray-700)', maxWidth: '800px', margin: '0 auto' }}>
              {s.home_mission_text}
            </p>
          </div>
        </div>
      </section>

      {/* Custom Fabrication Section */}
      <section className="features-section" style={{ background: 'var(--gray-100)' }}>
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 className="section-title">{s.home_fabrication_title}</h2>
            <div className="custom-fabrication-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--gray-700)' }}>
                  {s.home_fabrication_text}
                </p>
              </div>
              <div>
                <img
                  src="/images/front-page-image.webp"
                  alt="Custom painted fishing lures and specialty tackle"
                  loading="lazy"
                  style={{ width: '100%', height: 'auto', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Service Section */}
      <section className="about-section">
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="section-title">{s.home_customer_service_title}</h2>
            <p style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--gray-700)', maxWidth: '800px', margin: '0 auto 24px' }}>
              {s.home_customer_service_text}
            </p>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href={`tel:${s.contact_phone_sales}`} style={{ fontSize: '20px', fontWeight: '700', color: '#000000', textDecoration: 'none' }}>{s.contact_phone_sales}</a>
              <span style={{ color: '#000000' }}>|</span>
              <a href={`mailto:${s.contact_email}`} style={{ fontSize: '18px', color: '#000000', textDecoration: 'none' }}>{s.contact_email}</a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}

export default Home;
