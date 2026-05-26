import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getCount, openCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const s = useSiteSettings();
  const location = useLocation();

  const handleShopClick = (e) => {
    if (location.pathname === '/shop') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('shop:reset-filters'));
    }
  };
  const cartCount = getCount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    const next = !mobileMenuOpen;
    setMobileMenuOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      {/* Top Bar */}
      <div className={`top-bar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="top-bar-content">
            <span className="business-hours">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Business Hours: {s.contact_business_hours_short}
            </span>
            <Link to="/contact" className="store-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {s.contact_address}
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`} role="banner">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <img src="/images/logo.webp" alt="Custom Bus & Truck Panels" className="logo-img" width="200" height="60" />
            </Link>

            <nav aria-label="Main navigation" className="main-nav">
              <NavLink to="/" end>Home</NavLink>
              <NavLink to="/about-us">About</NavLink>
              <NavLink to="/shop" onClick={handleShopClick}>Shop</NavLink>
              <NavLink to="/contact">Contact Us</NavLink>
              <NavLink to="/shipping">Shipping</NavLink>
            </nav>

            <div className="header-actions">
              <a href={`tel:${s.contact_phone_sales}`} className="phone-link">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{s.contact_phone_sales}</span>
              </a>
              <Link to={isAuthenticated ? "/account" : "/login"} className="account-link" aria-label={isAuthenticated ? "My Account" : "Sign In"}>
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {isAuthenticated && user?.name && (
                  <span className="account-name">{user.name.split(' ')[0]}</span>
                )}
              </Link>
              <button
                className="cart-btn"
                onClick={openCart}
                aria-label="Shopping cart"
                aria-expanded="false"
              >
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && <span className="cart-count" aria-label={`${cartCount} items in cart`}>{cartCount}</span>}
              </button>
              <button
                className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div id="mobile-menu" className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`} aria-label="Mobile navigation">
        <nav aria-label="Mobile menu">
          <NavLink to="/" end onClick={closeMobileMenu}>Home</NavLink>
          <NavLink to="/about-us" onClick={closeMobileMenu}>About</NavLink>
          <NavLink to="/shop" onClick={(e) => { handleShopClick(e); closeMobileMenu(); }}>Shop</NavLink>
          <NavLink to="/contact" onClick={closeMobileMenu}>Contact Us</NavLink>
          <NavLink to="/shipping" onClick={closeMobileMenu}>Shipping</NavLink>
          <div className="mobile-menu-divider"></div>
          {isAuthenticated ? (
            <NavLink to="/account" onClick={closeMobileMenu}>My Account</NavLink>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMobileMenu}>Sign In</NavLink>
              <NavLink to="/register" onClick={closeMobileMenu}>Create Account</NavLink>
            </>
          )}
        </nav>
      </div>
    </>
  );
}

export default Header;
