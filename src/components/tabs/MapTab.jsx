import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getZones, getRecentReports } from '../../services/dbService';

const RISK_COLORS = { 
  high: '#cc0000', 
  medium: '#ff6b35', 
  low: '#2ecc71' 
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

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function MapTab({ onSOS }) {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(true);

  useEffect(() => {
    // Fetch zones from Supabase
    getZones('Chennai')
      .then(setZones)
      .catch(err => {
        console.error('Failed to fetch zones:', err);
        setZones([]);
      });

    // Fetch recent reports
    getRecentReports(30)
      .then(setReports)
      .catch(err => {
        console.error('Failed to fetch reports:', err);
        setReports([]);
      });

    // Get user location
    navigator.geolocation?.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  // Risk summary counts
  const riskCounts = zones.reduce(
    (acc, z) => {
      acc[z.riskLevel] = (acc[z.riskLevel] || 0) + 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return (
    <div style={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
      {/* Map */}
      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        {userPos && <MapController center={userPos} />}

        {/* Zone circles */}
        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.coordinates?.lat || 13.0827, zone.coordinates?.lng || 80.2707]}
            radius={500}
            pathOptions={{
              color: RISK_COLORS[zone.riskLevel] || '#aaa',
              fillColor: RISK_COLORS[zone.riskLevel] || '#aaa',
              fillOpacity: 0.15,
              weight: 1,
            }}
          >
            <Popup>
              <div style={{ background: '#111', color: '#fff', padding: '8px', borderRadius: '6px', minWidth: '120px' }}>
                <strong>{zone.name}</strong><br />
                <span style={{ color: RISK_COLORS[zone.riskLevel], fontSize: '12px', textTransform: 'capitalize' }}>
                  {zone.riskLevel} risk · {zone.incidentCount} incidents
                </span>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Report markers */}
        {reports.map(r =>
          r.location ? (
            <CircleMarker
              key={r.id}
              center={[r.location.lat, r.location.lng]}
              radius={6}
              pathOptions={{
                color: TYPE_COLORS[r.type?.toLowerCase()] || '#aaa',
                fillColor: TYPE_COLORS[r.type?.toLowerCase()] || '#aaa',
                fillOpacity: 0.8,
                weight: 1,
              }}
            >
              <Popup>
                <div style={{ background: '#111', color: '#fff', padding: '8px', borderRadius: '6px', minWidth: '140px' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{r.type}</strong><br />
                  <span style={{ color: '#aaa', fontSize: '12px' }}>{r.caseId}</span>
                </div>
              </Popup>
            </CircleMarker>
          ) : null
        )}

        {/* User position */}
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
      </MapContainer>

      {/* SOS floating button */}
      <button
        onClick={onSOS}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: '#e81850',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(232,24,80,0.4)',
        }}
      >
        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>SOS</span>
      </button>

      {/* Bottom sheet */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(17,17,17,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px 16px 0 0',
          padding: sheetOpen ? '16px 20px 20px' : '12px 20px',
          zIndex: 1000,
          transition: 'all 0.2s ease-out',
        }}
      >
        {/* Handle */}
        <div
          onClick={() => setSheetOpen(!sheetOpen)}
          style={{
            width: '36px',
            height: '4px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            margin: '0 auto 12px',
            cursor: 'pointer',
          }}
        />

        {sheetOpen && (
          <>
            <p style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
              Risk Zones in Chennai
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <RiskPill color="#cc0000" label="High" count={riskCounts.high} />
              <RiskPill color="#ff6b35" label="Medium" count={riskCounts.medium} />
              <RiskPill color="#2ecc71" label="Low" count={riskCounts.low} />
              <div style={{
                padding: '8px 14px',
                background: 'rgba(232,24,80,0.1)',
                border: '1px solid rgba(232,24,80,0.3)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ color: '#e81850', fontSize: '12px' }}>
                  {reports.length} reports
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RiskPill({ color, label, count }) {
  return (
    <div style={{
      padding: '8px 14px',
      background: `${color}15`,
      border: `1px solid ${color}40`,
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
      <span style={{ color, fontSize: '12px' }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{count}</span>
    </div>
  );
}
