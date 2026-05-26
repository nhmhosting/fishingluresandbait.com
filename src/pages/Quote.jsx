import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

const VEHICLE_TYPES = [
  'School Bus',
  'Transit Bus',
  'Coach Bus',
  'Truck',
  'Van',
  'Other',
];

function Quote() {
  const s = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    vehicle_type: '',
    vehicle_make_model: '',
    parts_needed: '',
    additional_notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          vehicle_type: '',
          vehicle_make_model: '',
          parts_needed: '',
          additional_notes: '',
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Request a Quote | Custom Bus & Truck Panels"
        description="Request a quote for school bus parts, custom panels, and truck components. Fill out our quick form and we'll get back to you with pricing."
        canonical="/quote"
      />

      <section className="page-header">
        <div className="container">
          <h1>Request a Quote</h1>
          <p>Tell us what you need and we'll get back to you with pricing as soon as possible</p>
        </div>
      </section>

      <section className="quote-section">
        <div className="container">
          <div className="quote-layout">
            {/* Form */}
            <div className="quote-form-wrapper">
              {submitStatus === 'success' ? (
                <div className="quote-success">
                  <div className="quote-success-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h2>Quote Request Sent!</h2>
                  <p>Thank you for reaching out. We'll review your request and get back to you shortly.</p>
                  <div className="quote-success-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => setSubmitStatus(null)}
                    >
                      Submit Another Request
                    </button>
                    <Link to="/shop" className="btn btn-secondary">Browse Parts</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="quote-form" noValidate>
                  <h2 className="quote-form-title">Quote Details</h2>

                  {submitStatus === 'error' && (
                    <div className="quote-error">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {errorMessage}
                    </div>
                  )}

                  {/* Contact Info */}
                  <fieldset className="quote-fieldset">
                    <legend>Your Information</legend>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Full Name <span aria-hidden="true">*</span></label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                          autoComplete="name"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email Address <span aria-hidden="true">*</span></label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(555) 555-5555"
                          autoComplete="tel"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="company">Company / Organization</label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Your company or school district"
                          autoComplete="organization"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Vehicle Info */}
                  <fieldset className="quote-fieldset">
                    <legend>Vehicle Information <span className="quote-fieldset-optional">(optional)</span></legend>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="vehicle_type">Vehicle Type</label>
                        <select
                          id="vehicle_type"
                          name="vehicle_type"
                          value={formData.vehicle_type}
                          onChange={handleChange}
                        >
                          <option value="">Select vehicle type…</option>
                          {VEHICLE_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="vehicle_make_model">Make &amp; Model / Year</label>
                        <input
                          type="text"
                          id="vehicle_make_model"
                          name="vehicle_make_model"
                          value={formData.vehicle_make_model}
                          onChange={handleChange}
                          placeholder="e.g. Blue Bird All American 2015"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Parts Info */}
                  <fieldset className="quote-fieldset">
                    <legend>Parts &amp; Products</legend>

                    <div className="form-group">
                      <label htmlFor="parts_needed">
                        What parts or products do you need? <span aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="parts_needed"
                        name="parts_needed"
                        value={formData.parts_needed}
                        onChange={handleChange}
                        placeholder="List the parts, SKUs, or descriptions of what you're looking for. Include quantities if known."
                        rows={5}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="additional_notes">Additional Notes</label>
                      <textarea
                        id="additional_notes"
                        name="additional_notes"
                        value={formData.additional_notes}
                        onChange={handleChange}
                        placeholder="Any other details, specifications, or questions…"
                        rows={3}
                      />
                    </div>
                  </fieldset>

                  <p className="quote-required-note"><span aria-hidden="true">*</span> Required fields</p>

                  <button
                    type="submit"
                    className="btn btn-primary quote-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="quote-spinner" aria-hidden="true"></span>
                        Sending…
                      </>
                    ) : (
                      'Submit Quote Request'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <aside className="quote-sidebar">
              <div className="quote-sidebar-card">
                <h3>Why Request a Quote?</h3>
                <ul className="quote-benefits">
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Volume &amp; wholesale pricing available
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Custom fabrication &amp; special orders
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Hard-to-find &amp; discontinued parts
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Fast turnaround for fleet orders
                  </li>
                </ul>
              </div>

              <div className="quote-sidebar-card">
                <h3>Prefer to Call?</h3>
                <p>Our parts specialists are ready to help.</p>
                <a href={`tel:${s.contact_phone_sales}`} className="quote-phone-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {s.contact_phone_sales}
                </a>
              </div>

              <div className="quote-sidebar-card">
                <h3>Response Time</h3>
                <p>We typically respond to quote requests within <strong>1–2 business days</strong>.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Browse?</h2>
          <p>Check out our full catalog of school bus and truck parts</p>
          <div className="cta-buttons">
            <Link to="/shop" className="btn btn-primary">Shop Parts</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Quote;
