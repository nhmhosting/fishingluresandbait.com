import { useState, useEffect, useCallback } from 'react';

const ACTION_LABELS = {
  'auth.register': 'Registered Account',
  'auth.login': 'Logged In',
  'auth.logout': 'Logged Out',
  'auth.token_revoke': 'Token Revoked',
  'user.self_update': 'Updated Profile',
  'user.password_reset': 'Password Reset',
  'user.create': 'Created User',
  'user.update': 'Updated User',
  'user.delete': 'Deleted User',
  'user.view': 'Viewed User',
  'cart.add_item': 'Added to Cart',
  'cart.update_item': 'Updated Cart Item',
  'cart.remove_item': 'Removed from Cart',
  'cart.clear': 'Cleared Cart',
  'cart.sync': 'Synced Cart',
  'cart.view': 'Viewed Cart',
  'product.create': 'Created Product',
  'product.update': 'Updated Product',
  'product.delete': 'Deleted Product',
  'pricing.set': 'Set Pricing',
  'pricing.delete': 'Deleted Pricing',
  'settings.update': 'Updated Settings',
};

const ACTION_OPTIONS = [
  { value: 'auth.register', label: 'Registration' },
  { value: 'auth.login', label: 'Login' },
  { value: 'auth.logout', label: 'Logout' },
  { value: 'auth.token_revoke', label: 'Token Revoked' },
  { value: 'user.self_update', label: 'Profile Update' },
  { value: 'user.password_reset', label: 'Password Reset' },
  { value: 'user.create', label: 'User Created (Admin)' },
  { value: 'user.update', label: 'User Updated (Admin)' },
  { value: 'user.delete', label: 'User Deleted (Admin)' },
  { value: 'user.view', label: 'User Viewed' },
  { value: 'cart.add_item', label: 'Cart: Add Item' },
  { value: 'cart.update_item', label: 'Cart: Update Item' },
  { value: 'cart.remove_item', label: 'Cart: Remove Item' },
  { value: 'cart.clear', label: 'Cart: Cleared' },
  { value: 'cart.sync', label: 'Cart: Synced' },
  { value: 'cart.view', label: 'Cart: Viewed' },
  { value: 'product.create', label: 'Product Created' },
  { value: 'product.update', label: 'Product Updated' },
  { value: 'product.delete', label: 'Product Deleted' },
  { value: 'pricing.set', label: 'Pricing Set' },
  { value: 'pricing.delete', label: 'Pricing Deleted' },
  { value: 'settings.update', label: 'Settings Updated' },
];

function formatActionLabel(action) {
  return ACTION_LABELS[action] || action;
}

function getTargetLabel(log) {
  if (!log.target_type) return '-';
  const type = log.target_type;
  if (type === 'user') {
    return log.target_email
      ? log.target_email
      : (log.target_id ? `User ${log.target_id.substring(0, 8)}...` : 'User');
  }
  if (log.target_id) {
    const display = log.target_id.length > 20
      ? `${log.target_id.substring(0, 20)}...`
      : log.target_id;
    return `${type}: ${display}`;
  }
  return type;
}

function getTargetDisplay(log) {
  if (log.target_type === 'user') {
    return log.target_email || (log.target_id ? log.target_id.substring(0, 20) + (log.target_id.length > 20 ? '...' : '') : '-');
  }
  if (log.target_type && log.target_id) {
    const truncated = log.target_id.length > 20 ? log.target_id.substring(0, 20) + '...' : log.target_id;
    return `${log.target_type}: ${truncated}`;
  }
  return log.target_id || '-';
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', { timeZone: 'America/New_York' });
}

