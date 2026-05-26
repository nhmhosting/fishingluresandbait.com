import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import QuoteForm from './QuoteForm';

const API_BASE = '/api';

function QuickViewModal({ product, onClose }) {
  const { addItem } = useCart();
  const s = useSiteSettings();
  const [activeImage, setActiveImage] = useState(0);
  const [livePricing, setLivePricing] = useState(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Refresh the current user's pricing for this part every time the modal opens.
  // Updates the product object in place so cached shop listings reflect the new price.
  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/pricing/${encodeURIComponent(product.id)}`, {
          credentials: 'include',
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setLivePricing(data);
        if (data && typeof data.price === 'number') {
          product.price = data.price;
          product.price_available = true;
        } else {
          product.price_available = false;
        }
      } catch (err) {
        console.warn('Could not refresh pricing:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [product?.id]);

  if (!product) return null;

  // Focus the close button when the modal opens
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, []);

  // Trap focus inside the modal and close on Escape key
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.closest('.quote-form'));

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  // Generate URL matching original site format: /product/{ID}
  const productUrl = `/product/${encodeURIComponent(product.id)}`;

  const brandDisplay = product.brand
    ? product.brand.charAt(0).toUpperCase() + product.brand.slice(1)
    : 'Universal';
  const categoryDisplay = product.category
    ? product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'General';

  const freshPrice = livePricing && typeof livePricing.price === 'number' ? livePricing.price : null;
  const displayPrice = freshPrice ?? (product.price_available ? product.price : (product.price > 0 ? product.price : null));
  const priceDisplay = displayPrice
    ? `$${parseFloat(displayPrice).toFixed(2)}`
    : <span className="price-inquiry">Price Available Upon Request</span>;

  const isInquiryOnly = product.name?.includes('*') || product.id?.includes('*');

  const handleAddToCart = () => {
    addItem(product.id, 1, product);
    onClose();
  };

  const images = (product.images && product.images.length > 0) ? product.images : [product.image].filter(Boolean);
  const currentImage = images[activeImage] || null;

  return (
    <div className="quick-view-modal active" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" ref={modalRef}>
      <div className="quick-view-overlay" onClick={onClose}></div>
      <div className="quick-view-content">
        <button ref={closeButtonRef} className="quick-view-close" onClick={onClose} aria-label="Close quick view">&times;</button>
        <div className="quick-view-grid">
          <div className="quick-view-image">
            {currentImage ? (
              <>
                <img src={currentImage} alt={product.name} />
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'center' }} role="list" aria-label="Product image thumbnails">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        style={{
                          width: '52px',
                          height: '52px',
                          padding: '3px',
                          border: activeImage === idx ? '2px solid var(--primary, #d97706)' : '2px solid var(--gray-300, #d1d5db)',
                          borderRadius: '6px',
                          background: 'var(--white, #fff)',
                          cursor: 'pointer',
                          opacity: activeImage === idx ? 1 : 0.7,
                          transition: 'all 0.15s ease',
                        }}
                        role="listitem"
                        aria-label={`View image ${idx + 1}${activeImage === idx ? ' (currently active)' : ''}`}
                        aria-current={activeImage === idx ? 'true' : undefined}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '3px' }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="placeholder-img">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1" aria-hidden="true">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
            )}
          </div>
          <div className="quick-view-details">
            {product.badge && <span className="product-detail-badge" aria-label={`Badge: ${product.badge}`}>{product.badge}</span>}
            <h2 id="quick-view-title">{product.name}</h2>
            <p className="quick-view-id">Part #: <strong>{product.id}</strong></p>
            <p className="quick-view-brand">Brand: <strong>{brandDisplay}</strong></p>
            <p className="quick-view-category">Category: <strong>{categoryDisplay}</strong></p>
            {product.material && (
              <p className="quick-view-material">Material: <strong>{product.material}</strong></p>
            )}
            {product.description && (
              <p
                className="quick-view-description"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
              />
            )}
            <div className="quick-view-price">{priceDisplay}</div>
            {!showQuoteForm && (
              <div className="quick-view-actions">
                {isInquiryOnly ? (
                  <>
                    <a href={`tel:${s.contact_phone_sales}`} className="btn btn-primary" onClick={onClose}>
                      Call for Quote
                    </a>
                    <button className="btn btn-secondary" onClick={() => setShowQuoteForm(true)}>
                      Request Quote
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary" onClick={handleAddToCart}>
                      Add to Cart
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowQuoteForm(true)}>
                      Request Quote
                    </button>
                  </>
                )}
                <Link to={productUrl} className="btn btn-secondary" onClick={onClose}>
                  View Full Details
                </Link>
              </div>
            )}
            {isInquiryOnly && !showQuoteForm && (
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px', padding: '8px 12px', background: '#fef9c3', borderRadius: '6px', border: '1px solid #fde047' }}>
                This part requires a custom quote - please contact us to order.
              </p>
            )}
            {showQuoteForm && (
              <QuoteForm
                product={product}
                onClose={() => setShowQuoteForm(false)}
                compact
              />
            )}
            {!showQuoteForm && (
              <p className="quick-view-contact">
                <strong>Questions?</strong> Call <a href={`tel:${s.contact_phone_sales}`}>{s.contact_phone_sales}</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
