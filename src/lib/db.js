import { supabase } from './supabase.js';
import { seedMatches } from '../data.js';

// localStorage keys (fallback when Supabase is not configured)
const LS_MATCHES  = 'wcw.matches.v2';
const LS_SETTLED  = 'wcw.settled.v1';
const LS_COLLAPSE = 'wcw.collapsed.v1';
const LS_TWEAKS   = 'wcw.tweaks.v1';
const LS_STAGES   = 'wcw.stagesOpen.v1';

// ── localStorage helpers ────────────────────────────────────────────────────

function lsLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch { return fallback; }
}

function lsSave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── DB ↔ app transforms ─────────────────────────────────────────────────────

function matchToDb(m) {
  return {
    id:           m.id,
    stage:        m.stage,
    group_letter: m.group  || null,
    matchday:     m.matchday || null,
    round:        m.round  || null,
    home:         m.home,
    away:         m.away,
    kickoff:      m.kickoff,
    line:         m.line,
    pick:         m.pick,
    home_score:   m.homeScore,
    away_score:   m.awayScore,
  };
}

function dbToMatch(row) {
  return {
    id:        row.id,
    stage:     row.stage,
    group:     row.group_letter || '',
    matchday:  row.matchday  ?? undefined,
    round:     row.round     ?? undefined,
    home:      row.home,
    away:      row.away,
    kickoff:   row.kickoff,
    line:      row.line,
    pick:      row.pick,
    homeScore: row.home_score,
    awayScore: row.away_score,
  };
}

// ── Matches ─────────────────────────────────────────────────────────────────

export async function loadMatches() {
  if (!supabase) {
    const raw = lsLoad(LS_MATCHES, null);
    if (!raw || !Array.isArray(raw) || !raw.length) return seedMatches();
    return raw;
  }
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff', { ascending: true });
  if (error) {
    console.error('loadMatches:', error.message);
    return seedMatches();
  }
  if (!data?.length) {
    // First run with Supabase — seed the DB so edits have a base to build on.
    const fresh = seedMatches();
    const { error: seedErr } = await supabase.from('matches').insert(fresh.map(matchToDb));
    if (seedErr) console.error('seed on first load:', seedErr.message);
    return fresh;
  }
  return data.map(dbToMatch);
}

export async function upsertMatch(match) {
  if (!supabase) return;
  const { error } = await supabase.from('matches').upsert(matchToDb(match));
  if (error) console.error('upsertMatch:', error.message);
}

export async function deleteMatchDb(id) {
  if (!supabase) return;
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) console.error('deleteMatch:', error.message);
}

export async function reseedDb(matches) {
  if (!supabase) {
    lsSave(LS_MATCHES, matches);
    return;
  }
  await supabase.from('matches').delete().neq('id', '');
  const { error } = await supabase.from('matches').insert(matches.map(matchToDb));
  if (error) console.error('reseedDb:', error.message);
}

export function saveMatchesLocal(matches) {
  lsSave(LS_MATCHES, matches);
}

// ── Settings ────────────────────────────────────────────────────────────────
// Keys: 'settled' | 'collapsed' | 'tweaks' | 'stagesOpen'

export async function loadSetting(key) {
  const defaults = {
    settled:    {},
    collapsed:  {},
    tweaks:     { alexPayout: 100, dadPayout: 20 },
    stagesOpen: true,
  };
  if (!supabase) {
    if (key === 'stagesOpen') {
      const v = localStorage.getItem(LS_STAGES);
      return v == null ? true : v === '1';
    }
    const lsKey = { settled: LS_SETTLED, collapsed: LS_COLLAPSE, tweaks: LS_TWEAKS }[key];
    return lsLoad(lsKey, defaults[key]);
  }
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return data?.value ?? defaults[key];
}

export async function saveSetting(key, value) {
  if (!supabase) {
    if (key === 'stagesOpen') {
      try { localStorage.setItem(LS_STAGES, value ? '1' : '0'); } catch {}
      return;
    }
    const lsKey = { settled: LS_SETTLED, collapsed: LS_COLLAPSE, tweaks: LS_TWEAKS }[key];
    if (lsKey) lsSave(lsKey, value);
    return;
  }
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value });
  if (error) console.error('saveSetting:', error.message);
}
