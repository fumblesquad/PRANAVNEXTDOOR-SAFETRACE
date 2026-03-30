import { useState } from 'react';
import { riskColor, riskLabel, TYPE_ICON } from '../data/config';

const TAG_COLOR = { police: '#38bdf8', hospital: '#34d399', school: '#fbbf24', crowd: '#c084fc' };
const TAG_ICON  = { police: '🚔', hospital: '🏥', school: '🏫', crowd: '🏬' };
const TAG_LABEL = { police: 'Police', hospital: 'Hospital', school: 'School', crowd: 'Public Area' };

function fmDist(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
function fmWalk(m) {
  const mins = Math.ceil(m / 80);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ── Place card ─────────────────────────────────────────────────────
function PlaceCard({ place, index, onSelect }) {
  const [hov, setHov] = useState(false);
  const c = TAG_COLOR[place.tags[0]] || '#888';
  const pct = Math.max(8, 100 - Math.min((place._dist / 3000) * 90, 90));
  const isGoogle = place.source === 'google';

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#110c18' : '#09090f',
        border: `1px solid ${hov ? '#e8185044' : '#ffffff07'}`,
        borderRadius: 12, padding: '13px 13px',
        marginBottom: 7, cursor: 'pointer',
        transition: 'all 0.16s ease',
        transform: hov ? 'translateX(4px)' : 'none',
        animation: `fadeUp 0.28s ease both`,
        animationDelay: `${index * 50}ms`,
        boxShadow: hov ? '0 4px 18px #e8185015' : 'none',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: `${c}15`, border: `1px solid ${c}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: c, fontWeight: 600,
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, color: hov ? '#ffe' : '#fff',
            fontWeight: 500, lineHeight: 1.4, marginBottom: 6,
          }}>
            {place.name}
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 4,
              letterSpacing: '0.07em', background: `${c}15`,
              color: c, border: `1px solid ${c}30`,
            }}>
              {TAG_ICON[place.tags[0]]} {TAG_LABEL[place.tags[0]] || place.tags[0]}
            </span>
            <span style={{ fontSize: 10, color: '#ffffff33' }}>
              {fmDist(place._dist)} &middot; {fmWalk(place._dist)}
            </span>
            {isGoogle && (
              <span style={{
                fontSize: 8, padding: '1px 5px', borderRadius: 3,
                background: '#34d39912', color: '#34d399',
                border: '1px solid #34d39922',
                letterSpacing: '0.06em',
              }}>
                LIVE
              </span>
            )}
          </div>

          {/* Google-specific extra info */}
          {isGoogle && (place.rating || place.openNow !== null) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 9, color: '#ffffff33' }}>
              {place.rating && <span>{'★'} {place.rating}</span>}
              {place.openNow !== null && (
                <span style={{ color: place.openNow ? '#34d399' : '#ff6060' }}>
                  {place.openNow ? 'Open now' : 'Closed'}
                </span>
              )}
            </div>
          )}

          <div style={{ marginTop: 8, height: 2, background: '#ffffff08', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: `linear-gradient(90deg, ${c}, ${c}55)`,
              borderRadius: 1, boxShadow: `0 0 4px ${c}88`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        <span style={{
          fontSize: 14, marginTop: 3, flexShrink: 0,
          color: hov ? '#e81850' : '#ffffff18',
          transition: 'color 0.15s',
        }}>&rarr;</span>
      </div>
    </div>
  );
}

// ── Destination card ───────────────────────────────────────────────
function DestCard({ dest, routeData, loading, onStartNav, onBack }) {
  const c = TAG_COLOR[dest.tags[0]] || '#888';
  return (
    <div>
      <div style={{
        background: '#0f0814', border: '1px solid #e8185030',
        borderRadius: 12, padding: '14px', marginBottom: 10,
      }}>
        <div style={{ fontSize: 9, color: '#e81850', letterSpacing: '0.15em', marginBottom: 10 }}>
          DESTINATION
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: `${c}15`, border: `1px solid ${c}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {TAG_ICON[dest.tags[0]]}
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, lineHeight: 1.4 }}>
              {dest.name}
            </div>
            <div style={{ fontSize: 10, color: '#ffffff44', marginTop: 3 }}>
              {fmDist(dest._dist)} &middot; {fmWalk(dest._dist)}
            </div>
          </div>
        </div>

        {routeData && (
          <div style={{
            marginTop: 12, padding: '9px 10px',
            background: '#ffffff05', borderRadius: 8,
            display: 'flex', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 9, color: '#ffffff33', letterSpacing: '0.1em' }}>DISTANCE</div>
              <div style={{ fontSize: 13, color: '#fff', marginTop: 2 }}>{routeData.totalDist}</div>
            </div>
            <div style={{ width: 1, background: '#ffffff0a' }} />
            <div>
              <div style={{ fontSize: 9, color: '#ffffff33', letterSpacing: '0.1em' }}>WALK TIME</div>
              <div style={{ fontSize: 13, color: '#fff', marginTop: 2 }}>{routeData.totalTime}</div>
            </div>
            <div style={{ width: 1, background: '#ffffff0a' }} />
            <div>
              <div style={{ fontSize: 9, color: '#ffffff33', letterSpacing: '0.1em' }}>STEPS</div>
              <div style={{ fontSize: 13, color: '#fff', marginTop: 2 }}>{routeData.steps.length}</div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onStartNav}
        disabled={loading || !routeData}
        style={{
          width: '100%', padding: '13px',
          background: loading || !routeData ? '#2a1020' : '#e81850',
          border: 'none', borderRadius: 10,
          color: loading || !routeData ? '#ffffff33' : '#fff',
          fontSize: 12, letterSpacing: '0.14em', fontWeight: 600,
          fontFamily: 'inherit', cursor: loading || !routeData ? 'not-allowed' : 'pointer',
          marginBottom: 8,
          boxShadow: !loading && routeData ? '0 0 24px #e8185044' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {loading ? '◌ calculating route...' : !routeData ? 'waiting for route...' : 'START NAVIGATION \u2192'}
      </button>

      <button onClick={onBack} style={{
        width: '100%', padding: '9px',
        background: 'transparent', border: '1px solid #ffffff0d',
        borderRadius: 8, color: '#ffffff33', fontSize: 11,
        letterSpacing: '0.08em', fontFamily: 'inherit', cursor: 'pointer',
        marginBottom: 16,
      }}>
        &larr; change destination
      </button>

      {routeData?.steps?.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: '#ffffff1a', letterSpacing: '0.15em', marginBottom: 7, paddingLeft: 2 }}>
            ROUTE PREVIEW
          </div>
          {routeData.steps.slice(0, 5).map((s, i) => (
            <div key={i} style={{
              fontSize: 11, color: '#ffffff44',
              padding: '7px 10px', background: '#09090f',
              borderRadius: 6, marginBottom: 3,
              borderLeft: '2px solid #e8185022', lineHeight: 1.5,
            }}>
              {s.instruction}
            </div>
          ))}
          {routeData.steps.length > 5 && (
            <div style={{ fontSize: 10, color: '#ffffff18', textAlign: 'center', padding: 4 }}>
              + {routeData.steps.length - 5} more steps
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Unsafe zone summary panel ──────────────────────────────────────
function UnsafeZoneSummary({ unsafeZones }) {
  const [open, setOpen] = useState(false);
  const highCount   = unsafeZones.filter(z => z.risk >= 0.75).length;
  const medCount    = unsafeZones.filter(z => z.risk >= 0.60 && z.risk < 0.75).length;
  const lowCount    = unsafeZones.filter(z => z.risk < 0.60).length;
  const newsCount   = unsafeZones.filter(z => z.source === 'newsapi').length;
  const staticCount = unsafeZones.filter(z => z.source === 'static').length;

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '9px 12px',
          background: '#0d0810', border: '1px solid #ff2d5522',
          borderRadius: 8, color: '#ff2d55',
          fontSize: 10, letterSpacing: '0.1em',
          fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span>
          ⚠ RISK ZONE MAP ({unsafeZones.length} zones
          {newsCount > 0 && <span style={{ color: '#ff9500' }}> &middot; {newsCount} live</span>})
        </span>
        <span style={{ color: '#ffffff33' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 6 }}>
          {/* Summary badges */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {[
              { label: 'HIGH',   count: highCount,  color: '#ff2d55' },
              { label: 'MED',    count: medCount,   color: '#ff9500' },
              { label: 'LOW',    count: lowCount,   color: '#ffcc00' },
            ].map(b => (
              <div key={b.label} style={{
                flex: 1, textAlign: 'center',
                background: `${b.color}10`,
                border: `1px solid ${b.color}30`,
                borderRadius: 6, padding: '5px 4px',
              }}>
                <div style={{ fontSize: 14, color: b.color, fontWeight: 600 }}>{b.count}</div>
                <div style={{ fontSize: 8, color: b.color, letterSpacing: '0.08em', opacity: 0.7 }}>{b.label}</div>
              </div>
            ))}
          </div>

          {/* Source breakdown */}
          {newsCount > 0 && (
            <div style={{
              display: 'flex', gap: 6, marginBottom: 8,
              fontSize: 8, letterSpacing: '0.08em',
            }}>
              <span style={{
                padding: '3px 7px', borderRadius: 4,
                background: '#ffffff08', color: '#ffffff44',
                border: '1px solid #ffffff0a',
              }}>
                {staticCount} BASELINE
              </span>
              <span style={{
                padding: '3px 7px', borderRadius: 4,
                background: '#ff950010', color: '#ff9500',
                border: '1px solid #ff950022',
              }}>
                📰 {newsCount} LIVE NEWS
              </span>
            </div>
          )}

          {/* Zone list */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {unsafeZones
              .sort((a, b) => b.risk - a.risk)
              .map(zone => {
              const c = riskColor(zone.risk);
              const isNews = zone.source === 'newsapi';
              return (
                <div key={zone.id} style={{
                  padding: '7px 10px',
                  background: '#09090f',
                  border: `1px solid ${c}18`,
                  borderLeft: `2px solid ${isNews ? '#ff9500' : c}66`,
                  borderRadius: 6, marginBottom: 3,
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 13, flexShrink: 0 }}>
                    {TYPE_ICON[zone.type] || '⚠️'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: '#ffffffcc', lineHeight: 1.4 }}>
                      {zone.label}
                    </div>
                    <div style={{ fontSize: 9, color: '#ffffff33', marginTop: 2 }}>
                      {zone.note}
                    </div>
                    {isNews && zone.publishedAt && (
                      <div style={{ fontSize: 8, color: '#ff950044', marginTop: 2 }}>
                        {new Date(zone.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short',
                        })}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 8, padding: '2px 5px', borderRadius: 3,
                      background: `${c}18`, color: c,
                      letterSpacing: '0.06em',
                    }}>
                      {Math.round(zone.risk * 100)}%
                    </span>
                    {isNews && (
                      <span style={{
                        fontSize: 7, padding: '1px 4px', borderRadius: 2,
                        background: '#ff950015', color: '#ff9500',
                        letterSpacing: '0.06em',
                      }}>
                        LIVE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main SidePanel ─────────────────────────────────────────────────
export default function SidePanel({
  pin, nearby, dest, routeData, loading,
  showUnsafe, onToggleUnsafe,
  onSelectDest, onStartNav, onReset, onChangeDest,
  unsafeZones,
  dataStatus,
  newsLoading,
  placesLoading,
}) {
  const show = !!pin;

  return (
    <div style={{
      width: show ? 300 : 0, minWidth: show ? 300 : 0,
      background: '#07070e',
      borderRight: show ? '1px solid #ffffff06' : 'none',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.38s cubic-bezier(0.4,0,0.2,1), min-width 0.38s cubic-bezier(0.4,0,0.2,1)',
      fontFamily: "'DM Mono', monospace",
    }}>
      {show && (
        <>
          {/* Top accent line */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, #e81850, #ff6090, #e81850)', flexShrink: 0 }} />

          {/* Header */}
          <div style={{ padding: '18px 18px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 10, color: '#e81850', letterSpacing: '0.18em', fontWeight: 500 }}>
                    SAFETRACE
                  </div>
                  {/* Live indicator dots */}
                  {(dataStatus?.places === 'live' || dataStatus?.news === 'live') && (
                    <div style={{ display: 'flex', gap: 3 }}>
                      {dataStatus?.places === 'live' && (
                        <div style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: '#34d399', boxShadow: '0 0 4px #34d399',
                        }} title="Places live" />
                      )}
                      {dataStatus?.news === 'live' && (
                        <div style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: '#ff9500', boxShadow: '0 0 4px #ff9500',
                        }} title="News live" />
                      )}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#ffffff44', marginTop: 2 }}>
                  {placesLoading
                    ? 'fetching nearby places...'
                    : dest
                      ? 'route ready'
                      : `${nearby.length} safe places nearby`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {/* Unsafe zone toggle */}
                <button
                  onClick={onToggleUnsafe}
                  title={showUnsafe ? 'Hide risk zones' : 'Show risk zones'}
                  style={{
                    background: showUnsafe ? '#ff2d5515' : 'none',
                    border: `1px solid ${showUnsafe ? '#ff2d5544' : '#ffffff0a'}`,
                    color: showUnsafe ? '#ff2d55' : '#ffffff33',
                    borderRadius: 6, padding: '4px 8px',
                    fontSize: 10, cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  ⚠
                </button>
                <button onClick={onReset} style={{
                  background: 'none', border: '1px solid #ffffff0a',
                  color: '#ffffff33', borderRadius: 6, padding: '4px 10px',
                  fontSize: 10, cursor: 'pointer', letterSpacing: '0.05em',
                  fontFamily: 'inherit',
                }}>
                  reset
                </button>
              </div>
            </div>
            <div style={{ height: 1, background: '#ffffff06', margin: '14px 0 0' }} />
          </div>

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
            {!dest
              ? (
                <>
                  {nearby.map((p, i) => (
                    <PlaceCard key={p.id} place={p} index={i} onSelect={() => onSelectDest(p)} />
                  ))}
                  <UnsafeZoneSummary unsafeZones={unsafeZones || []} />
                </>
              )
              : <DestCard
                  dest={dest}
                  routeData={routeData}
                  loading={loading}
                  onStartNav={onStartNav}
                  onBack={onChangeDest}
                />
            }
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