function AdminActivity({ authFetch }) {
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityOffset, setActivityOffset] = useState(0);
  const [activityLimit] = useState(50);
  const [activityActorFilter, setActivityActorFilter] = useState('');
  const [activityActionFilter, setActivityActionFilter] = useState('');
  const [activityStartDate, setActivityStartDate] = useState('');
  const [activityEndDate, setActivityEndDate] = useState('');
  const [activityLoading, setActivityLoading] = useState(false);
  const [selectedActivityLog, setSelectedActivityLog] = useState(null);

  const fetchActivityLogs = useCallback(async (offset = 0) => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams({ limit: activityLimit, offset });
      if (activityActorFilter) params.set('actor_type', activityActorFilter);
      if (activityActionFilter) params.set('action', activityActionFilter);
      if (activityStartDate) params.set('start_date', activityStartDate);
      if (activityEndDate) params.set('end_date', activityEndDate);
      const res = await authFetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      if (res.ok) {
        setActivityLogs(data.logs || []);
        setActivityTotal(data.total || 0);
        setActivityOffset(offset);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setActivityLoading(false);
    }
  }, [authFetch, activityLimit, activityActorFilter, activityActionFilter, activityStartDate, activityEndDate]);

  useEffect(() => {
    fetchActivityLogs(0);
  }, [fetchActivityLogs]);

  const handleClearFilters = () => {
    setActivityActorFilter('');
    setActivityActionFilter('');
    setActivityStartDate('');
    setActivityEndDate('');
    setTimeout(() => fetchActivityLogs(0), 0);
  };

  return (
    <div className="admin-section">
      <h2>Activity Log</h2>
      <p className="section-desc">All actions taken on the website - by admins and users alike. Click any row for full details.</p>

      <div className="filter-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <select value={activityActorFilter} onChange={e => setActivityActorFilter(e.target.value)}>
          <option value="">All Actors</option>
          <option value="admin">Admins Only</option>
          <option value="user">Users Only</option>
        </select>
        <select value={activityActionFilter} onChange={e => setActivityActionFilter(e.target.value)}>
          <option value="">All Actions</option>
          {ACTION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input type="date" value={activityStartDate} onChange={e => setActivityStartDate(e.target.value)} placeholder="Start date" />
        <input type="date" value={activityEndDate} onChange={e => setActivityEndDate(e.target.value)} placeholder="End date" />
        <button className="btn btn-primary" onClick={() => fetchActivityLogs(0)}>Apply Filters</button>
        <button className="btn btn-secondary" onClick={handleClearFilters}>Clear</button>
      </div>

      {activityLoading ? (
        <div className="loading">Loading activity log...</div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Type</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state">No activity found</td></tr>
                ) : activityLogs.map(log => {
                  const targetLabel = getTargetLabel(log);
                  const targetTooltip = log.target_id
                    ? `${log.target_type}: ${log.target_id}${log.target_name ? ` (${log.target_name})` : ''}`
                    : log.target_type;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedActivityLog(log)}
                      style={{ cursor: 'pointer' }}
                      title="Click for full details"
                    >
                      <td className="col-date" title={new Date(log.created_at).toISOString()}>
                        {formatDate(log.created_at)}
                      </td>
                      <td title={log.admin_email}>
                        <div className="actor-cell">
                          <span className="actor-email">{log.admin_email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${log.actor_type || 'admin'}`}>
                          {log.actor_type === 'user' ? 'User' : log.actor_type === 'system' ? 'System' : 'Admin'}
                        </span>
                      </td>
                      <td>
                        <span className="action-label">{formatActionLabel(log.action)}</span>
                      </td>
                      <td className="col-target" title={targetTooltip}>
                        {targetLabel}
                      </td>
                      <td className="col-ip" title={log.ip_address}>{log.ip_address}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pagination" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px', justifyContent: 'center' }}>
            <button className="btn btn-small" disabled={activityOffset === 0} onClick={() => fetchActivityLogs(Math.max(0, activityOffset - activityLimit))}>Previous</button>
            <span>{activityOffset + 1}&ndash;{Math.min(activityOffset + activityLimit, activityTotal)} of {activityTotal}</span>
            <button className="btn btn-small" disabled={activityOffset + activityLimit >= activityTotal} onClick={() => fetchActivityLogs(activityOffset + activityLimit)}>Next</button>
          </div>
        </>
      )}

      {selectedActivityLog && (() => {
        const log = selectedActivityLog;
        let changes = null;
        try { changes = JSON.parse(log.changes); } catch {}
        const targetDisplay = getTargetDisplay(log);

        return (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedActivityLog(null); }}
          >
            <div style={{
              background: 'white', borderRadius: '12px', padding: '28px',
              maxWidth: '700px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{formatActionLabel(log.action)}</h3>
                  <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
                    {formatDate(log.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedActivityLog(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '22px', color: '#6b7280', lineHeight: 1, padding: '0 4px',
                  }}
                  title="Close"
                >&times;</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Actor</div>
                  <div style={{ fontWeight: 500, fontSize: '14px', wordBreak: 'break-all' }}>{log.admin_email || '-'}</div>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`badge badge-${log.actor_type || 'admin'}`} style={{ fontSize: '11px' }}>
                      {log.actor_type === 'user' ? 'User' : log.actor_type === 'system' ? 'System' : 'Admin'}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Target</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px', textTransform: 'capitalize' }}>{log.target_type || '-'}</div>
                  <div style={{ fontWeight: 500, fontSize: '14px', wordBreak: 'break-all' }}>{targetDisplay}</div>
                  {log.target_id && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>{log.target_id}</div>
                  )}
                </div>

                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>IP Address</div>
                  <div style={{ fontWeight: 500, fontSize: '14px', fontFamily: 'monospace' }}>{log.ip_address || '-'}</div>
                </div>

                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Action Code</div>
                  <div style={{ fontWeight: 500, fontSize: '13px', fontFamily: 'monospace', color: '#374151' }}>{log.action}</div>
                </div>
              </div>

              {log.user_agent && (
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>User Agent</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>{log.user_agent}</div>
                </div>
              )}

              {changes && Object.keys(changes).length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Changes / Details</div>
                  {changes.before !== undefined && changes.before !== null && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444', marginBottom: '6px' }}>Before</div>
                      <pre style={{
                        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px',
                        padding: '12px', fontSize: '12px', overflowX: 'auto', margin: 0,
                        whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#374151',
                      }}>{JSON.stringify(changes.before, null, 2)}</pre>
                    </div>
                  )}
                  {changes.after !== undefined && changes.after !== null && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e', marginBottom: '6px' }}>After</div>
                      <pre style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px',
                        padding: '12px', fontSize: '12px', overflowX: 'auto', margin: 0,
                        whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#374151',
                      }}>{JSON.stringify(changes.after, null, 2)}</pre>
                    </div>
                  )}
                  {changes.metadata !== undefined && changes.metadata !== null && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Metadata</div>
                      <pre style={{
                        background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px',
                        padding: '12px', fontSize: '12px', overflowX: 'auto', margin: 0,
                        whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#374151',
                      }}>{JSON.stringify(changes.metadata, null, 2)}</pre>
                    </div>
                  )}
                  {changes.reason && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Reason</div>
                      <div style={{ fontSize: '13px', color: '#374151' }}>{changes.reason}</div>
                    </div>
                  )}
                  {!changes.before && !changes.after && !changes.metadata && !changes.reason && (
                    <pre style={{
                      background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px',
                      padding: '12px', fontSize: '12px', overflowX: 'auto', margin: 0,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#374151',
                    }}>{JSON.stringify(changes, null, 2)}</pre>
                  )}
                </div>
              )}

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedActivityLog(null)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default AdminActivity;
