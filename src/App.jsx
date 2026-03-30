import { useState, useEffect, useCallback, useRef } from 'react';
import SafeMap from './components/SafeMap';
import SidePanel from './components/SidePanel';
import NavOverlay from './components/NavOverlay';
import {
  GOOGLE_API_KEY, NEWSAPI_KEY,
  STATIC_SAFE_PLACES, STATIC_UNSAFE_ZONES,
  fetchNearbyPlaces, fetchNewsHazards,
} from './data/config';

// ── Haversine distance (metres) ────────────────────────────────────
export function haversine(a, b) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ── Google polyline decoder ────────────────────────────────────────
export function decodePolyline(encoded) {
  let index = 0, lat = 0, lng = 0;
  const out = [];
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    out.push([lat / 1e5, lng / 1e5]);
  }
  return out;
}

// ── Fetch walking route  Google first, OSRM fallback ──────────────
async function fetchRoute(start, end) {
  // Try Google Directions
  try {
    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${start.lat},${start.lng}` +
      `&destination=${end.lat},${end.lng}` +
      `&mode=walking&key=${GOOGLE_API_KEY}`;
    const data = await fetch(url).then(r => r.json());

    if (data.status === 'OK') {
      const leg = data.routes[0].legs[0];
      const steps = leg.steps.map(s => ({
        instruction: stripHTML(s.html_instructions),
        distance:    s.distance.text,
        distanceM:   s.distance.value,
        maneuver:    s.maneuver || '',
        coords:      decodePolyline(s.polyline.points),
      }));
      const allCoords = steps.flatMap(s => s.coords);
      return {
        allCoords,
        steps,
        totalDist: leg.distance.text,
        totalTime: leg.duration.text,
      };
    }
  } catch (_) {}

  // OSRM fallback
  try {
    const url =
      `https://router.project-osrm.org/route/v1/foot/` +
      `${start.lng},${start.lat};${end.lng},${end.lat}` +
      `?overview=full&geometries=geojson&steps=true&annotations=false`;
    const data = await fetch(url).then(r => r.json());

    if (data.code === 'Ok') {
      const route = data.routes[0];
      const leg   = route.legs[0];

      const steps = leg.steps
        .filter(s => s.maneuver?.type !== 'depart' || leg.steps.indexOf(s) === 0)
        .map(s => {
          const raw = s.geometry?.coordinates || [];
          const coords = raw.length ? raw.map(([ln, la]) => [la, ln]) : [];
          return {
            instruction: buildOSRMInstruction(s),
            distance:    `${Math.round(s.distance)} m`,
            distanceM:   s.distance,
            maneuver:    s.maneuver?.modifier || s.maneuver?.type || '',
            coords,
          };
        });

      const allCoords = route.geometry.coordinates.map(([ln, la]) => [la, ln]);
      return {
        allCoords,
        steps,
        totalDist: `${(route.distance / 1000).toFixed(2)} km`,
        totalTime: `${Math.ceil(route.duration / 60)} min`,
      };
    }
  } catch (_) {}

  return null;
}

