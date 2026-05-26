import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function CartSidebar() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal } = useCart();
  const { user } = useAuth();

  const [view, setView] = useState('cart'); // 'cart' | 'form' | 'success'
  const [requestType, setRequestType] = useState(null); // 'quote' | 'order'
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '', po_number: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const openForm = (type) => {
    setRequestType(type);
    setFormError('');
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      notes: '',
      po_number: '',
    });
    setView('form');
  };

  const backToCart = () => {
    setView('cart');
    setFormData({ name: '', email: '', phone: '', notes: '', po_number: '' });
    setFormError('');
  };

  const handleField = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
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
        setSuccessData({ name: formData.name, email: formData.email, type: requestType });
        setView('success');
      } else {
        setFormError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    closeCart();
    // Reset form state after transition
    setTimeout(() => {
      setView('cart');
      setFormData({ name: '', email: '', phone: '', notes: '', po_number: '' });
      setFormError('');
      setSuccessData(null);
    }, 300);
  };

  const total = getTotal();

  return (
    <>
      <div
        className={`cart-sidebar ${isOpen ? 'active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartTitle"
      >
        {/* ── Cart view ── */}
        {view === 'cart' && (
          <>
            <div className="cart-header">
              <h3 id="cartTitle">Shopping Cart</h3>
              <button className="cart-close" onClick={handleClose} aria-label="Close shopping cart" aria-keyshortcuts="Escape">&times;</button>
            </div>
            <div className="cart-items">
              {items.length === 0 ? (
                <p className="cart-empty">Cart is empty!</p>
              ) : (
                items.map(item => {
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                          </svg>
                        )}
                      </div>
                      <div className="cart-item-info">
                        <div className="cart-item-title">{item.name}</div>
                        <div className="cart-item-price">
                          {item.price > 0 ? `$${item.price.toFixed(2)}` : 'Price on request'}
                        </div>
                        <div className="cart-item-qty">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>&minus;</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name} from cart`}>&times;</button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span>{items.length === 0 ? '$0.00' : total > 0 ? `$${total.toFixed(2)}` : 'Prices on request'}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', fontStyle: 'italic', margin: '4px 0 10px' }}>
                Shipping &amp; handling not included.
              </p>
              <Link to="/cart" className="btn btn-primary btn-full" onClick={handleClose}>View Cart</Link>
              <button
                className="btn btn-secondary btn-full"
                style={{ marginTop: '10px' }}
                onClick={() => openForm('quote')}
                disabled={items.length === 0}
              >
                Request a Quote — We'll Reach Out
              </button>
              <button
                className="btn btn-secondary btn-full"
                style={{ marginTop: '8px' }}
                onClick={() => openForm('order')}
                disabled={items.length === 0}
              >
                Place an Order — We'll Reach Out
              </button>
            </div>
          </>
        )}

        {/* ── Form view ── */}
        {view === 'form' && (
          <>
            <div className="cart-header">
              <h3 id="cartTitle">
                {requestType === 'order' ? 'Place an Order' : 'Request a Quote'}
              </h3>
              <button className="cart-close" onClick={handleClose} aria-label="Close">&times;</button>
            </div>
            <div className="cart-items" style={{ padding: '16px' }}>
              <button
                className="cr-back-btn"
                onClick={backToCart}
                disabled={submitting}
              >
                ← Back to cart
              </button>

              <div className="cr-sidebar-summary">
                <p className="cr-items-label">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                {items.map(item => (
                  <div key={item.id} className="cr-item-row cr-item-row--sm">
                    <span className="cr-item-name">{item.name}</span>
                    <span className="cr-item-qty">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              {user && (
                <p className="cr-autofilled-note" style={{ marginBottom: '8px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Pre-filled from your account
                </p>
              )}
              <form className="cr-form cr-form--sidebar" onSubmit={handleSubmit} noValidate>
                <div className="cr-field">
                  <label htmlFor="sb-name">Name *</label>
                  <input
                    id="sb-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleField}
                    required
                    placeholder="Your full name"
                    autoComplete="name"
                    aria-required="true"
                    aria-describedby={formError ? 'sb-form-error' : undefined}
                  />
                </div>
                <div className="cr-field">
                  <label htmlFor="sb-email">Email *</label>
                  <input
                    id="sb-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleField}
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-required="true"
                    aria-describedby={formError ? 'sb-form-error' : undefined}
                  />
                </div>
                <div className="cr-field">
                  <label htmlFor="sb-phone">Phone *</label>
                  <input
                    id="sb-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleField}
                    required
                    placeholder="(555) 000-0000"
                    autoComplete="tel"
                    aria-required="true"
                    aria-describedby={formError ? 'sb-form-error' : undefined}
                  />
                </div>
                <div className="cr-field">
                  <label htmlFor="sb-notes">Notes</label>
                  <textarea
                    id="sb-notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleField}
                    rows={3}
                    placeholder="Anything we should know…"
                    aria-describedby={formError ? 'sb-form-error' : undefined}
                  />
                </div>

                {requestType === 'order' && (
                  <div className="cr-field">
                    <label htmlFor="sb-po-number">PO Number <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(optional)</span></label>
                    <input
                      id="sb-po-number"
                      type="text"
                      name="po_number"
                      value={formData.po_number}
                      onChange={handleField}
                      placeholder="e.g. PO-12345"
                      autoComplete="off"
                    />
                  </div>
                )}

                {formError && <p className="cr-error" id="sb-form-error" role="alert">{formError}</p>}

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
            </div>
          </>
        )}

        {/* ── Success view ── */}
        {view === 'success' && (
          <>
            <div className="cart-header">
              <h3 id="cartTitle">Request Sent</h3>
              <button className="cart-close" onClick={handleClose} aria-label="Close">&times;</button>
            </div>
            <div className="cr-sidebar-success">
              <div className="cr-success-icon cr-success-icon--sidebar">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="cr-success-heading">
                {successData?.type === 'order' ? 'Order Received!' : 'Quote Request Received!'}
              </h2>
              <p className="cr-success-body">
                Thanks, <strong>{successData?.name}</strong>! A confirmation has been sent to{' '}
                <strong>{successData?.email}</strong>. Our team will follow up with you shortly.
              </p>
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-primary btn-full" onClick={handleClose}>
                  Close
                </button>
                <Link to="/shop" className="btn btn-secondary btn-full" onClick={handleClose}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <div
        className={`cart-overlay ${isOpen ? 'active' : ''}`}
        onClick={handleClose}
      ></div>
    </>
  );
}

export default CartSidebar;
