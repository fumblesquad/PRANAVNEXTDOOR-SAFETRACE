import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getRecentReports } from '../firebase/reports';

// Risk zones around Chennai
const RISK_ZONES = [
  { lat: 13.0827, lng: 80.2707, risk: 'high', label: 'Central Chennai', radius: 600 },
  { lat: 13.0418, lng: 80.2341, risk: 'high', label: 'T. Nagar', radius: 450 },
  { lat: 13.0732, lng: 80.2609, risk: 'medium', label: 'Egmore', radius: 400 },
  { lat: 13.0694, lng: 80.1948, risk: 'medium', label: 'Koyambedu', radius: 500 },
  { lat: 13.0856, lng: 80.2095, risk: 'low', label: 'Anna Nagar', radius: 550 },
  { lat: 13.1067, lng: 80.2920, risk: 'high', label: 'Perambur', radius: 380 },
  { lat: 12.9716, lng: 80.2200, risk: 'medium', label: 'Guindy', radius: 420 },
];

const TYPE_COLORS = {
  harassment: '#D4537E',
  theft: '#ff6b35',
  'unsafe area': '#ffd60a',
  'poor lighting': '#8338ec',
  stalking: '#D4537E',
  sos: '#cc0000',
  other: '#aaa',
};

const RISK_COLORS = { high: '#cc0000', medium: '#ff6b35', low: '#2ecc71' };

function RecenterControl({ userPos }) {
  const map = useMap();
  if (!userPos) return null;
  return (
    <button
      onClick={() => map.setView(userPos, 14)}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        background: '#111',
        border: '1px solid #333',
        borderRadius: '8px',
        color: '#fff',
        padding: '8px 14px',
        cursor: 'pointer',
        fontSize: '13px',
      }}
    >
      My Location
    </button>
  );
}

export default function FullMap() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [userPos, setUserPos] = useState(null);
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);
  const navigate = useNavigate();

  useEffect(() => {
    getRecentReports(50).then(setReports).catch(() => {});
    navigator.geolocation?.getCurrentPosition(pos => {
      const c = [pos.coords.latitude, pos.coords.longitude];
      setUserPos(c);
      setMapCenter(c);
    });
  }, []);

  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(r => r.type?.toLowerCase() === filter);

  const types = ['all', ...new Set(reports.map(r => r.type?.toLowerCase()).filter(Boolean))];

  return (
    <div style={{ height: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        padding: '10px 16px',
        background: '#0f0f0f',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        zIndex: 10,
        position: 'relative',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            color: '#aaa',
            padding: '5px 12px',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          ← Back
        </button>
        <div style={{ width: '1px', height: '20px', background: '#2a2a2a' }} />
        <span style={{ color: '#555', fontSize: '13px' }}>Filter:</span>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '5px 14px',
              borderRadius: '16px',
              border: filter === t ? '1px solid #D4537E' : '1px solid #2a2a2a',
              background: filter === t ? 'rgba(212,83,126,0.15)' : 'transparent',
              color: filter === t ? '#D4537E' : '#666',
              fontSize: '12px',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <LegendItem color="#cc0000" label="High Risk" />
          <LegendItem color="#ff6b35" label="Medium" />
          <LegendItem color="#2ecc71" label="Low" />
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', isolation: 'isolate', zIndex: 0 }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {/* Risk zones */}
          {RISK_ZONES.map((zone, i) => (
            <Circle
              key={i}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{
                color: RISK_COLORS[zone.risk],
                fillColor: RISK_COLORS[zone.risk],
                fillOpacity: 0.15,
                weight: 1,
              }}
            >
              <Popup>
                <div style={{ background: '#111', color: '#fff', padding: '8px', borderRadius: '6px', minWidth: '140px' }}>
                  <strong>{zone.label}</strong>
                  <br />
                  <span style={{ color: RISK_COLORS[zone.risk], fontSize: '12px', textTransform: 'capitalize' }}>
                    {zone.risk} risk
                  </span>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Incident pins */}
          {filteredReports.map(r =>
            r.location ? (
              <CircleMarker
                key={r.id}
                center={[r.location.lat, r.location.lng]}
                radius={7}
                pathOptions={{
                  color: TYPE_COLORS[r.type?.toLowerCase()] || '#aaa',
                  fillColor: TYPE_COLORS[r.type?.toLowerCase()] || '#aaa',
                  fillOpacity: 0.8,
                  weight: 1,
                }}
              >
                <Popup>
                  <div style={{ background: '#111', color: '#fff', padding: '8px', borderRadius: '6px', minWidth: '160px' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{r.type}</strong>
                    <br />
                    <span style={{ color: '#aaa', fontSize: '12px' }}>{r.caseId}</span>
                    {r.description && (
                      <p style={{ color: '#888', fontSize: '12px', margin: '6px 0 0' }}>
                        {r.description.slice(0, 60)}{r.description.length > 60 ? '…' : ''}
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ) : null
          )}

          {/* User location */}
          {userPos && (
            <CircleMarker
              center={userPos}
              radius={8}
              pathOptions={{ color: '#4fc3f7', fillColor: '#4fc3f7', fillOpacity: 0.9, weight: 2 }}
            >
              <Popup>
                <div style={{ background: '#111', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                  You are here
                </div>
              </Popup>
            </CircleMarker>
          )}

          <RecenterControl userPos={userPos} />
        </MapContainer>
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
      <span style={{ color: '#666', fontSize: '12px' }}>{label}</span>
    </div>
  );
}
