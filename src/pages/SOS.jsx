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

  const handleSOS = async (e) => {
    e.stopPropagation();
    
    // 1. Flash screen red
    document.body.style.backgroundColor = '#CE2029';
    setTimeout(() => { document.body.style.backgroundColor = ''; }, 1500);

    // 2. Call 112
    window.location.href = 'tel:112';

    // 3. Get location
    let locationData = { lat: null, lng: null, label: 'Location unavailable' };
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      locationData = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        label: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
      };
    } catch {
      // location unavailable — still submit the report
    }

    // 4. Submit to Supabase
    try {
      const { caseId, error } = await submitReport({
        type: 'sos',
        description: 'SOS emergency triggered',
        location: locationData,
        uid: user?.id ?? null
      });
      if (!error && caseId) {
        console.log('SOS report filed:', caseId);
      }
    } catch {
      // fail silently — SOS call already made, don't block user
    }
  };

  function handleBackgroundClick(e) {
    // Navigate to app when clicking anywhere except the SOS button
    navigateToApp();
  }

  return (
    <div
      onClick={handleBackgroundClick}
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px 40px',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <style>{`
        @keyframes bounceUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          70% { transform: scale(1.05); opacity: 0; }
          100% { transform: scale(1.05); opacity: 0; }
        }
      `}</style>

      {/* Title Header */}
      <div style={{
        position: 'absolute',
        top: '48px',
        left: 0,
        right: 0,
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
          Safe<span style={{ color: '#e81850' }}>Trace</span>
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '40px' }}>
        {/* SOS Button Layout */}
        <div style={{ position: 'relative', width: 270, height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Animated Pulse Ring */}
          <div style={{
            position: 'absolute',
            width: '270px',
            height: '270px',
            borderRadius: '50%',
            border: '1px solid rgba(206,32,41,0.15)',
            animation: 'pulse-ring 2s ease-out infinite',
            pointerEvents: 'none',
          }} />

          {/* Static Outer Ring */}
          <div style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            border: '3px solid rgba(206,32,41,0.35)',
            pointerEvents: 'none',
          }} />

          {/* Inner Button */}
          <button
            onClick={handleSOS}
            onTouchEnd={handleSOS}
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: '#CE2029',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'transform 0.1s ease-out',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          >
            <span style={{ color: '#fff', fontSize: '36px', fontWeight: 700, letterSpacing: '4px', pointerEvents: 'none' }}>
              SOS
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '6px', pointerEvents: 'none' }}>
              Press in emergency
            </span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px', zIndex: 2 }}>
        {/* 3 Chip Indicators */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 300 }}>
          {['Calls 112', 'Anonymous', 'Auto-files report'].map(chip => (
            <div key={chip} style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', 
              padding: '6px 12px', 
              color: '#aaa', 
              fontSize: '11px', 
              fontWeight: 500,
              pointerEvents: 'none'
            }}>
              {chip}
            </div>
          ))}
        </div>
      </div>

      {/* Swipe up hint */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'none',
        position: 'absolute',
        bottom: '24px'
      }}>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ animation: 'bounceUp 1.5s ease-in-out infinite' }}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
          swipe up
        </span>
      </div>
    </div>
  );
}
