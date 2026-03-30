// Direction icon map — covers Google maneuver strings + OSRM modifiers
const DIR_ICON = {
  // Google maneuver values
  'turn-left':        { icon: '↰', label: 'Turn left' },
  'turn-right':       { icon: '↱', label: 'Turn right' },
  'turn-sharp-left':  { icon: '↺', label: 'Sharp left' },
  'turn-sharp-right': { icon: '↻', label: 'Sharp right' },
  'turn-slight-left': { icon: '↖', label: 'Slight left' },
  'turn-slight-right':{ icon: '↗', label: 'Slight right' },
  'uturn-left':       { icon: '↩', label: 'U-turn' },
  'uturn-right':      { icon: '↪', label: 'U-turn' },
  'straight':         { icon: '↑', label: 'Go straight' },
  'ramp-left':        { icon: '↰', label: 'Ramp left' },
  'ramp-right':       { icon: '↱', label: 'Ramp right' },
  'merge':            { icon: '⤵', label: 'Merge' },
  'fork-left':        { icon: '⑂', label: 'Fork left' },
  'fork-right':       { icon: '⑂', label: 'Fork right' },
  'ferry':            { icon: '⛴', label: 'Take ferry' },
  'roundabout-left':  { icon: '⟳', label: 'Roundabout' },
  'roundabout-right': { icon: '⟳', label: 'Roundabout' },
  // OSRM modifier values
  'left':             { icon: '↰', label: 'Turn left' },
  'right':            { icon: '↱', label: 'Turn right' },
  'sharp left':       { icon: '↺', label: 'Sharp left' },
  'sharp right':      { icon: '↻', label: 'Sharp right' },
  'slight left':      { icon: '↖', label: 'Slight left' },
  'slight right':     { icon: '↗', label: 'Slight right' },
  'u-turn':           { icon: '↩', label: 'U-turn' },
  // Fallbacks by instruction text
  arrive:             { icon: '🏁', label: 'Arrive' },
  depart:             { icon: '↑', label: 'Head out' },
};

function getDir(step) {
  const man = (step.maneuver || '').toLowerCase();
  const txt = (step.instruction || '').toLowerCase();

  if (DIR_ICON[man]) return DIR_ICON[man];
  if (txt.includes('arrive') || txt.includes('destination')) return DIR_ICON.arrive;
  if (txt.includes('left'))   return DIR_ICON.left;
  if (txt.includes('right'))  return DIR_ICON.right;
  if (txt.includes('straight') || txt.includes('continue')) return DIR_ICON.straight;
  if (txt.includes('u-turn') || txt.includes('uturn'))      return DIR_ICON['u-turn'];
  if (txt.includes('roundabout') || txt.includes('rotary')) return DIR_ICON['roundabout-right'];
  return { icon: '↑', label: 'Continue' };
}

