import { useState } from 'react';
import { API_BASE } from '../../config.js';

export default function AdminCatalog({
  authFetch,
  getAuthHeaders,
  setError,
  setSuccessMessage,
  catalogCategories,
  catalogMaterials,
  fetchCatalogCategories,
  fetchCatalogMaterials,
}) {
  const [catalogTab, setCatalogTab] = useState('categories');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', sort_order: 0 });
  const [materialForm, setMaterialForm] = useState({ id: '', name: '', sort_order: 0 });

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingCategory
        ? `${API_BASE}/admin/categories/${encodeURIComponent(editingCategory)}`
        : `${API_BASE}/admin/categories`;
      const response = await fetch(url, {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      if (response.ok) {
        setSuccessMessage(editingCategory ? 'Category updated' : 'Category created');
        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryForm({ id: '', name: '', sort_order: 0 });
        fetchCatalogCategories();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save category');
      }
    } catch (err) {
      setError('Failed to save category');
    }
  };

  const deleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`Delete category "${categoryName}"?`)) return;
    try {
      const response = await authFetch(`${API_BASE}/admin/categories/${encodeURIComponent(categoryId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setSuccessMessage('Category deleted');
        fetchCatalogCategories();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete category');
      }
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingMaterial
        ? `${API_BASE}/admin/materials/${encodeURIComponent(editingMaterial)}`
        : `${API_BASE}/admin/materials`;
      const response = await fetch(url, {
        method: editingMaterial ? 'PATCH' : 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(materialForm),
      });
      if (response.ok) {
        setSuccessMessage(editingMaterial ? 'Material updated' : 'Material created');
        setShowMaterialForm(false);
        setEditingMaterial(null);
        setMaterialForm({ id: '', name: '', sort_order: 0 });
        fetchCatalogMaterials();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save material');
      }
    } catch (err) {
      setError('Failed to save material');
    }
  };

  const deleteMaterial = async (materialId, materialName) => {
    if (!confirm(`Delete material "${materialName}"?`)) return;
    try {
      const response = await authFetch(`${API_BASE}/admin/materials/${encodeURIComponent(materialId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setSuccessMessage('Material deleted');
        fetchCatalogMaterials();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete material');
      }
    } catch (err) {
      setError('Failed to delete material');
    }
  };

  return (
    <div className="inventory-content">
      <div className="catalog-nav">
        <button className={`catalog-nav-btn ${catalogTab === 'categories' ? 'active' : ''}`} onClick={() => setCatalogTab('categories')}>
          Categories ({catalogCategories.length})
        </button>
        <button className={`catalog-nav-btn ${catalogTab === 'materials' ? 'active' : ''}`} onClick={() => setCatalogTab('materials')}>
          Materials ({catalogMaterials.length})
        </button>
      </div>

      {catalogTab === 'categories' && (
        <>
          <div className="admin-action-bar">
            <button
              onClick={() => {
                setShowCategoryForm(!showCategoryForm);
                setEditingCategory(null);
                setCategoryForm({ id: '', name: '', sort_order: 0 });
              }}
              className="btn btn-primary"
            >
              {showCategoryForm ? 'Cancel' : '+ Add Category'}
            </button>
          </div>

          {showCategoryForm && (
            <div className="account-form-card">
              <h4>{editingCategory ? 'Edit Category' : 'Add New Category'}</h4>
              <form onSubmit={handleCategorySubmit} className="account-form">
                <div className="form-row-3">
                  <div className="form-group">
                    <label>ID *</label>
                    <input type="text" value={categoryForm.id} onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })} placeholder="e.g., door-parts" required disabled={!!editingCategory} />
                  </div>
                  <div className="form-group">
                    <label>Name *</label>
                    <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g., Door Parts" required />
                  </div>
                  <div className="form-group">
                    <label>Sort Order</label>
                    <input type="number" value={categoryForm.sort_order} onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">{editingCategory ? 'Update Category' : 'Create Category'}</button>
              </form>
            </div>
          )}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Products</th><th>Sort</th><th>Actions</th></tr></thead>
              <tbody>
                {catalogCategories.map((c) => (
                  <tr key={c.id}>
                    <td title={c.id}><code>{c.id}</code></td>
                    <td title={c.name}><strong>{c.name}</strong></td>
                    <td>{c.product_count || 0}</td>
                    <td>{c.sort_order}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => { setCategoryForm({ id: c.id, name: c.name, sort_order: c.sort_order || 0 }); setEditingCategory(c.id); setShowCategoryForm(true); }} className="btn btn-small btn-outline">Edit</button>
                        <button onClick={() => deleteCategory(c.id, c.name)} className="btn btn-small btn-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {catalogCategories.length === 0 && (
                  <tr><td colSpan="5" className="no-data">No categories found. Run migrations to seed data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {catalogTab === 'materials' && (
        <>
          <div className="admin-action-bar">
            <button
              onClick={() => {
                setShowMaterialForm(!showMaterialForm);
                setEditingMaterial(null);
                setMaterialForm({ id: '', name: '', sort_order: 0 });
              }}
              className="btn btn-primary"
            >
              {showMaterialForm ? 'Cancel' : '+ Add Material'}
            </button>
          </div>

          {showMaterialForm && (
            <div className="account-form-card">
              <h4>{editingMaterial ? 'Edit Material' : 'Add New Material'}</h4>
              <form onSubmit={handleMaterialSubmit} className="account-form">
                <div className="form-row-3">
                  <div className="form-group">
                    <label>ID *</label>
                    <input type="text" value={materialForm.id} onChange={(e) => setMaterialForm({ ...materialForm, id: e.target.value })} placeholder="e.g., Aluminum" required disabled={!!editingMaterial} />
                  </div>
                  <div className="form-group">
                    <label>Name *</label>
                    <input type="text" value={materialForm.name} onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })} placeholder="e.g., Aluminum" required />
                  </div>
                  <div className="form-group">
                    <label>Sort Order</label>
                    <input type="number" value={materialForm.sort_order} onChange={(e) => setMaterialForm({ ...materialForm, sort_order: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">{editingMaterial ? 'Update Material' : 'Create Material'}</button>
              </form>
            </div>
          )}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Products</th><th>Sort</th><th>Actions</th></tr></thead>
              <tbody>
                {catalogMaterials.map((m) => (
                  <tr key={m.id}>
                    <td title={m.id}><code>{m.id}</code></td>
                    <td title={m.name}><strong>{m.name}</strong></td>
                    <td>{m.product_count || 0}</td>
                    <td>{m.sort_order}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => { setMaterialForm({ id: m.id, name: m.name, sort_order: m.sort_order || 0 }); setEditingMaterial(m.id); setShowMaterialForm(true); }} className="btn btn-small btn-outline">Edit</button>
                        <button onClick={() => deleteMaterial(m.id, m.name)} className="btn btn-small btn-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {catalogMaterials.length === 0 && (
                  <tr><td colSpan="5" className="no-data">No materials found. Run migrations to seed data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
