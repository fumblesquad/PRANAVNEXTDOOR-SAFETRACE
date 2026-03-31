import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../services/authService';
import { createUser, linkCaseToUser, getUser } from '../../services/dbService';

export default function ProfileTab() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();

  const [savedCases, setSavedCases] = useState([]);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load saved cases from localStorage
  useEffect(() => {
    try {
      const cases = JSON.parse(localStorage.getItem('safetrace_cases') || '[]');
      setSavedCases(cases);
    } catch {
      setSavedCases([]);
    }
  }, []);

  async function syncLocalCases(uid) {
    try {
      const cases = JSON.parse(localStorage.getItem('safetrace_cases') || '[]');
      for (const caseId of cases) {
        await linkCaseToUser(uid, caseId);
      }
    } catch {
      // silently ignore
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await signInWithGoogle();
      if (err) throw err;
      // OAuth redirects — no further action needed
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error: err } = await signUpWithEmail(email, password);
        if (err) throw err;
        const uid = data?.user?.id;
        if (uid) {
          await createUser(uid, email, 'email');
          await syncLocalCases(uid);
        }
      } else {
        const { data, error: err } = await signInWithEmail(email, password);
        if (err) throw err;
        const uid = data?.user?.id;
        if (uid) {
          await createUser(uid, email, 'email');
          await syncLocalCases(uid);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await logout();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }

  // Loading state
  if (user === undefined) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#555', fontSize: '13px' }}>Loading...</p>
      </div>
    );
  }

  // Signed in state
  if (user) {
    return (
      <div style={{ padding: '20px', paddingBottom: '100px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: '#fff' }}>Profile</h1>
        <p style={{ color: '#444', fontSize: '12px', marginBottom: '24px' }}>
          Manage your account and reports.
        </p>

        {/* User info */}
        <div style={{
          background: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(232,24,80,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e81850" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                {user.email || 'Google User'}
              </p>
              <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>
                {user.app_metadata?.provider === 'google' ? 'Signed in with Google' : 'Email account'}
              </p>
            </div>
          </div>
        </div>

        {/* Saved cases */}
        {savedCases.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#444', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Your Case IDs
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {savedCases.map(id => (
                <span
                  key={id}
                  style={{
                    padding: '6px 12px',
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '6px',
                    color: '#888',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '12px',
            background: 'none',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#888',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Not signed in state
  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      {/* Anonymous status */}
      <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '20px' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: '#fff' }}>You're Anonymous</h2>
        <p style={{ color: '#555', fontSize: '13px', margin: 0, maxWidth: '260px', marginLeft: 'auto', marginRight: 'auto' }}>
          Sign in to track reports across devices
        </p>
      </div>

      {/* Saved cases (even when anonymous) */}
      {savedCases.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: '#444', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            Saved locally on this device
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {savedCases.map(id => (
              <span
                key={id}
                style={{
                  padding: '6px 12px',
                  background: '#111',
                  border: '1px solid #222',
                  borderRadius: '6px',
                  color: '#888',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Google sign in */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '16px',
          fontFamily: 'inherit',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
        </svg>
        Sign in with Google
      </button>

      {/* Email toggle */}
      <button
        onClick={() => setShowEmailForm(!showEmailForm)}
        style={{
          width: '100%',
          padding: '12px',
          background: 'none',
          border: 'none',
          color: '#555',
          fontSize: '13px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginBottom: showEmailForm ? '16px' : '0',
        }}
      >
        {showEmailForm ? 'Hide email form' : 'or use email'}
      </button>

      {/* Email form */}
      {showEmailForm && (
        <div style={{
          background: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: '12px',
          padding: '20px',
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: '#0a0a0a',
            borderRadius: '8px',
            padding: '3px',
            marginBottom: '16px',
          }}>
            <button
              onClick={() => { setIsSignUp(false); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 0',
                background: !isSignUp ? '#1e1e1e' : 'transparent',
                border: !isSignUp ? '1px solid #2a2a2a' : '1px solid transparent',
                borderRadius: '6px',
                color: !isSignUp ? '#fff' : '#555',
                fontSize: '12px',
                fontWeight: !isSignUp ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 0',
                background: isSignUp ? '#1e1e1e' : 'transparent',
                border: isSignUp ? '1px solid #2a2a2a' : '1px solid transparent',
                borderRadius: '6px',
                color: isSignUp ? '#fff' : '#555',
                fontSize: '12px',
                fontWeight: isSignUp ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            {error && <p style={{ color: '#e81850', fontSize: '12px', margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                background: loading ? '#7a2f4a' : '#e81850',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>
      )}

      {/* Privacy note */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '24px',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span style={{ color: '#333', fontSize: '11px' }}>
          Your identity is never attached to anonymous reports
        </span>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px',
  background: '#0a0a0a',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};
