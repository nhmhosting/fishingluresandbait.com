import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

function Footer() {
  const s = useSiteSettings();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Custom Bus & Truck Panels</h4>
            <p>{s.footer_description}</p>
            <div className="footer-contact">
              <p><strong>Sales:</strong> <a href={`tel:${s.contact_phone_sales}`}>{s.contact_phone_sales}</a></p>
              <p><strong>Shop:</strong> <a href={`tel:${s.contact_phone_shop}`}>{s.contact_phone_shop}</a></p>
              <p><strong>Email:</strong> <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a></p>
            </div>
          </div>
          <div className="footer-col">
            <h4>Information</h4>
            <ul>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/shipping">Shipping</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/payment-methods">Payment Methods</Link></li>
              <li><Link to="/returns">Returns</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Custom Bus & Truck Panels Inc - All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
