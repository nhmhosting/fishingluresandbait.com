import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';

const howToSteps = [
  {
    name: 'Find Your Part',
    description: 'Search by bus brand, part category, or part number. Use the shop filters to narrow down by bus make, model, and part type. Can\'t find it? Try the search bar or call us — we have 592+ parts and growing.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
  },
  {
    name: 'Request a Quote',
    description: 'Add items to your cart and proceed to checkout, or use the quote form to describe your needs. For custom fabrication — send us photos, measurements, or a sketch and we\'ll quote the job.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
  },
  {
    name: 'We Confirm & Build',
    description: 'We review your order and confirm pricing, availability, and lead time. For custom fabrication, we\'ll send a drawing for your approval before we cut. Once confirmed, we get to work — usually within 1–3 business days.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    ),
  },
  {
    name: 'Fast Shipping Direct to You',
    description: 'We ship via FedEx Ground, UPS, or LTL freight depending on order size. School bus garages and school districts can request limited-access delivery. Custom crates keep your panels protected in transit.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    ),
  },
];

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Order School Bus Replacement Parts',
  description: 'Step-by-step guide to ordering school bus body panels and replacement parts from Custom Bus and Truck Panels.',
  url: 'https://custombusandtruckpanels.com/how-to-order',
  step: howToSteps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    itemListElement: {
      '@type': 'HowToDirection',
      text: step.description,
    },
  })),
  totalTime: 'PT5M',
};

function HowToOrder() {
  const s = useSiteSettings();

  return (
    <>
      <SEO
        title={s.seo_how_to_order_title}
        description={s.seo_how_to_order_description}
        canonical="/how-to-order"
      />
      {/* JSON-LD for HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>How to Order School Bus Parts</h1>
          <p>Four simple steps from part search to delivery — quote requests welcome</p>
        </div>
      </section>

      {/* Steps */}
      <section className="about-section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {howToSteps.map((step, index) => (
                <div key={index} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  <div style={{
                    flexShrink: 0,
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#1e3a5f',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: '700',
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ paddingTop: '10px' }}>
                    <h2 style={{ fontSize: '22px', marginBottom: '12px', color: '#1e3a5f' }}>{step.name}</h2>
                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', margin: 0 }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section style={{ background: '#f8fafc', padding: '60px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '28px', color: '#1e3a5f' }}>
            Common Questions
          </h2>
          <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              {
                q: 'Do I need an account to order?',
                a: 'No. Guest checkout is available. Create an account to access tiered pricing and order history, but it\'s not required to place an order.',
              },
              {
                q: 'How do I get a custom fabrication quote?',
                a: 'Use the quote form or email us photos and measurements of the part you need. We\'ll send a computer-generated drawing for your approval before we cut anything.',
              },
              {
                q: 'What if I don\'t know the exact part number?',
                a: 'Call us at 888-402-1661. Describe the bus (make, model, year) and the part you need — we\'ll help you identify the right part.',
              },
              {
                q: 'How long does custom fabrication take?',
                a: 'Most custom parts ship within 5–10 business days after drawing approval. Standard in-stock items ship in 1–3 business days.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '17px', marginBottom: '10px', color: '#1e3a5f' }}>{faq.q}</h3>
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#475569', margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Find Your Parts?</h2>
          <p>Browse 592+ school bus replacement parts or contact us for custom fabrication</p>
          <div className="cta-buttons">
            <Link to="/shop" className="btn btn-primary">Shop Parts</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default HowToOrder;
