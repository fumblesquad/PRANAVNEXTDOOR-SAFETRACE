import { useState } from 'react';
import { submitReport } from '../services/dbService';

export default function SOSButton() {
  const [triggered, setTriggered] = useState(false);

  async function handleSOS() {
    setTriggered(true);

    // Flash red overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; background: #cc0000;
      z-index: 9999; opacity: 0.85; pointer-events: none;
      animation: sosPulse 0.5s ease-in-out 4;
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2000);

    // Get location
    let location = null;
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
      );
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {}

    // Auto-submit anonymous SOS report
    try {
      await submitReport({
        type: 'SOS',
        description: 'Emergency SOS triggered',
        location,
      });
    } catch {}

    // Call emergency
    window.location.href = 'tel:112';

    setTimeout(() => setTriggered(false), 3000);
  }

  return (
    <button
      onClick={handleSOS}
      disabled={triggered}
      style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: triggered ? '#8b0000' : '#e81850',
        border: '4px solid rgba(232,24,80, 0.3)',
        color: '#fff',
        fontSize: '22px',
        fontWeight: 800,
        letterSpacing: '2px',
        cursor: triggered ? 'default' : 'pointer',
        boxShadow: triggered
          ? '0 0 40px rgba(232,24,80, 0.8), 0 0 80px rgba(232,24,80, 0.4)'
          : '0 0 20px rgba(232,24,80, 0.4)',
        transition: 'all 0.2s',
        animation: triggered ? 'sosPulse 0.5s ease-in-out infinite' : 'sosGlow 2s ease-in-out infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {triggered ? '...' : 'SOS'}
    </button>
  );
}
