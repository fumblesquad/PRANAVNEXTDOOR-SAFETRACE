import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReportByCaseId } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

const LIFECYCLE = ['submitted', 'under_review', 'escalated', 'resolved'];

const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  escalated: 'Escalated',
  resolved: 'Resolved',
};

const TYPE_COLORS = {
  harassment: '#e81850',
  theft: '#ff6b35',
  'unsafe area': '#ffd60a',
  'poor lighting': '#8338ec',
  stalking: '#e81850',
  sos: '#cc0000',
  other: '#aaa',
};

function TypeIcon({ type }) {
  const t = type?.toLowerCase();
  if (t === 'theft') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  );
  if (t === 'stalking' || t === 'harassment') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
  if (t === 'sos') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
  if (t === 'poor lighting') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    </svg>
  );
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function Track() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedCases, setSavedCases] = useState([]);
  const [caseInput, setCaseInput] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); // initial auto-fetch
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const cases = JSON.parse(localStorage.getItem('safetrace_cases') || '[]');
      setSavedCases(cases);
      if (cases.length === 1) {
        setCaseInput(cases[0]);
        doFetch(cases[0], true);
      }
    } catch {
      // ignore
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function validateCaseId(id) {
    const trimmed = (id || '').trim().toUpperCase();
    // Must match ST- followed by exactly 6 alphanumeric characters
    return /^ST-[A-Z0-9]{6}$/.test(trimmed);
  }

  async function doFetch(id, isAuto = false) {
    const q = (id || '').trim().toUpperCase();
    if (!q) {
      setError('Please enter a valid Case ID (e.g. ST-A1B2C3)');
      return;
    }
    if (!validateCaseId(q)) {
      setError('Please enter a valid Case ID (e.g. ST-A1B2C3)');
      setReport(null);
      return;
    }
    setError('');
    setReport(null);
    if (isAuto) setFetching(true); else setLoading(true);
    try {
      const r = await getReportByCaseId(q);
      if (!r) {
        setError('No report found with this ID. Double-check and try again.');
      } else {
        setReport(r);
      }
    } catch {
      setError('No report found with this ID. Double-check and try again.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    doFetch(caseInput);
  }

  function handleSavedClick(id) {
    setCaseInput(id);
    doFetch(id);
  }

  const currentStep = report ? LIFECYCLE.indexOf(report.status) : -1;
  const isOwner = !!(user && report && report.uid && report.uid === user.uid);
  const typeColor = report ? (TYPE_COLORS[report.type?.toLowerCase()] || '#aaa') : '#aaa';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '48px 24px 64px' }}>
      <style>{`
        @keyframes trackPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#444', fontSize: '13px', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: 'inherit', marginBottom: '36px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: '#fff' }}>Case Tracker</h1>
        <p style={{ color: '#444', fontSize: '13px', marginBottom: '32px' }}>
          Enter your case ID to check the status of your report.
        </p>

        {/* Saved cases chips */}
        {savedCases.length > 1 && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
              Your saved reports
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {savedCases.map(id => (
                <button
                  key={id}
                  onClick={() => handleSavedClick(id)}
                  style={{
                    padding: '5px 12px',
                    background: caseInput === id ? 'rgba(232,24,80,0.1)' : '#111',
                    border: `1px solid ${caseInput === id ? '#e81850' : '#222'}`,
                    borderRadius: '6px',
                    color: caseInput === id ? '#e81850' : '#555',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input
            value={caseInput}
            onChange={e => setCaseInput(e.target.value)}
            placeholder="Enter your Case ID"
            style={{
              flex: 1, padding: '12px 14px',
              background: '#111', border: '1px solid #2a2a2a',
              borderRadius: '8px', color: '#fff', fontSize: '14px',
              outline: 'none', fontFamily: 'monospace',
            }}
          />
          <button
            type="submit"
            disabled={loading || fetching}
            style={{
              padding: '12px 22px',
              background: (loading || fetching) ? '#7a2f4a' : '#e81850',
              border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '14px', fontWeight: 600,
              cursor: (loading || fetching) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            {(loading || fetching) ? '...' : 'Track Report'}
          </button>
        </form>

        {error && (
          <p style={{ color: '#e81850', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
        )}

        {/* Report card */}
        {report && (
          <div style={{
            background: '#111',
            border: '1px solid #1e1e1e',
            borderRadius: '14px',
            padding: '28px',
          }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <p style={{ color: '#333', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 5px' }}>Case ID</p>
                <p style={{ color: '#fff', fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  {report.caseId}
                </p>
              </div>
              {isOwner && (
                <span style={{
                  fontSize: '11px',
                  color: '#e81850',
                  border: '1px solid rgba(232,24,80,0.35)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(232,24,80,0.07)',
                  whiteSpace: 'nowrap',
                }}>
                  This is your report
                </span>
              )}
            </div>

            {/* Details grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '18px',
              marginBottom: '32px',
            }}>
              <div>
                <p style={labelStyle}>Type</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: typeColor }}>
                  <TypeIcon type={report.type} />
                  <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{report.type}</span>
                </div>
              </div>

              {report.location?.label && (
                <div>
                  <p style={labelStyle}>Location</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span style={{ fontSize: '13px' }}>{report.location.label}</span>
                  </div>
                </div>
              )}

              <div>
                <p style={labelStyle}>Submitted</p>
                <span style={{ color: '#888', fontSize: '13px' }}>{formatDate(report.createdAt)}</span>
              </div>
            </div>

            {/* Progress tracker */}
            <div>
              <p style={{ ...labelStyle, marginBottom: '18px' }}>Progress</p>
              <div style={{ display: 'flex', position: 'relative' }}>
                {LIFECYCLE.map((step, i) => {
                  const done = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <div
                      key={step}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
                    >
                      {/* Connector line */}
                      {i > 0 && (
                        <div style={{
                          position: 'absolute',
                          left: '-50%', top: '9px',
                          width: '100%', height: '2px',
                          background: (done || active) ? '#e81850' : '#1e1e1e',
                        }} />
                      )}

                      {/* Node */}
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        {active ? (
                          <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                            {/* Pulse ring */}
                            <div style={{
                              position: 'absolute',
                              inset: '-4px',
                              borderRadius: '50%',
                              background: 'rgba(232,24,80,0.4)',
                              animation: 'trackPulse 1.6s ease-in-out infinite',
                            }} />
                            <div style={{
                              width: '20px', height: '20px', borderRadius: '50%',
                              background: '#e81850',
                              position: 'relative', zIndex: 1,
                            }} />
                          </div>
                        ) : (
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: done ? '#e81850' : '#0a0a0a',
                            border: `2px solid ${done ? '#e81850' : '#222'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {done && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Label */}
                      <span style={{
                        marginTop: '9px',
                        fontSize: '10px',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        color: active ? '#e81850' : done ? '#666' : '#222',
                        fontWeight: active ? 600 : 400,
                      }}>
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            {report.description && (
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #1a1a1a' }}>
                <p style={labelStyle}>Description</p>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                  {report.description}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const labelStyle = {
  color: '#333',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: '0 0 6px',
};
