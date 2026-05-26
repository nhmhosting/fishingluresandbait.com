import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../data/products';

function Cart() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [requestType, setRequestType] = useState(null); // null | 'quote' | 'order'
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '', po_number: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // null | { success, name, email, type, error }

  const openModal = (type) => {
    setRequestType(type);
    setSubmitResult(null);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      notes: '',
      po_number: '',
    });
  };

  const closeModal = () => {
    if (submitting) return;
    setRequestType(null);
    setFormData({ name: '', email: '', phone: '', notes: '', po_number: '' });
    setSubmitResult(null);
  };

  const handleField = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/cart/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: requestType,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
          po_number: formData.po_number,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: getTotal(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitResult({ success: true, name: formData.name, email: formData.email, type: requestType });
      } else {
        setSubmitResult({ success: false, error: data.error || 'Something went wrong. Please try again.' });
      }
    } catch {
      setSubmitResult({ success: false, error: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const total = getTotal();
  const typeLabel = requestType === 'order' ? 'Place an Order' : 'Request a Quote';

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>Review your items and request a quote</p>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '20px' }}>
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h2>Your cart is empty</h2>
              <p style={{ color: 'var(--gray-600)', marginBottom: '24px' }}>Start shopping to add items to your cart.</p>
              <Link to="/shop" className="btn btn-primary">Browse Products</Link>
            </div>
          ) : (
            <div className="cart-page-content">
              <div className="cart-items-list">
                {items.map(item => {
                  const product = getProductById(item.id);
                  return (
                    <div key={item.id} className="cart-page-item">
                      <div className="cart-page-item-image">
                        {product?.image ? (
                          <img src={product.image} alt={item.name} />
                        ) : (
                          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                          </svg>
                        )}
                      </div>
                      <div className="cart-page-item-info">
                        <h3>
                          <Link to={`/product/${encodeURIComponent(item.id)}`}>{item.name}</Link>
                        </h3>
                        <p className="cart-page-item-id">Part #: {item.id}</p>
                        <p className="cart-page-item-price">
                          {item.price > 0 ? `$${item.price.toFixed(2)} each` : 'Price on request'}
                        </p>
                      </div>
                      <div className="cart-page-item-qty">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <div className="cart-page-item-subtotal">
                        {item.price > 0 ? `$${(item.price * item.quantity).toFixed(2)}` : '—'}
                      </div>
                      <button className="cart-page-item-remove" onClick={() => removeItem(item.id)}>
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="cart-page-summary">
                <div className="cart-page-total">
                  <span>Total:</span>
                  <span>{total > 0 ? `$${total.toFixed(2)}` : 'Prices on request'}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '4px', fontStyle: 'italic' }}>
                  Shipping &amp; handling not included — calculated upon request.
                </p>
                <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
                  Final pricing is confirmed upon request. A team member will follow up with you directly.
                </p>
                <div className="cart-page-actions">
                  <button className="btn btn-primary btn-full" onClick={() => openModal('quote')}>
                    Request a Quote — We'll Reach Out
                  </button>
                  <button className="btn btn-secondary btn-full" onClick={() => openModal('order')} style={{ marginTop: '12px' }}>
                    Place an Order — We'll Reach Out
                  </button>
                  <button className="btn btn-secondary btn-full" onClick={clearCart} style={{ marginTop: '12px' }}>
                    Clear Cart
                  </button>
                  <Link to="/shop" className="btn btn-secondary btn-full" style={{ marginTop: '12px' }}>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Request modal */}
      {requestType && (
        <div
          className="cr-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="crModalTitle"
        >
          <div className="cr-modal">
            {submitResult?.success ? (
              <div className="cr-success">
                <div className="cr-success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="cr-success-heading">
                  {submitResult.type === 'order' ? 'Order Received!' : 'Quote Request Received!'}
                </h2>
                <p className="cr-success-body">
                  Thanks, <strong>{submitResult.name}</strong>! We've received your{' '}
                  {submitResult.type === 'order' ? 'order request' : 'quote request'} and sent a
                  confirmation to <strong>{submitResult.email}</strong>. Our team will be in touch
                  shortly.
                </p>
                <div className="cr-success-actions">
                  <button className="btn btn-primary" onClick={closeModal}>
                    Back to Cart
                  </button>
                  <Link to="/shop" className="btn btn-secondary" onClick={closeModal}>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="cr-modal-header">
                  <h2 id="crModalTitle" className="cr-modal-title">{typeLabel}</h2>
                  <button className="cr-modal-close" onClick={closeModal} aria-label="Close">&times;</button>
                </div>

                <div className="cr-modal-items">
                  <p className="cr-items-label">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
                  {items.map(item => (
                    <div key={item.id} className="cr-item-row">
                      <span className="cr-item-name">{item.name}</span>
                      <span className="cr-item-qty">×{item.quantity}</span>
                      <span className="cr-item-price">
                        {item.price > 0 ? `$${(item.price * item.quantity).toFixed(2)}` : '—'}
                      </span>
                    </div>
                  ))}
                  {total > 0 && (
                    <div className="cr-item-total">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <form className="cr-form" onSubmit={handleSubmit} noValidate>
                  <p className="cr-form-section">Your Contact Information</p>
                  {user && (
                    <p className="cr-autofilled-note">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      Pre-filled from your account — edit if needed
                    </p>
                  )}
                  <div className="cr-form-row">
                    <div className="cr-field">
                      <label htmlFor="cr-name">Name *</label>
                      <input
                        id="cr-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleField}
                        required
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </div>
                    <div className="cr-field">
                      <label htmlFor="cr-email">Email *</label>
                      <input
                        id="cr-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleField}
                        required
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="cr-field">
                    <label htmlFor="cr-phone">Phone *</label>
                    <input
                      id="cr-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleField}
                      required
                      placeholder="(555) 000-0000"
                      autoComplete="tel"
                    />
                  </div>
                  <div className="cr-field">
                    <label htmlFor="cr-notes">
                      {requestType === 'order' ? 'Order Notes' : 'Additional Notes'}
                    </label>
                    <textarea
                      id="cr-notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleField}
                      rows={3}
                      placeholder={requestType === 'order'
                        ? 'Delivery requirements, timing, special instructions…'
                        : 'Vehicle type, make/model, or anything else we should know…'}
                    />
                  </div>

                  {requestType === 'order' && (
                    <div className="cr-field">
                      <label htmlFor="cr-po-number">PO Number <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(optional)</span></label>
                      <input
                        id="cr-po-number"
                        type="text"
                        name="po_number"
                        value={formData.po_number}
                        onChange={handleField}
                        placeholder="e.g. PO-12345"
                        autoComplete="off"
                      />
                    </div>
                  )}

                  {submitResult?.error && (
                    <p className="cr-error">{submitResult.error}</p>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-full cr-submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? 'Sending…'
                      : requestType === 'order'
                        ? 'Submit Order Request'
                        : 'Submit Quote Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;
