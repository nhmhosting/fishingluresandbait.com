import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state, or default to home
  // Validate redirect is a safe relative path (prevent open redirect attacks)
  const rawFrom = location.state?.from?.pathname || '/';
  const from = (rawFrom.startsWith('/') && !rawFrom.startsWith('//') && !rawFrom.includes(':\\')) ? rawFrom : '/';

  // Prevent search engine indexing of auth pages
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const result = await login(email, password, rememberMe);

    if (result.success) {
      navigate(from, { replace: true });
      return; // Component will unmount - don't update state after navigation
    }

    setErrorMessage(result.error || 'Login failed. Please try again.');
    setIsSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Sign In</h1>
          <p>Welcome back! Please sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMessage && (
            <div className="auth-error">
              {errorMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group password-field-wrapper">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                aria-describedby="login-password-hint"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => {
                  const input = document.getElementById('password');
                  if (input) {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    const btn = e.currentTarget;
                    btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
                    btn.setAttribute('aria-pressed', String(isPassword));
                    const svg = btn.querySelector('svg');
                    if (svg) {
                      if (isPassword) {
                        svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />';
                      } else {
                        svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />';
                      }
                    }
                  }
                }}
                aria-label="Show password"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <span id="login-password-hint" className="visually-hidden">Enter your account password</span>
          </div>

          <div className="form-group remember-me">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Stay signed in</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="forgot-password-link">
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>

          <p className="consent-notice">
            By signing in, you consent to the use of cookies to keep you logged in and
            acknowledge that your cart activity may be accessed to provide a better shopping experience.
          </p>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>

        <div className="auth-benefits">
          <h3>Account Benefits</h3>
          <ul>
            <li>Save your cart across devices</li>
            <li>View order history</li>
            <li>Access pricing (approved accounts)</li>
            <li>Faster quote requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
