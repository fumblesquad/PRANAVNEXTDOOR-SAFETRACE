import { useState, useEffect } from 'react';
import { getReportByCaseId } from '../../services/dbService';

const LIFECYCLE = ['submitted', 'under_review', 'escalated', 'resolved'];
const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  escalated: 'Escalated',
  resolved: 'Resolved',
};

export default function TrackTab() {
  const [savedCases, setSavedCases] = useState([]);
  const [caseInput, setCaseInput] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const r = await getReportByCaseId(q);
      if (!r) {
        setError('No report found with this ID. Double-check and try again.');
      } else {
        setReport(r);
      }
    } catch (err) {
      console.error('Track fetch error:', err);
      setError('No report found with this ID. Double-check and try again.');
    } finally {
      setLoading(false);
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

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: '#fff' }}>Track Report</h1>
      <p style={{ color: '#444', fontSize: '12px', marginBottom: '24px' }}>
        Enter your case ID to check status.
      </p>

      {/* Saved cases dropdown */}
      {savedCases.length > 1 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#444', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Your saved reports
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {savedCases.map(id => (
              <button
                key={id}
                onClick={() => handleSavedClick(id)}
                style={{
                  padding: '6px 12px',
                  background: caseInput === id ? 'rgba(212,83,126,0.1)' : '#111',
                  border: `1px solid ${caseInput === id ? '#D4537E' : '#222'}`,
                  borderRadius: '6px',
                  color: caseInput === id ? '#D4537E' : '#555',
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
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          value={caseInput}
          onChange={e => setCaseInput(e.target.value)}
          placeholder="Enter Case ID"
          style={{
            flex: 1, padding: '12px',
            background: '#111', border: '1px solid #2a2a2a',
            borderRadius: '8px', color: '#fff', fontSize: '14px',
            outline: 'none', fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 20px',
            background: loading ? '#7a2f4a' : '#D4537E',
            border: 'none', borderRadius: '8px',
            color: '#fff', fontSize: '14px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}
        >
          {loading ? '...' : 'Track'}
        </button>
      </form>

      {error && (
        <p style={{ color: '#D4537E', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
      )}

      {/* Report card */}
      {report && (
        <div style={{
          background: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: '12px',
          padding: '20px',
        }}>
          {/* Case ID */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#444', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 4px' }}>Case ID</p>
            <p style={{ color: '#fff', fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, margin: 0 }}>
              {report.caseId}
            </p>
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <p style={labelStyle}>Type</p>
              <p style={{ color: '#D4537E', fontSize: '13px', margin: 0, textTransform: 'capitalize' }}>
                {capitalizeFirst(report.type)}
              </p>
            </div>
            <div>
              <p style={labelStyle}>Location</p>
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                {report.location?.label ?? 'Location not specified'}
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={labelStyle}>Submitted</p>
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                {formatDate(report.createdAt)}
              </p>
            </div>
          </div>

          {/* Progress tracker */}
          <div>
            <p style={{ ...labelStyle, marginBottom: '16px' }}>Progress</p>
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
                        background: (done || active) ? '#D4537E' : '#1e1e1e',
                      }} />
                    )}

                    {/* Node */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {active ? (
                        <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                          <style>{`
                            @keyframes trackPulse {
                              0%, 100% { transform: scale(1); opacity: 0.5; }
                              50% { transform: scale(2); opacity: 0; }
                            }
                          `}</style>
                          <div style={{
                            position: 'absolute',
                            inset: '-4px',
                            borderRadius: '50%',
                            background: 'rgba(212,83,126,0.4)',
                            animation: 'trackPulse 1.6s ease-in-out infinite',
                          }} />
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: '#D4537E',
                            position: 'relative', zIndex: 1,
                          }} />
                        </div>
                      ) : (
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: done ? '#D4537E' : '#0a0a0a',
                          border: `2px solid ${done ? '#D4537E' : '#222'}`,
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
                      marginTop: '8px',
                      fontSize: '9px',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      color: active ? '#D4537E' : done ? '#666' : '#333',
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
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1a1a1a' }}>
              <p style={labelStyle}>Description</p>
              <p style={{ color: '#666', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                {report.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  color: '#444',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: '0 0 4px',
};