export default function NavOverlay({
  steps, stepIndex, setStepIndex,
  totalDist, totalTime, destName,
  onEnd,
}) {
  const step    = steps[stepIndex];
  const nextStep = steps[stepIndex + 1];
  const isFirst = stepIndex === 0;
  const isLast  = stepIndex === steps.length - 1;
  const pct     = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 100;
  const dir     = getDir(step);
  const nextDir = nextStep ? getDir(nextStep) : null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      pointerEvents: 'none',
    }}>

      {/* ── TOP CARD — current instruction ───────────────────────── */}
      <div style={{
        pointerEvents: 'all',
        margin: '16px auto 0',
        width: 'min(460px, calc(100vw - 32px))',
        background: 'rgba(7,7,14,0.97)',
        border: '1px solid #e8185055',
        borderRadius: 18,
        padding: '18px 20px 14px',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 12px 48px rgba(232,24,80,0.22)',
        animation: 'navIn 0.35s cubic-bezier(0.34,1.4,0.64,1)',
        fontFamily: "'DM Mono', monospace",
      }}>

        {/* Progress bar */}
        <div style={{
          height: 3, background: '#ffffff08', borderRadius: 2,
          marginBottom: 14, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: 'linear-gradient(90deg, #e81850, #ff6090)',
            borderRadius: 2, transition: 'width 0.6s ease',
            boxShadow: '0 0 8px #e81850',
          }} />
        </div>

        {/* Step counter + destination name */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 14,
        }}>
          <span style={{ fontSize: 9, color: '#e81850', letterSpacing: '0.18em' }}>
            STEP {stepIndex + 1} / {steps.length}
          </span>
          <span style={{
            fontSize: 9, color: '#ffffff33', letterSpacing: '0.1em',
            maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            → {destName}
          </span>
        </div>

        {/* Main direction */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
          <div style={{
            width: 60, height: 60, flexShrink: 0,
            background: '#e8185018', border: '1px solid #e8185044',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            boxShadow: '0 0 20px #e8185033',
            animation: 'stepFadeIn 0.3s ease both',
          }}>
            {dir.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 15, color: '#fff', fontWeight: 500,
              lineHeight: 1.5,
              animation: 'stepFadeIn 0.3s ease both',
            }}>
              {step.instruction}
            </div>
            {step.distance && (
              <div style={{ fontSize: 11, color: '#e8185077', marginTop: 4 }}>
                {step.distance}
              </div>
            )}
          </div>
        </div>

        {/* Next step preview */}
        {nextStep && (
          <div style={{
            padding: '9px 12px',
            background: '#ffffff04',
            border: '1px solid #ffffff07',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 9, color: '#ffffff22', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              THEN
            </span>
            <span style={{ fontSize: 18, flexShrink: 0, color: '#ffffff55' }}>
              {nextDir?.icon}
            </span>
            <span style={{ fontSize: 11, color: '#ffffff44', flex: 1, lineHeight: 1.4 }}>
              {nextStep.instruction}
            </span>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          {!isFirst && (
            <button
              onClick={() => setStepIndex(i => i - 1)}
              style={{
                flex: 1, padding: '10px',
                background: 'transparent',
                border: '1px solid #ffffff0f',
                borderRadius: 10, color: '#ffffff55',
                fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              ←
            </button>
          )}

          {!isLast ? (
            <button
              onClick={() => setStepIndex(i => i + 1)}
              style={{
                flex: 3, padding: '11px',
                background: '#e81850', border: 'none',
                borderRadius: 10, color: '#fff',
                fontSize: 12, letterSpacing: '0.14em', fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer',
                boxShadow: '0 0 20px #e8185044',
              }}
            >
              next step →
            </button>
          ) : (
            <button
              onClick={onEnd}
              style={{
                flex: 3, padding: '11px',
                background: '#e81850', border: 'none',
                borderRadius: 10, color: '#fff',
                fontSize: 12, letterSpacing: '0.14em', fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer',
                boxShadow: '0 0 28px #e8185077',
              }}
            >
              🏁 arrived!
            </button>
          )}

          <button
            onClick={onEnd}
            style={{
              padding: '11px 14px',
              background: 'transparent',
              border: '1px solid #ffffff0f',
              borderRadius: 10, color: '#ffffff33',
              fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            }}
            title="End navigation"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── BOTTOM BAR — trip summary ─────────────────────────────── */}
      <div style={{
        pointerEvents: 'all',
        margin: 'auto auto 24px',
        width: 'min(460px, calc(100vw - 32px))',
        background: 'rgba(7,7,14,0.88)',
        border: '1px solid #ffffff0a',
        borderRadius: 14,
        padding: '10px 20px',
        backdropFilter: 'blur(16px)',
        display: 'flex', gap: 0, alignItems: 'center',
        fontFamily: "'DM Mono', monospace",
      }}>
        {[
          { label: 'TOTAL DIST', value: totalDist },
          { label: 'WALK TIME',  value: totalTime },
          { label: 'REMAINING',  value: `${steps.length - stepIndex} steps` },
        ].map((item, i, arr) => (
          <div key={item.label} style={{
            flex: 1, textAlign: 'center',
            borderRight: i < arr.length - 1 ? '1px solid #ffffff0a' : 'none',
            padding: '0 8px',
          }}>
            <div style={{ fontSize: 8, color: '#ffffff33', letterSpacing: '0.12em', marginBottom: 3 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes navIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes stepFadeIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0);   }
        }
      `}</style>
    </div>
  );
}
