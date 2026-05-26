import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../../config.js';

export default function AdminSiteContent({ authFetch, getAuthHeaders, setError, setSuccessMessage }) {
  const [siteSettings, setSiteSettings] = useState([]);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(false);
  const [siteSettingsEdits, setSiteSettingsEdits] = useState({});
  const [siteSettingsSaving, setSiteSettingsSaving] = useState(false);
  const [siteSettingsCategory, setSiteSettingsCategory] = useState('contact');

  const fetchSiteSettings = useCallback(async (category) => {
    setSiteSettingsLoading(true);
    try {
      const catParam = category ? `?category=${encodeURIComponent(category)}` : '';
      const response = await authFetch(`${API_BASE}/admin/settings${catParam}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data.settings || []);
        const edits = {};
        (data.settings || []).forEach(s => {
          edits[s.key] = s.value;
        });
        setSiteSettingsEdits(edits);
      } else if (response.status === 401 || response.status === 403) {
        setError('Admin access denied. Try logging out and logging back in.');
      }
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
    } finally {
      setSiteSettingsLoading(false);
    }
  }, [authFetch, getAuthHeaders, setError]);

  useEffect(() => {
    fetchSiteSettings('contact');
  }, [fetchSiteSettings]);

  const saveSiteSettings = async () => {
    setSiteSettingsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      const changedSettings = [];
      siteSettings.forEach(s => {
        const editedValue = siteSettingsEdits[s.key];
        if (editedValue !== undefined && editedValue !== s.value) {
          changedSettings.push({ key: s.key, value: editedValue });
        }
      });

      if (changedSettings.length === 0) {
        setSuccessMessage('No changes to save');
        setSiteSettingsSaving(false);
        return;
      }

      const response = await authFetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: changedSettings }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(`${data.updated} setting(s) updated successfully. Refresh the site to see changes.`);
        fetchSiteSettings(siteSettingsCategory);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Failed to save site settings:', err);
      setError('Failed to save settings');
    } finally {
      setSiteSettingsSaving(false);
    }
  };

  const categories = [
    { id: 'contact', label: 'Contact Info' },
    { id: 'seo', label: 'SEO / Meta' },
    { id: 'home', label: 'Home Page' },
    { id: 'about', label: 'About Page' },
    { id: 'brands', label: 'Brands' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'returns', label: 'Returns' },
    { id: 'payment', label: 'Payment' },
    { id: 'terms', label: 'Terms' },
    { id: 'footer', label: 'Footer' },
  ];

  const inputBorderStyle = (setting) =>
    (siteSettingsEdits[setting.key] !== undefined && siteSettingsEdits[setting.key] !== setting.value)
      ? '2px solid #f59e0b'
      : '1px solid #d1d5db';

  return (
    <div className="admin-section">
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '12px' }}>Site Content Management</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Edit all site descriptions, contact info, SEO meta tags, and page content. Changes appear on the live site after saving.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSiteSettingsCategory(cat.id);
                fetchSiteSettings(cat.id);
              }}
              style={{
                padding: '8px 16px',
                border: siteSettingsCategory === cat.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                borderRadius: '6px',
                background: siteSettingsCategory === cat.id ? '#eff6ff' : '#fff',
                color: siteSettingsCategory === cat.id ? '#2563eb' : '#374151',
                fontWeight: siteSettingsCategory === cat.id ? '600' : '400',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {siteSettingsLoading ? (
        <p>Loading settings...</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {siteSettings.map(setting => (
              <div key={setting.key} style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', fontSize: '14px' }}>
                  {setting.label}
                </label>
                {setting.description && (
                  <small style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                    {setting.description}
                  </small>
                )}
                {setting.field_type === 'textarea' ? (
                  <textarea
                    value={siteSettingsEdits[setting.key] ?? setting.value}
                    onChange={(e) => setSiteSettingsEdits(prev => ({ ...prev, [setting.key]: e.target.value }))}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: inputBorderStyle(setting),
                      borderRadius: '6px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={siteSettingsEdits[setting.key] ?? setting.value}
                    onChange={(e) => setSiteSettingsEdits(prev => ({ ...prev, [setting.key]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: inputBorderStyle(setting),
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
                <small style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  Key: {setting.key}
                </small>
              </div>
            ))}
          </div>

          {siteSettings.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
              No settings found for this category. Run the database migration (0011_site_settings.sql and 0012_seed_site_settings.sql) to populate settings.
            </p>
          )}

          {siteSettings.length > 0 && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={saveSiteSettings}
                disabled={siteSettingsSaving}
                className="btn btn-primary"
                style={{ padding: '12px 32px' }}
              >
                {siteSettingsSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  const revert = {};
                  siteSettings.forEach(s => { revert[s.key] = s.value; });
                  setSiteSettingsEdits(revert);
                }}
                className="btn btn-secondary"
              >
                Revert Changes
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
