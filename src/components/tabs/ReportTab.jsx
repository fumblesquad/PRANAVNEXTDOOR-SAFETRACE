import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { submitReport, addEvidence } from '../../services/dbService';
import { hashFile } from '../../utils/hashFile';
import { useAuth } from '../../context/AuthContext';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const INCIDENT_TYPES = [
  { id: 'harassment', label: 'Harassment', icon: '⚠️' },
  { id: 'theft', label: 'Theft', icon: '🔓' },
  { id: 'unsafe area', label: 'Unsafe Area', icon: '🚫' },
  { id: 'poor lighting', label: 'Poor Lighting', icon: '💡' },
  { id: 'stalking', label: 'Stalking', icon: '👁️' },
  { id: 'other', label: 'Other', icon: '•••' },
];

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

export default function ReportTab() {
  const { user } = useAuth() || {};
  
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [locating, setLocating] = useState(false);
  const [markerPos, setMarkerPos] = useState(null);
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);
  
  const [fileEntries, setFileEntries] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [caseId, setCaseId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect location
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
      () => setLocating(false),
      { timeout: 10000 }
    );
  }, []);

  function handleLocationPick(latlng) {
    setLocation(latlng);
    setMarkerPos([latlng.lat, latlng.lng]);
  }

  async function handleFileChange(e) {
    const picked = Array.from(e.target.files).slice(0, 5 - fileEntries.length);
    if (!picked.length) return;

    const newEntries = picked.map(file => ({ file, hash: null }));
    setFileEntries(prev => [...prev, ...newEntries].slice(0, 5));

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

  async function handleSubmit() {
    if (!selectedType) { setError('Please select an incident type.'); return; }
    if (!location) { setError('Please select a location on the map.'); return; }

    setError('');
    setSubmitting(true);
    try {
      const uid = user?.uid ?? null;

      const id = await submitReport({
        type: selectedType,
        description,
        location: { lat: location.lat, lng: location.lng, label: locationLabel },
        uid,
      });

      // Save evidence metadata
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

      setCaseId(id);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error('Submit error:', err);
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

  function resetForm() {
    setSelectedType(null);
    setDescription('');
    setFileEntries([]);
    setCaseId(null);
    setError('');
  }

  // Success state
  if (caseId) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#0d2010', border: '2px solid #2ecc71',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Report Submitted</h2>
        <p style={{ color: '#555', fontSize: '13px', marginBottom: '20px' }}>
          Save this ID to track your report.
        </p>

        <div style={{
          background: '#111',
          border: '1px solid #2ecc71',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px',
        }}>
          <p style={{ color: '#555', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>Case ID</p>
          <p style={{ color: '#2ecc71', fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>{caseId}</p>
        </div>

        <button
          onClick={handleCopy}
          style={{
            width: '100%', padding: '12px',
            background: copied ? '#0d2010' : '#1a1a1a',
            border: `1px solid ${copied ? '#2ecc71' : '#2a2a2a'}`,
            borderRadius: '8px', color: copied ? '#2ecc71' : '#888',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          {copied ? '✓ Copied' : 'Copy Case ID'}
        </button>

        <button
          onClick={resetForm}
          style={{
            width: '100%', padding: '12px',
            background: '#e81850',
            border: 'none',
            borderRadius: '8px', color: '#fff',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: '#fff' }}>Report Incident</h1>
      <p style={{ color: '#444', fontSize: '12px', marginBottom: '24px' }}>
        Anonymous by default. No personal data stored.
      </p>

      {/* Incident type grid */}
      <p style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
        Select incident type
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '24px',
      }}>
        {INCIDENT_TYPES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSelectedType(id)}
            style={{
              padding: '16px 12px',
              background: selectedType === id ? 'rgba(232,24,80,0.15)' : '#111',
              border: selectedType === id ? '1px solid #e81850' : '1px solid #1e1e1e',
              borderRadius: '10px',
              color: selectedType === id ? '#e81850' : '#888',
              fontSize: '13px',
              fontWeight: selectedType === id ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'center',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Expanded form when type selected */}
      {selectedType && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Description */}
          <div>
            <p style={labelStyle}>Description</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Location */}
          <div>
            <p style={labelStyle}>
              Location
              {locating && <span style={{ color: '#555', fontWeight: 400, marginLeft: '8px' }}>Detecting...</span>}
            </p>
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #1e1e1e', marginBottom: '10px' }}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '160px', width: '100%' }}
                attributionControl={false}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <LocationPicker onSelect={handleLocationPick} />
                {markerPos && <Marker position={markerPos} />}
              </MapContainer>
            </div>
            {location && (
              <p style={{ color: '#333', fontSize: '11px', fontFamily: 'monospace', marginBottom: '8px' }}>
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}
            <input
              type="text"
              placeholder="Location label (e.g. T. Nagar metro)"
              value={locationLabel}
              onChange={e => setLocationLabel(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Evidence */}
          <div>
            <p style={labelStyle}>Evidence <span style={{ color: '#444', fontWeight: 400 }}>(optional)</span></p>
            <div
              onClick={() => document.getElementById('evidenceInput').click()}
              style={{
                border: '1px dashed #2a2a2a',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <input
                id="evidenceInput"
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hash ? '6px' : '0' }}>
                      <span style={{ color: '#bbb', fontSize: '12px' }}>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '16px', padding: 0, fontFamily: 'inherit' }}
                      >
                        ×
                      </button>
                    </div>
                    {hash === null ? (
                      <p style={{ color: '#333', fontSize: '10px', margin: 0 }}>Computing hash...</p>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          background: '#0d1a0d', border: '1px solid #1a3a1a',
                          color: '#2ecc71', padding: '2px 6px',
                          borderRadius: '4px', fontSize: '9px',
                        }}>
                          Verified
                        </span>
                        <span style={{ color: '#444', fontSize: '10px', fontFamily: 'monospace' }}>
                          SHA-256: {hash.slice(0, 12)}...
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
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '14px',
              background: submitting ? '#7a2f4a' : '#e81850',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: submitting ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  color: '#888',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '10px',
};
