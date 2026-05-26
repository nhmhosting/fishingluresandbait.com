import { useCart } from '../context/CartContext';

function Notification() {
  const { notification, openCart, setNotification } = useCart();

  if (!notification) return null;

  const handleViewCart = () => {
    setNotification(null);
    openCart();
  };

  return (
    <div className="notification" role="status" aria-live="polite" aria-atomic="true">
      <div className="notification-message">{notification}</div>
      <button className="notification-view-cart" onClick={handleViewCart} aria-label="View cart after adding items">
        View Cart
      </button>
    </div>
  );
}

export default Notification;
