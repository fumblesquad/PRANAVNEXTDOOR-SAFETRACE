import { useEffect, useState } from 'react';
import { getRecentReports } from '../services/dbService';

const TYPE_COLORS = {
  harassment: '#D4537E',
  theft: '#ff6b35',
  'unsafe area': '#ffd60a',
  'poor lighting': '#8338ec',
  stalking: '#D4537E',
  SOS: '#cc0000',
  other: '#aaa',
};

const statusColors = {
  Submitted: '#aaa',
  'Under Review': '#ffd60a',
  Escalated: '#ff6b35',
  Resolved: '#2ecc71',
};

export default function IncidentFeed() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentReports(8)
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#555', fontSize: '13px' }}>Loading incidents...</div>;
  if (!reports.length) return <div style={{ color: '#555', fontSize: '13px' }}>No recent incidents reported.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {reports.map((r) => (
        <div
          key={r.id}
          style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: TYPE_COLORS[r.type?.toLowerCase()] || '#aaa',
              marginTop: '6px',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
                {r.type}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: statusColors[r.status] || '#aaa',
                  border: `1px solid ${statusColors[r.status] || '#333'}`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {r.status}
              </span>
            </div>
            {r.description && (
              <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 0' }}>
                {r.description.length > 80 ? r.description.slice(0, 80) + '…' : r.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
              <span style={{ color: '#444', fontSize: '11px' }}>
                #{r.caseId}
              </span>
              <span style={{ color: '#444', fontSize: '11px' }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
