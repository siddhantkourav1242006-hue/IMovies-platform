import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useCity } from '../../hooks/useCity';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { city, cities, changeCity } = useCity();
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="site-logo">
            I<span className="logo-dot">●</span>Movies
          </Link>

          <div className="city-picker-wrapper">
            <select
              id="headerCitySelect"
              value={city}
              onChange={(e) => changeCity(e.target.value)}
              className="city-select"
              aria-label="Select your city"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <nav className="header-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              Now showing
            </NavLink>
            <NavLink
              to="/movies"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              All movies
            </NavLink>
            {user && (
              <>
                <NavLink
                  to="/my-tickets"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  My tickets
                </NavLink>
                <NavLink
                  to="/watchlist"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  Watchlist
                </NavLink>
              </>
            )}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          {user ? (
            <div className="user-profile-menu">
              <Link to="/profile" className="profile-btn" title="View Profile">
                <span className="profile-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="profile-name">{user.name.split(' ')[0]}</span>
              </Link>
              <button type="button" onClick={logout} className="logout-btn">
                Log out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="login-header-btn"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
