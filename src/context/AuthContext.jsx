import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext();

const API_BASE = '/api';

// Proactively refresh the token every hour so sessions never expire for active users
const REFRESH_CHECK_INTERVAL_MS = 1 * 60 * 60 * 1000;

export function AuthProvider({ children }) {
  // No longer restore user from localStorage — rely on httpOnly cookie via /auth/me
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Holds the in-flight refresh Promise so concurrent callers share the same result
  // instead of returning false immediately and triggering a spurious sign-out
  const refreshPromiseRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Returns empty headers — auth is handled via httpOnly cookie (credentials: 'include').
  // Kept for backward compatibility with admin components that spread these into fetch options.
  const getAuthHeaders = useCallback(() => ({}), []);

  const refreshToken = useCallback(async () => {
    // If a refresh is already in flight, return the same promise so concurrent
    // callers share the result — prevents a false sign-out when one caller gets
    // an immediate `false` and interprets it as "refresh failed"
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const doRefresh = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (userRef.current && data.user && userRef.current.tier !== data.user.tier) {
            window.dispatchEvent(new CustomEvent('userTierChanged', { detail: data.user }));
          }
          setUser(data.user);
          return true;
        }

        return false;
      } catch (err) {
        console.error('Token refresh failed:', err);
        return false;
      } finally {
        refreshPromiseRef.current = null;
      }
    };

    refreshPromiseRef.current = doRefresh();
    return refreshPromiseRef.current;
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // Lightweight check — just verify the cookie is valid, no token rewrite.
      // The hourly interval and tab-focus handlers handle actual refresh.
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Fire the same tier-change event that refreshToken fires so the cart
        // and shop reprice immediately if the admin changed this user's tier.
        if (userRef.current && data.user && userRef.current.tier !== data.user.tier) {
          window.dispatchEvent(new CustomEvent('userTierChanged', { detail: data.user }));
        }
        setUser(data.user);
      } else if (response.status === 401) {
        // Token may be expired but refreshable — try a refresh before giving up
        const refreshed = await refreshToken();
        if (!refreshed) {
          setUser(null);
        }
      }
      // Non-401 errors (5xx, etc.) are treated as transient — don't sign the user
      // out, since their session is likely still valid and the error may be caused
      // by a brief deployment window or an intermittent server issue.
    } catch (err) {
      // Network error — same as above: leave user state unchanged rather than
      // signing them out over a connection blip.
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Periodically refresh the token in the background to prevent expiry
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshToken();
    }, REFRESH_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, refreshToken]);

  // Refresh token when user returns to the tab after being away
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, refreshToken]);

  // Cross-tab session sync via a lightweight localStorage signal
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_session_signal') {
        if (e.newValue === 'logout') {
          setUser(null);
        } else if (e.newValue === 'login' && !user) {
          checkAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, checkAuth]);

  const login = async (email, password, rememberMe = false) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Auth is handled via httpOnly cookie set by the server
      setUser(data.user);

      // Signal other tabs about the login
      try { localStorage.setItem('auth_session_signal', 'login'); } catch {}

      // Dispatch event for cart sync
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auth is handled via httpOnly cookie set by the server
      setUser(data.user);

      // Signal other tabs about the login
      try { localStorage.setItem('auth_session_signal', 'login'); } catch {}

      // Dispatch event for cart sync
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      // Clean up any legacy localStorage tokens
      try { localStorage.removeItem('auth_token'); } catch {}
      // Signal other tabs about the logout
      try { localStorage.setItem('auth_session_signal', 'logout'); } catch {}
      setUser(null);
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (token, userId, newPassword) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, userId, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.tier === 'admin';
  const isDealer = user?.tier === 'dealer' || user?.tier === 'admin';
  const isWholesale = user?.tier === 'school' || user?.tier === 'wholesale' || user?.tier === 'dealer' || user?.tier === 'admin';
  const canSeePricing = user?.tier && user.tier !== 'public';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      isDealer,
      isWholesale,
      canSeePricing,
      login,
      register,
      logout,
      refreshToken,
      getAuthHeaders,
      checkAuth,
      updateProfile,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
