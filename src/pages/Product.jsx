import { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductById, getProductBySlug } from '../data/products';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import SEO from '../components/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';
import QuoteForm from '../components/QuoteForm';

const API_BASE = '/api';

function Product() {
  const { slug } = useParams();
  const s = useSiteSettings();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Scroll to top and reset image when product page loads
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActiveImage(0);
  }, [slug]);

  // Fetch product from API, fall back to static file
  useEffect(() => {
    async function fetchProduct() {
      // Get the ID to look up - prefer slug param, fall back to query param
      const lookupId = slug || productId;
      if (!lookupId) {
        setIsLoading(false);
        setError('No product ID provided');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Try API first
        let foundProduct = null;
        try {
          const response = await fetch(`${API_BASE}/products/${encodeURIComponent(lookupId)}`);
          if (response.ok) {
            const data = await response.json();
            foundProduct = data.product;
          }
          // If not found by slug, try uppercase (SKU format)
          if (!foundProduct) {
            const response2 = await fetch(`${API_BASE}/products/${encodeURIComponent(lookupId.toUpperCase())}`);
            if (response2.ok) {
              const data2 = await response2.json();
              foundProduct = data2.product;
            }
          }
        } catch (apiErr) {
          console.warn('API fetch failed, trying static file:', apiErr);
        }

        // Fall back to static file ONLY if API didn't return a product
        // (e.g. API is unreachable or product doesn't exist in DB yet)
        if (!foundProduct) {
          const staticProduct = getProductBySlug(lookupId) || getProductById(lookupId) || getProductById(lookupId.toUpperCase());
          if (staticProduct) {
            foundProduct = staticProduct;
          }
        }

        if (foundProduct) {
          setProduct(foundProduct);
          setError(null);
        } else {
          setProduct(null);
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [slug, productId]);

  // Separate pricing effect — re-runs whenever the product or user tier changes,
  // including when auth finishes loading after the product is already on screen.
  useEffect(() => {
    if (!product?.id || authLoading) return;
    setPricing(null);
    fetch(`${API_BASE}/pricing/${encodeURIComponent(product.id)}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPricing(data); })
      .catch(err => console.warn('Could not fetch pricing:', err));
  }, [product?.id, authLoading, user?.tier]);

  const { addItem, openCart } = useCart();

  if (isLoading) {
    return (
      <>
        <section className="page-header">
          <div className="container">
            <h1>Loading...</h1>
            <p>Please wait while we load the product details.</p>
          </div>
        </section>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <section className="page-header">
          <div className="container">
            <h1>Product Not Found</h1>
            <p>{error || 'The product you\'re looking for could not be found.'}</p>
          </div>
        </section>
        <section className="about-section">
          <div className="container" style={{ textAlign: 'center' }}>
            <Link to="/shop" className="btn btn-primary">Browse All Products</Link>
          </div>
        </section>
      </>
    );
  }

  const brandDisplay = product.brand
    ? product.brand.charAt(0).toUpperCase() + product.brand.slice(1)
    : 'Universal';
  const categoryDisplay = product.category
    ? product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'General';

  // Determine price based on user tier and pricing data
  const getDisplayPrice = () => {
    if (!pricing || !pricing.price) {
      return null;
    }
    return pricing.price;
  };

  const displayPrice = getDisplayPrice();
  const priceDisplay = displayPrice
    ? `$${parseFloat(displayPrice).toFixed(2)}`
    : !user
      ? <Link to="/login" className="price-inquiry">Login for pricing</Link>
      : user.tier === 'public'
        ? <span className="price-inquiry">Upgrade account for pricing</span>
        : <span className="price-inquiry">Price on request — contact us</span>;

  const isInquiryOnly = product.name?.includes('*') || product.id?.includes('*');

  const handleAddToCart = () => {
    addItem(product.id, 1, product);
  };

  // SEO description - strip HTML tags for meta
  const plainDescription = product.description
    ? product.description.replace(/<[^>]*>/g, '')
    : '';
  const baseDescription = plainDescription || `${product.name} - Quality ${product.material || 'replacement'} school bus panel for ${brandDisplay} buses. Part #${product.id}.`;
  const seoDescription = baseDescription.length < 70
    ? `${baseDescription} Order replacement bus body panels and repair parts from Custom Bus and Truck Panels.`.substring(0, 160)
    : baseDescription.substring(0, 160);

  return (
    <>
      <SEO
        title={`${product.name} - Part #${product.id}`}
        description={seoDescription}
        canonical={`/product/${product.id}`}
        image={product.image}
        type="product"
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          brand: product.brand,
          image: product.image,
          price: displayPrice,
        }}
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>{product.name}</h1>
          <p>Part #: {product.id}</p>
        </div>
      </section>

      {/* Product Details */}
      <section className="about-section">
        <div className="container">
          <div className="quick-view-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
            <div className="product-detail-image">
              {(() => {
                const images = (product.images && product.images.length > 0) ? product.images : [product.image].filter(Boolean);
                const currentImage = images[activeImage] || null;

                if (currentImage) {
                  return (
                    <>
                      <img
                        src={currentImage}
                        alt={`${product.name} - ${brandDisplay} school bus replacement part #${product.id}${activeImage > 0 ? ` - image ${activeImage + 1}` : ''}`}
                        style={{
                          width: '100%',
                          maxHeight: '70vh',
                          objectFit: 'contain',
                          borderRadius: '12px',
                          boxShadow: 'var(--shadow-md)'
                        }}
                      />
                      {images.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImage(idx)}
                              style={{
                                width: '72px',
                                height: '72px',
                                padding: '4px',
                                border: activeImage === idx ? '2px solid var(--primary, #d97706)' : '2px solid var(--gray-300, #d1d5db)',
                                borderRadius: '8px',
                                background: 'var(--white, #fff)',
                                cursor: 'pointer',
                                opacity: activeImage === idx ? 1 : 0.7,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                }

                return (
                  <div
                    className="placeholder-img"
                    style={{
                      width: '100%',
                      height: '400px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--gray-100)',
                      borderRadius: '12px'
                    }}
                  >
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                );
              })()}
            </div>
            <div className="product-detail-info">
              {product.badge && <span className="product-detail-badge">{product.badge}</span>}
              <h2>{product.name}</h2>
              <p className="quick-view-id" style={{ fontSize: '16px', marginBottom: '12px' }}>
                Part #: <strong>{product.id}</strong>
              </p>
              <p className="quick-view-brand" style={{ fontSize: '16px', marginBottom: '12px' }}>
                Brand: <strong>{brandDisplay}</strong>
              </p>
              <p className="quick-view-category" style={{ fontSize: '16px', marginBottom: '12px' }}>
                Category: <strong>{categoryDisplay}</strong>
              </p>
              {product.material && (
                <p className="quick-view-material" style={{ fontSize: '16px', marginBottom: '12px' }}>
                  Material: <strong>{product.material}</strong>
                </p>
              )}
              <div className="quick-view-price" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
                {priceDisplay}
              </div>
              {product.description && (
                <div className="product-description" style={{ marginBottom: '24px', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', borderLeft: '4px solid var(--primary-600)' }}>
                  <p
                    style={{ margin: 0, lineHeight: '1.6', color: 'var(--gray-700)' }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
                  />
                </div>
              )}
              {!showQuoteForm && (
                <div className="product-detail-actions" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  {isInquiryOnly ? (
                    <>
                      <a href={`tel:${s.contact_phone_sales}`} className="btn btn-primary">
                        Call for Quote
                      </a>
                      <button className="btn btn-secondary" onClick={() => setShowQuoteForm(true)}>
                        Request Quote
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary" onClick={handleAddToCart}>
                        Add to Cart
                      </button>
                      <button className="btn btn-secondary" onClick={() => setShowQuoteForm(true)}>
                        Request Quote
                      </button>
                      <button className="btn btn-secondary" onClick={openCart}>
                        View Cart
                      </button>
                    </>
                  )}
                </div>
              )}
              {isInquiryOnly && !showQuoteForm && (
                <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px', padding: '10px 14px', background: '#fef9c3', borderRadius: '6px', border: '1px solid #fde047' }}>
                  This part requires a custom quote - please contact us to order.
                </p>
              )}
              {showQuoteForm && (
                <QuoteForm
                  product={product}
                  onClose={() => setShowQuoteForm(false)}
                />
              )}
              {!showQuoteForm && (
                <div className="product-detail-contact" style={{ padding: '20px', background: 'var(--gray-100)', borderRadius: '8px' }}>
                  <p style={{ marginBottom: '8px' }}><strong>Questions about this part?</strong></p>
                  <p>
                    Call <a href={`tel:${s.contact_phone_sales}`} style={{ fontWeight: '600' }}>{s.contact_phone_sales}</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Back to Shop */}
      <section className="about-section" style={{ paddingTop: '0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <Link to="/shop" className="btn btn-secondary">
            &larr; Back to Shop
          </Link>
        </div>
      </section>
    </>
  );
}

export default Product;
