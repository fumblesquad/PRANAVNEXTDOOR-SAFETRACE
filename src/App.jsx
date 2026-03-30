import { useState, useEffect, useRef } from 'react';
import { supabase } from './services/supabase';
import { getAllReports, updateReportStatus } from './services/reportsService';

function useComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await getAllReports();
    if (error) setError(error.message);
    else setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const subscription = supabase
      .channel('reports-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports'
      }, () => load())
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const updateStatus = async (id, newStatus, note = '') => {
    const statusMap = {
      reviewing: 'under_review',
      escalated: 'escalated',
      resolved: 'resolved',
      closed: 'resolved'
    };
    const { error } = await updateReportStatus(id, statusMap[newStatus] ?? newStatus, note);
    if (!error) await load();
    return { error };
  };

  return { complaints, loading, error, updateStatus, refresh: load };
}

// ── Design system tokens ─────────────────────────────────────────────
const T = {
  // Backgrounds
  bg:          '#07070e',
  cardBg:      '#0d0d14',
  surfaceAlt:  '#0d0d14',
  sheetBg:     'rgba(7,7,14,0.97)',
  overlayBg:   'rgba(7,7,14,0.92)',

  // Accent
  pink:        '#e81850',
  pinkGlow:    '#e8185033',
  pinkGlowHi: '#e8185044',
  pinkSubtle:  '#e8185010',
  pinkSubtle2: '#e8185018',

  // Semantic
  confirm:     '#dc2626',
  success:     '#34d399',
  info:        '#38bdf8',
  warning:     '#ff9500',
  danger:      '#ff2d55',

  // Severity / risk
  sevHigh:     '#ff2d55',
  sevMedium:   '#ff9500',
  sevLow:      '#ffcc00',

  // Text
  text:        '#fff',
  textSub:     '#ffffff55',
  textMuted:   '#ffffff33',
  textGhost:   '#ffffff22',
  textHint:    '#ffffff1a',
  labelHeader: '#ffffff44',

  // Borders
  border:      '#ffffff08',
  borderMid:   '#ffffff0c',
  accentBorder:'#e8185028',
  accentBorderHi: '#e8185033',

  // Misc
  handleBar:   '#ffffff1a',
  closeBg:     '#ffffff08',
  closeColor:  '#ffffff33',

  // Pill
  pillBg:      (active) => active ? '#e8185018' : '#0d0d14',
  pillBorder:  (active) => active ? '#e8185033' : '#ffffff0c',
  pillColor:   (active) => active ? '#e81850' : '#ffffff33',

  // Timeline
  tlLine:      '#ffffff08',
  tlNodeActive:'#e8185018',
  tlNodeBorder:(last) => last ? '#e81850' : '#ffffff22',
  tlTextActive:'#e81850',
  tlTextDim:   '#ffffff55',

  // Button disabled
  disabledBg:  '#1a0c14',
  disabledColor:'#ffffff1a',
};

// ── Status config ────────────────────────────────────────────────────
const STATUS = {
  submitted: { label: 'Submitted', active: true  },
  reviewing: { label: 'Reviewing', active: false },
  escalated: { label: 'Escalated', active: true  },
  resolved:  { label: 'Resolved',  active: false },
  closed:    { label: 'Closed',    active: false },
};

const STATUS_ACTIONS = ['reviewing', 'escalated', 'resolved', 'closed'];
const FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'submitted', label: 'New'       },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'resolved',  label: 'Resolved'  },
];

// ── Severity dot color ───────────────────────────────────────────────
function sevColor(severity) {
  if (severity === 'high') return T.sevHigh;
  if (severity === 'medium') return T.sevMedium;
  if (severity === 'low') return T.sevLow;
  return T.textMuted;
}

