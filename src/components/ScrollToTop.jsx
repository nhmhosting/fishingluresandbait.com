import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls to the top of the page
 * when the route changes. Uses 'instant' behavior to override
 * any smooth scroll CSS settings.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use instant behavior to ensure scroll happens immediately
    // regardless of CSS scroll-behavior setting
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
