import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract redirect url parameter
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
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
          <h1 className="auth-title">Log in to your account</h1>
          <p className="auth-subtitle">Fast cinema booking, live seat selection, digital passes.</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="loginEmail">Email address</label>
            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" block disabled={loading} style={{ marginTop: 12 }}>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <div style={{ marginTop: 20, padding: '14px', background: 'var(--card-bg, #1a1a2e)', borderRadius: '8px', border: '1px solid var(--border-color, #2d2d48)' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 8, fontWeight: 700, letterSpacing: '0.5px' }}>
            ⚡ QUICK DEMO CREDENTIALS:
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => { setEmail('admin@imovies.com'); setPassword('Admin@12345'); }}
              style={{ flex: 1, padding: '7px 10px', background: '#252538', border: '1px solid #444466', borderRadius: '6px', color: '#00d4ff', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
            >
              👑 Admin (admin@imovies.com)
            </button>
            <button
              type="button"
              onClick={() => { setEmail('aanya@example.com'); setPassword('User@12345'); }}
              style={{ flex: 1, padding: '7px 10px', background: '#252538', border: '1px solid #444466', borderRadius: '6px', color: '#10b981', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
            >
              👤 User (aanya@example.com)
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to={`/signup?redirect=${encodeURIComponent(redirect)}`} className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
