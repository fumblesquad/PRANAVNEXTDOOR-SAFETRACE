import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SOSButton from '../components/SOSButton';
import IncidentFeed from '../components/IncidentFeed';
import MapPreview from '../components/MapPreview';

const INCIDENT_TYPES = [
  { id: 'harassment', label: 'Harassment', icon: '⚠' },
  { id: 'theft', label: 'Theft', icon: '🔓' },
  { id: 'unsafe area', label: 'Unsafe Area', icon: '🚫' },
  { id: 'poor lighting', label: 'Poor Lighting', icon: '💡' },
  { id: 'stalking', label: 'Stalking', icon: '👁' },
  { id: 'other', label: 'Other', icon: '•' },
];

export default function Home() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  function handleTypeSelect(id) {
    setSelected(id);
    setTimeout(() => navigate(`/report?type=${id}`), 300);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Hero */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 60px',
        textAlign: 'center',
        borderBottom: '1px solid #181818',
      }}>
        <p style={{ color: '#D4537E', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Anonymous. Fast. Secure.
        </p>
        <h1 style={{ fontSize: '48px', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1 }}>
          Report. Track. Stay Safe.
        </h1>
        <p style={{ color: '#666', maxWidth: '480px', fontSize: '16px', lineHeight: 1.6, margin: '0 0 48px' }}>
          SafeTrace lets you report safety incidents anonymously, track their resolution, and view real-time risk zones in your area.
        </p>

        <SOSButton />

        <p style={{ color: '#444', fontSize: '12px', marginTop: '16px' }}>
          Calls 112 + files anonymous report instantly
        </p>
      </section>

      {/* Quick Report */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Quick Report</h2>
        <p style={{ color: '#555', fontSize: '14px', marginBottom: '24px' }}>
          Select incident type to start an anonymous report. No account needed.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
        }}>
          {INCIDENT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTypeSelect(t.id)}
              style={{
                background: selected === t.id ? '#D4537E' : '#111',
                border: selected === t.id ? '1px solid #D4537E' : '1px solid #222',
                borderRadius: '10px',
                padding: '20px 16px',
                color: selected === t.id ? '#fff' : '#ccc',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '20px' }}>{t.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Map Preview + Feed */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Safety Map</h2>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px' }}>
            Live risk zones in your area
          </p>
          <MapPreview height="300px" />
          <button
            onClick={() => navigate('/map')}
            style={{
              marginTop: '12px',
              background: 'none',
              border: '1px solid #333',
              color: '#aaa',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              width: '100%',
            }}
          >
            Open full map →
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Recent Incidents</h2>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px' }}>
            Latest community reports
          </p>
          <IncidentFeed />
        </div>
      </section>
    </div>
  );
}