function stripHTML(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildOSRMInstruction(s) {
  const type = s.maneuver?.type  || '';
  const mod  = s.maneuver?.modifier || '';
  const name = s.name ? ` on ${s.name}` : '';
  const dist = s.distance > 0 ? ` for ${Math.round(s.distance)} m` : '';

  const verbs = {
    depart:       `Head ${mod}${name}`,
    arrive:       'Arrive at your destination',
    turn:         `Turn ${mod}${name}`,
    'new name':   `Continue${name}`,
    continue:     `Continue straight${name}`,
    merge:        `Merge ${mod}${name}`,
    'on ramp':    `Take the ramp ${mod}${name}`,
    'off ramp':   `Take the exit ${mod}${name}`,
    fork:         `Keep ${mod} at the fork${name}`,
    roundabout:   `At the roundabout, take the exit${name}`,
    rotary:       `At the rotary, take the exit${name}`,
    'end of road':`At the end of the road, turn ${mod}${name}`,
    notification: `Continue${name}`,
  };

  return (verbs[type] || `Continue${name}`) + dist;
}

// ── Root component ─────────────────────────────────────────────────
export default function App() {
  const [pin, setPin]               = useState(null);
  const [nearby, setNearby]         = useState([]);
  const [dest, setDest]             = useState(null);
  const [routeData, setRouteData]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [stepIndex, setStepIndex]   = useState(0);
  const [showUnsafe, setShowUnsafe] = useState(true);

  // ── Dynamic data state ─────────────────────────────────────────
  const [safePlaces, setSafePlaces]     = useState(STATIC_SAFE_PLACES);
  const [unsafeZones, setUnsafeZones]   = useState(STATIC_UNSAFE_ZONES);
  const [newsLoading, setNewsLoading]   = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [dataStatus, setDataStatus]     = useState({ places: 'static', news: 'static' });

  // Track whether news has been fetched this session (fetch once)
  const newsFetched = useRef(false);

  // ── Fetch news hazards on first load ───────────────────────────
  useEffect(() => {
    if (newsFetched.current) return;
    if (!NEWSAPI_KEY || NEWSAPI_KEY === 'e8d48558cb3e46a3a0944a80a1857cbc') return;

    newsFetched.current = true;
    setNewsLoading(true);

    fetchNewsHazards(NEWSAPI_KEY)
      .then(newsZones => {
        if (newsZones.length > 0) {
          setUnsafeZones(prev => [...prev, ...newsZones]);
          setDataStatus(prev => ({ ...prev, news: 'live' }));
          console.log(`[SafeTrace] Loaded ${newsZones.length} live news hazard zones`);
        }
      })
      .catch(err => console.warn('[SafeTrace] News fetch error:', err))
      .finally(() => setNewsLoading(false));
  }, []);

  // ── Fetch Google Places when pin is dropped ────────────────────
  const fetchPlacesForPin = useCallback(async (lat, lng) => {
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
      // No API key: use static places
      return STATIC_SAFE_PLACES;
    }

    setPlacesLoading(true);
    try {
      const dynamicPlaces = await fetchNearbyPlaces(lat, lng, GOOGLE_API_KEY);
      if (dynamicPlaces.length > 0) {
        // Merge: dynamic Google results + static fallback (deduped by proximity)
        const merged = [...dynamicPlaces];
        for (const sp of STATIC_SAFE_PLACES) {
          const tooClose = dynamicPlaces.some(dp =>
            haversine({ lat: sp.lat, lng: sp.lng }, { lat: dp.lat, lng: dp.lng }) < 100
          );
          if (!tooClose) merged.push(sp);
        }
        setSafePlaces(merged);
        setDataStatus(prev => ({ ...prev, places: 'live' }));
        console.log(`[SafeTrace] Loaded ${dynamicPlaces.length} Google Places + ${merged.length - dynamicPlaces.length} static`);
        return merged;
      }
    } catch (err) {
      console.warn('[SafeTrace] Google Places error, using static fallback:', err);
    } finally {
      setPlacesLoading(false);
    }
    return STATIC_SAFE_PLACES;
  }, []);

  // ── Pin drop handler (now async to wait for Places) ────────────
  const handlePinDrop = useCallback(async (latlng) => {
    if (navigating) return;
    const { lat, lng } = latlng;
    setPin({ lat, lng });

    // Fetch dynamic places first, then compute nearby
    const places = await fetchPlacesForPin(lat, lng);
    const sorted = [...places]
      .map(p => ({ ...p, _dist: haversine({ lat, lng }, p) }))
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 8);
    setNearby(sorted);
  }, [navigating, fetchPlacesForPin]);

  async function handleSelectDest(place) {
    setDest(place);
    setRouteData(null);
    setLoading(true);
    const result = await fetchRoute(pin, place);
    setRouteData(result);
    setLoading(false);
  }

  function handleStartNav() {
    setNavigating(true);
    setStepIndex(0);
  }

  function handleReset() {
    setPin(null);
    setNearby([]);
    setDest(null);
    setRouteData(null);
    setNavigating(false);
    setStepIndex(0);
    setLoading(false);
  }

  function handleChangeDestination() {
    setDest(null);
    setRouteData(null);
    setNavigating(false);
    setStepIndex(0);
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      background: '#07070e', overflow: 'hidden',
      fontFamily: "'DM Mono', monospace",
    }}>
      {/* Side panel  hidden during active navigation */}
      {!navigating && (
        <SidePanel
          pin={pin}
          nearby={nearby}
          dest={dest}
          routeData={routeData}
          loading={loading}
          showUnsafe={showUnsafe}
          onToggleUnsafe={() => setShowUnsafe(v => !v)}
          onSelectDest={handleSelectDest}
          onStartNav={handleStartNav}
          onReset={handleReset}
          onChangeDest={handleChangeDestination}
          unsafeZones={unsafeZones}
          dataStatus={dataStatus}
          newsLoading={newsLoading}
          placesLoading={placesLoading}
        />
      )}

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <SafeMap
          pin={pin}
          onMapClick={handlePinDrop}
          nearby={nearby}
          safePlaces={safePlaces}
          dest={dest}
          routeData={routeData}
          navigating={navigating}
          stepIndex={stepIndex}
          showUnsafe={showUnsafe}
          unsafeZones={unsafeZones}
        />

        {/* Tap hint */}
        {!pin && (
          <div style={{
            position: 'absolute', bottom: 32, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 800,
            background: 'rgba(7,7,14,0.9)',
            border: '1px solid #e8185033',
            color: '#fff', padding: '12px 28px',
            borderRadius: 40, fontSize: 13,
            letterSpacing: '0.08em',
            backdropFilter: 'blur(12px)',
            pointerEvents: 'none',
            animation: 'breathe 2.4s ease-in-out infinite',
          }}>
            tap anywhere to drop your pin
          </div>
        )}

        {/* Route loading spinner */}
        {loading && (
          <div style={{
            position: 'absolute', bottom: 32, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 800,
            background: 'rgba(7,7,14,0.9)',
            border: '1px solid #e8185044',
            color: '#e81850', padding: '12px 24px',
            borderRadius: 40, fontSize: 12,
            letterSpacing: '0.1em',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            calculating route...
          </div>
        )}

        {/* Dynamic data loading indicator */}
        {(newsLoading || placesLoading) && (
          <div style={{
            position: 'absolute', top: 16, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 800,
            background: 'rgba(7,7,14,0.92)',
            border: '1px solid #38bdf822',
            color: '#38bdf8', padding: '8px 20px',
            borderRadius: 30, fontSize: 10,
            letterSpacing: '0.12em',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
            {newsLoading && placesLoading
              ? 'LOADING LIVE DATA...'
              : newsLoading
                ? 'FETCHING NEWS HAZARDS...'
                : 'FETCHING NEARBY PLACES...'}
          </div>
        )}

        {/* Live data badge  top-left when live data is active */}
        {(dataStatus.places === 'live' || dataStatus.news === 'live') && !newsLoading && !placesLoading && (
          <div style={{
            position: 'absolute', top: 16, left: 16,
            zIndex: 800,
            background: 'rgba(7,7,14,0.88)',
            border: '1px solid #34d39922',
            borderRadius: 8,
            padding: '6px 12px',
            backdropFilter: 'blur(12px)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 8,
            letterSpacing: '0.12em',
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            {dataStatus.places === 'live' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#34d399',
                  boxShadow: '0 0 6px #34d399',
                  animation: 'breathe 2s ease-in-out infinite',
                }} />
                <span style={{ color: '#34d399' }}>PLACES LIVE</span>
              </div>
            )}
            {dataStatus.news === 'live' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#ff9500',
                  boxShadow: '0 0 6px #ff9500',
                  animation: 'breathe 2s ease-in-out infinite',
                }} />
                <span style={{ color: '#ff9500' }}>NEWS LIVE</span>
              </div>
            )}
          </div>
        )}

        {/* Unsafe zone legend  bottom right */}
        {showUnsafe && (
          <div style={{
            position: 'absolute', bottom: 32, right: 16,
            zIndex: 800,
            background: 'rgba(7,7,14,0.88)',
            border: '1px solid #ffffff0a',
            borderRadius: 10,
            padding: '10px 14px',
            backdropFilter: 'blur(12px)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.1em',
          }}>
            <div style={{ color: '#ffffff33', marginBottom: 7 }}>RISK ZONES</div>
            {[
              { label: 'HIGH',   color: '#ff2d55' },
              { label: 'MEDIUM', color: '#ff9500' },
              { label: 'LOW',    color: '#ffcc00' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: r.color,
                  boxShadow: `0 0 6px ${r.color}`,
                }} />
                <span style={{ color: r.color }}>{r.label}</span>
              </div>
            ))}
            {dataStatus.news === 'live' && (
              <>
                <div style={{ height: 1, background: '#ffffff08', margin: '6px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10 }}>📰</span>
                  <span style={{ color: '#ff950088' }}>= LIVE NEWS</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nav overlay  full screen takeover */}
      {navigating && routeData && (
        <NavOverlay
          steps={routeData.steps}
          allCoords={routeData.allCoords}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          totalDist={routeData.totalDist}
          totalTime={routeData.totalTime}
          destName={dest?.name}
          onEnd={handleReset}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e8185033; border-radius: 2px; }
        @keyframes breathe {
          0%,100% { opacity: .65; transform: translateX(-50%) scale(1); }
          50%      { opacity: 1;   transform: translateX(-50%) scale(1.02); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
