import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

export default function SOS() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const [flashing, setFlashing] = useState(false);
  const startYRef = useRef(0);

  const navigateToApp = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  // Swipe up detection on window
  useEffect(() => {
    const handleTouchStart = (e) => {
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const deltaY = startYRef.current - e.changedTouches[0].clientY;
      if (deltaY > 60) {
        navigateToApp();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigateToApp]);

  async function handleSOS(e) {
    e.stopPropagation();
    setFlashing(true);

    // Get location
    let location = null;
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      // Location unavailable — continue without it
    }

    // Submit SOS report
    try {
      await submitReport({
        type: 'sos',
        description: 'Emergency SOS triggered',
        location,
        uid: user?.uid ?? null,
      });
    } catch (err) {
      console.error('SOS report failed:', err);
    }

    // Call emergency number
    window.location.href = 'tel:112';

    // Reset flash after 1.5s
    setTimeout(() => setFlashing(false), 1500);
  }

  function handleBackgroundClick(e) {
    // Navigate to app when clicking anywhere except the SOS button
    navigateToApp();
  }

  return (
    <div
      onClick={handleBackgroundClick}
      style={{
        minHeight: '100vh',
        background: flashing ? '#E24B4A' : '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px 24px 40px',
        transition: 'background 0.15s ease-out',
        cursor: 'pointer',
      }}
    >
      <style>{`
        @keyframes bounceUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes sosPulseRing {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
        <svg width="40" height="40" viewBox="0 0 34 34" fill="none">
          <path 
            d="M17 3L5 8v10c0 7.18 5.82 13 12 13s12-5.82 12-13V8L17 3z"
            fill="none" 
            stroke={flashing ? '#fff' : '#D4537E'} 
            strokeWidth="2" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 17l3.5 3.5L22 14"
            stroke={flashing ? '#fff' : '#D4537E'} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        <p style={{ 
          color: flashing ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', 
          fontSize: '13px', 
          fontWeight: 600,
          marginTop: '8px',
          letterSpacing: '1px',
        }}>
          SafeTrace
        </p>
      </div>

      {/* SOS Button */}
      <button
        onClick={handleSOS}
        style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: '#E24B4A',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'transform 0.1s ease-out',
          boxShadow: '0 0 60px rgba(226,75,74,0.3)',
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Outer ring */}
        <div style={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '50%',
          border: '2px solid rgba(226,75,74,0.3)',
          pointerEvents: 'none',
        }} />
        
        {/* Pulse ring */}
        <div style={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '50%',
          border: '2px solid rgba(226,75,74,0.4)',
          animation: 'sosPulseRing 2s ease-out infinite',
          pointerEvents: 'none',
        }} />

        <span style={{
          color: '#fff',
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '4px',
          pointerEvents: 'none',
        }}>
          SOS
        </span>
        <span style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '11px',
          marginTop: '6px',
          pointerEvents: 'none',
        }}>
          Press in emergency
        </span>
      </button>

      {/* Swipe up hint */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'none',
      }}>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={flashing ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)'}
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ animation: 'bounceUp 1.5s ease-in-out infinite' }}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
        <span style={{ 
          color: flashing ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)', 
          fontSize: '11px',
        }}>
          swipe up
        </span>
      </div>
    </div>
  );
}
