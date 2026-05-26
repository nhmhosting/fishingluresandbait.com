import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const API_BASE = '/api';

// Module-level cache - survives component unmount/remount (navigation)
// Prevents mobile freezing on second visit by reusing cached data
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const shopCache = {
  products: null,
  productsTimestamp: 0,
  productsUserId: null,
  productsUserTier: null,
  categories: null,
  categoriesTimestamp: 0,
};

// Local search function for filtering products
function searchProductsLocal(products, query) {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return products;

  return products.filter(product => {
    const searchFields = [
      product.id,
      product.name,
      product.description,
      product.brand,
      product.category,
      ...(product.categories || []),
      ...(product.category_ids || [])
    ].filter(Boolean).map(f => f.toLowerCase());

    return searchFields.some(field => field.includes(normalizedQuery));
  });
}

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('name');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (searchTerm === debouncedSearch) return;
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  // Products state - fetched from API
  const [products, setProducts] = useState(() => shopCache.products || []);
  const [isLoading, setIsLoading] = useState(() => !shopCache.products);
  const [error, setError] = useState('');

  // Categories state - fetched from API only
  const [categories, setCategories] = useState(() => shopCache.categories || [{ id: 'all', name: 'All Products' }]);

  const { user } = useAuth();
  const s = useSiteSettings();

  const fetchingProducts = useRef(false);
  const fetchingCategories = useRef(false);

  const userId = user?.id || null;
  const userTier = user?.tier || null;

  useEffect(() => {
    const now = Date.now();
    const cacheValid = shopCache.products &&
      (now - shopCache.productsTimestamp < CACHE_TTL) &&
      shopCache.productsUserId === userId &&
      shopCache.productsUserTier === userTier;

    if (cacheValid && products.length > 0) {
      setIsLoading(false);
      return;
    }

    if (fetchingProducts.current) return;

    async function fetchProducts() {
      fetchingProducts.current = true;
      try {
        if (!shopCache.products) {
          setIsLoading(true);
        }
        setError('');

        let apiProducts = [];
        try {
          const response = await fetch(`${API_BASE}/products?limit=1000`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            apiProducts = data.products || [];
          } else {
            setError('Failed to load products. Please try again later.');
          }
        } catch (apiErr) {
          console.warn('API fetch failed:', apiErr);
          setError('Unable to connect to the server. Please check your connection and try again.');
        }

        shopCache.products = apiProducts;
        shopCache.productsTimestamp = Date.now();
        shopCache.productsUserId = userId;
        shopCache.productsUserTier = userTier;

        setProducts(apiProducts);
      } catch (err) {
        console.error('Error loading products:', err);
        setProducts([]);
      } finally {
        setIsLoading(false);
        fetchingProducts.current = false;
      }
    }
    fetchProducts();
  }, [userId, userTier]);

  // Fetch categories from API
  useEffect(() => {
    const now = Date.now();
    const cacheValid = shopCache.categories && (now - shopCache.categoriesTimestamp < CACHE_TTL);
    if (cacheValid) return;
    if (fetchingCategories.current) return;

    async function fetchCategories() {
      fetchingCategories.current = true;
      try {
        const response = await fetch(`${API_BASE}/products/categories`);
        if (response.ok) {
          const data = await response.json();
          if (data.categories && data.categories.length > 0) {
            const apiCategories = [
              { id: 'all', name: 'All Products' },
              ...data.categories.map(c => ({
                id: c.id,
                name: c.name,
              })),
            ];
            shopCache.categories = apiCategories;
            shopCache.categoriesTimestamp = Date.now();
            setCategories(apiCategories);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch categories, using static fallback:', err);
      } finally {
        fetchingCategories.current = false;
      }
    }
    fetchCategories();
  }, []);

  // Calculate category counts based on search filters
  const categoryCounts = useMemo(() => {
    const baseProducts = debouncedSearch ? searchProductsLocal(products, debouncedSearch) : products;
    const counts = { all: baseProducts.length };

    for (const p of baseProducts) {
      const cats = new Set();
      if (p.category) cats.add(p.category);
      if (p.category_ids) {
        for (const catId of p.category_ids) cats.add(catId);
      }
      for (const catId of cats) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    }

    return counts;
  }, [debouncedSearch, products]);

  // Show all backend categories, sorted alphabetically
  const filteredCategories = useMemo(() => {
    let relevantCategories = [...categories];

    // Sort alphabetically by name, keeping 'all' at the beginning
    relevantCategories.sort((a, b) => {
      if (a.id === 'all') return -1;
      if (b.id === 'all') return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    return relevantCategories;
  }, [categoryCounts, categories]);

  const toggleFilter = (filter) => {
    setExpandedFilter(expandedFilter === filter ? null : filter);
  };

  const handleCategorySelect = (value) => {
    setSelectedCategory(value);
    setExpandedFilter(null);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);

    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();
    if (newParamsString !== currentParamsString) {
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearch, selectedCategory]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = debouncedSearch ? searchProductsLocal(products, debouncedSearch) : [...products];

    if (selectedCategory !== 'all') {
      result = result.filter(p =>
        (p.category_ids && p.category_ids.includes(selectedCategory)) ||
        p.category === selectedCategory
      );
    }

    result.sort((a, b) => {
      const nameA = (a.name || a.id || '').toLowerCase();
      const nameB = (b.name || b.id || '').toLowerCase();
      return sortBy === 'name-desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    });

    return result;
  }, [debouncedSearch, selectedCategory, sortBy, products]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearch('');
    clearTimeout(debounceTimer.current);
    setSelectedCategory('all');
  }, []);

  useEffect(() => {
    window.addEventListener('shop:reset-filters', clearFilters);
    return () => window.removeEventListener('shop:reset-filters', clearFilters);
  }, [clearFilters]);

  const hasActiveFilters = searchTerm || selectedCategory !== 'all';

  // Progressive rendering: show products in batches to prevent mobile freezing
  const INITIAL_BATCH = 48;
  const LOAD_MORE_BATCH = 48;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [debouncedSearch, selectedCategory, sortBy]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMore = visibleCount < filteredProducts.length;

  return (
    <>
      <SEO
        title={s.seo_shop_title}
        description={s.seo_shop_description}
        canonical="/shop"
      />
      {/* Compact Shop Header with Search */}
      <section className="shop-header-compact">
        <div className="container">
          <div className="shop-header-content">
            <h1>Shop School Bus Parts</h1>
            <div className="shop-search-large" role="search">
              <svg className="search-icon-large" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search school bus parts by part number or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search products"
                aria-controls="products-grid"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')} aria-label="Clear search">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Compact Filters Bar */}
      <section className="filters-bar">
        <div className="container">
          {/* Desktop Filter Dropdowns (hidden on mobile) */}
          <div className="filters-row filters-desktop">
            <div className="desktop-filter-row">
              {/* Category Dropdown */}
              <div className={`desktop-filter-dropdown ${expandedFilter === 'category' ? 'expanded' : ''}`}>
                <button
                  className="desktop-filter-toggle"
                  onClick={() => toggleFilter('category')}
                >
                  <span className="desktop-filter-label">
                    Category: <strong>{filteredCategories.find(c => c.id === selectedCategory)?.name || 'All Products'}</strong>
                    <span className="desktop-filter-count">({categoryCounts[selectedCategory] || 0})</span>
                  </span>
                  <svg
                    className="desktop-filter-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {expandedFilter === 'category' && (
                  <div className="desktop-filter-options">
                    {filteredCategories.map(cat => (
                      <button
                        key={cat.id}
                        className={`desktop-filter-option ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(cat.id)}
                      >
                        <span>{cat.name} <span className="option-count">({categoryCounts[cat.id] || 0})</span></span>
                        {selectedCategory === cat.id && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Mobile Filter Dropdowns (hidden on desktop) */}
          <div className="filters-mobile">
            <div className="mobile-filter-row">
              {/* Category Dropdown */}
              <div className={`mobile-filter-dropdown ${expandedFilter === 'category' ? 'expanded' : ''}`}>
                <button
                  className="mobile-filter-toggle"
                  onClick={() => toggleFilter('category')}
                >
                  <span className="mobile-filter-label">
                    Category: <strong>{filteredCategories.find(c => c.id === selectedCategory)?.name || 'All Products'}</strong>
                    <span className="mobile-filter-count">({categoryCounts[selectedCategory] || 0})</span>
                  </span>
                  <svg
                    className="mobile-filter-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {expandedFilter === 'category' && (
                  <div className="mobile-filter-options">
                    {filteredCategories.map(cat => (
                      <button
                        key={cat.id}
                        className={`mobile-filter-option ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(cat.id)}
                      >
                        <span>{cat.name} <span className="option-count">({categoryCounts[cat.id] || 0})</span></span>
                        {selectedCategory === cat.id && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Shop Content */}
      <section className="shop-content">
        <div className="container">
          <h2 className="visually-hidden">Available School Bus Parts</h2>
          {/* Toolbar */}
          <div className="shop-toolbar-compact">
            <div className="toolbar-left">
              <span className="results-count-compact">
                <strong>{filteredProducts.length}</strong> products
              </span>
              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Clear filters
                </button>
              )}
            </div>
            <div className="toolbar-right">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select-compact"
              >
                <option value="name">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
              <Link to="/contact#contact-form" className="help-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Need Help?
              </Link>
            </div>
          </div>

          {/* Error State */}
          {error && !isLoading && (
            <div className="no-results">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>Error loading products</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>Try Again</button>
            </div>
          )}

          {/* Products Grid */}
          {!error && (
            <>
              <div className="products-grid products-grid-dense">
                {visibleProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
              {hasMore && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setVisibleCount(prev => Math.min(prev + LOAD_MORE_BATCH, filteredProducts.length))}
                  >
                    Load More ({filteredProducts.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          {!error && filteredProducts.length === 0 && !isLoading && (
            <div className="no-results">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear All Filters</button>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}

export default Shop;
