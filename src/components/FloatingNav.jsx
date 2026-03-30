// SVG icons for nav items
function HomeIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4537E' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  );
}

function MapIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4537E' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="3" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="21"/>
      <line x1="3" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="21" y2="12"/>
    </svg>
  );
}

function ReportIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4537E' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Home', index: 0, Icon: HomeIcon },
  { label: 'Map', index: 1, Icon: MapIcon },
  { label: 'Report', index: 2, Icon: ReportIcon },
];

export default function FloatingNav({ activePage, onNavigate }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '9999px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        gap: '2px',
        zIndex: 1000,
      }}
    >
      {NAV_ITEMS.map(({ label, index, Icon }) => {
        const active = activePage === index;
        return (
          <button
            key={index}
            onClick={() => onNavigate(index)}
            style={{
              padding: active ? '0 18px 0 12px' : '0 14px',
              height: '36px',
              borderRadius: '9999px',
              border: 'none',
              background: active ? 'rgba(212,83,126,0.14)' : 'none',
              color: active ? '#D4537E' : '#555',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: active ? 600 : 400,
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
          >
            {active && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#D4537E',
                flexShrink: 0,
              }} />
            )}
            <Icon active={active} />
            {active && label}
          </button>
        );
      })}
    </div>
  );
}
