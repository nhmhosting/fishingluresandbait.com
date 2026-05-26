import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

function Account() {
  const { user, loading, logout, updateProfile } = useAuth();
  const s = useSiteSettings();
  const navigate = useNavigate();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    company: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Prevent search engine indexing of auth pages
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  // Auth redirect is now handled by ProtectedRoute in App.jsx

  // Initialize edit form when user data is available
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        company: user.company || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name || '',
      company: user.company || '',
      phone: user.phone || '',
    });
    setError('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Only send fields that have changed
      const updates = {};
      if (editForm.name !== user.name) {
        updates.name = editForm.name;
      }
      if (editForm.company !== (user.company || '')) {
        updates.company = editForm.company;
      }
      if (editForm.phone !== (user.phone || '')) {
        updates.phone = editForm.phone;
      }

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      const result = await updateProfile(updates);

      if (result.success) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="account-page">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tierLabels = {
    public: 'Standard',
    school: 'School',
    wholesale: 'School',
    dealer: 'Dealer',
    admin: 'Administrator',
  };

  const tierDescriptions = {
    public: 'Contact us to request pricing access.',
    school: 'You have access to school pricing on all products.',
    wholesale: 'You have access to school pricing on all products.',
    dealer: 'You have access to dealer pricing on all products.',
    admin: 'You have full administrative access.',
  };

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-header">
          <h1>My Account</h1>
          <button onClick={handleLogout} className="btn btn-outline logout-btn">
            Sign Out
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Admin Tools Bar - shown at top for admins */}
        {user.tier === 'admin' && (
          <div className="admin-toolbar">
            <div className="admin-toolbar-content">
              <div className="admin-toolbar-info">
                <span className="admin-toolbar-icon">⚙️</span>
                <div className="admin-toolbar-text">
                  <span className="admin-toolbar-title">Admin Tools</span>
                  <span className="admin-toolbar-subtitle">Manage users, products, pricing, and customer carts</span>
                </div>
              </div>
              <div className="admin-toolbar-actions">
                <Link to="/admin" className="btn btn-admin">
                  Open Dashboard
                </Link>
                <Link to="/admin?tab=users" className="btn btn-admin-outline">
                  Users
                </Link>
                <Link to="/admin?tab=carts" className="btn btn-admin-outline">
                  Carts
                </Link>
                <Link to="/admin?tab=inventory" className="btn btn-admin-outline">
                  Inventory
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="account-grid">
          {/* Profile Information Card */}
          <div className="account-card profile-card">
            <div className="card-header">
              <h2>Profile Information</h2>
              {!isEditing && (
                <button onClick={handleEditClick} className="btn btn-small btn-outline">
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="disabled-input"
                  />
                  <span className="field-hint">Email cannot be changed</span>
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company (optional)</label>
                  <input
                    type="text"
                    id="company"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    maxLength={100}
                    placeholder="Your company name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone (optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    maxLength={30}
                    placeholder="Your phone number"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="btn btn-outline" disabled={saving}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{user.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email}</span>
                </div>
                {user.company && (
                  <div className="info-row">
                    <span className="info-label">Company</span>
                    <span className="info-value">{user.company}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{user.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Status Card */}
          <div className="account-card status-card">
            <h2>Account Status</h2>
            <div className="status-info">
              <div className="status-badge" data-tier={user.tier}>
                Activated
              </div>
              <p className="status-description">
                {tierDescriptions[user.tier] || tierDescriptions.public}
              </p>
              {user.tier === 'public' && (
                <p className="status-note">
                  Need faster activation? Call us at <a href={`tel:${s.contact_phone_sales}`}>{s.contact_phone_sales}</a>.
                </p>
              )}
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="account-card links-card">
            <h2>Quick Links</h2>
            <div className="quick-links">
              <Link to="/cart" className="quick-link">
                <span className="quick-link-icon">🛒</span>
                <span>View Cart</span>
              </Link>
              <Link to="/shop" className="quick-link">
                <span className="quick-link-icon">🔧</span>
                <span>Browse Parts</span>
              </Link>
              <Link to="/contact" className="quick-link">
                <span className="quick-link-icon">📧</span>
                <span>Contact Us</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Account;
