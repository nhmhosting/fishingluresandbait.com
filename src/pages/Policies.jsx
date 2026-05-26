import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

function Policies() {
  const location = useLocation();
  const s = useSiteSettings();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  // Parse payment methods from comma-separated string
  const paymentMethods = (s.payment_methods_list || '').split(',').map(m => m.trim()).filter(Boolean);

  return (
    <>
      <SEO
        title="Payment and Return Policies"
        description="View payment methods, processing fee notes, return policy details, and special build part terms for Custom Bus and Truck Panels orders."
        canonical="/policies"
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>Policies</h1>
          <p>Payment methods and returns</p>
        </div>
      </section>

      {/* Policies Content */}
      <section className="about-section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* Payment Methods */}
            <div id="payment" style={{ marginBottom: '60px' }}>
              <h2 className="section-title">Payment Methods</h2>
              <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                ****We Proudly Accept****
              </p>
              <ul style={{ fontSize: '16px', lineHeight: '2', paddingLeft: '20px', marginBottom: '24px', listStyle: 'none', textAlign: 'center' }}>
                {paymentMethods.map((method, i) => (
                  <li key={i}>{method}</li>
                ))}
              </ul>
              <p style={{ fontSize: '16px', lineHeight: '1.8', marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                {s.payment_processing_fee_notice}
              </p>
            </div>

            {/* Returns */}
            <div id="returns" style={{ marginBottom: '60px' }}>
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

export default Policies;
