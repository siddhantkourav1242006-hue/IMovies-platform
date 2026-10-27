import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCity } from '../hooks/useCity';
import authService from '../services/authService';
import Button from '../components/ui/Button';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { cities } = useCity();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await authService.updateProfile({ name, phone, city });
      updateUser(res.data?.user || { ...user, name, phone, city });
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-heading">Account Profile</h1>

        {successMsg && <div className="profile-alert success">{successMsg}</div>}
        {errorMsg && <div className="profile-alert error">{errorMsg}</div>}

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-large-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="profile-user-name">{user?.name}</h2>
              <p className="profile-user-email">{user?.email}</p>
              <span className="profile-role-tag">{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="profName">Full name</label>
              <input
                id="profName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="profPhone">Phone number</label>
              <input
                id="profPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="profCity">Preferred city</label>
              <select
                id="profCity"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" onClick={logout}>
                Log out
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
