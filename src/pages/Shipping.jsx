import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

function Shipping() {
  const s = useSiteSettings();

  return (
    <>
      <SEO
        title={s.seo_shipping_title}
        description={s.seo_shipping_description}
        canonical="/shipping"
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>School Bus Parts Shipping</h1>
          <p>We ship direct to bus garages, school districts, and schoolie builders nationwide</p>
        </div>
      </section>

      {/* Shipping Content */}
      <section className="about-section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            <div className="shipping-info" style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Ground Shipments to Bus Garages & Schoolie Builders</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.shipping_ground_text}
              </p>
            </div>

            <div className="shipping-info" style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Freight/LTL for Large School Bus Panel Orders</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.shipping_freight_text}
              </p>
            </div>

            <div className="shipping-info" style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Shipping to Schools, Churches & Bus Garages</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                Many bus garages and school districts have limited access locations. We have negotiated reduced limited access fees with our carriers to keep shipping costs down for your bus garage. Whether you are a fleet mechanic, school district maintenance shop, church bus ministry, or schoolie builder working from home, we can get your school bus parts to you quickly and affordably.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Order?</h2>
          <p>Browse our catalog and request a quote today</p>
          <div className="cta-buttons">
            <Link to="/shop" className="btn btn-primary">Shop Parts</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Shipping;
