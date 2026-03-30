import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { submitReport } from '../firebase/reports';
import { uploadEvidence } from '../firebase/storage';
import { useAuth } from '../context/AuthContext';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const INCIDENT_TYPES = ['Harassment', 'Theft', 'Unsafe Area', 'Poor Lighting', 'Stalking', 'Other'];

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function Report() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [type, setType] = useState(params.get('type') || '');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [files, setFiles] = useState([]);
  const [optIn, setOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [caseId, setCaseId] = useState(null);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(c);
        setLocation({ lat: c[0], lng: c[1] });
        setMarkerPos(c);
      },
      () => {}
    );
  }, []);

  function handleFileChange(e) {
    const picked = Array.from(e.target.files).slice(0, 5);
    setFiles(prev => [...prev, ...picked].slice(0, 5));
  }

  function handleLocationPick(latlng) {
    setLocation(latlng);
    setMarkerPos([latlng.lat, latlng.lng]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!type) { setError('Please select an incident type.'); return; }
    if (!location) { setError('Please select a location on the map.'); return; }

    setError('');
    setSubmitting(true);
    try {
      const evidenceUploads = await Promise.all(
        files.map(f => uploadEvidence(f, 'temp'))
      );
      const evidenceUrls = evidenceUploads.map(e => ({ url: e.url, hash: e.hash, name: e.name }));

      const userId = (user && optIn) ? user.uid : null;
      const id = await submitReport({ type: type.toLowerCase(), description, location, evidenceUrls, userId });
      setCaseId(id);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (caseId) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 56px)',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '420px',
          background: '#111',
          border: '1px solid #1a2a1a',
          borderRadius: '12px',
          padding: '48px 40px',
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#0d2010', border: '2px solid #2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '24px' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Report Submitted</h2>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '24px' }}>
            Your anonymous report has been filed. Save your case ID to track progress.
          </p>
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #2ecc71',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <p style={{ color: '#666', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 6px' }}>Case ID</p>
            <p style={{ color: '#2ecc71', fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>{caseId}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate(`/track?caseId=${caseId}`)}
              style={{
                flex: 1,
                padding: '12px',
                background: '#D4537E',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Track Case
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'none',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#aaa',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#0a0a0a', padding: '40px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Submit Report</h1>
        <p style={{ color: '#555', fontSize: '14px', marginBottom: '36px' }}>
          All reports are anonymous by default. No personal data is stored.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Type */}
          <div>
            <label style={labelStyle}>Incident Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {INCIDENT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: type === t ? '1px solid #D4537E' : '1px solid #2a2a2a',
                    background: type === t ? 'rgba(212,83,126,0.15)' : '#111',
                    color: type === t ? '#D4537E' : '#888',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Location <span style={{ color: '#555', fontWeight: 400 }}>(click map to pin)</span></label>
            <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #222', isolation: 'isolate', position: 'relative', zIndex: 0 }}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '280px', width: '100%' }}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <LocationPicker onSelect={handleLocationPick} />
                {markerPos && <Marker position={markerPos} />}
              </MapContainer>
            </div>
            {location && (
              <p style={{ color: '#444', fontSize: '12px', marginTop: '6px' }}>
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                marginTop: '10px',
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Evidence */}
          <div>
            <label style={labelStyle}>Evidence <span style={{ color: '#555', fontWeight: 400 }}>(images or audio, up to 5 files)</span></label>
            <div
              style={{
                marginTop: '10px',
                border: '1px dashed #2a2a2a',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*,audio/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>
                Click to upload files ({files.length}/5)
              </p>
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {files.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '6px',
                    padding: '6px 10px',
                  }}>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opt-in if signed in */}
          {user && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={optIn}
                onChange={e => setOptIn(e.target.checked)}
                style={{ accentColor: '#D4537E' }}
              />
              <span style={{ color: '#888', fontSize: '13px' }}>
                Link this report to my account (allows you to view it in Evidence Locker)
              </span>
            </label>
          )}

          {error && <p style={{ color: '#D4537E', fontSize: '13px', margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '14px',
              background: '#D4537E',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Anonymous Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  color: '#ccc',
  fontSize: '14px',
  fontWeight: 600,
};

const inputStyle = {
  padding: '12px 14px',
  background: '#111',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};
