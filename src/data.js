export const STAGES = [
  { id: 'group', label: 'Group Stage',      short: 'GS'  },
  { id: 'r32',   label: 'Round of 32',      short: 'R32' },
  { id: 'r16',   label: 'Round of 16',      short: 'R16' },
  { id: 'qf',    label: 'Quarterfinals',    short: 'QF'  },
  { id: 'sf',    label: 'Semifinals',       short: 'SF'  },
  { id: 'third', label: '3rd Place Match',  short: '3rd' },
  { id: 'final', label: 'Final',            short: 'F'   },
];

export const GROUPS_2026 = [
  { id: 'A', teams: ['Mexico',      'South Africa', 'South Korea',          'Czech Republic'] },
  { id: 'B', teams: ['Canada',      'Bosnia and Herzegovina', 'Qatar',      'Switzerland']    },
  { id: 'C', teams: ['Brazil',      'Morocco',      'Haiti',                'Scotland']       },
  { id: 'D', teams: ['United States','Paraguay',    'Australia',            'Turkey']         },
  { id: 'E', teams: ['Germany',     'Curaçao',      'Ivory Coast',          'Ecuador']        },
  { id: 'F', teams: ['Netherlands', 'Japan',        'Sweden',               'Tunisia']        },
  { id: 'G', teams: ['Belgium',     'Egypt',        'Iran',                 'New Zealand']    },
  { id: 'H', teams: ['Spain',       'Cape Verde',   'Saudi Arabia',         'Uruguay']        },
  { id: 'I', teams: ['France',      'Senegal',      'Iraq',                 'Norway']         },
  { id: 'J', teams: ['Argentina',   'Algeria',      'Austria',              'Jordan']         },
  { id: 'K', teams: ['Portugal',    'DR Congo',     'Uzbekistan',           'Colombia']       },
  { id: 'L', teams: ['England',     'Croatia',      'Ghana',                'Panama']         },
];

const MD1_DATES = {
  A: '2026-06-11',
  B: '2026-06-12', D: '2026-06-12',
  C: '2026-06-13',
  E: '2026-06-14', F: '2026-06-14',
  G: '2026-06-15', H: '2026-06-15',
  I: '2026-06-16', J: '2026-06-16',
  K: '2026-06-17', L: '2026-06-17',
};
const KICK_HOURS = ['12:00', '15:00', '18:00', '21:00'];

let _id = 0;
export const uid = () => `m_${Date.now().toString(36)}_${(_id++).toString(36)}`;

function addDays(iso, days) {
  const d = new Date(iso + 'T00:00');
  d.setDate(d.getDate() + days);
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
}

const MATCHDAY_PAIRINGS = [
  [[1,2],[3,4]],
  [[1,3],[4,2]],
  [[4,1],[2,3]],
];

function seedGroupMatches() {
  const out = [];
  for (const g of GROUPS_2026) {
    const md1 = MD1_DATES[g.id];
    const dates = [md1, addDays(md1, 5), addDays(md1, 11)];
    MATCHDAY_PAIRINGS.forEach((pairs, mdIdx) => {
      pairs.forEach(([h, a], pairIdx) => {
        out.push({
          id: uid(),
          stage: 'group',
          group: g.id,
          matchday: mdIdx + 1,
          home: g.teams[h - 1],
          away: g.teams[a - 1],
          kickoff: `${dates[mdIdx]}T${KICK_HOURS[(mdIdx * 2 + pairIdx) % KICK_HOURS.length]}`,
          line: '', pick: 'over', homeScore: '', awayScore: '',
        });
      });
    });
  }
  return out;
}

const R32_MATCHES = [
  { home: 'South Africa',  away: 'Canada',                 kickoff: '2026-06-28T15:00' },
  { home: 'Brazil',        away: 'Japan',                  kickoff: '2026-06-29T13:00' },
  { home: 'Germany',       away: 'Paraguay',               kickoff: '2026-06-29T16:30' },
  { home: 'Netherlands',   away: 'Morocco',                kickoff: '2026-06-29T21:00' },
  { home: 'Ivory Coast',   away: 'Norway',                 kickoff: '2026-06-30T13:00' },
  { home: 'France',        away: 'Sweden',                 kickoff: '2026-06-30T17:00' },
  { home: 'Mexico',        away: 'Ecuador',                kickoff: '2026-06-30T21:00' },
  { home: 'England',       away: 'DR Congo',               kickoff: '2026-07-01T12:00' },
  { home: 'Belgium',       away: 'Senegal',                kickoff: '2026-07-01T16:00' },
  { home: 'United States', away: 'Bosnia and Herzegovina', kickoff: '2026-07-01T20:00' },
  { home: 'Spain',         away: 'Austria',                kickoff: '2026-07-02T15:00' },
  { home: 'Portugal',      away: 'Croatia',                kickoff: '2026-07-02T19:00' },
  { home: 'Switzerland',   away: 'Algeria',                kickoff: '2026-07-02T23:00' },
  { home: 'Australia',     away: 'Egypt',                  kickoff: '2026-07-03T14:00' },
  { home: 'Argentina',     away: 'Cape Verde',             kickoff: '2026-07-03T18:00' },
  { home: 'Colombia',      away: 'Ghana',                  kickoff: '2026-07-03T21:30' },
];

