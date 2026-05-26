import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

function Terms() {
  const s = useSiteSettings();

  return (
    <>
      <SEO
        title="Terms and Conditions"
        description="Read the terms and conditions for using Custom Bus and Truck Panels, placing bus parts orders, pricing, shipping, returns, and warranties."
        canonical="/terms"
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>Terms & Conditions</h1>
          <p>Please read these terms carefully before using our services</p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="about-section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Acceptance of Terms</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.terms_acceptance}
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Products and Pricing</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.terms_products_pricing}
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Orders and Payment</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.terms_orders_payment}
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Shipping and Delivery</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.terms_shipping_delivery}
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Returns and Refunds</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.terms_returns_refunds}
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Limitation of Liability</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.terms_liability}
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Product Use and Warranty</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.terms_product_warranty}
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Changes to Terms</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {s.terms_changes}
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Contact Information</h2>
              <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <ul style={{ fontSize: '16px', lineHeight: '1.8', paddingLeft: '20px', marginTop: '16px' }}>
                <li><strong>Phone:</strong> <a href={`tel:${s.contact_phone_sales}`}>{s.contact_phone_sales}</a></li>
                <li><strong>Email:</strong> <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a></li>
                <li><strong>Address:</strong> {s.contact_address}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Shop?</h2>
          <p>Browse our catalog of quality bus parts</p>
          <div className="cta-buttons">
            <Link to="/shop" className="btn btn-primary">Shop Parts</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Terms;
