import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/authService';
import { createUser, linkCaseToUser } from '../services/dbService';

async function syncLocalCases(uid) {
  try {
    const cases = JSON.parse(localStorage.getItem('safetrace_cases') || '[]');
    for (const caseId of cases) {
      await linkCaseToUser(uid, caseId);
    }
  } catch {
    // silently ignore — non-critical
  }
}

export default function SignIn() {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signup') {
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
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const { error: err } = await signInWithGoogle();
      if (err) throw err;
      // OAuth redirects back to origin — no navigate() needed
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style={{ marginBottom: '10px' }}>
            <path d="M17 3L5 8v10c0 7.18 5.82 13 12 13s12-5.82 12-13V8L17 3z"
              fill="none" stroke="#D4537E" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 17l3.5 3.5L22 14"
              stroke="#D4537E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: 0 }}>SafeTrace</p>
        </div>

        <div style={{
          background: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: '14px',
          padding: '32px',
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: '#0a0a0a',
            borderRadius: '8px',
            padding: '3px',
            marginBottom: '28px',
            gap: '2px',
          }}>
            {[
              { id: 'signin', label: 'Sign In' },
              { id: 'signup', label: 'Sign Up' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setError(''); setName(''); }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: tab === id ? '#1e1e1e' : 'transparent',
                  border: tab === id ? '1px solid #2a2a2a' : '1px solid transparent',
                  borderRadius: '6px',
                  color: tab === id ? '#fff' : '#555',
                  fontSize: '13px',
                  fontWeight: tab === id ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
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
              marginBottom: '20px',
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
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
            <span style={{ color: '#333', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tab === 'signup' && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
            )}
            <input
              type="email"
              placeholder="Email address"
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

            {error && (
              <p style={{ color: '#D4537E', fontSize: '13px', margin: '2px 0 0' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                background: loading ? '#7a2f4a' : '#D4537E',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Please wait...' : tab === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          {/* Anonymous */}
          <div style={{
            borderTop: '1px solid #1a1a1a',
            paddingTop: '20px',
            marginTop: '24px',
            textAlign: 'center',
          }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                background: 'none',
                border: 'none',
                color: '#777',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: '6px',
                display: 'block',
                width: '100%',
              }}
            >
              Continue without signing in →
            </button>
            <p style={{ color: '#333', fontSize: '12px', margin: 0 }}>
              You can still report incidents and use the safety map
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          marginTop: '20px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ color: '#333', fontSize: '12px' }}>
            Your identity is never attached to anonymous reports
          </span>
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px 14px',
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
