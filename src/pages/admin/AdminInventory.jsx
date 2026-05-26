import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../../config.js';
import AdminProducts from './AdminProducts.jsx';
import AdminPricing from './AdminPricing.jsx';
import AdminCatalog from './AdminCatalog.jsx';

export default function AdminInventory({
  authFetch,
  getAuthHeaders,
  setError,
  setSuccessMessage,
  inventoryTab,
  setInventoryTab,
  refreshStats,
}) {
  const [catalogBrands, setCatalogBrands] = useState([]);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [catalogMaterials, setCatalogMaterials] = useState([]);

  const fetchCatalogBrands = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE}/admin/makes`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setCatalogBrands(data.makes || []);
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  }, [authFetch, getAuthHeaders]);

  const fetchCatalogCategories = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE}/admin/categories`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setCatalogCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, [authFetch, getAuthHeaders]);

  const FALLBACK_MATERIALS = [
    { id: 'Aluminum', name: 'Aluminum' },
    { id: 'Bronze', name: 'Bronze' },
    { id: 'Cold Roll Etched', name: 'Cold Roll Etched' },
    { id: 'Galvanized', name: 'Galvanized' },
    { id: 'Galvannealed', name: 'Galvannealed' },
    { id: 'Nylon', name: 'Nylon' },
    { id: 'Stainless Steel', name: 'Stainless Steel' },
    { id: 'Steel', name: 'Steel' },
    { id: 'Steel (3/16")', name: 'Steel (3/16")' },
  ];

  const fetchCatalogMaterials = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/products/materials`);
      if (response.ok) {
        const data = await response.json();
        const materials = data.materials || [];
        setCatalogMaterials(materials.length > 0 ? materials : FALLBACK_MATERIALS);
      } else {
        setCatalogMaterials(FALLBACK_MATERIALS);
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      setCatalogMaterials(FALLBACK_MATERIALS);
    }
  }, []);

  useEffect(() => {
    fetchCatalogBrands();
    fetchCatalogCategories();
    fetchCatalogMaterials();
  }, [fetchCatalogBrands, fetchCatalogCategories, fetchCatalogMaterials]);

  return (
    <div className="admin-section inventory-section">
      <div className="inventory-nav">
        <button
          className={`inventory-nav-btn ${inventoryTab === 'products' ? 'active' : ''}`}
          onClick={() => setInventoryTab('products')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          Products
        </button>
        <button
          className={`inventory-nav-btn ${inventoryTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setInventoryTab('pricing')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          Pricing
        </button>
        <button
          className={`inventory-nav-btn ${inventoryTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setInventoryTab('catalog')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Catalog
          <span className="nav-count">{catalogCategories.length + catalogMaterials.length}</span>
        </button>
      </div>

      {inventoryTab === 'products' && (
        <AdminProducts
          authFetch={authFetch}
          getAuthHeaders={getAuthHeaders}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
          catalogBrands={catalogBrands}
          catalogCategories={catalogCategories}
          catalogMaterials={catalogMaterials}
          refreshStats={refreshStats}
        />
      )}

      {inventoryTab === 'pricing' && (
        <AdminPricing
          authFetch={authFetch}
          getAuthHeaders={getAuthHeaders}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      {inventoryTab === 'catalog' && (
        <AdminCatalog
          authFetch={authFetch}
          getAuthHeaders={getAuthHeaders}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
          catalogCategories={catalogCategories}
          catalogMaterials={catalogMaterials}
          fetchCatalogCategories={fetchCatalogCategories}
          fetchCatalogMaterials={fetchCatalogMaterials}
        />
      )}
    </div>
  );
}
