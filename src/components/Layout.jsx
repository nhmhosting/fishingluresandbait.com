import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import Notification from './Notification';
import CookieBanner from './CookieBanner';
import ScrollToTop from './ScrollToTop';

function Layout() {
  return (
    <>
      <ScrollToTop />
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header />
      <main id="main-content" role="main">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
      <Notification />
      <CookieBanner />
    </>
  );
}

export default Layout;
