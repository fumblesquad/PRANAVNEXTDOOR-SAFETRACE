import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { submitReport, addEvidence, createUser, linkCaseToUser } from '../services/dbService';
import { hashFile } from '../utils/hashFile';
import { useAuth } from '../context/AuthContext';
import { usePageNav } from '../context/PageNavContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const INCIDENT_TYPES = ['Harassment', 'Theft', 'Unsafe Area', 'Poor Lighting', 'Stalking', 'Other'];

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

export default function Report() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goToPage } = usePageNav() || {};

  const [type, setType] = useState(params.get('type') || '');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [locating, setLocating] = useState(false);
  const [markerPos, setMarkerPos] = useState(null);
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);

  // Each entry: { file: File, hash: string | null }
  const [fileEntries, setFileEntries] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [caseId, setCaseId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(c);
        setLocation({ lat: c[0], lng: c[1] });
        setMarkerPos(c);
        setLocating(false);
      },
      () => { setLocating(false); }
    );
  }, []);

  // Sync type from URL param changes (e.g. Quick Report tap)
  useEffect(() => {
    const t = params.get('type');
    if (t) setType(t);
  }, [params]);

  function handleLocationPick(latlng) {
    setLocation(latlng);
    setMarkerPos([latlng.lat, latlng.lng]);
  }

  async function handleFileChange(e) {
    const picked = Array.from(e.target.files).slice(0, 5 - fileEntries.length);
    if (!picked.length) return;

    // Add entries immediately with null hash so UI shows file name right away
    const newEntries = picked.map(file => ({ file, hash: null }));
    setFileEntries(prev => [...prev, ...newEntries].slice(0, 5));

    // Compute hashes asynchronously and update each entry as it resolves
    picked.forEach(async (file) => {
      const hash = await hashFile(file);
      setFileEntries(prev =>
        prev.map(entry => entry.file === file ? { ...entry, hash } : entry)
      );
    });
  }

  function removeFile(index) {
    setFileEntries(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!type) { setError('Please select an incident type.'); return; }
    if (!location) { setError('Please select a location on the map.'); return; }

    setError('');
    setSubmitting(true);
    try {
      const uid = user?.uid ?? null;

      const id = await submitReport({
        type: type.toLowerCase(),
        description,
        location: { lat: location.lat, lng: location.lng, label: locationLabel },
        uid,
      });

      // Save evidence metadata (hash only — no file upload)
      if (fileEntries.length > 0) {
        await Promise.all(
          fileEntries.map(async ({ file, hash }) => {
            const sha256Hash = hash ?? await hashFile(file);
            const fileType = file.type.startsWith('image/') ? 'image'
              : file.type.startsWith('audio/') ? 'audio'
              : 'document';
            await addEvidence({ caseId: id, fileName: file.name, fileType, sha256Hash, uid });
          })
        );
      }

      // Upsert user profile and link case when signed in
      if (user) {
        const provider = user.app_metadata?.provider ?? 'email';
        await createUser(user.uid, user.email, provider);
        await linkCaseToUser(user.uid, id);
      }

      setCaseId(id);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(caseId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (caseId) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '420px',
          width: '100%',
          background: '#111',
          border: '1px solid #1a2a1a',
          borderRadius: '12px',
          padding: '48px 40px',
        }}>
          {/* Check circle */}
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: '#0d2010', border: '2px solid #2ecc71',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>Report Submitted</h2>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '24px' }}>
            Save this ID to track your report.
          </p>

          {/* Case ID display */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #2ecc71',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '14px',
          }}>
            <p style={{ color: '#555', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 6px' }}>Case ID</p>
            <p style={{ color: '#2ecc71', fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>{caseId}</p>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            style={{
              width: '100%', padding: '10px',
              background: copied ? '#0d2010' : '#1a1a1a',
              border: `1px solid ${copied ? '#2ecc71' : '#2a2a2a'}`,
              borderRadius: '7px', color: copied ? '#2ecc71' : '#888',
              fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              marginBottom: '20px', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            }}
          >
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy Case ID
              </>
            )}
          </button>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => navigate(`/track?caseId=${caseId}`)}
              style={{
                flex: 1, padding: '12px',
                background: '#e81850', border: 'none',
                borderRadius: '8px', color: '#fff',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Track Case
            </button>
            <button
              onClick={() => goToPage ? goToPage(0) : navigate('/')}
              style={{
                flex: 1, padding: '12px',
                background: 'none', border: '1px solid #2a2a2a',
                borderRadius: '8px', color: '#888',
                fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Done
            </button>
          </div>

          {!user && (
            <p style={{ color: '#444', fontSize: '13px', borderTop: '1px solid #1a1a1a', paddingTop: '16px' }}>
              <a href="/signin" style={{ color: '#e81850', textDecoration: 'none' }}>Sign in</a>
              {' '}to track this report's status.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#0a0a0a', padding: '36px 24px 96px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Submit Report</h1>
        <p style={{ color: '#444', fontSize: '13px', marginBottom: '32px' }}>
          Anonymous by default. No personal data stored.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Incident Type */}
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
                    border: type === t ? '1px solid #e81850' : '1px solid #2a2a2a',
                    background: type === t ? 'rgba(232,24,80,0.14)' : '#111',
                    color: type === t ? '#e81850' : '#777',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>
              Location
              {locating && (
                <span style={{ color: '#555', fontWeight: 400, marginLeft: '8px', fontSize: '12px' }}>
                  Locating you...
                </span>
              )}
            </label>

            {/* Map */}
            <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1e1e1e', isolation: 'isolate', position: 'relative', zIndex: 0 }}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '220px', width: '100%' }}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <LocationPicker onSelect={handleLocationPick} />
                {markerPos && <Marker position={markerPos} />}
              </MapContainer>
            </div>

            {/* Coordinates display */}
            {location && !locating && (
              <p style={{ color: '#333', fontSize: '12px', marginTop: '6px', marginBottom: '8px', fontFamily: 'monospace' }}>
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}

            {/* Manual label */}
            <input
              type="text"
              placeholder="Location label (e.g. T. Nagar metro exit)"
              value={locationLabel}
              onChange={e => setLocationLabel(e.target.value)}
              style={{ ...inputStyle, marginTop: location ? '0' : '10px' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', marginTop: '10px', lineHeight: 1.6 }}
            />
          </div>

          {/* Evidence */}
          <div>
            <label style={labelStyle}>
              Evidence{' '}
              <span style={{ color: '#444', fontWeight: 400 }}>(images or audio, up to 5)</span>
            </label>
            <div
              style={{
                marginTop: '10px',
                border: '1px dashed #2a2a2a',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
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
              <p style={{ color: '#444', fontSize: '13px', margin: 0 }}>
                Tap to upload ({fileEntries.length}/5)
              </p>
            </div>

            {fileEntries.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fileEntries.map(({ file, hash }, i) => (
                  <div key={i} style={{
                    background: '#111', border: '1px solid #1e1e1e',
                    borderRadius: '8px', padding: '10px 12px',
                  }}>
                    {/* File name + remove */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hash ? '8px' : '0' }}>
                      <span style={{ color: '#bbb', fontSize: '13px' }}>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1, fontFamily: 'inherit' }}
                      >
                        ×
                      </button>
                    </div>

                    {/* Hash display */}
                    {hash === null ? (
                      <p style={{ color: '#333', fontSize: '11px', margin: 0 }}>Computing hash...</p>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#555', fontSize: '11px', fontFamily: 'monospace' }}>
                          SHA-256: {hash.slice(0, 16)}...
                        </span>
                        <span style={{
                          background: '#0d1a0d', border: '1px solid #1a3a1a',
                          color: '#2ecc71', padding: '2px 7px',
                          borderRadius: '4px', fontSize: '10px', letterSpacing: '0.5px',
                        }}>
                          Verified
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p style={{ color: '#e81850', fontSize: '13px', margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '14px',
              background: '#e81850',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              fontFamily: 'inherit',
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
  color: '#bbb',
  fontSize: '13px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
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
  fontFamily: 'inherit',
};
