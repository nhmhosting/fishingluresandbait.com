import { useState } from 'react';

/**
 * Inline quote request form for a specific part.
 * Renders as an expandable panel; the parent controls open/close via props.
 *
 * Props:
 *   product  – { id, name, material }
 *   onClose  – called when the user dismisses the form (cancel or success)
 *   compact  – true when embedded in the QuickViewModal (tighter layout)
 */
function QuoteForm({ product, onClose, compact = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setErrorMsg('');

    const partsNeeded = [
      `Part #: ${product.id}`,
      `Part Name: ${product.name}`,
      product.material ? `Material: ${product.material}` : null,
      formData.quantity ? `Quantity: ${formData.quantity}` : null,
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          parts_needed: partsNeeded,
          additional_notes: formData.notes || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="inline-quote-success">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <div>
          <strong>Quote request sent!</strong>
          <p>We'll get back to you with pricing as soon as possible.</p>
        </div>
        <button className="inline-quote-close-btn" onClick={onClose} aria-label="Dismiss">
          &times;
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-quote-form${compact ? ' inline-quote-form--compact' : ''}`}>
      <div className="inline-quote-header">
        <span className="inline-quote-title">Request a Quote</span>
        <span className="inline-quote-part">Part #{product.id} — {product.name}</span>
        <button className="inline-quote-close-btn" onClick={onClose} aria-label="Cancel">
          &times;
        </button>
      </div>

      {status === 'error' && (
        <div className="inline-quote-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="inline-quote-row">
          <div className="inline-quote-field">
            <label htmlFor={`iqf-name-${product.id}`}>
              Name <span aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id={`iqf-name-${product.id}`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>
          <div className="inline-quote-field">
            <label htmlFor={`iqf-email-${product.id}`}>
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id={`iqf-email-${product.id}`}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="inline-quote-row">
          <div className="inline-quote-field">
            <label htmlFor={`iqf-phone-${product.id}`}>Phone</label>
            <input
              type="tel"
              id={`iqf-phone-${product.id}`}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 555-5555"
              autoComplete="tel"
            />
          </div>
          <div className="inline-quote-field">
            <label htmlFor={`iqf-qty-${product.id}`}>Quantity Needed</label>
            <input
              type="number"
              id={`iqf-qty-${product.id}`}
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 4"
              min="1"
            />
          </div>
        </div>

        <div className="inline-quote-field">
          <label htmlFor={`iqf-notes-${product.id}`}>Additional Notes</label>
          <textarea
            id={`iqf-notes-${product.id}`}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Vehicle make/model, year, special requirements…"
            rows={compact ? 2 : 3}
          />
        </div>

        <div className="inline-quote-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="quote-spinner" aria-hidden="true"></span>
                Sending…
              </>
            ) : (
              'Send Quote Request'
            )}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuoteForm;
