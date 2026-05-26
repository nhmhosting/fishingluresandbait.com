import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

function Returns() {
  const s = useSiteSettings();

  return (
    <>
      <SEO
        title="Return Policy for Bus Parts Orders"
        description="Read the Custom Bus and Truck Panels return policy for school bus parts, special build parts, refunds, and order questions."
        canonical="/returns"
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>Return Policy</h1>
          <p>Our returns and refunds policy</p>
        </div>
      </section>

      {/* Returns Content */}
      <section className="about-section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title">Return Policy</h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
              {s.returns_policy_text}
            </p>

            <h3 style={{ marginBottom: '12px' }}>Special Build Parts</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
              {s.returns_special_build_text}
            </p>

            <p style={{ fontSize: '16px', lineHeight: '1.8' }}>
              {s.returns_closing_text}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Have More Questions?</h2>
          <p>Our team is here to help</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Returns;
