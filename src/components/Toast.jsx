export default function Toast({ toast }) {
  if (!toast) return null

  return (
    <div style={{
      position: 'absolute', bottom: 20, right: 20, zIndex: 20,
      background: 'rgba(10,12,16,0.97)',
      border: '1px solid var(--accent)',
      borderRadius: 10, padding: '12px 16px',
      maxWidth: 260, fontSize: 12, lineHeight: 1.5,
      animation: 'slide-up 0.35s ease',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 2, fontSize: 11 }}>
        {toast.title}
      </div>
      <div style={{ color: 'var(--text)' }}>{toast.body}</div>
    </div>
  )
}
