import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Risk zones around Chennai
const RISK_ZONES = [
  { lat: 13.0827, lng: 80.2707, risk: 'high', label: 'Central Chennai' },
  { lat: 13.0418, lng: 80.2341, risk: 'medium', label: 'T. Nagar' },
  { lat: 13.0694, lng: 80.1948, risk: 'low', label: 'Koyambedu' },
];

const RISK_COLORS = { high: '#cc0000', medium: '#ff6b35', low: '#2ecc71' };

export default function MapPreview({ center = [13.0827, 80.2707], zoom = 12, height = '300px' }) {
  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #222', isolation: 'isolate', position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {RISK_ZONES.map((zone, i) => (
          <Circle
            key={i}
            center={[zone.lat, zone.lng]}
            radius={400}
            pathOptions={{
              color: RISK_COLORS[zone.risk],
              fillColor: RISK_COLORS[zone.risk],
              fillOpacity: 0.2,
              weight: 1,
            }}
          >
            <Popup>{zone.label}</Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
