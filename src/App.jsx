import { useState, useEffect, useRef } from 'react';
import { supabase } from './services/supabase';
import { getAllReports, updateReportStatus } from './services/reportsService';

function useComplaints() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await getAllReports();
    if (error) setError(error.message);
    else setList(data);
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

  return { list, loading, error, updateStatus };
}

// ── Theme tokens ─────────────────────────────────────────────────────
const DARK = {
  bg:          '#07070e',
  bgDeep:      '#0a0a0a',
  surface:     '#0c0c15',
  surfaceAlt:  '#0d0d18',
  border:      '#ffffff08',
  borderMid:   '#ffffff12',
  text:        '#ffffff',
  textSub:     '#ffffff99',
  textDim:     '#ffffff44',
  textFaint:   '#ffffff22',
  searchBg:    '#0c0c15',
  filterColor: '#ffffff33',
  filterHover: '#ffffff66',
  statBg:      '#0c0c14',
  statBorder:  '#ffffff07',
  statLabel:   '#ffffff33',
  pillBg:      (active) => active ? '#e8185020' : '#ffffff06',
  pillBorder:  (active) => active ? '#e8185055' : '#ffffff10',
  pillColor:   (active) => active ? '#e81850'   : '#ffffff44',
  cardHoverBg: '#0e0b14',
  dotActive:   '#e81850',
  dotInactive: '#ffffff28',
  timelineHr:  '#ffffff08',
  noteBg:      '#0d0d18',
  noteText:    '#ffffff44',
  noteBorder:  '#ffffff06',
  sheetBg:     '#09090f',
  sheetBorder: '#ffffff0a',
  handleBar:   '#ffffff12',
  closeBg:     '#ffffff08',
  closeColor:  '#ffffff33',
  infoLabel:   '#ffffff28',
  timeLabel:   '#ffffff22',
  tlLine:      '#ffffff08',
  tlNodeActive:'#e8185020',
  tlNodeBorder:(last) => last ? '#e81850' : '#ffffff20',
  tlTextActive:'#e81850',
  tlTextDim:   '#ffffff66',
  updateLabel: '#ffffff28',
  confirmBg:   '#e8185010',
  confirmBrd:  '#e8185025',
  confirmText: '#e81850',
};

