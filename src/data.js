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

const R32_PAIRINGS = [
  ['1A','2C'], ['1L','3rd ?'], ['1F','2E'], ['1H','2J'],
  ['1B','3rd ?'], ['1K','2I'], ['1G','3rd ?'], ['1E','2F'],
  ['1I','2K'], ['1D','2B'], ['1J','3rd ?'], ['1C','2A'],
  ['1A','3rd ?'], ['1L','2H'], ['1D','3rd ?'], ['1G','2L'],
];

const KO_DATES = {
  r32:   ['2026-06-28','2026-06-29','2026-06-30','2026-07-01','2026-07-02','2026-07-03'],
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
  R32_PAIRINGS.forEach((pair, i) => {
    out.push({ id: uid(), stage: 'r32', round: i+1, home: pair[0], away: pair[1], kickoff: pickDate('r32',i), line:'', pick:'over', homeScore:'', awayScore:'' });
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
  return LIVERPOOL_COUNTRIES.has(m.home) || LIVERPOOL_COUNTRIES.has(m.away);
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
