import { createContext, useContext, useState, useEffect } from 'react';

const CookieContext = createContext();

const CONSENT_KEY = 'cbtp_cookie_consent';
const CART_KEY = 'cbtp_cart';

export function CookieProvider({ children }) {
  // Default to null (undecided) - no storage until user decides
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check localStorage first (user previously accepted)
    const persistentConsent = localStorage.getItem(CONSENT_KEY);
    if (persistentConsent === 'true') {
      setConsent(true);
      setShowBanner(false);
      return;
    }

    // Check sessionStorage (user declined this session)
    const sessionConsent = sessionStorage.getItem(CONSENT_KEY);
    if (sessionConsent === 'false') {
      setConsent(false);
      setShowBanner(false);
      return;
    }

    // No decision made yet - show banner
    setShowBanner(true);
  }, []);

  const acceptCookies = () => {
    setConsent(true);
    // Store consent in localStorage so it persists across browser sessions
    localStorage.setItem(CONSENT_KEY, 'true');
    // Clear any session-only consent
    sessionStorage.removeItem(CONSENT_KEY);
    setShowBanner(false);
    // Notify CartContext to migrate cart to localStorage
    window.dispatchEvent(new CustomEvent('cookieConsentAccepted'));
  };

  const declineCookies = () => {
    setConsent(false);
    // Store consent in sessionStorage only (clears when browser closes)
    sessionStorage.setItem(CONSENT_KEY, 'false');
    // Ensure no persistent consent stored
    localStorage.removeItem(CONSENT_KEY);
    // Clear any persistent cart data
    localStorage.removeItem(CART_KEY);
    setShowBanner(false);
    // Notify CartContext about decline (cart stays in sessionStorage)
    window.dispatchEvent(new CustomEvent('cookieConsentDeclined'));
    // Clear any non-essential cookies
    clearNonEssentialCookies();
  };

  const clearNonEssentialCookies = () => {
    // Get all cookies and clear non-essential ones
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName) {
        // Clear all cookies - we're not using any essential cookies
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    }
  };

  // Helper to check if tracking/analytics can run
  const canUseAnalytics = () => consent === true;

  return (
    <CookieContext.Provider value={{
      consent,
      showBanner,
      acceptCookies,
      declineCookies,
      canUseAnalytics
    }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
}
