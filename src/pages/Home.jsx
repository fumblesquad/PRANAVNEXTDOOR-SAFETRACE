import { useState } from 'react';
import { usePageNav } from '../context/PageNavContext';
import IncidentFeed from '../components/IncidentFeed';
import MapPreview from '../components/MapPreview';

// Inline SVG icons — no emojis
function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function LockOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 019.9-1"/>
    </svg>
  );
}

function BanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  );
}

function SunDimIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="4"/>
      <line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="2" y1="12" x2="4" y2="12"/>
      <line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function MoreHorizIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="1"/>
      <circle cx="12" cy="12" r="1"/>
      <circle cx="19" cy="12" r="1"/>
    </svg>
  );
}

const INCIDENT_TYPES = [
  { id: 'harassment', label: 'Harassment', Icon: WarningIcon },
  { id: 'theft', label: 'Theft', Icon: LockOpenIcon },
  { id: 'unsafe area', label: 'Unsafe Area', Icon: BanIcon },
  { id: 'poor lighting', label: 'Poor Lighting', Icon: SunDimIcon },
  { id: 'stalking', label: 'Stalking', Icon: EyeIcon },
  { id: 'other', label: 'Other', Icon: MoreHorizIcon },
];

export default function Home() {
  const [selected, setSelected] = useState(null);
  const { goToPage } = usePageNav() || {};

  function handleTypeSelect(id) {
    setSelected(id);
    setTimeout(() => {
      if (goToPage) {
        goToPage(2, `type=${id}`);
      }
    }, 150);
  }

  return (
    <div style={{ minHeight: '100%', background: '#0a0a0a', color: '#fff' }}>
      {/* Quick Report */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 0' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Report</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '10px',
        }}>
          {INCIDENT_TYPES.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleTypeSelect(id)}
              style={{
                background: selected === id ? '#e81850' : '#111',
                border: selected === id ? '1px solid #e81850' : '1px solid #1e1e1e',
                borderRadius: '8px',
                padding: '16px 14px',
                color: selected === id ? '#fff' : '#999',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <Icon />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Map Preview + Feed */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px 96px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px' }}>Safety Map</h2>
          <MapPreview height="260px" />
        </div>

        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Incidents</h2>
          <IncidentFeed />
        </div>
      </section>
    </div>
  );
}
