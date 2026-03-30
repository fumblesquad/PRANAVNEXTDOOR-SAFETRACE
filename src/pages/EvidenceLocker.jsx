import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserReports } from '../firebase/reports';
import { useAuth } from '../context/AuthContext';

export default function EvidenceLocker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (user === null) {
      navigate('/signin');
      return;
    }
    if (user) {
      getUserReports(user.uid)
        .then(setReports)
        .catch(() => setReports([]))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (user === undefined || loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#444', fontSize: '14px' }}>Loading...</span>
      </div>
    );
  }

  function exportReport(r) {
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
      `Evidence Files (${r.evidenceUrls?.length || 0}):`,
      ...(r.evidenceUrls || []).map(e => `  - ${e.name}\n    SHA-256: ${e.hash}\n    URL: ${e.url}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${r.caseId}.txt`;
    a.click();
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#0a0a0a', padding: '48px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Evidence Locker</h1>
            <p style={{ color: '#555', fontSize: '14px' }}>
              {user.email} · {reports.length} case{reports.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>
              No linked reports found. Submit a report with "Link to account" checked.
            </p>
            <button
              onClick={() => navigate('/report')}
              style={{
                padding: '10px 24px',
                background: '#D4537E',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              File a report
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map(r => (
              <div
                key={r.id}
                style={{
                  background: '#111',
                  border: `1px solid ${expanded === r.id ? '#D4537E44' : '#1e1e1e'}`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'border 0.2s',
                }}
              >
                <button
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '14px', fontWeight: 600 }}>
                      {r.caseId}
                    </span>
                    <span style={{ color: '#555', fontSize: '13px', marginLeft: '16px', textTransform: 'capitalize' }}>
                      {r.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <StatusBadge status={r.status} />
                    <span style={{ color: '#444', fontSize: '18px', transform: expanded === r.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ↓
                    </span>
                  </div>
                </button>

                {expanded === r.id && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', marginBottom: '16px' }}>
                      <Field label="Filed" value={new Date(r.createdAt).toLocaleString()} />
                      <Field label="Location" value={r.location ? `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}` : 'Not provided'} />
                    </div>

                    {r.description && (
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>Description</p>
                        <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{r.description}</p>
                      </div>
                    )}

                    {r.evidenceUrls?.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>
                          Evidence Files ({r.evidenceUrls.length})
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {r.evidenceUrls.map((ev, i) => (
                            <div
                              key={i}
                              style={{
                                background: '#0a0a0a',
                                border: '1px solid #1a1a1a',
                                borderRadius: '8px',
                                padding: '12px 14px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#ccc', fontSize: '13px' }}>{ev.name}</span>
                                <a
                                  href={ev.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: '#D4537E', fontSize: '12px', textDecoration: 'none' }}
                                >
                                  View ↗
                                </a>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  background: '#0d1a0d',
                                  border: '1px solid #1a3a1a',
                                  color: '#2ecc71',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  letterSpacing: '0.5px',
                                }}>
                                  SHA-256
                                </span>
                                <span style={{
                                  color: '#444',
                                  fontSize: '11px',
                                  fontFamily: 'monospace',
                                  wordBreak: 'break-all',
                                }}>
                                  {ev.hash}
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
                        padding: '9px 18px',
                        background: 'none',
                        border: '1px solid #333',
                        borderRadius: '7px',
                        color: '#aaa',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      ↓ Export Report
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
  const colors = {
    Submitted: '#aaa',
    'Under Review': '#ffd60a',
    Escalated: '#ff6b35',
    Resolved: '#2ecc71',
  };
  const c = colors[status] || '#aaa';
  return (
    <span style={{
      fontSize: '11px',
      color: c,
      border: `1px solid ${c}44`,
      background: `${c}11`,
      padding: '3px 10px',
      borderRadius: '20px',
    }}>
      {status}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p style={{ color: '#444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{value}</p>
    </div>
  );
}
