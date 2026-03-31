import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/report', label: 'Report' },
    { to: '/map', label: 'Map' },
    { to: '/track', label: 'Track' },
    ...(user ? [{ to: '/evidence-locker', label: 'Evidence' }] : []),
  ];

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '56px',
      background: '#111',
      borderBottom: '1px solid #222',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="/favicon.svg" alt="SafeTrace Icon" style={{ height: '24px' }} />
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              color: location.pathname === to ? '#e81850' : '#aaa',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: location.pathname === to ? 600 : 400,
              transition: 'color 0.2s',
            }}
          >
            {label}
          </Link>
        ))}
        {user ? (
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: '1px solid #333',
              color: '#aaa',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Sign out
          </button>
        ) : (
          <Link
            to="/signin"
            style={{
              color: '#aaa',
              textDecoration: 'none',
              fontSize: '13px',
              border: '1px solid #333',
              padding: '6px 14px',
              borderRadius: '6px',
            }}
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
