import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../../config.js';
import convertToWebP from '../../utils/convertToWebP.js';

export default function AdminProducts({
  authFetch,
  getAuthHeaders,
  setError,
  setSuccessMessage,
  catalogBrands,
  catalogCategories,
  catalogMaterials,
  refreshStats,
}) {
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [pricingFilter, setPricingFilter] = useState('');
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsPage, setProductsPage] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(100);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    id: '', name: '', description: '', material: '', brand: '', category: '',
    image: '', images: [], is_active: true, is_featured: false, badge: '',
    public_price: '', wholesale_price: '', dealer_price: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const descEditorRef = useRef(null);
  const productFormRef = useRef(null);
  const savedSelRef = useRef(null);

  const [productRelationships, setProductRelationships] = useState({ category_ids: [] });
  const [loadingRelationships, setLoadingRelationships] = useState(false);

  const [showBulkPricing, setShowBulkPricing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkPricingForm, setBulkPricingForm] = useState({ public_price: '', wholesale_price: '', dealer_price: '' });
  const [bulkPricingLoading, setBulkPricingLoading] = useState(false);

  const productSearchRef = useRef(productSearch);
  productSearchRef.current = productSearch;
  const pricingFilterRef = useRef(pricingFilter);
  pricingFilterRef.current = pricingFilter;
  const productsPageRef = useRef(productsPage);
  productsPageRef.current = productsPage;
  const productsPerPageRef = useRef(productsPerPage);
  productsPerPageRef.current = productsPerPage;

  const fetchProducts = useCallback(async (page) => {
    setProductsLoading(true);
    const currentPage = typeof page === 'number' ? page : productsPageRef.current;
    const perPage = productsPerPageRef.current;
    try {
      const params = new URLSearchParams();
      if (productSearchRef.current) params.append('search', productSearchRef.current);
      if (pricingFilterRef.current) params.append('pricing', pricingFilterRef.current);
      if (perPage === 'all') {
        params.append('limit', '50000');
        params.append('offset', '0');
      } else {
        params.append('limit', String(perPage));
        params.append('offset', String(currentPage * perPage));
      }
      params.append('active', 'false');
      const response = await authFetch(`${API_BASE}/admin/products?${params}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setProductsTotal(data.total || 0);
      } else if (response.status === 401 || response.status === 403) {
        setError('Admin access denied. Try logging out and logging back in.');
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setProductsLoading(false);
    }
  }, [authFetch, getAuthHeaders, setError]);

  useEffect(() => { fetchProducts(0); }, [fetchProducts]);

  const fetchProductRelationships = useCallback(async (productId) => {
    setLoadingRelationships(true);
    try {
      const response = await fetch(
        `${API_BASE}/admin/products/${encodeURIComponent(productId)}/relationships`,
        { headers: getAuthHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        setProductRelationships({ category_ids: data.categories?.map(c => c.id) || [] });
      }
    } catch (err) {
      console.error('Failed to fetch product relationships:', err);
    } finally {
      setLoadingRelationships(false);
    }
  }, [getAuthHeaders]);

  const saveProductRelationships = useCallback(async (productId, relationships) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/products/${encodeURIComponent(productId)}/relationships`,
        {
          method: 'PUT',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(relationships),
        }
      );
      return response.ok;
    } catch (err) {
      console.error('Failed to save product relationships:', err);
      return false;
    }
  }, [getAuthHeaders]);

  const resetProductForm = () => {
    setProductForm({
      id: '', name: '', description: '', material: '', brand: '', category: '',
      image: '', images: [], is_active: true, is_featured: false, badge: '',
      public_price: '', wholesale_price: '', dealer_price: '',
    });
    setProductRelationships({ category_ids: [] });
    setEditingProduct(null);
    setShowProductForm(false);
    if (descEditorRef.current) descEditorRef.current.innerHTML = '';
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!productForm.id || !productForm.name) {
      setError('Product SKU and name are required');
      return;
    }
    try {
      const isEditing = !!editingProduct;
      const url = isEditing
        ? `${API_BASE}/admin/products/${encodeURIComponent(editingProduct)}`
        : `${API_BASE}/admin/products`;
      const requestBody = {
        id: productForm.id, name: productForm.name,
        description: productForm.description || undefined,
        material: productForm.material || undefined,
        brand: productForm.brand || undefined,
        category: productForm.category || undefined,
        image: productForm.images[0] || productForm.image || undefined,
        images: productForm.images.length > 0 ? productForm.images : undefined,
        is_active: productForm.is_active,
        is_featured: productForm.is_featured,
        badge: productForm.badge || undefined,
      };
      if (!isEditing) {
        if (productForm.public_price !== '') requestBody.public_price = parseFloat(productForm.public_price);
        if (productForm.wholesale_price !== '') requestBody.wholesale_price = parseFloat(productForm.wholesale_price);
        if (productForm.dealer_price !== '') requestBody.dealer_price = parseFloat(productForm.dealer_price);
      }
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        const allCategoryIds = [...new Set([
          ...(productForm.category ? [productForm.category] : []),
          ...productRelationships.category_ids,
        ])];
        const relSaved = await saveProductRelationships(productForm.id, { category_ids: allCategoryIds });
        if (isEditing) {
          const hasPricing = productForm.public_price !== '' || productForm.wholesale_price !== '' || productForm.dealer_price !== '';
          if (hasPricing) {
            await authFetch(`${API_BASE}/admin/pricing`, {
              method: 'POST',
              headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_sku: productForm.id,
                public_price: productForm.public_price === '' ? null : parseFloat(productForm.public_price),
                wholesale_price: productForm.wholesale_price === '' ? null : parseFloat(productForm.wholesale_price),
                dealer_price: productForm.dealer_price === '' ? null : parseFloat(productForm.dealer_price),
              }),
            });
          }
        }
        const baseMsg = isEditing ? 'Product updated successfully' : 'Product created successfully';
        setSuccessMessage(relSaved ? baseMsg : `${baseMsg} (warning: category relationships may not have saved)`);
        resetProductForm();
        fetchProducts(0);
        refreshStats();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        let errMsg = 'Failed to save product';
        try { const data = await response.json(); errMsg = data.error || errMsg; } catch {}
        setError(`${errMsg} (HTTP ${response.status})`);
      }
    } catch (err) {
      setError(`Failed to save product: ${err.message || err}`);
    }
  };

  const toggleProductActive = async (product) => {
    const newStatus = !(product.is_active === 1 || product.is_active === true);
    try {
      const response = await authFetch(`${API_BASE}/admin/products/${encodeURIComponent(product.id)}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (response.ok) fetchProducts(0);
      else { const data = await response.json(); setError(data.error || 'Failed to update product status'); }
    } catch (err) {
      setError('Failed to update product status');
    }
  };

  const editProduct = (product) => {
    let productImages = [];
    if (product.images) {
      try { productImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images; } catch { productImages = []; }
    }
    if (productImages.length === 0 && product.image) productImages = [product.image];
    setProductForm({
      id: product.id, name: product.name || '', description: product.description || '',
      material: product.material || '', brand: product.brand || '', category: product.category || '',
      image: product.image || '', images: productImages,
      is_active: product.is_active === 1 || product.is_active === true,
      is_featured: product.is_featured === 1 || product.is_featured === true,
      badge: product.badge || '',
      public_price: product.public_price != null ? product.public_price : '',
      wholesale_price: product.wholesale_price != null ? product.wholesale_price : '',
      dealer_price: product.dealer_price != null ? product.dealer_price : '',
    });
    setEditingProduct(product.id);
    setShowProductForm(true);
    fetchProductRelationships(product.id);
    setTimeout(() => {
      if (descEditorRef.current) descEditorRef.current.innerHTML = product.description || '';
      if (productFormRef.current) productFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const deleteProduct = async (productId, productName) => {
    if (!confirm(`Delete product "${productName}"? This will also delete its pricing.`)) return;
    try {
      const response = await authFetch(`${API_BASE}/admin/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE', headers: getAuthHeaders(),
      });
      if (response.ok) {
        setSuccessMessage('Product deleted successfully');
        fetchProducts(0);
        refreshStats();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete product');
      }
    } catch (err) { setError('Failed to delete product'); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) { setError('Invalid file type. Allowed: jpg, png, webp, gif'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File too large. Maximum 5MB'); return; }
    if (productForm.images.length >= 5) { setError('Maximum 5 images allowed. Remove one first.'); return; }
    setUploading(true);
    setError('');
    try {
      setUploadProgress('Converting to WebP...');
      const webpFile = await convertToWebP(file);
      setUploadProgress('Uploading...');
      const formData = new FormData();
      formData.append('file', webpFile);
      if (productForm.id) {
        const suffix = productForm.images.length > 0 ? `-${productForm.images.length + 1}` : '';
        formData.append('name', productForm.id + suffix);
      }
      const response = await authFetch(`${API_BASE}/images/upload`, {
        method: 'POST', headers: { Authorization: getAuthHeaders().Authorization }, body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        const newImages = [...productForm.images, data.path];
        setProductForm({ ...productForm, images: newImages, image: newImages[0] });
        setUploadProgress('Uploaded!');
        setTimeout(() => setUploadProgress(''), 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload image');
        setUploadProgress('');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const removeProductImage = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages, image: newImages[0] || '' });
  };

  const moveProductImage = (index, direction) => {
    const newImages = [...productForm.images];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newImages.length) return;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    setProductForm({ ...productForm, images: newImages, image: newImages[0] || '' });
  };

  const handleBulkPricingSubmit = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) { setError('Please select at least one product'); return; }
    setBulkPricingLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await authFetch(`${API_BASE}/admin/pricing/bulk`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skus: selectedProducts.map(p => p.id),
          public_price: bulkPricingForm.public_price === '' ? undefined : parseFloat(bulkPricingForm.public_price),
          wholesale_price: bulkPricingForm.wholesale_price === '' ? undefined : parseFloat(bulkPricingForm.wholesale_price),
          dealer_price: bulkPricingForm.dealer_price === '' ? undefined : parseFloat(bulkPricingForm.dealer_price),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(`Bulk pricing applied: ${data.summary.created} created, ${data.summary.updated} updated`);
        setShowBulkPricing(false);
        setSelectedProducts([]);
        setBulkPricingForm({ public_price: '', wholesale_price: '', dealer_price: '' });
        fetchProducts(0);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to apply bulk pricing');
      }
    } catch (err) {
      setError('Failed to apply bulk pricing');
    } finally {
      setBulkPricingLoading(false);
    }
  };

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
    });
  };
  const selectAllProducts = () => setSelectedProducts(products);
  const clearProductSelection = () => setSelectedProducts([]);

  return (
    <div className="inventory-content">
      <div className="admin-action-bar">
        <button onClick={() => { if (showProductForm) resetProductForm(); else setShowProductForm(true); }} className="btn btn-primary">
          {showProductForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showProductForm && (
        <div className="account-form-card" ref={productFormRef}>
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleProductSubmit} className="account-form">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="prod_id">SKU *</label>
                <input type="text" id="prod_id" value={productForm.id} onChange={(e) => setProductForm({ ...productForm, id: e.target.value })} placeholder="e.g., AT105" required disabled={!!editingProduct} />
              </div>
              <div className="form-group">
                <label htmlFor="prod_name">Name *</label>
                <input type="text" id="prod_name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product name" required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <div className="desc-editor-toolbar" style={{ display: 'flex', gap: '2px', marginBottom: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { cmd: 'bold', label: 'B', title: 'Bold (Ctrl+B)', style: { fontWeight: 'bold' } },
                  { cmd: 'italic', label: 'I', title: 'Italic (Ctrl+I)', style: { fontStyle: 'italic' } },
                  { cmd: 'underline', label: 'U', title: 'Underline (Ctrl+U)', style: { textDecoration: 'underline' } },
                  { cmd: 'strikeThrough', label: 'S', title: 'Strikethrough', style: { textDecoration: 'line-through' } },
                ].map(({ cmd, label, title, style }) => (
                  <button key={cmd} type="button" className="btn btn-small btn-outline" title={title} style={{ ...style, minWidth: '32px', padding: '4px 8px', fontSize: '14px' }}
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand(cmd, false, null); if (descEditorRef.current) setProductForm(prev => ({ ...prev, description: descEditorRef.current.innerHTML })); }}>
                    {label}
                  </button>
                ))}
                <span style={{ borderLeft: '1px solid var(--gray-300, #d1d5db)', height: '24px', margin: '0 4px' }} />
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <select
                    title="Font Size"
                    style={{ appearance: 'none', WebkitAppearance: 'none', padding: '4px 26px 4px 8px', fontSize: '13px', fontFamily: 'var(--font-heading, inherit)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '4px', border: '2px solid var(--primary, #d97706)', background: 'transparent', color: 'var(--primary, #d97706)', cursor: 'pointer', height: '30px', lineHeight: '1', minWidth: '68px' }}
                    defaultValue=""
                    onMouseDown={() => {
                      const sel = window.getSelection();
                      if (sel && sel.rangeCount > 0) savedSelRef.current = sel.getRangeAt(0).cloneRange();
                    }}
                    onChange={(e) => {
                      const size = e.target.value;
                      if (!size) return;
                      if (savedSelRef.current) {
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(savedSelRef.current);
                      }
                      document.execCommand('fontSize', false, size);
                      if (descEditorRef.current) setProductForm(prev => ({ ...prev, description: descEditorRef.current.innerHTML }));
                      e.target.value = '';
                    }}
                  >
                    <option value="" disabled>Aa</option>
                    <option value="1">XS</option>
                    <option value="2">S</option>
                    <option value="3">M</option>
                    <option value="4">L</option>
                    <option value="5">XL</option>
                    <option value="6">XXL</option>
                  </select>
                  <svg style={{ position: 'absolute', right: '6px', pointerEvents: 'none', color: 'var(--primary, #d97706)' }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <span style={{ borderLeft: '1px solid var(--gray-300, #d1d5db)', height: '24px', margin: '0 4px' }} />
                <button type="button" className="btn btn-small btn-outline" title="Clear all formatting" style={{ padding: '4px 8px', fontSize: '12px' }}
                  onMouseDown={(e) => { e.preventDefault(); document.execCommand('removeFormat', false, null); if (descEditorRef.current) setProductForm(prev => ({ ...prev, description: descEditorRef.current.innerHTML })); }}>
                  Clear Format
                </button>
              </div>
              <div
                ref={(el) => { descEditorRef.current = el; if (el && el.innerHTML === '') el.innerHTML = productForm.description || ''; }}
                contentEditable className="desc-editor"
                style={{ border: '1px solid var(--gray-300, #d1d5db)', borderRadius: '6px', padding: '8px 12px', minHeight: '80px', lineHeight: '1.5', outline: 'none', background: 'var(--white, #fff)', fontSize: '14px' }}
                onInput={() => { if (descEditorRef.current) setProductForm(prev => ({ ...prev, description: descEditorRef.current.innerHTML })); }}
                onBlur={() => { if (descEditorRef.current) setProductForm(prev => ({ ...prev, description: descEditorRef.current.innerHTML })); }}
                suppressContentEditableWarning
              />
              <small style={{ color: 'var(--gray-500, #6b7280)' }}>Select text then click a button to format. Keyboard shortcuts: Ctrl+B, Ctrl+I, Ctrl+U</small>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="prod_brand">Brand</label>
                <select id="prod_brand" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className="admin-select">
                  <option value="">Select Brand...</option>
                  {catalogBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="prod_category">Primary Category</label>
                <select id="prod_category" value={productForm.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProductForm({ ...productForm, category: val });
                    if (val && !productRelationships.category_ids.includes(val)) {
                      setProductRelationships(prev => ({ ...prev, category_ids: [...prev.category_ids, val] }));
                    }
                  }}
                  className="admin-select">
                  <option value="">Select Primary Category...</option>
                  {catalogCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="prod_material">Material</label>
                <select id="prod_material" value={productForm.material || ''} onChange={(e) => setProductForm({ ...productForm, material: e.target.value })} className="admin-select">
                  <option value="">Select Material...</option>
                  {catalogMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                Additional Categories
                {productRelationships.category_ids.length > 0 && <span className="cat-count-badge">{productRelationships.category_ids.length} selected</span>}
              </label>
              <p className="field-hint">Click to toggle - product appears in all selected categories.</p>
              <div className="cat-pill-grid">
                {catalogCategories.length === 0 && <span style={{ color: 'var(--gray-400)', fontSize: '13px' }}>No categories available</span>}
                {[...catalogCategories].sort((a, b) => a.name.localeCompare(b.name)).map(c => {
                  const active = productRelationships.category_ids.includes(c.id);
                  return (
                    <button key={c.id} type="button" className={`cat-pill${active ? ' cat-pill--active' : ''}`}
                      onClick={() => { setProductRelationships(prev => ({ ...prev, category_ids: active ? prev.category_ids.filter(id => id !== c.id) : [...prev.category_ids, c.id] })); }}>
                      {active && <span className="cat-pill-check">✓</span>}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Product Images <small style={{ fontWeight: 'normal', color: 'var(--gray-500)' }}>({productForm.images.length}/5)</small></label>
              <div style={{ border: '1px solid var(--gray-300, #d1d5db)', borderRadius: '10px', padding: '12px', background: 'var(--gray-50, #f9fafb)' }}>
                {productForm.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                    {productForm.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', border: idx === 0 ? '2px solid var(--primary, #d97706)' : '2px solid var(--gray-200, #e5e7eb)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                        <img src={img} alt={`Image ${idx + 1}`} style={{ width: '100%', height: '90px', objectFit: 'contain', display: 'block' }} onError={(e) => { e.target.style.opacity = '0.3'; }} />
                        {idx === 0 && <span style={{ position: 'absolute', top: '2px', left: '2px', background: 'var(--primary, #d97706)', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>Primary</span>}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', padding: '4px', borderTop: '1px solid var(--gray-200, #e5e7eb)' }}>
                          <button type="button" title="Move left" disabled={idx === 0} onClick={() => moveProductImage(idx, -1)} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, padding: '2px 4px', fontSize: '12px' }}>&larr;</button>
                          <button type="button" title="Move right" disabled={idx === productForm.images.length - 1} onClick={() => moveProductImage(idx, 1)} style={{ background: 'none', border: 'none', cursor: idx === productForm.images.length - 1 ? 'default' : 'pointer', opacity: idx === productForm.images.length - 1 ? 0.3 : 1, padding: '2px 4px', fontSize: '12px' }}>&rarr;</button>
                          <button type="button" title="Remove" onClick={() => removeProductImage(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '2px 4px', fontSize: '12px', fontWeight: 'bold' }}>&times;</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {productForm.images.length < 5 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="file" id="prod_image_file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} disabled={uploading} className="file-input" />
                    <label htmlFor="prod_image_file" className="btn btn-small btn-outline file-label">{uploading ? 'Uploading...' : '+ Add Image'}</label>
                    {uploadProgress && <span className="upload-status">{uploadProgress}</span>}
                  </div>
                )}
                {productForm.images.length === 0 && <small style={{ color: 'var(--gray-500)', display: 'block', marginTop: '4px' }}>Upload up to 5 images. First image is the primary display image.</small>}
              </div>
            </div>

            <div className="pricing-section">
              <h4>Pricing (Optional)</h4>
              <p className="hint">Set prices now or leave empty to set later. Leave a tier empty to hide pricing for that tier.</p>
              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="prod_public_price">Public Price</label>
                  <input type="number" id="prod_public_price" step="0.01" min="0" value={productForm.public_price} onChange={(e) => setProductForm({ ...productForm, public_price: e.target.value })} placeholder="e.g., 99.99" />
                </div>
                <div className="form-group">
                  <label htmlFor="prod_wholesale_price">School Price</label>
                  <input type="number" id="prod_wholesale_price" step="0.01" min="0" value={productForm.wholesale_price} onChange={(e) => setProductForm({ ...productForm, wholesale_price: e.target.value })} placeholder="e.g., 79.99" />
                </div>
                <div className="form-group">
                  <label htmlFor="prod_dealer_price">Dealer Price</label>
                  <input type="number" id="prod_dealer_price" step="0.01" min="0" value={productForm.dealer_price} onChange={(e) => setProductForm({ ...productForm, dealer_price: e.target.value })} placeholder="e.g., 59.99" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', padding: '12px 0' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', border: productForm.badge === 'new' ? '2px solid #2563eb' : '2px solid var(--gray-200, #e5e7eb)', background: productForm.badge === 'new' ? '#dbeafe' : 'transparent', color: productForm.badge === 'new' ? '#1d4ed8' : 'var(--gray-600, #4b5563)', boxShadow: productForm.badge === 'new' ? '0 0 8px rgba(37, 99, 235, 0.4)' : 'none', transition: 'all 0.15s ease' }}>
                <input type="checkbox" checked={productForm.badge === 'new'} onChange={(e) => setProductForm({ ...productForm, badge: e.target.checked ? 'new' : '' })} style={{ display: 'none' }} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill={productForm.badge === 'new' ? '#2563eb' : 'none'} stroke={productForm.badge === 'new' ? '#1d4ed8' : 'currentColor'} strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                New
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', border: productForm.is_featured ? '2px solid #f59e0b' : '2px solid var(--gray-200, #e5e7eb)', background: productForm.is_featured ? '#fef3c7' : 'transparent', color: productForm.is_featured ? '#b45309' : 'var(--gray-600, #4b5563)', boxShadow: productForm.is_featured ? '0 0 8px rgba(245, 158, 11, 0.4)' : 'none', transition: 'all 0.15s ease' }}>
                <input type="checkbox" checked={productForm.is_featured} onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })} style={{ display: 'none' }} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill={productForm.is_featured ? '#f59e0b' : 'none'} stroke={productForm.is_featured ? '#d97706' : 'currentColor'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Featured
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', border: productForm.is_active ? '2px solid #16a34a' : '2px solid var(--gray-200, #e5e7eb)', background: productForm.is_active ? '#f0fdf4' : 'transparent', color: productForm.is_active ? '#15803d' : 'var(--gray-600, #4b5563)', transition: 'all 0.15s ease' }}>
                <input type="checkbox" checked={productForm.is_active} onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })} style={{ display: 'none' }} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {productForm.is_active ? <polyline points="20 6 9 17 4 12"></polyline> : <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>}
                </svg>
                {productForm.is_active ? 'Active' : 'Inactive'}
              </label>
            </div>
            <button type="submit" className="btn btn-primary">{editingProduct ? 'Update Product' : 'Create Product'}</button>
          </form>
        </div>
      )}

      {showBulkPricing && (
        <div className="account-form-card bulk-pricing-card">
          <h3>Bulk Pricing - {selectedProducts.length} Products Selected</h3>
          <p className="hint">Set prices for all selected products at once. Leave a field empty to keep existing values unchanged.</p>
          <form onSubmit={handleBulkPricingSubmit} className="account-form">
            <div className="form-row-3">
              <div className="form-group"><label htmlFor="bulk_public_price">Public Price</label><input type="number" id="bulk_public_price" step="0.01" min="0" value={bulkPricingForm.public_price} onChange={(e) => setBulkPricingForm({ ...bulkPricingForm, public_price: e.target.value })} placeholder="Leave empty to skip" /></div>
              <div className="form-group"><label htmlFor="bulk_wholesale_price">School Price</label><input type="number" id="bulk_wholesale_price" step="0.01" min="0" value={bulkPricingForm.wholesale_price} onChange={(e) => setBulkPricingForm({ ...bulkPricingForm, wholesale_price: e.target.value })} placeholder="Leave empty to skip" /></div>
              <div className="form-group"><label htmlFor="bulk_dealer_price">Dealer Price</label><input type="number" id="bulk_dealer_price" step="0.01" min="0" value={bulkPricingForm.dealer_price} onChange={(e) => setBulkPricingForm({ ...bulkPricingForm, dealer_price: e.target.value })} placeholder="Leave empty to skip" /></div>
            </div>
            <div className="selected-products-preview">
              <strong>Selected Products:</strong>
              <div className="selected-skus">
                {selectedProducts.slice(0, 10).map(p => <span key={p.id} className="sku-tag">{p.id}</span>)}
                {selectedProducts.length > 10 && <span className="sku-tag">+{selectedProducts.length - 10} more</span>}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={bulkPricingLoading}>{bulkPricingLoading ? 'Applying...' : 'Apply Pricing'}</button>
              <button type="button" className="btn btn-outline" onClick={() => { setShowBulkPricing(false); setBulkPricingForm({ public_price: '', wholesale_price: '', dealer_price: '' }); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-filters">
        <input type="text" placeholder="Search by SKU, name, or description..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setProductsPage(0); fetchProducts(0); } }} className="admin-search" />
        <select value={pricingFilter} onChange={(e) => { setPricingFilter(e.target.value); setProductsPage(0); setTimeout(() => fetchProducts(0), 0); }} className="admin-select">
          <option value="">All Products</option>
          <option value="with">With Pricing</option>
          <option value="without">Without Pricing</option>
        </select>
        <button onClick={() => { setProductsPage(0); fetchProducts(0); }} className="btn btn-small">Search</button>
        {selectedProducts.length > 0 && (
          <>
            <button onClick={() => setShowBulkPricing(true)} className="btn btn-small btn-primary">Set Pricing ({selectedProducts.length})</button>
            <button onClick={clearProductSelection} className="btn btn-small btn-outline">Clear Selection</button>
          </>
        )}
      </div>

      <div className="products-header">
        <h3>Products ({productsTotal})</h3>
        {products.length > 0 && (
          <button onClick={selectedProducts.length === products.length ? clearProductSelection : selectAllProducts} className="btn btn-small btn-outline">
            {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table products-table">
          <thead>
            <tr>
              <th className="col-checkbox"><input type="checkbox" checked={products.length > 0 && selectedProducts.length === products.length} onChange={() => selectedProducts.length === products.length ? clearProductSelection() : selectAllProducts()} title="Select all" /></th>
              <th>SKU</th><th>Name</th><th className="col-brand">Brand</th><th className="col-category">Category</th>
              <th className="col-price">Public</th><th className="col-price">School</th><th className="col-price">Dealer</th>
              <th>Status</th><th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={selectedProducts.find(sp => sp.id === p.id) ? 'selected-row' : ''}>
                <td className="col-checkbox"><input type="checkbox" checked={!!selectedProducts.find(sp => sp.id === p.id)} onChange={() => toggleProductSelection(p)} /></td>
                <td title={p.id}><strong>{p.id}</strong></td>
                <td className="col-name" title={p.name}>{p.name}{p.badge === 'new' && <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '10px', fontWeight: '600', background: '#2563eb', color: '#fff', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New</span>}</td>
                <td className="col-brand" title={p.brand ? (catalogBrands.find(b => b.id === p.brand)?.name || p.brand) : ''}>
                  {p.brand ? (catalogBrands.find(b => b.id === p.brand)?.name || p.brand) : <span className="no-price">-</span>}
                </td>
                <td className="col-category" title={p.category ? (catalogCategories.find(c => c.id === p.category)?.name || p.category) : ''}>
                  {p.category ? (catalogCategories.find(c => c.id === p.category)?.name || p.category) : <span className="no-price">-</span>}
                </td>
                <td className="col-price">{p.public_price != null ? <span className="price">${parseFloat(p.public_price).toFixed(2)}</span> : <span className="no-price">-</span>}</td>
                <td className="col-price">{p.wholesale_price != null ? <span className="price">${parseFloat(p.wholesale_price).toFixed(2)}</span> : <span className="no-price">-</span>}</td>
                <td className="col-price">{p.dealer_price != null ? <span className="price">${parseFloat(p.dealer_price).toFixed(2)}</span> : <span className="no-price">-</span>}</td>
                <td>
                  <label className="toggle-switch" title={p.is_active ? 'Click to hide' : 'Click to activate'}>
                    <input type="checkbox" checked={!!p.is_active} onChange={() => toggleProductActive(p)} />
                    <span className={`tier-badge ${p.is_active ? 'tier-dealer' : 'tier-public'}`}>{p.is_active ? 'Active' : 'Hidden'}</span>
                  </label>
                </td>
                <td className="col-actions">
                  <div className="action-buttons">
                    <a href={`/product/${encodeURIComponent(p.id)}`} target="_blank" rel="noopener noreferrer" className="btn btn-small btn-secondary">Show</a>
                    <button onClick={() => editProduct(p)} className="btn btn-small btn-outline">Edit</button>
                    <button onClick={() => deleteProduct(p.id, p.name)} className="btn btn-small btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="10" className="no-data">No products found. Add products or run the migration.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pagination-controls">
        <div className="pagination-left">
          <span className="pagination-info">
            {productsPerPage === 'all' ? <>Showing all {productsTotal} products</> : <>Showing {Math.min(productsPage * productsPerPage + 1, productsTotal)}&ndash;{Math.min((productsPage + 1) * productsPerPage, productsTotal)} of {productsTotal} products</>}
          </span>
        </div>
        <div className="pagination-center">
          {productsPerPage !== 'all' && productsTotal > productsPerPage && (
            <div className="pagination-nav">
              <button className="btn btn-small btn-outline" onClick={() => { setProductsPage(0); fetchProducts(0); }} disabled={productsLoading || productsPage === 0} title="First page">&laquo;</button>
              <button className="btn btn-small btn-outline" onClick={() => { const pg = productsPage - 1; setProductsPage(pg); fetchProducts(pg); }} disabled={productsLoading || productsPage === 0}>Previous</button>
              <span className="pagination-page-info">Page {productsPage + 1} of {Math.ceil(productsTotal / productsPerPage)}</span>
              <button className="btn btn-small btn-outline" onClick={() => { const pg = productsPage + 1; setProductsPage(pg); fetchProducts(pg); }} disabled={productsLoading || (productsPage + 1) >= Math.ceil(productsTotal / productsPerPage)}>Next</button>
              <button className="btn btn-small btn-outline" onClick={() => { const last = Math.ceil(productsTotal / productsPerPage) - 1; setProductsPage(last); fetchProducts(last); }} disabled={productsLoading || (productsPage + 1) >= Math.ceil(productsTotal / productsPerPage)} title="Last page">&raquo;</button>
            </div>
          )}
        </div>
        <div className="pagination-right">
          <div className="pagination-per-page">
            <label htmlFor="products-per-page">Show:</label>
            <select id="products-per-page" value={productsPerPage}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setProductsPerPage(val);
                setProductsPage(0);
                productsPerPageRef.current = val;
                productsPageRef.current = 0;
                fetchProducts(0);
              }}
              className="admin-select pagination-select">
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
              <option value="all">All</option>
            </select>
          </div>
          <button className="btn btn-small btn-outline" onClick={() => fetchProducts()} disabled={productsLoading}>{productsLoading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
    </div>
  );
}
