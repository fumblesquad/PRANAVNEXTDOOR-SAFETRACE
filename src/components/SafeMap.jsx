import {
  MapContainer, TileLayer, Marker, Popup,
  Polyline, Circle, useMapEvents, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState, memo } from 'react';
import React from 'react';
import { riskColor } from '../data/config';
import { haversine } from '../App';

// ── Colours ────────────────────────────────────────────────────────
const TAG_COLOR = { police: '#38bdf8', hospital: '#34d399', school: '#fbbf24', crowd: '#c084fc' };
const TAG_ICON  = { police: '🚔', hospital: '🏥', school: '🏫', crowd: '🏬' };

// ── Leaflet icons (created once) ───────────────────────────────────
const PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:22px;height:22px;">
    <div style="width:22px;height:22px;background:#e81850;border-radius:50%;
      border:3px solid #fff;
      box-shadow:0 0 0 5px #e8185040,0 0 20px #e8185099;"></div>
    <div style="position:absolute;bottom:-13px;left:50%;transform:translateX(-50%);
      width:2px;height:13px;background:linear-gradient(#e81850,transparent);"></div>
  </div>`,
  iconSize: [22, 35], iconAnchor: [11, 35],
});

const DEST_ICON = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#fff;border:3px solid #e81850;
    border-radius:50%;box-shadow:0 0 14px #e8185088;"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8],
});

// Nav dot  pulsing ring
const NAV_DOT = L.divIcon({
  className: '',
  html: `<div class="nav-dot-outer"><div class="nav-dot-inner"></div></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

function makeUnsafeIcon(zone) {
  const c = riskColor(zone.risk);
  const isNews = zone.source === 'newsapi';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${isNews ? 12 : 10}px;height:${isNews ? 12 : 10}px;background:${c};border-radius:50%;
      opacity:0.85;
      border:2px solid ${isNews ? '#ffffffaa' : 'rgba(255,255,255,0.25)'};
      box-shadow:0 0 ${isNews ? 12 : 8}px ${c}cc;
      ${isNews ? 'animation:newsPulse 2s ease-in-out infinite;' : ''}
    "></div>`,
    iconSize: [isNews ? 12 : 10, isNews ? 12 : 10],
    iconAnchor: [isNews ? 6 : 5, isNews ? 6 : 5],
  });
}

function makeSafeIcon(tag, bright, selected, isGoogle) {
  const c = TAG_COLOR[tag] || '#888';
  const s = selected ? 18 : bright ? 13 : 7;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${s}px;height:${s}px;background:${selected ? '#fff' : c};border-radius:50%;
      opacity:${bright || selected ? 1 : 0.18};
      border:${selected ? `3px solid ${c}` : bright ? '2px solid rgba(255,255,255,.2)' : 'none'};
      box-shadow:0 0 ${selected ? 14 : bright ? 8 : 2}px ${c}${selected ? 'dd' : bright ? '99' : '22'};
    "></div>`,
    iconSize: [s, s], iconAnchor: [s / 2, s / 2],
  });
}

// ── Click handler ──────────────────────────────────────────────────
function ClickHandler({ onMapClick }) {
  useMapEvents({ click: e => onMapClick(e.latlng) });
  return null;
}

// ── FlyTo  only fires when target actually changes ─────────────────
function FlyTo({ lat, lng, zoom }) {
  const map  = useMap();
  const prev = useRef('');
  useEffect(() => {
    const key = `${lat},${lng},${zoom}`;
    if (prev.current === key) return;
    prev.current = key;
    map.flyTo([lat, lng], zoom, { duration: 1.0, easeLinearity: 0.3 });
  }, [lat, lng, zoom]);
  return null;
}

