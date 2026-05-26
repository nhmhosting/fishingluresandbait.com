import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../../config.js';

function formatPhoneNumber(phone) {
  if (!phone) return '-';

  const trimmed = String(phone).trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return trimmed;
}

export default function AdminUsers({
  authFetch,
  getAuthHeaders,
  setError,
  setSuccessMessage,
  currentUser,
  refreshStats,
}) {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [accountForm, setAccountForm] = useState({
    name: '', email: '', password: '', company: '', phone: '', pricing_tier: 'public',
  });
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userEditForm, setUserEditForm] = useState({ name: '', company: '', phone: '' });
  const [passwordResetUserId, setPasswordResetUserId] = useState(null);
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [passwordResetNew, setPasswordResetNew] = useState('');
  const [passwordResetConfirm, setPasswordResetConfirm] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [welcomeEmailUserId, setWelcomeEmailUserId] = useState(null);
  const [manageUser, setManageUser] = useState(null);
  const [manageTier, setManageTier] = useState('public');
  const [manageTierLoading, setManageTierLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (tierFilter) params.append('tier', tierFilter);
      params.append('limit', '100');

      const response = await authFetch(`${API_BASE}/admin/users?${params}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 401 || response.status === 403) {
        setError('Admin access denied. Try logging out and logging back in.');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [authFetch, getAuthHeaders, userSearch, tierFilter, setError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserTier = async (userId, newTier) => {
    setError('');
    setSuccessMessage('');
    try {
      const response = await authFetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pricing_tier: newTier }),
      });

      if (response.ok) {
        setSuccessMessage('User tier updated successfully');
        fetchUsers();
        refreshStats();
        setTimeout(() => setSuccessMessage(''), 3000);
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update user');
        return false;
      }
    } catch (err) {
      setError('Failed to update user tier');
      return false;
    }
  };

  const openManageUser = (u) => {
    setManageUser(u);
    setManageTier(u.pricing_tier || 'public');
  };

  const closeManageUser = () => {
    if (manageTierLoading) return;
    setManageUser(null);
    setManageTier('public');
  };

  const handleManageTierSave = async () => {
    if (!manageUser || manageTier === manageUser.pricing_tier) return;
    setManageTierLoading(true);
    const success = await updateUserTier(manageUser.id, manageTier);
    if (success) {
      setManageUser(prev => prev ? { ...prev, pricing_tier: manageTier } : prev);
    }
    setManageTierLoading(false);
  };

  const startEditUser = (u) => {
    setManageUser(null);
    setEditingUser(u);
    setUserEditForm({
      name: u.name || '',
      company: u.company || '',
      phone: u.phone || '',
    });
  };

  const cancelEditUser = () => {
    setEditingUser(null);
    setUserEditForm({ name: '', company: '', phone: '' });
  };

  const handleUserEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!userEditForm.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      const response = await authFetch(`${API_BASE}/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userEditForm.name.trim(),
          company: userEditForm.company.trim() || null,
          phone: userEditForm.phone.trim() || null,
        }),
      });

      if (response.ok) {
        setSuccessMessage('User updated successfully');
        cancelEditUser();
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!accountForm.name || !accountForm.email || !accountForm.password) {
      setError('Name, email, and password are required');
      return;
    }

    if (accountForm.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await authFetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: accountForm.name,
          email: accountForm.email,
          password: accountForm.password,
          company: accountForm.company || undefined,
          phone: accountForm.phone || undefined,
          pricing_tier: accountForm.pricing_tier,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Account created successfully');
        setAccountForm({
          name: '',
          email: '',
          password: '',
          company: '',
          phone: '',
          pricing_tier: 'public',
        });
        setShowAccountForm(false);
        fetchUsers();
        refreshStats();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setError('Failed to create account');
    }
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const response = await authFetch(`${API_BASE}/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setSuccessMessage('User deleted successfully');
        setDeleteTarget(null);
        fetchUsers();
        refreshStats();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordResetNew || passwordResetNew !== passwordResetConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (passwordResetNew.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setPasswordResetLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/admin/users/${passwordResetUserId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: passwordResetNew }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccessMessage(`Password reset successfully for ${passwordResetEmail}`);
      setPasswordResetUserId(null);
      setPasswordResetNew('');
      setPasswordResetConfirm('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const sendWelcomeEmail = async (user) => {
    if (!user?.id || !user?.email) return;
    setError('');
    setSuccessMessage('');
    setWelcomeEmailUserId(user.id);
    try {
      const res = await authFetch(`${API_BASE}/admin/users/${user.id}/send-welcome-email`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send welcome email');
      setSuccessMessage(`Welcome email sent to ${user.email}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to send welcome email');
    } finally {
      setWelcomeEmailUserId(null);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-action-bar">
        <button
          onClick={() => setShowAccountForm(!showAccountForm)}
          className="btn btn-primary"
        >
          {showAccountForm ? 'Cancel' : '+ Add Account'}
        </button>
      </div>

      {showAccountForm && (
        <div className="account-form-card">
          <h3>Create New Account</h3>
          <form onSubmit={handleAccountSubmit} className="account-form">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="acc_name">Name *</label>
                <input
                  type="text"
                  id="acc_name"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="acc_email">Email *</label>
                <input
                  type="email"
                  id="acc_email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="acc_password">Password *</label>
                <input
                  type="password"
                  id="acc_password"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="acc_tier">Pricing Tier</label>
                <select
                  id="acc_tier"
                  value={accountForm.pricing_tier}
                  onChange={(e) => setAccountForm({ ...accountForm, pricing_tier: e.target.value })}
                >
                  <option value="public">Public</option>
                  <option value="school">School</option>
                  <option value="dealer">Dealer</option>
                </select>
                <span className="hint">Admin accounts must be created via database</span>
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="acc_company">Company</label>
                <input
                  type="text"
                  id="acc_company"
                  value={accountForm.company}
                  onChange={(e) => setAccountForm({ ...accountForm, company: e.target.value })}
                  placeholder="Company name (optional)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="acc_phone">Phone</label>
                <input
                  type="tel"
                  id="acc_phone"
                  value={accountForm.phone}
                  onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                  placeholder="Phone number (optional)"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Create Account
            </button>
          </form>
        </div>
      )}

      {editingUser && (
        <div className="account-form-card">
          <h3>Edit User: {editingUser.email}</h3>
          <form onSubmit={handleUserEditSubmit} className="account-form">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="edit_name">Name *</label>
                <input
                  type="text"
                  id="edit_name"
                  value={userEditForm.name}
                  onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit_company">Company</label>
                <input
                  type="text"
                  id="edit_company"
                  value={userEditForm.company}
                  onChange={(e) => setUserEditForm({ ...userEditForm, company: e.target.value })}
                  placeholder="Company name (optional)"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="edit_phone">Phone</label>
              <input
                type="tel"
                id="edit_phone"
                value={userEditForm.phone}
                onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value })}
                placeholder="Phone number (optional)"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button type="button" onClick={cancelEditUser} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="admin-search"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="admin-select"
        >
          <option value="">All Tiers</option>
          <option value="public">Public</option>
          <option value="school">School</option>
          <option value="dealer">Dealer</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={fetchUsers} className="btn btn-small">
          Search
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table admin-users-table">
          <thead>
            <tr>
              <th className="col-name">Name</th>
              <th className="col-email">Email</th>
              <th className="col-company">Company</th>
              <th className="col-phone">Phone</th>
              <th className="col-current-tier">Current Tier</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="col-name" title={u.name}>{u.name}</td>
                <td className="col-email" title={u.email}>{u.email}</td>
                <td className="col-company" title={u.company || ''}>{u.company || '-'}</td>
                <td className="col-phone" title={u.phone || ''}>{formatPhoneNumber(u.phone)}</td>
                <td className="col-current-tier">
                  <span className={`tier-badge tier-${u.pricing_tier}`}>
                    {u.pricing_tier}
                  </span>
                </td>
                <td className="col-actions">
                  <button
                    onClick={() => openManageUser(u)}
                    className="btn btn-small btn-outline"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {passwordResetUserId && (
        <div className="modal-overlay" onClick={() => setPasswordResetUserId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Reset Password</h3>
            <p>Setting new password for <strong>{passwordResetEmail}</strong></p>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={passwordResetNew} onChange={e => setPasswordResetNew(e.target.value)} placeholder="New password (min 8 chars)" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" value={passwordResetConfirm} onChange={e => setPasswordResetConfirm(e.target.value)} placeholder="Confirm new password" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-small btn-outline" onClick={() => setPasswordResetUserId(null)}>Cancel</button>
              <button className="btn btn-small btn-primary" onClick={handleResetPassword} disabled={passwordResetLoading}>
                {passwordResetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {manageUser && (
        <div className="modal-overlay" onClick={closeManageUser}>
          <div className="modal-content manage-user-modal" onClick={e => e.stopPropagation()}>
            <h3>Manage User</h3>
            <p className="delete-confirm-intro">Manage account actions for <strong>{manageUser.email}</strong>.</p>

            <div className="delete-details">
              <div className="delete-detail-row"><span>Name</span><strong>{manageUser.name || '-'}</strong></div>
              <div className="delete-detail-row"><span>Email</span><strong>{manageUser.email || '-'}</strong></div>
              <div className="delete-detail-row"><span>Company</span><strong>{manageUser.company || '-'}</strong></div>
              <div className="delete-detail-row"><span>Phone</span><strong>{formatPhoneNumber(manageUser.phone)}</strong></div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label htmlFor="manage_tier">Pricing Tier</label>
              <div className="manage-tier-row">
                <select
                  id="manage_tier"
                  value={manageTier}
                  onChange={(e) => setManageTier(e.target.value)}
                  className="tier-select"
                  disabled={manageUser.id === currentUser?.id || manageUser.pricing_tier === 'admin' || manageTierLoading}
                  title={manageUser.pricing_tier === 'admin' ? 'Admin accounts cannot be modified' : ''}
                >
                  <option value="public">Public</option>
                  <option value="school">School</option>
                  <option value="dealer">Dealer</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  className="btn btn-small btn-primary"
                  onClick={handleManageTierSave}
                  disabled={manageUser.id === currentUser?.id || manageUser.pricing_tier === 'admin' || manageTierLoading || manageTier === manageUser.pricing_tier}
                >
                  {manageTierLoading ? 'Saving...' : 'Save Tier'}
                </button>
              </div>
            </div>

            <div className="action-buttons manage-actions">
              <button
                onClick={() => startEditUser(manageUser)}
                className="btn btn-small btn-outline"
                disabled={manageUser.pricing_tier === 'admin'}
                title={manageUser.pricing_tier === 'admin' ? 'Admin accounts cannot be modified' : 'Edit user'}
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setPasswordResetUserId(manageUser.id);
                  setPasswordResetEmail(manageUser.email);
                  setPasswordResetNew('');
                  setPasswordResetConfirm('');
                  closeManageUser();
                }}
                className="btn btn-small btn-outline"
                title="Reset password"
              >
                Reset Password
              </button>
              <button
                onClick={() => sendWelcomeEmail(manageUser)}
                className="btn btn-small btn-outline"
                disabled={welcomeEmailUserId === manageUser.id}
                title="Send welcome email"
              >
                {welcomeEmailUserId === manageUser.id ? 'Sending...' : 'Welcome Email'}
              </button>
              <button
                onClick={() => {
                  setDeleteTarget(manageUser);
                  closeManageUser();
                }}
                className="btn btn-small btn-danger"
                disabled={manageUser.id === currentUser?.id || manageUser.pricing_tier === 'admin'}
                title={manageUser.pricing_tier === 'admin' ? 'Admin accounts cannot be deleted' : 'Delete user'}
              >
                Delete Account
              </button>
            </div>

            <div className="modal-actions">
              <button className="btn btn-small btn-outline" onClick={closeManageUser}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleteLoading && setDeleteTarget(null)}>
          <div className="modal-content delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Account?</h3>
            <p className="delete-confirm-intro">
              This action permanently removes this user and all related cart data.
            </p>

            <div className="delete-details">
              <div className="delete-detail-row"><span>Name</span><strong>{deleteTarget.name || '-'}</strong></div>
              <div className="delete-detail-row"><span>Email</span><strong>{deleteTarget.email || '-'}</strong></div>
              <div className="delete-detail-row"><span>Company</span><strong>{deleteTarget.company || '-'}</strong></div>
              <div className="delete-detail-row"><span>Phone</span><strong>{formatPhoneNumber(deleteTarget.phone)}</strong></div>
              <div className="delete-detail-row"><span>Tier</span><strong>{deleteTarget.pricing_tier || '-'}</strong></div>
            </div>

            <p className="delete-warning">Deleted data cannot be recovered.</p>

            <div className="modal-actions">
              <button
                className="btn btn-small btn-outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-small btn-danger"
                onClick={deleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
