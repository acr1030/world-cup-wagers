import { resolveBet, payoutFor, involvesLiverpool } from '../data.js';

function fmtKick(s) {
  if (!s) return '—';
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return s; }
}

export default function MatchCard({ match, onChange, onDelete, payouts }) {
  const set = (k, v) => onChange({ ...match, [k]: v });
  const r = resolveBet(match);
  const dadPick = match.pick === 'over' ? 'under' : 'over';
  const p = payoutFor(match, payouts);
  const counted = involvesLiverpool(match);

  let chipLabel = 'Pending';
  let chipMod = 'wcm__chip--pending';
  if (r.status === 'push') { chipLabel = 'Push'; chipMod = 'wcm__chip--push'; }
  else if (r.status === 'alex') { chipLabel = counted ? `Alex +$${p.alex}` : 'Alex'; chipMod = 'wcm__chip--alex'; }
  else if (r.status === 'dad')  { chipLabel = counted ? `Dad +$${p.dad}`  : 'Dad';  chipMod = 'wcm__chip--dad'; }

  return (
    <div className={`wcm ${r.status === 'alex' ? 'wcm--alex' : r.status === 'dad' ? 'wcm--dad' : ''}`}>
      <div className="wcm__teams">
        <input className="wcm__team" value={match.home} onChange={e => set('home', e.target.value)} />
        <span className="wcm__vs">vs</span>
        <input className="wcm__team" value={match.away} onChange={e => set('away', e.target.value)} />
      </div>

      <input className="wcm__when" type="datetime-local" value={match.kickoff}
             onChange={e => set('kickoff', e.target.value)} />

      <div className="wcm__line">
        <span className="wcm__lbl">O/U</span>
        <input className="wcm__num" type="number" step="0.5" inputMode="decimal"
               placeholder="2.5" value={match.line} onChange={e => set('line', e.target.value)} />
      </div>

      <div className="wcm__pick" role="group" aria-label="Alex's pick">
        <button type="button" className={`wcm__pickbtn ${match.pick === 'over' ? 'is-on' : ''}`}
                onClick={() => set('pick', 'over')}>
          <span className="wcm__pickwho">Alex</span>
          <span className="wcm__pickdir">Over</span>
        </button>
        <button type="button" className={`wcm__pickbtn ${match.pick === 'under' ? 'is-on' : ''}`}
                onClick={() => set('pick', 'under')}>
          <span className="wcm__pickwho">Alex</span>
          <span className="wcm__pickdir">Under</span>
        </button>
      </div>
      <div className="wcm__dadpick" title={`Dad: ${dadPick}`}>Dad: {dadPick}</div>

      <div className="wcm__score">
        <input className="wcm__num" type="number" min="0" inputMode="numeric"
               placeholder="–" value={match.homeScore} onChange={e => set('homeScore', e.target.value)} />
        <span className="wcm__dash">–</span>
        <input className="wcm__num" type="number" min="0" inputMode="numeric"
               placeholder="–" value={match.awayScore} onChange={e => set('awayScore', e.target.value)} />
      </div>

      <div className={`wcm__chip ${chipMod}`}>
        {r.total != null && r.line != null && (
          <span className="wcm__total">
            {r.total} {r.total > r.line ? '▲' : r.total < r.line ? '▼' : '='} {r.line}
          </span>
        )}
        <span className="wcm__chiptext">{chipLabel}</span>
      </div>

      <button className="wcm__del" type="button" aria-label="Delete match" onClick={onDelete}>×</button>
    </div>
  );
}
