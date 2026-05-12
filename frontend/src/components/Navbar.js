import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">

      <Link to="/" className="navbar__brand">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        DeepShield
      </Link>

      <div className="navbar__links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/user-guide">User Guide</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        {isAuthenticated && <NavLink to="/scan">Scanner</NavLink>}
        {isAuthenticated && <NavLink to="/history">History</NavLink>}
      </div>

      <div className="navbar__auth">
        {isAuthenticated ? (
          <>
            <span style={{
              fontSize: '13px', fontWeight: 500,
              color: 'var(--text-1)',
              maxWidth: '140px', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {user.name}
            </span>
            <button onClick={logout} style={{
              background: 'transparent',
              border: '1.5px solid #e5e7eb',
              color: '#6b7280', fontSize: '13px',
              fontWeight: 500, padding: '5px 14px',
              borderRadius: '7px', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
              onMouseEnter={e => {
                e.target.style.background  = '#fee2e2';
                e.target.style.borderColor = '#fca5a5';
                e.target.style.color       = '#dc2626';
              }}
              onMouseLeave={e => {
                e.target.style.background  = 'transparent';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color       = '#6b7280';
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              fontSize: '13px', fontWeight: 500,
              color: '#6b7280', textDecoration: 'none'
            }}>
              Sign in
            </Link>
            <Link to="/signup" style={{
              background: '#16a372', color: '#fff',
              fontSize: '13px', fontWeight: 600,
              padding: '7px 16px', borderRadius: '8px',
              textDecoration: 'none'
            }}>
              Get started
            </Link>
          </>
        )}
      </div>

    </nav>
  );
}