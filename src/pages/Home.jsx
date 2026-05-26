import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

const makes = [
  { id: 'bluebird', name: 'Blue Bird', fullName: 'Blue Bird Corporation' },
  { id: 'thomas', name: 'Thomas', fullName: 'Thomas Built Buses' },
  { id: 'international', name: 'International', fullName: 'International / AmTran' },
  { id: 'collins', name: 'Collins', fullName: 'Collins Bus' },
  { id: 'universal', name: 'Universal', fullName: 'Universal / Multi-fit' },
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

      {/* Brands Section */}
      <section className="home-brands-section">
        <div className="container">
          <h2 className="section-title">Brands We Carry</h2>
          <div className="home-brands-grid">
            {makes.map(brand => (
              <div
                key={brand.id}
                className={`home-brand-card home-brand-${brand.id}`}
              >
                <div className="home-brand-icon">
                  <img src="/images/logo.webp" alt="Custom Bus & Truck Panels" />
                </div>
                <span className="home-brand-name">{brand.name}</span>
                {brand.fullName && (
                  <span className="home-brand-subtitle">{brand.fullName}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section" ref={featuredSectionRef}>
        <div className="container">
          <h2 className="section-title">Featured School Bus Parts</h2>
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
                  alt="Custom school bus panel fabrication using fiber laser and plasma cutting"
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
