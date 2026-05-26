import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../../config.js';

export default function AdminPricing({ authFetch, getAuthHeaders, setError, setSuccessMessage }) {
  const [pricing, setPricing] = useState([]);
  const [pricingForm, setPricingForm] = useState({
    product_sku: '', public_price: '', wholesale_price: '', dealer_price: '',
  });
  const [pricingSearch, setPricingSearch] = useState('');
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [inlinePricing, setInlinePricing] = useState({});
  const [savingPricing, setSavingPricing] = useState({});
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  const fetchPricing = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE}/admin/pricing?limit=1000`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        const pricingData = data.pricing || [];
        setPricing(pricingData);
        const inlineState = {};
        pricingData.forEach(p => {
          inlineState[p.product_sku] = {
            public_price: p.public_price ?? '',
            wholesale_price: p.wholesale_price ?? '',
            dealer_price: p.dealer_price ?? '',
          };
        });
        setInlinePricing(inlineState);
      } else if (response.status === 401 || response.status === 403) {
        setError('Admin access denied. Try logging out and logging back in.');
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
    }
  }, [authFetch, getAuthHeaders, setError]);

  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  const searchProductsForPricing = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setProductSearchResults([]);
      return;
    }
    setSearchingProducts(true);
    try {
      const response = await fetch(
        `${API_BASE}/admin/products/search?q=${encodeURIComponent(query)}&limit=10`,
        { headers: getAuthHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        setProductSearchResults(data.products || []);
      }
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setSearchingProducts(false);
    }
  }, [getAuthHeaders]);

  const handlePricingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!pricingForm.product_sku) {
      setError('Product SKU is required');
      return;
    }
    try {
      const response = await authFetch(`${API_BASE}/admin/pricing`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_sku: pricingForm.product_sku,
          public_price: pricingForm.public_price === '' ? null : parseFloat(pricingForm.public_price),
          wholesale_price: pricingForm.wholesale_price === '' ? null : parseFloat(pricingForm.wholesale_price),
          dealer_price: pricingForm.dealer_price === '' ? null : parseFloat(pricingForm.dealer_price),
        }),
      });
      if (response.ok) {
        setSuccessMessage('Pricing saved successfully');
        setPricingForm({ product_sku: '', public_price: '', wholesale_price: '', dealer_price: '' });
        fetchPricing();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save pricing');
      }
    } catch (err) {
      setError('Failed to save pricing');
    }
  };

  const deletePricing = async (sku) => {
    if (!confirm(`Delete pricing for ${sku}?`)) return;
    try {
      const response = await authFetch(`${API_BASE}/admin/pricing/${encodeURIComponent(sku)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setSuccessMessage('Pricing deleted');
        fetchPricing();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete pricing');
    }
  };

  const updateInlinePricing = (sku, field, value) => {
    setInlinePricing(prev => ({
      ...prev,
      [sku]: { ...prev[sku], [field]: value },
    }));
  };

  const saveInlinePricing = async (sku) => {
    const prices = inlinePricing[sku];
    if (!prices) return;
    setSavingPricing(prev => ({ ...prev, [sku]: true }));
    try {
      const response = await authFetch(`${API_BASE}/admin/pricing`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_sku: sku,
          public_price: prices.public_price === '' ? null : parseFloat(prices.public_price),
          wholesale_price: prices.wholesale_price === '' ? null : parseFloat(prices.wholesale_price),
          dealer_price: prices.dealer_price === '' ? null : parseFloat(prices.dealer_price),
        }),
      });
      if (response.ok) {
        setSuccessMessage('Pricing saved');
        fetchPricing();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save pricing');
      }
    } catch (err) {
      setError('Failed to save pricing');
    } finally {
      setSavingPricing(prev => ({ ...prev, [sku]: false }));
    }
  };

  return (
    <div className="inventory-content">
      <div className="pricing-form-card">
        <h3>Set Product Pricing</h3>
        <p className="hint">Search for a product by SKU or name, or type a SKU directly.</p>
        <form onSubmit={handlePricingSubmit} className="pricing-form">
          <div className="form-group product-search-group">
            <label htmlFor="product_sku">Product SKU</label>
            <div className="product-search-wrapper">
              <input
                type="text"
                id="product_sku"
                value={pricingForm.product_sku}
                onChange={(e) => {
                  setPricingForm({ ...pricingForm, product_sku: e.target.value });
                  searchProductsForPricing(e.target.value);
                }}
                placeholder="Search by SKU or name..."
                required
                autoComplete="off"
              />
              {searchingProducts && <span className="search-loading">Searching...</span>}
              {productSearchResults.length > 0 && pricingForm.product_sku && (
                <div className="product-search-results">
                  {productSearchResults.map((product) => (
                    <div
                      key={product.id}
                      className={`product-search-item ${product.has_pricing ? 'has-pricing' : ''}`}
                      onClick={() => {
                        setPricingForm({
                          product_sku: product.id,
                          public_price: product.public_price ?? '',
                          wholesale_price: product.wholesale_price ?? '',
                          dealer_price: product.dealer_price ?? '',
                        });
                        setProductSearchResults([]);
                      }}
                    >
                      <strong>{product.id}</strong>
                      <span className="product-name">{product.name}</span>
                      {product.has_pricing ? (
                        <span className="pricing-badge has">Priced</span>
                      ) : (
                        <span className="pricing-badge none">No price</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="public_price">Public Price</label>
              <input type="number" id="public_price" step="0.01" value={pricingForm.public_price} onChange={(e) => setPricingForm({ ...pricingForm, public_price: e.target.value })} placeholder="Leave empty to hide" />
            </div>
            <div className="form-group">
              <label htmlFor="wholesale_price">School Price</label>
              <input type="number" id="wholesale_price" step="0.01" value={pricingForm.wholesale_price} onChange={(e) => setPricingForm({ ...pricingForm, wholesale_price: e.target.value })} placeholder="School price" />
            </div>
            <div className="form-group">
              <label htmlFor="dealer_price">Dealer Price</label>
              <input type="number" id="dealer_price" step="0.01" value={pricingForm.dealer_price} onChange={(e) => setPricingForm({ ...pricingForm, dealer_price: e.target.value })} placeholder="Dealer price" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Pricing</button>
        </form>
      </div>

      {(() => {
        const missingCount = pricing.filter((p) => p.public_price == null && p.wholesale_price == null && p.dealer_price == null).length;
        const filteredPricing = pricing.filter((p) => {
          const matchesSearch = !pricingSearch || p.product_sku.toLowerCase().includes(pricingSearch.toLowerCase());
          const matchesMissing = !showMissingOnly || (p.public_price == null && p.wholesale_price == null && p.dealer_price == null);
          return matchesSearch && matchesMissing;
        });

        return (
          <>
            {missingCount > 0 && (
              <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: '#92400e' }}>
                  <strong>{missingCount} product{missingCount !== 1 ? 's' : ''}</strong> {missingCount !== 1 ? 'have' : 'has'} no prices set — these show &quot;Price on request&quot; in the cart.
                </span>
                <button
                  type="button"
                  className={`btn btn-small ${showMissingOnly ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setShowMissingOnly((v) => !v)}
                >
                  {showMissingOnly ? 'Show all' : 'Show only missing'}
                </button>
              </div>
            )}

            <div className="pricing-list-header">
              <h3>
                Existing Pricing ({filteredPricing.length}{(pricingSearch || showMissingOnly) ? ` of ${pricing.length}` : ''})
              </h3>
              <div className="pricing-search-box">
                <input type="text" placeholder="Search by SKU..." value={pricingSearch} onChange={(e) => setPricingSearch(e.target.value)} className="pricing-search-input" />
                {pricingSearch && (
                  <button type="button" className="pricing-search-clear" onClick={() => setPricingSearch('')}>Clear</button>
                )}
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Public Price</th>
                    <th>School Price</th>
                    <th>Dealer Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPricing.map((p) => {
                    const isMissing = p.public_price == null && p.wholesale_price == null && p.dealer_price == null;
                    return (
                      <tr key={p.product_sku} style={isMissing ? { background: '#fffbeb' } : undefined}>
                        <td title={p.product_sku}>
                          <strong>{p.product_sku}</strong>
                          {isMissing && <span style={{ marginLeft: '8px', fontSize: '11px', background: '#fde68a', color: '#92400e', borderRadius: '3px', padding: '1px 5px', fontWeight: '600' }}>No price</span>}
                        </td>
                        <td>
                          <div className="inline-price-input">
                            <span className="price-prefix">$</span>
                            <input type="number" step="0.01" min="0" placeholder="0.00" value={inlinePricing[p.product_sku]?.public_price ?? ''} onChange={(e) => updateInlinePricing(p.product_sku, 'public_price', e.target.value)} className="price-input-small" />
                          </div>
                        </td>
                        <td>
                          <div className="inline-price-input">
                            <span className="price-prefix">$</span>
                            <input type="number" step="0.01" min="0" placeholder="0.00" value={inlinePricing[p.product_sku]?.wholesale_price ?? ''} onChange={(e) => updateInlinePricing(p.product_sku, 'wholesale_price', e.target.value)} className="price-input-small" />
                          </div>
                        </td>
                        <td>
                          <div className="inline-price-input">
                            <span className="price-prefix">$</span>
                            <input type="number" step="0.01" min="0" placeholder="0.00" value={inlinePricing[p.product_sku]?.dealer_price ?? ''} onChange={(e) => updateInlinePricing(p.product_sku, 'dealer_price', e.target.value)} className="price-input-small" />
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => saveInlinePricing(p.product_sku)} className="btn btn-small btn-primary" disabled={savingPricing[p.product_sku]}>
                              {savingPricing[p.product_sku] ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => deletePricing(p.product_sku)} className="btn btn-small btn-danger">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {pricing.length === 0 && (
                    <tr><td colSpan="5" className="no-data">No pricing set yet</td></tr>
                  )}
                  {pricing.length > 0 && filteredPricing.length === 0 && (
                    <tr><td colSpan="5" className="no-data">No products found{pricingSearch ? ` matching "${pricingSearch}"` : ''}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
      })()}
    </div>
  );
}
