import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getReportByCaseId, getUserReports } from '../firebase/reports';
import { useAuth } from '../context/AuthContext';

const LIFECYCLE = ['Submitted', 'Under Review', 'Escalated', 'Resolved'];

const STATUS_COLORS = {
  Submitted: '#aaa',
  'Under Review': '#ffd60a',
  Escalated: '#ff6b35',
  Resolved: '#2ecc71',
};

const TYPE_COLORS = {
  harassment: '#D4537E',
  theft: '#ff6b35',
  'unsafe area': '#ffd60a',
  'poor lighting': '#8338ec',
  stalking: '#D4537E',
  sos: '#cc0000',
  other: '#aaa',
};

export default function Track() {
  const [params] = useSearchParams();
  const { user } = useAuth();

  const [caseInput, setCaseInput] = useState(params.get('caseId') || '');
  const [report, setReport] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.get('caseId')) {
      handleSearch(null, params.get('caseId'));
    }
  }, []);

  useEffect(() => {
    if (user) {
      getUserReports(user.uid).then(setUserReports).catch(() => {});
    }
  }, [user]);

  async function handleSearch(e, id) {
    if (e) e.preventDefault();
    const query = id || caseInput.trim();
    if (!query) return;
    setError('');
    setLoading(true);
    try {
      const r = await getReportByCaseId(query);
      if (!r) {
        setError('No case found with that ID.');
        setReport(null);
      } else {
        setReport(r);
      }
    } catch {
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const currentStep = report ? LIFECYCLE.indexOf(report.status) : -1;

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#0a0a0a', padding: '48px 24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Case Tracker</h1>
        <p style={{ color: '#555', fontSize: '14px', marginBottom: '36px' }}>
          Enter a case ID to check status. No account required.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
          <input
            value={caseInput}
            onChange={e => setCaseInput(e.target.value)}
            placeholder="e.g. ST-M1K2L3-AB4C"
            style={{
              flex: 1,
              padding: '12px 14px',
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'monospace',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#D4537E',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {loading ? '...' : 'Track'}
          </button>
        </form>

        {error && <p style={{ color: '#D4537E', fontSize: '14px', marginBottom: '20px' }}>{error}</p>}

        {report && (
          <div style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '28px',
            marginBottom: '32px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <p style={{ color: '#555', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>Case ID</p>
                <p style={{ color: '#fff', fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, margin: 0 }}>{report.caseId}</p>
              </div>
              <span style={{
                fontSize: '12px',
                color: STATUS_COLORS[report.status] || '#aaa',
                border: `1px solid ${STATUS_COLORS[report.status] || '#333'}`,
                padding: '4px 12px',
                borderRadius: '20px',
              }}>
                {report.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Type</p>
                <span style={{
                  color: TYPE_COLORS[report.type?.toLowerCase()] || '#aaa',
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}>
                  {report.type}
                </span>
              </div>
              <div>
                <p style={{ color: '#444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Filed</p>
                <span style={{ color: '#aaa', fontSize: '13px' }}>
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '8px' }}>
              {LIFECYCLE.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    {i > 0 && (
                      <div style={{
                        position: 'absolute',
                        left: '-50%',
                        top: '10px',
                        width: '100%',
                        height: '2px',
                        background: done ? '#D4537E' : '#222',
                        transition: 'background 0.3s',
                      }} />
                    )}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: active ? '#D4537E' : done ? 'rgba(212,83,126,0.4)' : '#1a1a1a',
                      border: `2px solid ${done ? '#D4537E' : '#333'}`,
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: done ? '#fff' : '#333',
                    }}>
                      {done ? '✓' : ''}
                    </div>
                    <span style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: active ? '#D4537E' : done ? '#aaa' : '#444',
                      textAlign: 'center',
                      lineHeight: 1.3,
                    }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {report.description && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #1a1a1a' }}>
                <p style={{ color: '#444', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Description</p>
                <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{report.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Signed-in user's cases */}
        {user && userReports.length > 0 && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#ccc' }}>
              Your Cases
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userReports.map(r => (
                <button
                  key={r.id}
                  onClick={() => { setCaseInput(r.caseId); setReport(r); }}
                  style={{
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '13px' }}>{r.caseId}</span>
                    <span style={{ color: '#555', fontSize: '12px', marginLeft: '12px', textTransform: 'capitalize' }}>{r.type}</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: STATUS_COLORS[r.status] || '#aaa',
                    border: `1px solid ${STATUS_COLORS[r.status] || '#333'}`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    {r.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
