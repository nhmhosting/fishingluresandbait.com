import { useCookieConsent } from '../context/CookieContext';

function CookieBanner() {
  const { showBanner, acceptCookies, declineCookies } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent" aria-describedby="cookie-description">
      <div className="cookie-banner-content">
        <p id="cookie-description">
          We use cookies to enhance your browsing experience and analyze site traffic.
          By clicking "Accept", you consent to the use of cookies as described in our Privacy Policy.
          Under GDPR (EU) and CCPA (California), you have the right to decline non-essential cookies.
          No cookies are set until you make a choice.
        </p>
        <div className="cookie-banner-actions">
          <button
            onClick={declineCookies}
            className="cookie-btn cookie-btn-decline"
            aria-label="Decline non-essential cookies"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="cookie-btn cookie-btn-accept"
            aria-label="Accept all cookies"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
