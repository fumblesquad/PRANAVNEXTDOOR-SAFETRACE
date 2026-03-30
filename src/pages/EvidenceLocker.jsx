import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } from '../services/authService';
import { getUserReports, getEvidenceByCase } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

function AuthGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = isRegister
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      if (err) throw err;
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
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#555', fontSize: '13px', textDecoration: 'none', marginBottom: '32px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </a>

        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Evidence Locker</h1>
        <p style={{ color: '#555', fontSize: '14px', marginBottom: '28px' }}>
          Sign in to access your linked reports and evidence.
        </p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            background: '#111', border: '1px solid #2a2a2a',
            borderRadius: '8px', color: '#fff', fontSize: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px', marginBottom: '20px',
            fontFamily: 'inherit',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
          <span style={{ color: '#333', fontSize: '12px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
        </div>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          {error && <p style={{ color: '#D4537E', fontSize: '13px', margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '12px', background: '#D4537E', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', fontFamily: 'inherit' }}>
            {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#444' }}>
          {isRegister ? 'Have an account?' : 'No account?'}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{ background: 'none', border: 'none', color: '#D4537E', cursor: 'pointer', fontSize: '13px', padding: 0, fontFamily: 'inherit' }}>
            {isRegister ? 'Sign in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function EvidenceLocker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [evidenceMap, setEvidenceMap] = useState({});

  useEffect(() => {
    if (user) {
      getUserReports(user.uid)
        .then(setReports)
        .catch(() => setReports([]))
        .finally(() => setLoading(false));
    }
  }, [user]);

  async function handleExpand(reportId, caseId) {
    if (expanded === reportId) {
      setExpanded(null);
      return;
    }
    setExpanded(reportId);
    if (!evidenceMap[caseId]) {
      try {
        const ev = await getEvidenceByCase(caseId);
        setEvidenceMap(prev => ({ ...prev, [caseId]: ev }));
      } catch {
        setEvidenceMap(prev => ({ ...prev, [caseId]: [] }));
      }
    }
  }

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#333', fontSize: '13px' }}>Loading...</span>
      </div>
    );
  }

  if (!user) return <AuthGate />;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#333', fontSize: '13px' }}>Loading...</span>
      </div>
    );
  }

  function exportReport(r) {
    const evidence = evidenceMap[r.caseId] || [];
    const lines = [
      `SAFETRACE INCIDENT REPORT`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `Case ID: ${r.caseId}`,
      `Type: ${r.type}`,
      `Status: ${r.status}`,
      `Filed: ${r.createdAt}`,
      `Location: ${r.location ? `${r.location.lat}, ${r.location.lng}` : 'Not provided'}`,
      ``,
      `Description:`,
      r.description || '(none)',
      ``,
      `Evidence Files (${evidence.length}):`,
      ...evidence.map(ev => `  - ${ev.fileName}\n    Type: ${ev.fileType}\n    SHA-256: ${ev.sha256Hash}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${r.caseId}.txt`;
    a.click();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '48px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#555', fontSize: '13px', textDecoration: 'none', marginBottom: '28px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </a>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Evidence Locker</h1>
            <p style={{ color: '#444', fontSize: '13px' }}>
              {user.email} · {reports.length} case{reports.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
          >
            Sign out
          </button>
        </div>

        {reports.length === 0 ? (
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#444', fontSize: '14px', marginBottom: '20px' }}>
              No linked reports found. Submit a report with "Link to account" checked.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '10px 24px', background: '#D4537E', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              File a report
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reports.map(r => (
              <div
                key={r.id}
                style={{
                  background: '#111',
                  border: `1px solid ${expanded === r.id ? '#D4537E33' : '#1a1a1a'}`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => handleExpand(r.id, r.caseId)}
                  style={{
                    width: '100%', padding: '16px 20px',
                    background: 'none', border: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}
                >
                  <div>
                    <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '14px', fontWeight: 600 }}>{r.caseId}</span>
                    <span style={{ color: '#444', fontSize: '13px', marginLeft: '14px', textTransform: 'capitalize' }}>{r.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StatusBadge status={r.status} />
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: expanded === r.id ? 'rotate(180deg)' : 'none' }}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>

                {expanded === r.id && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px', marginBottom: '16px' }}>
                      <Field label="Filed" value={new Date(r.createdAt).toLocaleString()} />
                      <Field label="Location" value={r.location ? `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}` : 'Not provided'} />
                    </div>

                    {r.description && (
                      <div style={{ marginBottom: '18px' }}>
                        <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>Description</p>
                        <p style={{ color: '#777', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{r.description}</p>
                      </div>
                    )}

                    {(evidenceMap[r.caseId] || []).length > 0 && (
                      <div style={{ marginBottom: '18px' }}>
                        <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>
                          Evidence Files ({evidenceMap[r.caseId].length})
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {evidenceMap[r.caseId].map((ev) => (
                            <div key={ev.id} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '7px', padding: '12px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#bbb', fontSize: '13px' }}>{ev.fileName}</span>
                                <span style={{ color: '#444', fontSize: '12px', textTransform: 'capitalize' }}>{ev.fileType}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: '#0d1a0d', border: '1px solid #1a3a1a', color: '#2ecc71', padding: '2px 7px', borderRadius: '4px', fontSize: '10px', letterSpacing: '0.5px' }}>
                                  SHA-256
                                </span>
                                <span style={{ color: '#333', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                  {ev.sha256Hash}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => exportReport(r)}
                      style={{
                        padding: '8px 16px', background: 'none',
                        border: '1px solid #2a2a2a', borderRadius: '7px',
                        color: '#777', fontSize: '13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Export Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { submitted: '#aaa', under_review: '#ffd60a', escalated: '#ff6b35', resolved: '#2ecc71' };
  const labels = { submitted: 'Submitted', under_review: 'Under Review', escalated: 'Escalated', resolved: 'Resolved' };
  const c = colors[status] || '#aaa';
  return (
    <span style={{
      fontSize: '11px', color: c,
      border: `1px solid ${c}44`,
      background: `${c}11`,
      padding: '3px 10px', borderRadius: '20px',
    }}>
      {labels[status] || status}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: '#777', fontSize: '13px', margin: 0 }}>{value}</p>
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
