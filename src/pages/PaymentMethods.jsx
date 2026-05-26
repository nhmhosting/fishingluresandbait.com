import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

function PaymentMethods() {
  const s = useSiteSettings();

  return (
    <>
      <SEO
        title="Payment Methods for Bus Parts Orders"
        description="Review accepted payment methods for Custom Bus and Truck Panels orders, including card and check options for bus parts purchases."
        canonical="/payment-methods"
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>Payment Methods</h1>
          <p>Accepted payment options</p>
        </div>
      </section>

      {/* Payment Methods Content */}
      <section className="about-section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title">Payment Methods</h2>
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
              ****We Proudly Accept****
            </p>
            <ul style={{ fontSize: '16px', lineHeight: '2', paddingLeft: '20px', marginBottom: '24px', listStyle: 'none', textAlign: 'center' }}>
              {s.payment_methods_list.split(',').map((m) => m.trim()).map((method, index) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
            <p style={{ fontSize: '16px', lineHeight: '1.8', marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              {s.payment_processing_fee_notice}
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

export default PaymentMethods;