// ── Global CSS ───────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Poppins:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html{color-scheme:dark;}
html,body,#root{height:100%;font-family:'Poppins',sans-serif;background:#07070e;color:#fff;}
button,input,textarea,select{color-scheme:dark;background-color:transparent;color:inherit;font:inherit;border:none;outline:none;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#e8185028;border-radius:2px;}

@keyframes fadeUp    {from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
@keyframes fadeIn    {from{opacity:0;}to{opacity:1;}}
@keyframes scaleIn   {from{opacity:0;transform:scale(.92);}to{opacity:1;transform:scale(1);}}
@keyframes sheetUp   {from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes overlayIn {from{opacity:0;}to{opacity:1;}}
@keyframes spin      {to{transform:rotate(360deg);}}
@keyframes slideIn   {from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:none;}}
@keyframes breathe   {0%,100%{opacity:1;}50%{opacity:.4;}}
@keyframes blink     {0%,100%{opacity:1;}50%{opacity:.35;}}
@keyframes newPulse  {0%,100%{opacity:1;}50%{opacity:.5;}}
@keyframes checkPop  {0%{transform:scale(0);}60%{transform:scale(1.2);}100%{transform:scale(1);}}
`;

// ── Pill ─────────────────────────────────────────────────────────────
const Pill = ({ status }) => {
  const m = STATUS[status] || STATUS.submitted;
  return (
    <span style={{
      padding: '5px 14px', borderRadius: 20,
      background: T.pillBg(m.active),
      border: `1px solid ${T.pillBorder(m.active)}`,
      color: T.pillColor(m.active),
      fontSize: 10, fontWeight: 700, letterSpacing: '.07em',
    }}>
      {m.label.toUpperCase()}
    </span>
  );
};

// ── Severity dot ────────────────────────────────────────────────────
const SevDot = ({ severity, status }) => {
  const active = STATUS[status]?.active;
  const color = active ? sevColor(severity) : T.textGhost;
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
      background: color,
      boxShadow: active ? `0 0 6px ${color}` : 'none',
      flexShrink: 0,
    }}/>
  );
};

// ── Stat tile ────────────────────────────────────────────────────────
const Stat = ({ label, val, pink }) => (
  <div style={{
    flex: 1, background: T.cardBg, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: '12px 10px',
  }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: pink ? T.pink : T.text, lineHeight: 1 }}>{val}</div>
    <div style={{ fontSize: 9, color: T.labelHeader, fontWeight: 600, letterSpacing: '.15em', marginTop: 3, textTransform: 'uppercase' }}>{label}</div>
  </div>
);

// ── Complaint card ───────────────────────────────────────────────────
function Card({ c, isNew, onClick, delay }) {
  return (
    <div onClick={onClick} style={{
      background: T.cardBg, border: `1px solid ${isNew ? T.accentBorderHi : T.border}`,
      borderRadius: 16, padding: '16px 18px', marginBottom: 8,
      cursor: 'pointer', animation: `fadeUp .25s ease both`,
      animationDelay: `${delay}ms`,
      transition: 'box-shadow .2s, border-color .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px #e8185015'; e.currentTarget.style.borderColor = T.accentBorder; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = isNew ? T.accentBorderHi : T.border; }}
    >
      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SevDot severity={c.severity} status={c.status}/>
          <span style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: T.pink, letterSpacing: '.06em', fontWeight: 500 }}>{c.id}</span>
          {isNew && (
            <span style={{ fontSize: 9, fontWeight: 700, color: T.pink, background: T.pinkSubtle, border: `1px solid ${T.accentBorder}`, borderRadius: 20, padding: '2px 8px', letterSpacing: '.07em', animation: 'newPulse 1.8s ease-in-out infinite' }}>NEW</span>
          )}
        </div>
        <Pill status={c.status}/>
      </div>

      {/* type */}
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6, lineHeight: 1.3 }}>{c.type}</div>

      {/* location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: T.pink, fontWeight: 700, lineHeight: 1 }}>·</span>
        <span style={{ fontSize: 13, color: T.textSub, fontWeight: 600 }}>{c.location}</span>
      </div>

      {/* severity badge + date/time */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase',
          color: sevColor(c.severity), background: `${sevColor(c.severity)}15`,
          border: `1px solid ${sevColor(c.severity)}28`, borderRadius: 20,
          padding: '3px 10px', fontFamily: "'DM Mono',monospace",
        }}>{c.severity}</span>
        {c.date && <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "'DM Mono',monospace", background: '#ffffff05', border: `1px solid ${T.border}`, padding: '3px 9px', borderRadius: 6 }}>{c.date}</span>}
        {c.time && <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "'DM Mono',monospace", background: '#ffffff05', border: `1px solid ${T.border}`, padding: '3px 9px', borderRadius: 6 }}>{c.time}</span>}
      </div>
    </div>
  );
}

// ── Detail sheet ─────────────────────────────────────────────────────
function Detail({ c, onClose, onUpdate }) {
  const [note,      setNote]      = useState('');
  const [busy,      setBusy]      = useState(false);
  const [localStat, setLocalStat] = useState(c.status);
  const [pending,   setPending]   = useState(null);

  useEffect(() => { setLocalStat(c.status); setPending(null); }, [c.status]);

  const submit = async () => {
    if (!pending || pending === localStat || busy) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 600));
    onUpdate(c.id, pending, note.trim());
    setLocalStat(pending);
    setPending(null);
    setNote('');
    setBusy(false);
  };

  const updated = localStat !== c.status;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'overlayIn .2s ease' }}>
      {/* overlay */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: T.overlayBg, backdropFilter: 'blur(16px)' }}/>

      {/* sheet */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: T.sheetBg, backdropFilter: 'blur(20px)',
        borderRadius: '24px 24px 0 0',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        animation: 'sheetUp .32s cubic-bezier(0.32,1.4,0.58,1)',
        borderTop: `1px solid ${T.borderMid}`,
      }}>

        {/* handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '13px 0 0' }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: T.handleBar }}/>
        </div>

        {/* close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 18,
          background: T.closeBg, border: 'none', borderRadius: '50%',
          width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.closeColor, fontSize: 15, cursor: 'pointer',
        }}>✕</button>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '16px 22px 32px' }}>

            {/* heading */}
            <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: T.pink, letterSpacing: '.07em' }}>{c.id}</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.text, marginTop: 4, marginBottom: 8, lineHeight: 1.2 }}>{c.type}</div>
            <div style={{ marginBottom: 20 }}><Pill status={localStat}/></div>

            {/* info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { lbl: 'Location',  val: c.location    },
                { lbl: 'Date',      val: c.date || '—' },
                { lbl: 'Time',      val: c.time || '—' },
                { lbl: 'Submitted', val: c.submittedAt },
              ].map(({ lbl, val }) => (
                <div key={lbl} style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 14, padding: '11px 13px' }}>
                  <div style={{ fontSize: 9, color: T.labelHeader, fontWeight: 600, letterSpacing: '.15em', marginBottom: 4, textTransform: 'uppercase' }}>{lbl}</div>
                  <div style={{ fontSize: 12, color: T.text, fontWeight: 600, lineHeight: 1.4 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* description */}
            {c.description && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, color: T.labelHeader, fontWeight: 600, letterSpacing: '.15em', marginBottom: 8, textTransform: 'uppercase' }}>DESCRIPTION</div>
                <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 14, padding: '13px 14px', fontSize: 13, color: T.textSub, lineHeight: 1.65 }}>
                  {c.description}
                </div>
              </div>
            )}

            {/* timeline */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 9, color: T.labelHeader, fontWeight: 600, letterSpacing: '.15em', marginBottom: 12, textTransform: 'uppercase' }}>TIMELINE</div>
              <div style={{ paddingLeft: 16, borderLeft: `1px solid ${T.tlLine}` }}>
                {c.statusHistory.map((h, i) => {
                  const isLast = i === c.statusHistory.length - 1;
                  const sm = STATUS[h.status] || STATUS.submitted;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: isLast ? 0 : 14, position: 'relative', animation: `slideIn .28s ease both`, animationDelay: `${i * 50}ms` }}>
                      <div style={{
                        position: 'absolute', left: -21, top: 4, width: 9, height: 9, borderRadius: '50%',
                        border: `1.5px solid ${T.tlNodeBorder(isLast)}`,
                        background: isLast ? T.tlNodeActive : 'transparent',
                      }}/>
                      <div style={{ paddingLeft: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: h.note ? 4 : 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: isLast ? T.tlTextActive : T.tlTextDim }}>{sm.label}</span>
                          <span style={{ fontSize: 10, color: T.textGhost, fontFamily: "'DM Mono',monospace" }}>{h.ts}</span>
                        </div>
                        {h.note && (
                          <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5, background: T.cardBg, padding: '6px 10px', borderRadius: 8, border: `1px solid ${T.border}` }}>
                            {h.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* update status */}
            <div>
              <div style={{ fontSize: 9, color: T.labelHeader, fontWeight: 600, letterSpacing: '.15em', marginBottom: 10, textTransform: 'uppercase' }}>UPDATE STATUS</div>
              <textarea
                rows={2}
                placeholder="Add note (optional)…"
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{
                  width: '100%', padding: '11px 13px',
                  background: T.cardBg, border: `1px solid ${T.border}`,
                  borderRadius: 14, color: T.text, fontSize: 12,
                  fontFamily: "'Poppins',sans-serif", outline: 'none',
                  resize: 'none', lineHeight: 1.5, marginBottom: 10,
                }}
              />
              {/* status selector grid */}
              <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
                {STATUS_ACTIONS.map(s => {
                  const isCur    = localStat === s;
                  const isPicked = pending === s;
                  return (
                    <button
                      key={s}
                      disabled={isCur || busy}
                      onClick={() => setPending(isCur ? null : s)}
                      style={{
                        flex: 1, padding: '11px 6px', borderRadius: 14,
                        border: `1px solid ${isCur ? '#e8185033' : isPicked ? T.pinkGlowHi : T.border}`,
                        background: isCur ? T.pinkSubtle : isPicked ? T.pinkSubtle2 : T.cardBg,
                        color: isCur ? T.pink : isPicked ? T.pink : T.textMuted,
                        fontSize: 11, fontWeight: 600,
                        cursor: isCur ? 'default' : 'pointer',
                        letterSpacing: '.03em',
                        transition: 'background .2s, color .2s, border-color .2s',
                      }}
                      onMouseEnter={e => { if (!isCur && !isPicked) { e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.color = T.pink; e.currentTarget.style.background = T.pinkSubtle; } }}
                      onMouseLeave={e => { if (!isCur && !isPicked) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = T.cardBg; } }}
                    >
                      {STATUS[s].label}
                    </button>
                  );
                })}
              </div>

              {/* submit button */}
              <button
                onClick={submit}
                disabled={!pending || pending === localStat || busy}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: 16, border: 'none',
                  background: pending && pending !== localStat ? T.pink : T.disabledBg,
                  color: pending && pending !== localStat ? '#fff' : T.disabledColor,
                  fontSize: 13, fontWeight: 700,
                  cursor: pending && pending !== localStat ? 'pointer' : 'not-allowed',
                  letterSpacing: '.04em',
                  boxShadow: pending && pending !== localStat ? `0 0 30px ${T.pinkGlow}` : 'none',
                  transition: 'background .25s, color .25s, box-shadow .25s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {busy
                  ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span> Updating…</>
                  : pending && pending !== localStat
                    ? `Submit · Mark as ${STATUS[pending]?.label}`
                    : 'Select a status above'}
              </button>

              {updated && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: T.pinkSubtle, border: `1px solid ${T.accentBorder}`, borderRadius: 14, fontSize: 12, color: T.pink, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, animation: 'checkPop .35s ease both' }}>
                  <span style={{ color: T.success }}>✓</span> Status updated · citizen tracking page reflects this change
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────
export default function PoliceDashboard() {
  const { complaints: list, loading, error: loadError, updateStatus } = useComplaints();
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [seenIds,  setSeenIds]  = useState(() => new Set());
  const prevLen = useRef(list.length);

  // ── Passcode gate ──
  const [authed, setAuthed] = useState(
    sessionStorage.getItem('authority_authed') === 'true'
  );
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleCodeSubmit = () => {
    if (codeInput === import.meta.env.VITE_AUTHORITY_CODE) {
      sessionStorage.setItem('authority_authed', 'true');
      setAuthed(true);
    } else {
      setCodeError('Invalid access code');
    }
  };

  useEffect(() => {
    if (list.length > prevLen.current) {
      setTimeout(() => setSeenIds(new Set(list.map(c => c.id))), 8000);
    }
    prevLen.current = list.length;
  }, [list.length]);

  const isNew = id => !seenIds.has(id);

  const stats = {
    total:     list.length,
    active:    list.filter(c => !['resolved', 'closed'].includes(c.status)).length,
    escalated: list.filter(c => c.status === 'escalated').length,
    resolved:  list.filter(c => c.status === 'resolved').length,
  };

  const visible = list
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.id.toLowerCase().includes(q) || (c.type || '').toLowerCase().includes(q) || (c.location || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const so = { escalated: 0, submitted: 1, reviewing: 2, resolved: 3, closed: 4 };
      return (so[a.status] ?? 5) - (so[b.status] ?? 5);
    });

  const selectedObj = selected ? list.find(c => c.id === selected) : null;

  if (!authed) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', fontFamily:'sans-serif' }}>
      <style>{CSS}</style>
      <div style={{ fontSize:'20px', fontWeight:'700', color:'white' }}>Safe<span style={{color:'#D4537E'}}>Trace</span></div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', letterSpacing:'1px', textTransform:'uppercase' }}>Authority Access Only</div>
      <input
        type="password"
        placeholder="Enter access code"
        value={codeInput}
        onChange={e => setCodeInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
        style={{ background:'#181818', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'12px 16px', color:'white', fontSize:'14px', width:'280px', outline:'none' }}
      />
      {codeError && <div style={{ fontSize:'12px', color:'#E24B4A' }}>{codeError}</div>}
      <button onClick={handleCodeSubmit} style={{ background:'#D4537E', border:'none', borderRadius:'8px', padding:'12px 24px', color:'white', fontSize:'14px', fontWeight:'600', cursor:'pointer', width:'280px' }}>
        Access Portal
      </button>
    </div>
  );

  return (
    <div style={{ height: '100vh', width: '100vw', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <style>{CSS}</style>

      {/* phone frame */}
      <div style={{ width: 393, height: '100vh', maxWidth: '100vw', background: T.bg, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>

        {/* ── HEADER ── */}
        <div style={{ background: T.bg, borderBottom: `1px solid ${T.border}`, padding: '20px 20px 14px', flexShrink: 0 }}>

          {/* brand row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '.06em', lineHeight: 1 }}>
                <span style={{ color: T.text }}>SAFE</span>
                <span style={{ color: T.pink }}>TRACE</span>
              </div>
              <div style={{ fontSize: 9, color: T.labelHeader, fontWeight: 700, letterSpacing: '.15em', marginTop: 3, textTransform: 'uppercase' }}>POLICE PORTAL</div>
            </div>

            {/* live dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.success, boxShadow: `0 0 6px ${T.success}`, animation: 'breathe 2s ease-in-out infinite' }}/>
              <span style={{ fontSize: 9, color: T.textMuted, fontWeight: 600, letterSpacing: '.15em', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase' }}>LIVE</span>
            </div>
          </div>

          {/* heading */}
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-.02em', marginBottom: 14 }}>
            Complaints
          </div>

          {/* stats */}
          <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
            <Stat label="TOTAL"     val={stats.total}/>
            <Stat label="ACTIVE"    val={stats.active}    pink/>
            <Stat label="ESCALATED" val={stats.escalated} pink/>
            <Stat label="RESOLVED"  val={stats.resolved}/>
          </div>

          {/* search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: T.cardBg, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: '11px 14px 11px 38px',
                color: T.text, fontSize: 13,
                width: '100%',
              }}
            />
          </div>

          {/* filters */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {FILTERS.map(f => {
              const cnt = f.key === 'all' ? list.length : list.filter(c => c.status === f.key).length;
              const active = filter === f.key;
              return (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  padding: '10px 16px', borderRadius: 20,
                  border: `1px solid ${active ? T.accentBorderHi : '#ffffff12'}`,
                  background: active ? T.pinkSubtle2 : T.cardBg,
                  color: active ? T.pink : T.textMuted,
                  fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'all .15s',
                }}>
                  {f.label}&nbsp;<span style={{ opacity: .55 }}>{cnt}</span>
                </button>
              );
            })}
          </div>
          {loadError && (
            <div style={{ margin: '8px 0 0', padding: '8px 12px', background: '#ff2d5515', border: '1px solid #ff2d5528', borderRadius: 10, fontSize: 11, color: '#ff2d55', fontWeight: 500 }}>
              Failed to load reports: {loadError}
            </div>
          )}
        </div>

        {/* ── LIST ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px', background: T.bg }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55%', gap: 10 }}>
              <div style={{ fontSize: 16, color: T.textMuted, animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</div>
              <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>Loading reports...</div>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55%', gap: 10 }}>
              <div style={{ fontSize: 28, color: T.textMuted, fontWeight: 300 }}>—</div>
              <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>No complaints</div>
            </div>
          ) : visible.map((c, i) => (
            <Card key={c.id} c={c} isNew={isNew(c.id)} delay={i * 40}
              onClick={() => { setSelected(c.id); setSeenIds(p => { const n = new Set(p); n.add(c.id); return n; }); }}
            />
          ))}
        </div>

        {/* ── DETAIL ── */}
        {selectedObj && (
          <Detail c={selectedObj} onClose={() => setSelected(null)} onUpdate={updateStatus}/>
        )}
      </div>
    </div>
  );
}
