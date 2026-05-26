import { useState, useEffect, useCallback, Fragment } from 'react';
import { API_BASE } from '../../config.js';

function AdminCarts({ authFetch, getAuthHeaders, setError, setSuccessMessage }) {
  const [carts, setCarts] = useState([]);
  const [selectedCart, setSelectedCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartsLoading, setCartsLoading] = useState(false);

  const fetchCarts = useCallback(async () => {
    setCartsLoading(true);
    try {
      const response = await authFetch(`${API_BASE}/admin/carts?limit=100&status=active`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCarts(data.carts || []);
      }
    } catch (err) {
      console.error('Failed to fetch carts:', err);
    } finally {
      setCartsLoading(false);
    }
  }, [authFetch, getAuthHeaders]);

  const fetchCartItems = useCallback(async (userId) => {
    try {
      const response = await authFetch(`${API_BASE}/admin/carts/${userId}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch cart items:', err);
      setCartItems([]);
    }
  }, [authFetch, getAuthHeaders]);

  const viewCartDetails = async (cart) => {
    if (selectedCart?.user_id === cart.user_id) {
      setSelectedCart(null);
      setCartItems([]);
    } else {
      setSelectedCart(cart);
      await fetchCartItems(cart.user_id);
    }
  };

  const deleteCartItem = async (userId, itemId, itemName) => {
    if (!confirm(`Remove "${itemName}" from this cart?`)) return;
    try {
      const response = await authFetch(`${API_BASE}/admin/carts/${userId}/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
        setSuccessMessage('Cart item removed');
        fetchCarts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove cart item');
      }
    } catch (err) {
      console.error('Failed to delete cart item:', err);
      setError('Failed to remove cart item');
    }
  };

  const clearUserCartItems = async (userId, userName) => {
    if (!confirm(`Clear all items from ${userName}'s cart?`)) return;
    try {
      const response = await authFetch(`${API_BASE}/admin/carts/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setCartItems([]);
        setSelectedCart(null);
        setSuccessMessage('Cart cleared');
        fetchCarts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to clear cart');
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear cart');
    }
  };

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr + 'Z').toLocaleString('en-US', { timeZone: 'America/New_York' }) : '-';
  };

  const activeCarts = carts.filter(c => (c.item_count || 0) > 0);
  const inactiveCarts = carts.filter(c => (c.item_count || 0) === 0);

  return (
    <div className="admin-section">
      <div className="admin-action-bar">
        <button onClick={fetchCarts} className="btn btn-primary" disabled={cartsLoading}>
          {cartsLoading ? 'Refreshing...' : 'Refresh Carts'}
        </button>
      </div>

      <p className="section-description">
        View registered users&apos; shopping carts. Active carts (with items) are shown first.
      </p>

      {cartsLoading ? (
        <p>Loading carts...</p>
      ) : (
        <>
          <h3>Active Carts ({activeCarts.length})</h3>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Items</th>
                  <th>Total Qty</th>
                  <th>Cart Total</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeCarts.map((cart) => (
                  <Fragment key={cart.id}>
                    <tr className={selectedCart?.user_id === cart.user_id ? 'selected-row' : ''}>
                      <td title={cart.name || 'Unknown'}><strong>{cart.name || 'Unknown'}</strong></td>
                      <td title={cart.email || ''}>{cart.email || '-'}</td>
                      <td title={cart.company || ''}>{cart.company || '-'}</td>
                      <td>{cart.item_count || 0}</td>
                      <td>{cart.total_quantity || 0}</td>
                      <td><strong>{cart.cart_total > 0 ? `$${parseFloat(cart.cart_total).toFixed(2)}` : '—'}</strong></td>
                      <td title={formatDate(cart.updated_at)}>{formatDate(cart.updated_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => viewCartDetails(cart)}
                            className="btn btn-small btn-outline"
                          >
                            {selectedCart?.user_id === cart.user_id ? 'Hide Items' : 'View Items'}
                          </button>
                          <button
                            onClick={() => clearUserCartItems(cart.user_id, cart.name || cart.email)}
                            className="btn btn-small btn-danger"
                          >
                            Clear
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selectedCart?.user_id === cart.user_id && (
                      <tr key={`${cart.id}-items`} className="cart-items-row">
                        <td colSpan="8">
                          <div className="cart-items-detail">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <h4 style={{ margin: 0 }}>Cart Items for {cart.name || cart.email}</h4>
                              {cartItems.length > 0 && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => clearUserCartItems(cart.user_id, cart.name || cart.email)}
                                >
                                  Clear Cart
                                </button>
                              )}
                            </div>
                            {cartItems.length === 0 ? (
                              <p className="no-items">No items in cart</p>
                            ) : (
                              <table className="cart-items-table">
                                <thead>
                                  <tr>
                                    <th>Image</th>
                                    <th>SKU</th>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Line Total</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {cartItems.map((item) => (
                                    <tr key={item.id}>
                                      <td>
                                        {item.product_image ? (
                                          <img
                                            src={item.product_image}
                                            alt={item.product_name}
                                            className="cart-item-thumbnail"
                                          />
                                        ) : (
                                          <span className="no-image">-</span>
                                        )}
                                      </td>
                                      <td title={item.product_sku}><strong>{item.product_sku}</strong></td>
                                      <td title={item.product_name || ''}>{item.product_name || '-'}</td>
                                      <td>{item.quantity}</td>
                                      <td>
                                        {item.price_at_add > 0
                                          ? `$${parseFloat(item.price_at_add).toFixed(2)}`
                                          : '—'}
                                      </td>
                                      <td>
                                        <strong>
                                          {item.price_at_add > 0
                                            ? `$${(parseFloat(item.price_at_add) * item.quantity).toFixed(2)}`
                                            : '—'}
                                        </strong>
                                      </td>
                                      <td>{formatDate(item.created_at)}</td>
                                      <td>
                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={() => deleteCartItem(cart.user_id, item.id, item.product_name || item.product_sku)}
                                        >
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr style={{ borderTop: '2px solid var(--gray-300)', background: 'var(--gray-100)' }}>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: '700', padding: '10px 12px' }}>Cart Total:</td>
                                    <td style={{ fontWeight: '700', padding: '10px 12px' }}>
                                      {cartItems.reduce((s, i) => s + i.quantity, 0)} units
                                    </td>
                                    <td></td>
                                    <td style={{ fontWeight: '700', padding: '10px 12px' }}>
                                      {(() => {
                                        const total = cartItems.reduce((s, i) => s + ((i.price_at_add || 0) * i.quantity), 0);
                                        return total > 0 ? `$${total.toFixed(2)}` : '—';
                                      })()}
                                    </td>
                                    <td colSpan="2"></td>
                                  </tr>
                                </tfoot>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {activeCarts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="no-data">No active carts with items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginTop: '2rem' }}>Inactive Cart Sessions ({inactiveCarts.length})</h3>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Items</th>
                  <th>Total Qty</th>
                  <th>Cart Total</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inactiveCarts.map((cart) => (
                  <tr key={cart.id}>
                    <td title={cart.name || 'Unknown'}><strong>{cart.name || 'Unknown'}</strong></td>
                    <td title={cart.email || ''}>{cart.email || '-'}</td>
                    <td title={cart.company || ''}>{cart.company || '-'}</td>
                    <td>{cart.item_count || 0}</td>
                    <td>{cart.total_quantity || 0}</td>
                    <td>{cart.cart_total > 0 ? `$${parseFloat(cart.cart_total).toFixed(2)}` : '—'}</td>
                    <td>{formatDate(cart.updated_at)}</td>
                    <td>-</td>
                  </tr>
                ))}
                {inactiveCarts.length === 0 && (
                  <tr>
                    <td colSpan="8" className="no-data">No inactive cart sessions</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminCarts;
