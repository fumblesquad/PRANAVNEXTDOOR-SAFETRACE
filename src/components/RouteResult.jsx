export default function RouteResult({ routeData }) {
  if (!routeData) return null
  const { score, dest, checks, color } = routeData
  const scoreColor = score >= 90 ? 'var(--accent)' : score >= 70 ? 'var(--warn)' : 'var(--danger)'

  return (
    <div style={{
      margin: '0 16px 12px',
      background: 'rgba(0,255,135,0.05)',
      border: '1px solid rgba(0,255,135,0.2)',
      borderRadius: 10, padding: 14,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
        ▶ Active Route
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        {[
          { val: dest.timeMin, label: 'min walk', color: 'var(--accent)' },
          { val: dest.distKm,  label: 'km',       color: 'var(--text)' },
          { val: `${score}%`,  label: 'safety',   color: scoreColor },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: s.color }}>{s.val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {checks.map((c) => (
          <div key={c} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--accent)', fontSize: 10 }}>✓</span>
            {c}
          </div>
        ))}
      </div>
    </div>
  )
}
