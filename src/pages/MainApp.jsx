import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapTab from '../components/tabs/MapTab';
import ReportTab from '../components/tabs/ReportTab';
import TrackTab from '../components/tabs/TrackTab';
import ProfileTab from '../components/tabs/ProfileTab';

// Tab icons
function MapIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e81850' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function ReportIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e81850' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function TrackIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e81850' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#e81850' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

const TABS = [
  { id: 'map', label: 'Map', Icon: MapIcon },
  { id: 'report', label: 'Report', Icon: ReportIcon },
  { id: 'track', label: 'Track', Icon: TrackIcon },
  { id: 'profile', label: 'Profile', Icon: ProfileIcon },
];

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('map');
  const navigate = useNavigate();

  // Read initial tab from URL hash if present
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && TABS.some(t => t.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    window.location.hash = tabId;
  }

  function goToSOS() {
    navigate('/');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Content area */}
      <div style={{
        flex: 1,
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {activeTab === 'map' && <MapTab onSOS={goToSOS} />}
        {activeTab === 'report' && <ReportTab />}
        {activeTab === 'track' && <TrackTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>

      {/* Bottom tab bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#111111',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        maxWidth: '430px',
        margin: '0 auto',
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              style={{
                flex: 1,
                height: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: 0,
              }}
            >
              <Icon active={active} />
              <span style={{
                fontSize: '10px',
                color: active ? '#e81850' : 'rgba(255,255,255,0.35)',
                fontWeight: active ? 600 : 400,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
