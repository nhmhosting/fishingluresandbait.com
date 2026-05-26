import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_KEY = 'cbtp_cart';
const CONSENT_KEY = 'cbtp_cookie_consent';
const API_BASE = '/api';

function safeParseCart(rawValue) {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Invalid cart data found in storage, resetting cart:', error);
    return [];
  }
}

function mapServerItems(serverItems) {
  return (serverItems || []).map(item => ({
    id: item.product_sku,
    name: item.product_name,
    image: item.product_image,
    quantity: item.quantity,
    price: item.price_at_add || 0,
  }));
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [usePersistentStorage, setUsePersistentStorage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CONSENT_KEY) === 'true';
    }
    return false;
  });

  const [items, setItems] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(CONSENT_KEY) === 'true') {
        return safeParseCart(localStorage.getItem(CART_KEY));
      }
      return safeParseCart(sessionStorage.getItem(CART_KEY));
    }
    return [];
  });

  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInProgress = useRef(false);
  // Stable ref so syncCartWithBackend doesn't need items in its dependency array
  const itemsRef = useRef(items);
  // Only fetch server cart once on initial auth resolution
  const hasFetchedOnMount = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Save cart to appropriate storage whenever items change
  useEffect(() => {
    if (usePersistentStorage) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } else {
      sessionStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, usePersistentStorage]);

  // Listen for cookie consent accepted - migrate cart to localStorage
  useEffect(() => {
    const handleConsentAccepted = () => {
      setUsePersistentStorage(true);
      const currentCart = sessionStorage.getItem(CART_KEY);
      if (currentCart) {
        localStorage.setItem(CART_KEY, currentCart);
        sessionStorage.removeItem(CART_KEY);
      } else {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
      }
    };

    window.addEventListener('cookieConsentAccepted', handleConsentAccepted);
    return () => {
      window.removeEventListener('cookieConsentAccepted', handleConsentAccepted);
    };
  }, [items]);

  // Listen for cookie consent declined - ensure using sessionStorage only
  useEffect(() => {
    const handleConsentDeclined = () => {
      setUsePersistentStorage(false);
    };

    window.addEventListener('cookieConsentDeclined', handleConsentDeclined);
    return () => {
      window.removeEventListener('cookieConsentDeclined', handleConsentDeclined);
    };
  }, []);

  // On initial auth resolution: if user already has an active session (cookie from
  // a prior visit), fetch the server cart as the authoritative source of truth.
  // This handles the case where userLoggedIn never fires because the user was
  // already authenticated when the page loaded.
  useEffect(() => {
    if (authLoading || hasFetchedOnMount.current) return;
    hasFetchedOnMount.current = true;
    if (!user) return;

    fetch(`${API_BASE}/cart`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) setItems(mapServerItems(data.items));
      })
      .catch(err => console.error('Cart fetch error:', err));
  }, [authLoading, user]);

  // Sync local cart with backend when user logs in (merges local guest items → server).
  // Uses itemsRef so this callback is stable and doesn't cause event listener churn.
  const syncCartWithBackend = useCallback(async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const currentItems = itemsRef.current;

      if (currentItems.length > 0) {
        // POST /cart/sync already returns the merged, repriced cart — use it directly.
        const syncResponse = await fetch(`${API_BASE}/cart/sync`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: currentItems.map(item => ({
              product_sku: item.id,
              product_name: item.name,
              product_image: item.image,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        });
        if (syncResponse.ok) {
          const data = await syncResponse.json();
          setItems(mapServerItems(data.items));
          return;
        }
      }

      // No local items or sync failed — just fetch server cart
      const response = await fetch(`${API_BASE}/cart`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setItems(mapServerItems(data.items));
      }
    } catch (error) {
      console.error('Cart sync error:', error);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, []); // stable — reads current items via itemsRef

  // Listen for user login and tier change events
  useEffect(() => {
    const handleUserLoggedIn = () => syncCartWithBackend();
    const handleTierChanged = () => syncCartWithBackend();

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('userTierChanged', handleTierChanged);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('userTierChanged', handleTierChanged);
    };
  }, [syncCartWithBackend]);

  // Sync item changes to backend if logged in.
  // Auth is handled via httpOnly cookie — syncs silently fail for unauthenticated users.
  const syncItemToBackend = useCallback(async (action, itemData) => {
    try {
      if (action === 'add') {
        await fetch(`${API_BASE}/cart/items`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_sku: itemData.id,
            product_name: itemData.name,
            product_image: itemData.image,
            quantity: itemData.quantity,
            price: itemData.price,
          }),
        });
      } else if (action === 'update') {
        const cartResponse = await fetch(`${API_BASE}/cart`, {
          credentials: 'include',
        });
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          const backendItem = cartData.items?.find(i => i.product_sku === itemData.id);
          if (backendItem) {
            await fetch(`${API_BASE}/cart/items/${backendItem.id}`, {
              method: 'PATCH',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: itemData.quantity }),
            });
          }
        }
      } else if (action === 'remove') {
        const cartResponse = await fetch(`${API_BASE}/cart`, {
          credentials: 'include',
        });
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          const backendItem = cartData.items?.find(i => i.product_sku === itemData.id);
          if (backendItem) {
            await fetch(`${API_BASE}/cart/items/${backendItem.id}`, {
              method: 'DELETE',
              credentials: 'include',
            });
          }
        }
      } else if (action === 'clear') {
        await fetch(`${API_BASE}/cart`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Backend sync error:', error);
    }
  }, []);

  const addItem = (productId, quantity = 1, productData = null) => {
    (async () => {
      const product = productData || (await import('../data/products')).getProductById(productId);
      if (!product) return;

      // Parts marked with * are inquiry-only and cannot be added to the cart
      if (product.name?.includes('*') || product.id?.includes('*')) {
        showNotification('This part requires a custom quote. Please contact us to order.');
        return;
      }

      // Always fetch the live price at add-time so the cart never stores a stale
      // price from a cached/shop-context product object. This ensures:
      //  - Guest-added items get the correct public price before login
      //  - Items added after a shop-cache invalidation still have correct prices
      //  - Tier changes that affect pricing are reflected immediately
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price || 0,
        image: product.image,
        quantity: quantity
      };

      let resolvedPrice = product.price || 0;
      try {
        const res = await fetch(`${API_BASE}/pricing/${encodeURIComponent(product.id)}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.price === 'number' && data.price > 0) {
            resolvedPrice = data.price;
          }
        }
      } catch {
        // Fall back to the price already on the product object
      }

      const pricedItem = { ...newItem, price: resolvedPrice };

      setItems(prevItems => {
        const existing = prevItems.find(item => item.id === productId);
        if (existing) {
          return prevItems.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prevItems, pricedItem];
        }
      });

      syncItemToBackend('add', pricedItem);
      showNotification(`${product.name} added to cart!`);
    })();
  };

  const removeItem = (productId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
    syncItemToBackend('remove', { id: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
      syncItemToBackend('update', { id: productId, quantity });
    }
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCart = () => {
    setItems([]);
    syncItemToBackend('clear', {});
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(prev => !prev);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      notification,
      isSyncing,
      addItem,
      removeItem,
      updateQuantity,
      getTotal,
      getCount,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      setNotification,
      syncCartWithBackend,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
