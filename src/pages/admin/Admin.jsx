import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config.js';
import AdminUsers from './AdminUsers.jsx';
import AdminCarts from './AdminCarts.jsx';
import AdminInventory from './AdminInventory.jsx';
import AdminSiteContent from './AdminSiteContent.jsx';
import AdminActivity from './AdminActivity.jsx';

function Admin() {
  const { user, isAdmin, loading, getAuthHeaders, checkAuth } = useAuth();
  const navigate = useNavigate();

  const authFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });
  }, [getAuthHeaders]);

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    const validTabs = ['users', 'carts', 'inventory', 'site-content', 'activity'];
    return validTabs.includes(tab) ? tab : 'users';
  });
  const [inventoryTab, setInventoryTab] = useState('products');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (localStorage.getItem('auth_token') && !user && !loading) {
      checkAuth();
    }
  }, [checkAuth, user, loading]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE}/admin/stats`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [authFetch, getAuthHeaders]);

  useEffect(() => {
    if (isAdmin) {
      setIsLoading(true);
      fetchStats().finally(() => setIsLoading(false));
    }
  }, [isAdmin, fetchStats]);

  const onNavigateToTab = useCallback(({ active, inventoryTab: subTab }) => {
    if (active) setActiveTab(active);
    if (subTab) setInventoryTab(subTab);
  }, []);

  if (loading || isLoading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header-new">
          <div className="admin-header-content">
            <div className="admin-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className="admin-header-text">
              <h1>Admin Tools</h1>
              <p>Manage your store inventory, users, and orders</p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="admin-stats-new">
            <div className="stat-card-new">
              <div className="stat-icon stat-icon-users">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value-new">{stats.users}</span>
                <span className="stat-label-new">Users</span>
              </div>
            </div>
            <div className="stat-card-new">
              <div className="stat-icon stat-icon-carts">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value-new">{stats.active_carts}</span>
                <span className="stat-label-new">Active Carts</span>
              </div>
            </div>
            <div className="stat-card-new">
              <div className="stat-icon stat-icon-items">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value-new">{stats.cart_items}</span>
                <span className="stat-label-new">Cart Items</span>
              </div>
            </div>
            <div className="stat-card-new">
              <div className="stat-icon stat-icon-priced">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value-new">{stats.products_with_pricing}</span>
                <span className="stat-label-new">Priced</span>
              </div>
            </div>
            <div className="stat-card-new">
              <div className="stat-icon stat-icon-products">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value-new">{stats.total_products || 0}</span>
                <span className="stat-label-new">Products</span>
              </div>
            </div>
          </div>
        )}

        {error && <div className="admin-error">{error}</div>}
        {successMessage && <div className="admin-success">{successMessage}</div>}

        <div className="admin-nav">
          <button className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Users</span>
          </button>
          <button className={`admin-nav-btn ${activeTab === 'carts' ? 'active' : ''}`} onClick={() => setActiveTab('carts')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Carts</span>
          </button>
          <button className={`admin-nav-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Inventory</span>
          </button>
          <button className={`admin-nav-btn ${activeTab === 'site-content' ? 'active' : ''}`} onClick={() => setActiveTab('site-content')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Site Content</span>
          </button>
          <button className={`admin-nav-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <span>Activity Log</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <AdminUsers
            authFetch={authFetch}
            getAuthHeaders={getAuthHeaders}
            setError={setError}
            setSuccessMessage={setSuccessMessage}
            currentUser={user}
            refreshStats={fetchStats}
          />
        )}

        {activeTab === 'carts' && (
          <AdminCarts
            authFetch={authFetch}
            getAuthHeaders={getAuthHeaders}
            setError={setError}
            setSuccessMessage={setSuccessMessage}
          />
        )}

        {activeTab === 'inventory' && (
          <AdminInventory
            authFetch={authFetch}
            getAuthHeaders={getAuthHeaders}
            setError={setError}
            setSuccessMessage={setSuccessMessage}
            inventoryTab={inventoryTab}
            setInventoryTab={setInventoryTab}
            refreshStats={fetchStats}
          />
        )}

        {activeTab === 'site-content' && (
          <AdminSiteContent
            authFetch={authFetch}
            getAuthHeaders={getAuthHeaders}
            setError={setError}
            setSuccessMessage={setSuccessMessage}
          />
        )}

        {activeTab === 'activity' && (
          <AdminActivity authFetch={authFetch} />
        )}
      </div>
    </div>
  );
}

export default Admin;
