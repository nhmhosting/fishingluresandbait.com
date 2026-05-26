import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function ProductCard({ product, onQuickView }) {
  const { addItem, openCart } = useCart();
  const { user } = useAuth();

  const isInquiryOnly = product.name?.includes('*') || product.id?.includes('*');

  const displayPrice = product.price_available ? product.price : (product.price > 0 ? product.price : null);
  const priceDisplay = displayPrice
    ? `$${parseFloat(displayPrice).toFixed(2)}`
    : !user
      ? <Link to="/login" className="price-inquiry">Login for pricing</Link>
      : user.tier === 'public'
        ? <span className="price-inquiry">Upgrade account for pricing</span>
        : <span className="price-inquiry">Price on request</span>;

  const productUrl = `/product/${encodeURIComponent(product.id)}`;
  const image = product.image;

  return (
    <div className="product-card">
      <div className="product-image">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <Link to={productUrl}>
          {image ? (
            <img src={image} alt={`${product.name} - school bus replacement part`} loading="lazy" decoding="async" />
          ) : (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          )}
        </Link>
        <div className="product-actions">
          <button
            className="product-action-btn"
            title="Quick View"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-title">
          <Link to={productUrl} style={{ color: 'inherit', textDecoration: 'none' }}>
            {product.name}
          </Link>
        </h3>
        <p className="product-id">Part #: {product.id}</p>
        {product.material && (
          <p className="product-material">Material: {product.material}</p>
        )}
        <div className="product-price">{priceDisplay}</div>
        <div className="product-card-actions">
          {isInquiryOnly ? (
            <span className="add-to-cart-btn inquiry-only-btn" title="Contact us to order this part">
              Contact for Quote
            </span>
          ) : (
            <button className="add-to-cart-btn" onClick={() => addItem(product.id, 1, product)}>
              Add to Cart
            </button>
          )}
          {!isInquiryOnly && (
            <button className="show-cart-btn" onClick={openCart}>
              Show Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
