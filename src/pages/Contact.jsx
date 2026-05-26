import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

function Contact() {
  const s = useSiteSettings();

  return (
    <>
      <SEO
        title={s.seo_contact_title}
        description={s.seo_contact_description}
        canonical="/contact"
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>Contact Custom Bus &amp; Truck Panels – School Bus Parts Quote &amp; Custom Fabrication Inquiry</h1>
          <p>Get in touch with our team for school bus parts, quotes, and custom fabrication</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="about-section">
        <div className="container">
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
            {/* Contact Info */}
            <div className="contact-info">
              <h2 className="section-title" style={{ textAlign: 'left' }}>Get In Touch</h2>
              <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '30px' }}>
                Have questions about school bus parts or need a custom panel for your bus garage or schoolie build? We're here to help!
                Contact us by phone or email.
              </p>

              <div className="contact-details">
                <div className="contact-item" style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Phone
                  </h3>
                  <p itemProp="telephone"><strong>Sales:</strong> <a href={`tel:${s.contact_phone_sales}`}>{s.contact_phone_sales}</a></p>
                  <p><strong>Shop:</strong> <a href={`tel:${s.contact_phone_shop}`}>{s.contact_phone_shop}</a></p>
                </div>

                <div className="contact-item" style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Email
                  </h3>
                  <p><a href={`mailto:${s.contact_email}`}>{s.contact_email}</a></p>
                </div>

                <div className="contact-item" style={{ marginBottom: '24px' }} itemProp="address" itemscope itemType="https://schema.org/PostalAddress">
                  <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Address
                  </h3>
                  <p itemProp="streetAddress">{s.contact_address}</p>
                  <p><span itemProp="addressLocality">Minerva</span>, <span itemProp="addressRegion">OH</span> <span itemProp="postalCode">44657</span></p>
                  <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                    <a href="https://www.google.com/maps/search/?api=1&query=302+S+Market+St+Minerva+OH+44657" target="_blank" rel="noopener noreferrer" style={{ color: '#1e40af' }}>View on Google Maps →</a>
                  </p>
                </div>

                <div className="contact-item" style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Business Hours
                  </h3>
                  <p>{s.contact_business_hours}</p>
                </div>

              </div>
            </div>

            {/* Send Us a Message */}
            <div className="contact-form-wrapper" id="contact-form">
              <h2 className="section-title" style={{ textAlign: 'left' }}>Request a Quote</h2>
              <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '30px' }}>
                Need pricing on parts or a custom fabrication job? Fill out our quick quote form and we'll get back to you as soon as possible.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
                <Link
                  to="/quote"
                  className="btn btn-primary"
                  style={{ fontSize: '18px', padding: '16px 40px' }}
                >
                  Request a Quote
                </Link>
                <a
                  href={`mailto:${s.contact_email}?subject=${encodeURIComponent('Website Inquiry')}`}
                  style={{
                    display: 'inline-block',
                    color: '#1e293b',
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'underline',
                  }}
                >
                  Or email us directly
                </a>
              </div>
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
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
