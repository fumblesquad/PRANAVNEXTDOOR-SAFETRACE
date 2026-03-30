const ITEMS = [
  { label: 'High Risk Zone',  dot: { width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 6px var(--danger)' } },
  { label: 'Moderate Risk',   dot: { width: 10, height: 10, borderRadius: '50%', background: 'var(--warn)',   boxShadow: '0 0 6px var(--warn)' } },
  { label: 'Safe Haven',      dot: { width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' } },
  { label: 'Safe Route',      dot: { width: 20, height: 4,  borderRadius: 2,     background: 'var(--accent2)',boxShadow: '0 0 6px var(--accent2)' } },
  { label: 'Risky Shortcut',  dot: { width: 20, height: 4,  borderRadius: 2,     background: 'var(--danger)', border: '1px dashed rgba(255,255,255,0.3)' } },
]

export default function Legend() {
  return (
    <div style={{
      position: 'absolute', top: 16, right: 16, zIndex: 10,
      background: 'rgba(10,12,16,0.88)', backdropFilter: 'blur(16px)',
      border: '1px solid var(--border)', borderRadius: 12, padding: 14, minWidth: 160,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
        Map Key
      </div>
      {ITEMS.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 11 }}>
          <div style={{ flexShrink: 0, ...item.dot }} />
          {item.label}
        </div>
      ))}
    </div>
  )
}
