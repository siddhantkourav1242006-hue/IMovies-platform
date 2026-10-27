import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCity } from '../hooks/useCity';
import Button from '../components/ui/Button';
import './LoginPage.css'; // Shared clean auth style

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { city, cities } = useCity();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCity, setSelectedCity] = useState(city);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({
        name,
        email,
        phone,
        password,
        city: selectedCity,
      });
      navigate(redirect);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Try with another email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            i<span className="logo-dot">●</span>Movies
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Book tickets in under a minute with real-time seat lock.</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="regName">Full name</label>
            <input
              id="regName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aanya Sharma"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="regEmail">Email address</label>
            <input
              id="regEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aanya@example.com"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="regPhone">Phone number</label>
            <input
              id="regPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="regCity">City</label>
            <select
              id="regCity"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="city-select"
              style={{ width: '100%', background: 'var(--bg-page)' }}
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="regPassword">Password (min 6 characters)</label>
            <input
              id="regPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" block disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="auth-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