const LIGHT = {
  bg:          '#f4f4f8',
  bgDeep:      '#e8e8f0',
  surface:     '#ffffff',
  surfaceAlt:  '#f8f8fc',
  border:      '#0000000f',
  borderMid:   '#0000001a',
  text:        '#0a0a14',
  textSub:     '#0a0a1499',
  textDim:     '#0a0a1466',
  textFaint:   '#0a0a1433',
  searchBg:    '#ffffff',
  filterColor: '#0a0a1455',
  filterHover: '#0a0a14aa',
  statBg:      '#ffffff',
  statBorder:  '#0000000d',
  statLabel:   '#0a0a1466',
  pillBg:      (active) => active ? '#e8185018' : '#0000000a',
  pillBorder:  (active) => active ? '#e8185040' : '#00000018',
  pillColor:   (active) => active ? '#e81850'   : '#0a0a1466',
  cardHoverBg: '#fafaff',
  dotActive:   '#e81850',
  dotInactive: '#0a0a1428',
  timelineHr:  '#0000000f',
  noteBg:      '#f4f4f8',
  noteText:    '#0a0a1466',
  noteBorder:  '#0000000f',
  sheetBg:     '#ffffff',
  sheetBorder: '#0000001a',
  handleBar:   '#0000001a',
  closeBg:     '#0000000a',
  closeColor:  '#0a0a1466',
  infoLabel:   '#0a0a1455',
  timeLabel:   '#0a0a1444',
  tlLine:      '#0000001a',
  tlNodeActive:'#e8185015',
  tlNodeBorder:(last) => last ? '#e81850' : '#0000002a',
  tlTextActive:'#e81850',
  tlTextDim:   '#0a0a1466',
  updateLabel: '#0a0a1455',
  confirmBg:   '#e8185010',
  confirmBrd:  '#e8185030',
  confirmText: '#e81850',
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

// ── Global CSS (animations only — no colour hardcodes) ───────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Poppins:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html,body,#root{height:100%;font-family:'Poppins',sans-serif;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#e8185028;border-radius:2px;}
@keyframes fadeUp   {from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
@keyframes sheetUp  {from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes overlayIn{from{opacity:0;}to{opacity:1;}}
@keyframes spin     {to{transform:rotate(360deg);}}
@keyframes slideIn  {from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:none;}}
@keyframes blink    {0%,100%{opacity:1;}50%{opacity:.35;}}
@keyframes newPulse {0%,100%{opacity:1;}50%{opacity:.5;}}
@keyframes togSlide {from{transform:translateX(0);}to{transform:translateX(20px);}}
`;

// ── Theme toggle pill ────────────────────────────────────────────────
function ThemeToggle({ dark, onToggle, t }) {
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: t.surface, border: `1px solid ${t.borderMid}`,
      borderRadius: 20, padding: '5px 10px 5px 6px',
      cursor: 'pointer', transition: 'background .25s, border-color .25s',
    }}>
      {/* track */}
      <div style={{
        width: 34, height: 18, borderRadius: 9,
        background: dark ? '#e81850' : t.borderMid,
        position: 'relative', transition: 'background .25s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: dark ? 18 : 2,
          width: 14, height: 14, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,.2)',
          transition: 'left .22s cubic-bezier(.4,0,.2,1)',
        }}/>
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: t.textDim, letterSpacing: '.05em', fontFamily: "'DM Mono',monospace" }}>
        {dark ? 'DARK' : 'LIGHT'}
      </span>
    </button>
  );
}

// ── Pill ─────────────────────────────────────────────────────────────
const Pill = ({ status, t }) => {
  const m = STATUS[status] || STATUS.submitted;
  return (
    <span style={{
      padding: '4px 11px', borderRadius: 20,
      background: t.pillBg(m.active),
      border: `1px solid ${t.pillBorder(m.active)}`,
      color: t.pillColor(m.active),
      fontSize: 10, fontWeight: 700, letterSpacing: '.07em',
      transition: 'background .25s, color .25s, border-color .25s',
    }}>
      {m.label.toUpperCase()}
    </span>
  );
};

// ── Status dot ───────────────────────────────────────────────────────
const SevDot = ({ status, t }) => {
  const active = STATUS[status]?.active;
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: active ? t.dotActive : t.dotInactive,
      boxShadow: active ? `0 0 6px ${t.dotActive}` : 'none',
      flexShrink: 0, transition: 'background .25s',
    }}/>
  );
};

// ── Stat tile ────────────────────────────────────────────────────────
const Stat = ({ label, val, pink, t }) => (
  <div style={{
    flex: 1, background: t.statBg, border: `1px solid ${t.statBorder}`,
    borderRadius: 14, padding: '12px 10px',
    transition: 'background .25s, border-color .25s',
  }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: pink ? '#e81850' : t.text, lineHeight: 1, transition: 'color .25s' }}>{val}</div>
    <div style={{ fontSize: 9, color: t.statLabel, fontWeight: 600, letterSpacing: '.05em', marginTop: 3, transition: 'color .25s' }}>{label}</div>
  </div>
);

// ── Complaint card ───────────────────────────────────────────────────
function Card({ c, isNew, onClick, delay, t, dark }) {
  return (
    <div onClick={onClick} style={{
      background: t.surface, border: `1px solid ${isNew ? '#e8185038' : t.border}`,
      borderRadius: 18, padding: '16px 18px', marginBottom: 8,
      cursor: 'pointer', animation: `fadeUp .25s ease both`,
      animationDelay: `${delay}ms`,
      transition: 'background .25s, border-color .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = t.cardHoverBg}
      onMouseLeave={e => e.currentTarget.style.background = t.surface}
    >
      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SevDot status={c.status} t={t}/>
          <span style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: '#e81850', letterSpacing: '.06em', fontWeight: 500 }}>{c.id}</span>
          {isNew && (
            <span style={{ fontSize: 9, fontWeight: 700, color: '#e81850', background: '#e8185012', border: '1px solid #e8185028', borderRadius: 20, padding: '2px 8px', letterSpacing: '.07em', animation: 'newPulse 1.8s ease-in-out infinite' }}>NEW</span>
          )}
        </div>
        <Pill status={c.status} t={t}/>
      </div>

      {/* type */}
      <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 6, lineHeight: 1.3, transition: 'color .25s' }}>{c.type}</div>

      {/* location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#e81850', fontWeight: 700, lineHeight: 1 }}>·</span>
        <span style={{ fontSize: 13, color: t.textSub, fontWeight: 600, transition: 'color .25s' }}>{c.location}</span>
      </div>

      {/* date / time */}
      <div style={{ display: 'flex', gap: 8 }}>
        {c.date && <span style={{ fontSize: 10, color: t.textDim, fontFamily: "'DM Mono',monospace", background: dark ? '#ffffff05' : '#00000008', border: `1px solid ${t.border}`, padding: '3px 9px', borderRadius: 6, transition: 'color .25s' }}>{c.date}</span>}
        {c.time && <span style={{ fontSize: 10, color: t.textDim, fontFamily: "'DM Mono',monospace", background: dark ? '#ffffff05' : '#00000008', border: `1px solid ${t.border}`, padding: '3px 9px', borderRadius: 6, transition: 'color .25s' }}>{c.time}</span>}
      </div>
    </div>
  );
}

// ── Detail sheet ─────────────────────────────────────────────────────
function Detail({ c, onClose, onUpdate, t }) {
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'overlayIn .2s ease' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)' }}/>

      <div style={{
        position: 'relative', zIndex: 1,
        background: t.sheetBg, borderRadius: '26px 26px 0 0',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        animation: 'sheetUp .32s cubic-bezier(0.32,1.4,0.58,1)',
        borderTop: `1px solid ${t.sheetBorder}`,
        transition: 'background .25s',
      }}>

        {/* handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '13px 0 0' }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: t.handleBar }}/>
        </div>

        {/* close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 18,
          background: t.closeBg, border: 'none', borderRadius: 20,
          width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.closeColor, fontSize: 15, cursor: 'pointer',
        }}>✕</button>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '16px 22px 32px' }}>

            {/* heading */}
            <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#e81850', letterSpacing: '.07em' }}>{c.id}</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.text, marginTop: 4, marginBottom: 8, lineHeight: 1.2, transition: 'color .25s' }}>{c.type}</div>
            <div style={{ marginBottom: 20 }}><Pill status={localStat} t={t}/></div>

            {/* info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { lbl: 'Location',  val: c.location    },
                { lbl: 'Date',      val: c.date || '—' },
                { lbl: 'Time',      val: c.time || '—' },
                { lbl: 'Submitted', val: c.submittedAt },
              ].map(({ lbl, val }) => (
                <div key={lbl} style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 12, padding: '11px 13px', transition: 'background .25s' }}>
                  <div style={{ fontSize: 9, color: t.infoLabel, fontWeight: 600, letterSpacing: '.1em', marginBottom: 4 }}>{lbl.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: t.text, fontWeight: 600, lineHeight: 1.4, transition: 'color .25s' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* description */}
            {c.description && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, color: t.infoLabel, fontWeight: 600, letterSpacing: '.1em', marginBottom: 8 }}>DESCRIPTION</div>
                <div style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 12, padding: '13px 14px', fontSize: 13, color: t.textSub, lineHeight: 1.65, transition: 'background .25s, color .25s' }}>
                  {c.description}
                </div>
              </div>
            )}

            {/* timeline */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 9, color: t.infoLabel, fontWeight: 600, letterSpacing: '.1em', marginBottom: 12 }}>TIMELINE</div>
              <div style={{ paddingLeft: 16, borderLeft: `1px solid ${t.tlLine}` }}>
                {c.statusHistory.map((h, i) => {
                  const isLast = i === c.statusHistory.length - 1;
                  const sm = STATUS[h.status] || STATUS.submitted;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: isLast ? 0 : 14, position: 'relative', animation: `slideIn .28s ease both`, animationDelay: `${i * 50}ms` }}>
                      <div style={{
                        position: 'absolute', left: -21, top: 4, width: 9, height: 9, borderRadius: '50%',
                        border: `1.5px solid ${t.tlNodeBorder(isLast)}`,
                        background: isLast ? t.tlNodeActive : 'transparent',
                        transition: 'border-color .25s',
                      }}/>
                      <div style={{ paddingLeft: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: h.note ? 4 : 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: isLast ? t.tlTextActive : t.tlTextDim, transition: 'color .25s' }}>{sm.label}</span>
                          <span style={{ fontSize: 10, color: t.timeLabel, fontFamily: "'DM Mono',monospace" }}>{h.ts}</span>
                        </div>
                        {h.note && (
                          <div style={{ fontSize: 11, color: t.noteText, lineHeight: 1.5, background: t.noteBg, padding: '6px 10px', borderRadius: 8, border: `1px solid ${t.noteBorder}`, transition: 'background .25s, color .25s' }}>
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
              <div style={{ fontSize: 9, color: t.updateLabel, fontWeight: 600, letterSpacing: '.1em', marginBottom: 10 }}>UPDATE STATUS</div>
              <textarea
                rows={2}
                placeholder="Add note (optional)…"
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{
                  width: '100%', padding: '11px 13px',
                  background: t.surfaceAlt, border: `1px solid ${t.border}`,
                  borderRadius: 12, color: t.text, fontSize: 12,
                  fontFamily: "'Poppins',sans-serif", outline: 'none',
                  resize: 'none', lineHeight: 1.5, marginBottom: 10,
                  transition: 'background .25s, color .25s, border-color .2s',
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
                        flex: 1, padding: '11px 6px', borderRadius: 12,
                        border: `1px solid ${isCur ? '#e8185040' : isPicked ? '#e8185060' : t.border}`,
                        background: isCur ? '#e8185012' : isPicked ? '#e8185018' : t.surfaceAlt,
                        color: isCur ? '#e81850' : isPicked ? '#e81850' : t.textDim,
                        fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 600,
                        cursor: isCur ? 'default' : 'pointer',
                        letterSpacing: '.03em',
                        transition: 'background .2s, color .2s, border-color .2s',
                      }}
                      onMouseEnter={e => { if (!isCur && !isPicked) { e.currentTarget.style.borderColor = '#e8185030'; e.currentTarget.style.color = '#e81850'; e.currentTarget.style.background = '#e8185010'; } }}
                      onMouseLeave={e => { if (!isCur && !isPicked) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textDim; e.currentTarget.style.background = t.surfaceAlt; } }}
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
                  borderRadius: 13, border: 'none',
                  background: pending && pending !== localStat ? '#e81850' : t.surfaceAlt,
                  color: pending && pending !== localStat ? '#fff' : t.textDim,
                  fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 700,
                  cursor: pending && pending !== localStat ? 'pointer' : 'not-allowed',
                  letterSpacing: '.04em',
                  boxShadow: pending && pending !== localStat ? '0 0 24px #e8185033' : 'none',
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
                <div style={{ marginTop: 12, padding: '10px 14px', background: t.confirmBg, border: `1px solid ${t.confirmBrd}`, borderRadius: 10, fontSize: 12, color: t.confirmText, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>✓</span> Status updated · citizen tracking page reflects this change
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
  const { list, loading, error: loadError, updateStatus } = useComplaints();
  const [dark,     setDark]     = useState(() => localStorage.getItem('st-police-theme') !== 'light');
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [seenIds,  setSeenIds]  = useState(() => new Set());
  const prevLen = useRef(list.length);

  const t = dark ? DARK : LIGHT;

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('st-police-theme', next ? 'dark' : 'light');
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

  return (
    <div style={{ height: '100vh', width: '100vw', background: t.bgDeep, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .3s' }}>
      <style>{CSS}</style>

      {/* app container — 393px wide, full height */}
      <div style={{ width: 393, height: '100vh', maxWidth: '100vw', background: t.bg, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', transition: 'background .3s' }}>

        {/* ── HEADER ── */}
        <div style={{ background: t.bg, borderBottom: `1px solid ${t.border}`, padding: '20px 20px 14px', flexShrink: 0, transition: 'background .3s, border-color .3s' }}>

          {/* brand row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '.06em', lineHeight: 1 }}>
                <span style={{ color: t.text, transition: 'color .25s' }}>SAFE</span>
                <span style={{ color: '#e81850' }}>TRACE</span>
              </div>
              <div style={{ fontSize: 9, color: t.textDim, fontWeight: 700, letterSpacing: '.15em', marginTop: 3, transition: 'color .25s' }}>POLICE PORTAL</div>
            </div>

            {/* live dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e81850', boxShadow: '0 0 6px #e81850', animation: 'blink 2s ease-in-out infinite' }}/>
              <span style={{ fontSize: 9, color: t.textDim, fontWeight: 600, letterSpacing: '.1em', fontFamily: "'DM Mono',monospace", transition: 'color .25s' }}>LIVE</span>
            </div>
          </div>

          {/* heading */}
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: '-.02em', marginBottom: 14, transition: 'color .25s' }}>
            Complaints
          </div>

          {/* stats */}
          <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
            <Stat label="TOTAL"     val={stats.total}     t={t}/>
            <Stat label="ACTIVE"    val={stats.active}    t={t} pink/>
            <Stat label="ESCALATED" val={stats.escalated} t={t} pink/>
            <Stat label="RESOLVED"  val={stats.resolved}  t={t}/>
          </div>

          {/* search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.textDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: t.searchBg, border: `1px solid ${t.border}`,
                borderRadius: 13, padding: '11px 14px 11px 38px',
                color: t.text, fontSize: 13, fontFamily: "'Poppins',sans-serif",
                outline: 'none', width: '100%',
                transition: 'background .25s, color .25s, border-color .2s',
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
                  padding: '7px 15px', borderRadius: 20,
                  border: `1px solid ${active ? '#e8185050' : t.border}`,
                  background: active ? '#e8185015' : 'transparent',
                  color: active ? '#e81850' : t.filterColor,
                  fontSize: 11, fontWeight: 600, fontFamily: "'Poppins',sans-serif",
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'all .15s',
                }}>
                  {f.label}&nbsp;<span style={{ opacity: .55 }}>{cnt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ERROR ── */}
        {loadError && (
          <div style={{ margin: '0 16px', padding: '8px 12px', background: '#ff2d5515', border: '1px solid #ff2d5528', borderRadius: 10, fontSize: 11, color: '#ff2d55', fontWeight: 500 }}>
            Failed to load reports: {loadError}
          </div>
        )}

        {/* ── LIST ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px', background: t.bg, transition: 'background .3s' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55%', gap: 10 }}>
              <div style={{ fontSize: 16, color: t.textDim, animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</div>
              <div style={{ fontSize: 13, color: t.textDim, fontWeight: 500 }}>Loading reports...</div>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55%', gap: 10 }}>
              <div style={{ fontSize: 28, color: t.textDim, fontWeight: 300 }}>—</div>
              <div style={{ fontSize: 13, color: t.textDim, fontWeight: 500 }}>No complaints</div>
            </div>
          ) : visible.map((c, i) => (
            <Card key={c.id} c={c} isNew={isNew(c.id)} delay={i * 40} t={t} dark={dark}
              onClick={() => { setSelected(c.id); setSeenIds(p => { const n = new Set(p); n.add(c.id); return n; }); }}
            />
          ))}
        </div>

        {/* ── DETAIL ── */}
        {selectedObj && (
          <Detail c={selectedObj} onClose={() => setSelected(null)} onUpdate={updateStatus} t={t}/>
        )}
      </div>
    </div>
  );
}
