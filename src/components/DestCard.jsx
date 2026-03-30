import { useState } from 'react'

const TAG_STYLES = {
  crowd:    { background: 'rgba(0,201,255,0.1)', color: 'var(--accent2)' },
  light:    { background: 'rgba(255,170,0,0.1)', color: 'var(--warn)' },
  police:   { background: 'rgba(0,255,135,0.1)', color: 'var(--accent)' },
  hospital: { background: 'rgba(255,59,92,0.12)', color: '#ff8fa0' },
}

export default function DestCard({ place, mode, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  const score = place.scores[mode]
  const scoreColor = score >= 90 ? 'var(--accent)' : score >= 70 ? 'var(--warn)' : 'var(--danger)'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active || hovered ? 'rgba(0,255,135,0.04)' : 'rgba(30,37,48,0.6)',
        border: `1px solid ${active ? 'rgba(0,255,135,0.4)' : hovered ? 'rgba(0,255,135,0.25)' : 'var(--border)'}`,
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'pointer',
        marginBottom: 8,
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: 'var(--accent)',
        transform: active || hovered ? 'scaleY(1)' : 'scaleY(0)',
        transformOrigin: 'bottom',
        transition: 'transform 0.2s',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: active || hovered ? 'var(--accent)' : 'var(--text)', transition: 'color 0.2s' }}>
          {place.name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: scoreColor, fontWeight: 700 }}>
          {score}%
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
        {place.tags.map((tag, i) => (
          <span key={tag} style={{
            fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 1,
            padding: '2px 6px', borderRadius: 4,
            ...TAG_STYLES[tag],
          }}>
            {place.tagLabels[i]}
          </span>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)' }}>
        {place.distKm}km · ~{place.timeMin} min walk
      </div>
    </div>
  )
}