// ── Nav dot that smoothly walks along coords ───────────────────────
const NavDot = memo(function NavDot({ coords, onDone }) {
  const [pos, setPos] = useState(coords[0] || null);
  const idx           = useRef(0);
  const timer         = useRef(null);
  const map           = useMap();

  useEffect(() => {
    if (!coords?.length) return;
    idx.current = 0;
    clearInterval(timer.current);

    timer.current = setInterval(() => {
      if (idx.current >= coords.length) {
        clearInterval(timer.current);
        onDone?.();
        return;
      }
      const pt = coords[idx.current];
      setPos(pt);
      map.panTo(pt, { animate: true, duration: 0.15, easeLinearity: 0.5, noMoveStart: true });
      idx.current++;
    }, 80);

    return () => clearInterval(timer.current);
  }, [coords]);

  if (!pos) return null;
  return <Marker position={pos} icon={NAV_DOT} />;
});

// ── Main Map ───────────────────────────────────────────────────────
export default function SafeMap({
  pin, onMapClick,
  nearby,
  safePlaces,        // dynamic safe places array from App
  dest, routeData,
  navigating, stepIndex,
  showUnsafe,
  unsafeZones,       // dynamic unsafe zones array from App
}) {
  const nearbySet = useRef(new Set());

  // Keep nearbySet in sync with nearby prop
  useEffect(() => {
    nearbySet.current = new Set((nearby || []).map(p => p.id));
  }, [nearby]);

  const currentStepCoords = navigating && routeData?.steps?.[stepIndex]?.coords?.length
    ? routeData.steps[stepIndex].coords
    : null;

  const completedCoords = navigating && routeData
    ? routeData.steps.slice(0, stepIndex).flatMap(s => s.coords)
    : [];

  const remainingCoords = navigating && routeData
    ? routeData.steps.slice(stepIndex).flatMap(s => s.coords)
    : (routeData?.allCoords || []);

  const flyTarget = dest && pin && !navigating
    ? { lat: (pin.lat + dest.lat) / 2, lng: (pin.lng + dest.lng) / 2, zoom: 15 }
    : null;

  return (
    <MapContainer
      center={[13.0827, 80.2707]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CartoDB"
      />

      <ClickHandler onMapClick={onMapClick} />

      {flyTarget && (
        <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />
      )}

      {/* ── Unsafe zone circles ─────────────────────────────────── */}
      {showUnsafe && unsafeZones.map(zone => {
        const c = riskColor(zone.risk);
        const isNews = zone.source === 'newsapi';
        return (
          <React.Fragment key={zone.id}>
            {/* Outer glow ring */}
            <Circle
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{
                color: c,
                fillColor: c,
                fillOpacity: isNews ? 0.10 : 0.07,
                weight: isNews ? 1.5 : 1,
                opacity: isNews ? 0.50 : 0.35,
                dashArray: isNews ? '6 4' : '4 4',
              }}
            />
            {/* Inner solid fill */}
            <Circle
              center={[zone.lat, zone.lng]}
              radius={zone.radius * 0.45}
              pathOptions={{
                color: c,
                fillColor: c,
                fillOpacity: isNews ? 0.18 : 0.14,
                weight: 0,
              }}
            />
            {/* Centre marker with popup */}
            <Marker
              position={[zone.lat, zone.lng]}
              icon={makeUnsafeIcon(zone)}
            >
              <Popup className="st-popup">
                <div style={{
                  background: '#0d060a',
                  border: `1px solid ${c}44`,
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: 'DM Mono,monospace',
                  lineHeight: 1.6,
                  minWidth: 180,
                  maxWidth: 260,
                }}>
                  <div style={{ color: c, fontWeight: 600, marginBottom: 4 }}>
                    {isNews ? '📰' : '⚠'} {zone.label}
                  </div>
                  <div style={{ color: '#ffffff66', fontSize: 10 }}>{zone.note}</div>
                  <div style={{
                    marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
                  }}>
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 3,
                      background: `${c}22`, color: c, border: `1px solid ${c}44`,
                      letterSpacing: '0.08em',
                    }}>
                      {Math.round(zone.risk * 100)}% RISK
                    </span>
                    <span style={{ fontSize: 9, color: '#ffffff33' }}>
                      r&asymp;{zone.radius}m
                    </span>
                    {isNews && (
                      <span style={{
                        fontSize: 8, padding: '2px 5px', borderRadius: 3,
                        background: '#ff950018', color: '#ff9500',
                        letterSpacing: '0.06em',
                      }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  {isNews && zone.publishedAt && (
                    <div style={{ fontSize: 8, color: '#ffffff22', marginTop: 4 }}>
                      {new Date(zone.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}

      {/* ── Safe place markers ──────────────────────────────────── */}
      {safePlaces.map(p => {
        const bright   = nearbySet.current.has(p.id);
        const selected = dest?.id === p.id;
        const isGoogle = p.source === 'google';
        if (!bright && !selected) {
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={makeSafeIcon(p.tags[0], false, false, isGoogle)}
            />
          );
        }
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={makeSafeIcon(p.tags[0], bright, selected, isGoogle)}
          >
            <Popup className="st-popup">
              <div style={{
                background: '#080d12', color: '#fff',
                padding: '7px 11px', borderRadius: 7,
                fontSize: 12, fontFamily: 'DM Mono,monospace',
                lineHeight: 1.5,
              }}>
                <span style={{ color: TAG_COLOR[p.tags[0]] }}>
                  {TAG_ICON[p.tags[0]]} {p.name}
                </span>
                {isGoogle && (
                  <div style={{ fontSize: 9, color: '#ffffff33', marginTop: 3 }}>
                    {p.vicinity && <span>{p.vicinity}</span>}
                    {p.rating && <span style={{ marginLeft: 6 }}>{'★'} {p.rating}</span>}
                    {p.openNow !== null && (
                      <span style={{
                        marginLeft: 6,
                        color: p.openNow ? '#34d399' : '#ff6060',
                      }}>
                        {p.openNow ? 'Open' : 'Closed'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Route: completed (dim) + remaining (bright) */}
      {completedCoords.length > 1 && (
        <Polyline positions={completedCoords} color="#e81850" weight={3} opacity={0.2} />
      )}
      {remainingCoords.length > 1 && (
        <>
          <Polyline positions={remainingCoords} color="#e81850" weight={10} opacity={0.08} />
          <Polyline
            positions={remainingCoords}
            color="#e81850"
            weight={3.5}
            opacity={0.92}
            dashArray={navigating ? '10,6' : undefined}
          />
        </>
      )}

      {/* User pin */}
      {pin && !navigating && (
        <Marker position={[pin.lat, pin.lng]} icon={PIN_ICON}>
          <Popup className="st-popup">
            <div style={{ background: '#0d060a', color: '#e81850', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'DM Mono,monospace' }}>
              you are here
            </div>
          </Popup>
        </Marker>
      )}

      {/* Destination marker */}
      {dest && !navigating && (
        <Marker position={[dest.lat, dest.lng]} icon={DEST_ICON} />
      )}

      {/* Animated nav dot */}
      {navigating && currentStepCoords && (
        <NavDot
          key={stepIndex}
          coords={currentStepCoords}
        />
      )}

      <style>{`
        .st-popup .leaflet-popup-content-wrapper{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important;}
        .st-popup .leaflet-popup-tip-container{display:none;}
        .leaflet-control-zoom{display:none;}
        .nav-dot-outer{
          width:24px;height:24px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          animation:navRing 1.2s ease-in-out infinite;
        }
        .nav-dot-inner{
          width:14px;height:14px;background:#e81850;border-radius:50%;
          border:2.5px solid #fff;
          box-shadow:0 0 10px #e81850cc;
        }
        @keyframes navRing{
          0%,100%{box-shadow:0 0 0 0 #e8185055;}
          50%{box-shadow:0 0 0 8px #e8185000;}
        }
        @keyframes newsPulse{
          0%,100%{opacity:0.85;box-shadow:0 0 8px currentColor;}
          50%{opacity:1;box-shadow:0 0 16px currentColor;}
        }
      `}</style>
    </MapContainer>
  );
}
