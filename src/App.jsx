import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header.jsx';
import StageSection from './components/StageSection.jsx';
import { STAGES, seedMatches, uid, FINAL_GROUP } from './data.js';
import {
  loadMatches, saveMatchesLocal, upsertMatch, deleteMatchDb,
  reseedDb, loadSetting, saveSetting,
} from './lib/db.js';
import { supabase } from './lib/supabase.js';

// ── Tweaks (floating settings panel) ────────────────────────────────────────

function TweaksPanel({ tweaks, onChange }) {
  const [open, setOpen] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 16, y: 16 });

  const clamp = useCallback(() => {
    const p = dragRef.current;
    if (!p) return;
    const w = p.offsetWidth, h = p.offsetHeight;
    offsetRef.current = {
      x: Math.min(Math.max(16, offsetRef.current.x), Math.max(16, window.innerWidth  - w - 16)),
      y: Math.min(Math.max(16, offsetRef.current.y), Math.max(16, window.innerHeight - h - 16)),
    };
    p.style.right  = offsetRef.current.x + 'px';
    p.style.bottom = offsetRef.current.y + 'px';
  }, []);

  useEffect(() => {
    if (!open) return;
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [open, clamp]);

  const onDragStart = (e) => {
    const p = dragRef.current;
    if (!p) return;
    const r = p.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const sr = window.innerWidth  - r.right;
    const sb = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = { x: sr - (ev.clientX - sx), y: sb - (ev.clientY - sy) };
      clamp();
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <>
      <button
        type="button"
        style={{
          position: 'fixed', right: 16, bottom: open ? 260 : 16,
          zIndex: 2147483645,
          appearance: 'none', border: '1px solid rgba(0,0,0,.15)',
          background: 'rgba(250,249,247,.92)',
          backdropFilter: 'blur(12px)',
          color: '#29261b', padding: '8px 14px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          transition: 'bottom .2s',
          boxShadow: '0 2px 12px rgba(0,0,0,.1)',
          display: open ? 'none' : 'block',
        }}
        onClick={() => setOpen(true)}>
        ⚙ Tweaks
      </button>

      {open && (
        <div ref={dragRef} style={{
          position: 'fixed', right: 16, bottom: 16, zIndex: 2147483646,
          width: 260, background: 'rgba(250,249,247,.92)',
          backdropFilter: 'blur(24px) saturate(160%)',
          border: '.5px solid rgba(255,255,255,.6)', borderRadius: 14,
          boxShadow: '0 1px 0 rgba(255,255,255,.5) inset, 0 12px 40px rgba(0,0,0,.18)',
          fontFamily: 'ui-sans-serif,system-ui,-apple-system,sans-serif',
          fontSize: 11.5, color: '#29261b', overflow: 'hidden',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'10px 8px 10px 14px', cursor:'move', userSelect:'none' }}
               onMouseDown={onDragStart}>
            <b style={{ fontSize:12, fontWeight:600 }}>Tweaks</b>
            <button type="button" onClick={() => setOpen(false)}
                    onMouseDown={e => e.stopPropagation()}
                    style={{ appearance:'none', border:0, background:'transparent',
                             color:'rgba(41,38,27,.55)', width:22, height:22,
                             borderRadius:6, cursor:'pointer', fontSize:13 }}>✕</button>
          </div>
          <div style={{ padding:'2px 14px 14px', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'.06em',
                          textTransform:'uppercase', color:'rgba(41,38,27,.45)', paddingTop:4 }}>
              Payouts
            </div>
            {[['Alex / win','alexPayout'],['Dad / win','dadPayout']].map(([label, key]) => (
              <div key={key} style={{ display:'flex', alignItems:'center', height:26,
                                      padding:'0 0 0 8px', border:'.5px solid rgba(0,0,0,.1)',
                                      borderRadius:7, background:'rgba(255,255,255,.6)' }}>
                <span style={{ fontWeight:500, color:'rgba(41,38,27,.6)', paddingRight:8,
                                cursor:'ew-resize', userSelect:'none', fontSize:11.5 }}>
                  {label}
                </span>
                <input type="number" value={tweaks[key]} min={0} step={5}
                       onChange={e => onChange(key, Number(e.target.value))}
                       style={{ flex:1, minWidth:0, height:'100%', border:0, background:'transparent',
                                fontFamily:'inherit', fontSize:11.5, textAlign:'right',
                                padding:'0 4px 0 0', outline:'none', color:'inherit',
                                MozAppearance:'textfield' }} />
                <span style={{ paddingRight:8, color:'rgba(41,38,27,.45)' }}>$</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

const SAVE_DELAY = supabase ? 800 : 0;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [settled, setSettled] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [stagesOpen, setStagesOpen] = useState(true);
  const [tweaks, setTweaks] = useState({ alexPayout: 100, dadPayout: 20 });

  const payouts = useMemo(() => ({
    alex: Number(tweaks.alexPayout) || 0,
    dad:  Number(tweaks.dadPayout)  || 0,
  }), [tweaks.alexPayout, tweaks.dadPayout]);

  // Load all state on mount
  useEffect(() => {
    (async () => {
      const [ms, s, c, so, tw] = await Promise.all([
        loadMatches(),
        loadSetting('settled'),
        loadSetting('collapsed'),
        loadSetting('stagesOpen'),
        loadSetting('tweaks'),
      ]);
      setMatches(ms);
      setSettled(s);
      setCollapsed(c);
      setStagesOpen(so);
      setTweaks(tw);
      setLoading(false);
    })();
  }, []);

  // Persist matches — debounced for Supabase, immediate for localStorage
  const saveTimer = useRef(null);
  const pendingUpserts = useRef(new Map());
  const pendingDeletes = useRef(new Set());

  const flushSaves = useCallback(async () => {
    const ups = [...pendingUpserts.current.values()];
    const dels = [...pendingDeletes.current];
    pendingUpserts.current.clear();
    pendingDeletes.current.clear();
    await Promise.all([
      ...ups.map(m => upsertMatch(m)),
      ...dels.map(id => deleteMatchDb(id)),
    ]);
  }, []);

  const scheduleSave = useCallback((updated, delId) => {
    if (delId) pendingDeletes.current.add(delId);
    if (updated) updated.forEach(m => pendingUpserts.current.set(m.id, m));
    clearTimeout(saveTimer.current);
    if (SAVE_DELAY === 0) { flushSaves(); return; }
    saveTimer.current = setTimeout(flushSaves, SAVE_DELAY);
  }, [flushSaves]);

  // Keep localStorage in sync (for offline fallback even when Supabase is set)
  useEffect(() => {
    if (!loading) saveMatchesLocal(matches);
  }, [matches, loading]);

  const onChange = useCallback((next) => {
    setMatches(prev => {
      const updated = prev.map(m => m.id === next.id ? next : m);
      scheduleSave([next]);
      return updated;
    });
  }, [scheduleSave]);

  const onDelete = useCallback((id) => {
    setMatches(prev => {
      scheduleSave(null, id);
      return prev.filter(m => m.id !== id);
    });
  }, [scheduleSave]);

  const onAdd = useCallback((stageId) => {
    const newMatch = {
      id: uid(), stage: stageId, group: '', home: '', away: '',
      kickoff: '', line: '', pick: 'over', homeScore: '', awayScore: '',
    };
    setMatches(prev => {
      scheduleSave([newMatch]);
      return [...prev, newMatch];
    });
  }, [scheduleSave]);

  const onSettle = useCallback((key) => {
    setSettled(prev => {
      let next;
      if (key === 'final-group') {
        next = { ...prev };
        FINAL_GROUP.forEach(sid => { next[sid] = Date.now(); });
      } else {
        next = { ...prev, [key]: Date.now() };
      }
      saveSetting('settled', next);
      return next;
    });
  }, []);

  const onToggleCollapse = useCallback((stageId) => {
    setCollapsed(prev => {
      const next = { ...prev, [stageId]: !prev[stageId] };
      saveSetting('collapsed', next);
      return next;
    });
  }, []);

  const onToggleStages = useCallback(() => {
    setStagesOpen(prev => {
      saveSetting('stagesOpen', !prev);
      return !prev;
    });
  }, []);

  const setTweak = useCallback((key, value) => {
    setTweaks(prev => {
      const next = { ...prev, [key]: value };
      saveSetting('tweaks', next);
      return next;
    });
  }, []);

  const allCollapsed = STAGES.every(s => collapsed[s.id]);
  const toggleAll = () => {
    const next = {};
    if (!allCollapsed) STAGES.forEach(s => { next[s.id] = true; });
    setCollapsed(next);
    saveSetting('collapsed', next);
  };

  const onReset = async () => {
    if (!window.confirm('Reset to the full 2026 schedule? All bets will be erased.')) return;
    const fresh = seedMatches();
    setMatches(fresh);
    setSettled({});
    saveSetting('settled', {});
    await reseedDb(fresh);
  };

  const onClearAll = async () => {
    if (!window.confirm('Delete every match? You can re-seed afterward.')) return;
    setMatches([]);
    setSettled({});
    saveSetting('settled', {});
    await reseedDb([]);
  };

  if (loading) {
    return (
      <div data-theme="paper" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center',
                                       background: '#f6f4ef', color: '#1a1a1a', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="wcw" data-theme="paper">
      <Header matches={matches} payouts={payouts}
              stagesOpen={stagesOpen} onToggleStages={onToggleStages} />

      <main className="wcw__main">
        {STAGES.map(s => (
          <StageSection key={s.id} stage={s}
            matches={matches} allMatches={matches}
            onChange={onChange} onDelete={onDelete} onAdd={onAdd}
            collapsed={!!collapsed[s.id]} onToggleCollapse={onToggleCollapse}
            settled={settled} onSettle={onSettle} payouts={payouts} />
        ))}

        <footer className="wcw__foot">
          <div className="wcw__footnote">
            {supabase ? 'Synced to Supabase.' : 'Saved locally — add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to sync.'}
          </div>
          <div className="wcw__footacts">
            <button type="button" className="wcw__btn wcw__btn--ghost" onClick={toggleAll}>
              {allCollapsed ? 'Expand all' : 'Collapse all'}
            </button>
            <button type="button" className="wcw__btn wcw__btn--ghost" onClick={onReset}>Re-seed full schedule</button>
            <button type="button" className="wcw__btn wcw__btn--danger" onClick={onClearAll}>Clear all</button>
          </div>
        </footer>
      </main>

      <TweaksPanel tweaks={tweaks} onChange={setTweak} />
    </div>
  );
}