const KO_DATES = {
  r16:   ['2026-07-04','2026-07-05','2026-07-06','2026-07-07'],
  qf:    ['2026-07-09','2026-07-10','2026-07-11'],
  sf:    ['2026-07-14','2026-07-15'],
  third: ['2026-07-18'],
  final: ['2026-07-19'],
};

function pickDate(stage, idx) {
  const dates = KO_DATES[stage] || [];
  if (!dates.length) return '';
  return dates[idx % dates.length] + 'T15:00';
}

function seedKnockout() {
  const out = [];
  R32_MATCHES.forEach((m, i) => {
    out.push({ id: uid(), stage: 'r32', round: i+1, home: m.home, away: m.away, kickoff: m.kickoff, line:'', pick:'over', homeScore:'', awayScore:'' });
  });
  for (let i = 0; i < 8; i++) {
    out.push({ id: uid(), stage:'r16', round:i+1, home:`Winner R32-${i*2+1}`, away:`Winner R32-${i*2+2}`, kickoff:pickDate('r16',i), line:'', pick:'over', homeScore:'', awayScore:'' });
  }
  for (let i = 0; i < 4; i++) {
    out.push({ id: uid(), stage:'qf', round:i+1, home:`Winner R16-${i*2+1}`, away:`Winner R16-${i*2+2}`, kickoff:pickDate('qf',i), line:'', pick:'over', homeScore:'', awayScore:'' });
  }
  for (let i = 0; i < 2; i++) {
    out.push({ id: uid(), stage:'sf', round:i+1, home:`Winner QF-${i*2+1}`, away:`Winner QF-${i*2+2}`, kickoff:pickDate('sf',i), line:'', pick:'over', homeScore:'', awayScore:'' });
  }
  out.push({ id: uid(), stage:'third', round:1, home:'Loser SF-1', away:'Loser SF-2', kickoff:pickDate('third',0), line:'', pick:'over', homeScore:'', awayScore:'' });
  out.push({ id: uid(), stage:'final', round:1, home:'Winner SF-1', away:'Winner SF-2', kickoff:pickDate('final',0), line:'', pick:'over', homeScore:'', awayScore:'' });
  return out;
}

export function seedMatches() {
  return [...seedGroupMatches(), ...seedKnockout()];
}

export const LIVERPOOL_COUNTRIES = new Set([
  'Argentina', 'Brazil', 'Colombia', 'Egypt', 'England', 'France',
  'Germany', 'Japan', 'Netherlands', 'Scotland', 'Senegal', 'Sweden', 'Uruguay',
]);

export function involvesLiverpool(m) {
  return LIVERPOOL_COUNTRIES.has(m.home) || LIVERPOOL_COUNTRIES.has(m.away)
      || m.home === 'United States' || m.away === 'United States';
}

export function resolveBet(m) {
  const hs = m.homeScore === '' ? null : Number(m.homeScore);
  const as = m.awayScore === '' ? null : Number(m.awayScore);
  const line = m.line === '' ? null : Number(m.line);
  if (hs == null || as == null || line == null
      || Number.isNaN(hs) || Number.isNaN(as) || Number.isNaN(line)) {
    return { status: 'pending', total: null, line };
  }
  const total = hs + as;
  if (total === line) return { status: 'push', total, line };
  const wentOver = total > line;
  const alexWins = (m.pick === 'over' && wentOver) || (m.pick === 'under' && !wentOver);
  return { status: alexWins ? 'alex' : 'dad', total, line };
}

export function payoutFor(m, payouts) {
  if (m.stage === 'final') return { alex: payouts.alex, dad: payouts.alex };
  return { alex: payouts.alex, dad: payouts.dad };
}

export const FINAL_GROUP = ['qf', 'sf', 'third', 'final'];
export const LFC_ONLY_STAGES = new Set(['group', 'r32', 'r16']);

export function requiredMatches(stageId, matches) {
  const inStage = matches.filter(m => m.stage === stageId);
  if (LFC_ONLY_STAGES.has(stageId)) return inStage.filter(involvesLiverpool);
  return inStage;
}
