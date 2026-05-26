import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If there's already a token in the URL, redirect to reset password
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');
  useEffect(() => {
    if (token && uid) {
      navigate(`/reset-password?token=${token}&uid=${uid}`);
    }
  }, [token, uid, navigate]);

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
    setSuccessMessage('');

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccessMessage(result.message || 'If an account with that email exists, a password reset link has been sent.');
    } else {
      setErrorMessage(result.error || 'Something went wrong. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Reset Your Password</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMessage && (
            <div className="auth-error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="auth-success" role="status">
              {successMessage}
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
              aria-describedby="email-hint"
            />
            <span id="email-hint" className="visually-hidden">
              Enter the email address associated with your account
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Sign in</Link></p>
        </div>

        <div className="auth-note">
          <p>
            <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
