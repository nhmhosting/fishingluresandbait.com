import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Prevent search engine indexing of auth pages
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }

    // Validate consent checkbox
    if (!consentChecked) {
      setErrorMessage('Please acknowledge the consent notice to create an account');
      setIsSubmitting(false);
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      company: formData.company || undefined,
      phone: formData.phone,
    });

    if (result.success) {
      navigate('/account', { replace: true });
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join us to save your cart and access exclusive pricing.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMessage && (
            <div className="auth-error">
              {errorMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-row">
            <div className="form-group password-field-wrapper">
              <label htmlFor="password">Password *</label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  aria-describedby="password-hint"
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
              <span id="password-hint" className="visually-hidden">Password must be at least 8 characters with letters and numbers</span>
            </div>

            <div className="form-group password-field-wrapper">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  aria-describedby="confirm-password-hint"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => {
                    const input = document.getElementById('confirmPassword');
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
                  aria-label="Show confirm password"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              <span id="confirm-password-hint" className="visually-hidden">Re-enter your password to confirm</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="company">Company Name (Optional)</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Your company name"
              autoComplete="organization"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 555-5555"
              required
              autoComplete="tel"
            />
          </div>

          <div className="form-group consent-group">
            <label className="consent-label">
              <input
                type="checkbox"
                id="consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span className="consent-text">
                I understand that by creating an account, cookies will be used to keep me signed in
                while on this website, and my cart activity may be accessed to provide a better
                shopping experience.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>

        <div className="auth-note">
          <p>
            After registration and refreshing the web page, contact us if pricing does not appear.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
