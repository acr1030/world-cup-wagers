import { useState } from 'react';
import MatchCard from './MatchCard.jsx';
import { involvesLiverpool, resolveBet, payoutFor, requiredMatches, FINAL_GROUP } from '../data.js';

function isReady(m) {
  return resolveBet(m).status !== 'pending';
}

function SettleButton({ label, required, isSettled, onSettle, payouts }) {
  const ready = required.length > 0 && required.every(isReady);
  let alexW=0, dadW=0, alex$=0, dad$=0;
  for (const m of required) {
    const r = resolveBet(m);
    const p = payoutFor(m, payouts);
    if (r.status === 'alex') { alexW++; alex$ += p.alex; }
    else if (r.status === 'dad') { dadW++; dad$ += p.dad; }
  }
  const net = alex$ - dad$;
  const remaining = required.filter(m => !isReady(m)).length;

  return (
    <div className={`wcg__settle ${isSettled ? 'is-settled' : ''}`}>
      <div className="wcg__settle-meta">
        {isSettled ? (
          <>
            <span className="wcg__settle-badge">✓ Settled</span>
            <span className="wcg__settle-sum">
              Alex {alexW} · Dad {dadW} · net {net >= 0 ? '+' : '−'}${Math.abs(net).toLocaleString()}
            </span>
          </>
        ) : ready ? (
          <span className="wcg__settle-sum">
            Ready: Alex {alexW} · Dad {dadW} · net {net >= 0 ? '+' : '−'}${Math.abs(net).toLocaleString()}
          </span>
        ) : (
          <span className="wcg__settle-sum wcg__settle-sum--warn">
            {required.length === 0
              ? 'No qualifying matches yet'
              : `${remaining} match${remaining !== 1 ? 'es' : ''} need O/U + score`}
          </span>
        )}
      </div>
      <button type="button" className="wcg__settle-btn"
              disabled={!ready || isSettled} onClick={onSettle}>
        {isSettled ? 'Round paid out' : label}
      </button>
    </div>
  );
}

export default function StageSection({ stage, matches, allMatches, onChange, onDelete, onAdd,
                                       collapsed, onToggleCollapse, settled, onSettle, payouts }) {
  const [filter, setFilter] = useState('lfc');
  const allList = matches.filter(m => m.stage === stage.id);
  const list = filter === 'lfc' ? allList.filter(involvesLiverpool) : allList;
  const lfcCount = allList.filter(involvesLiverpool).length;
  const isGroup = stage.id === 'group';
  const byGroup = isGroup
    ? list.reduce((acc, m) => { const k = m.group || '?'; (acc[k] = acc[k] || []).push(m); return acc; }, {})
    : null;

  return (
    <section className={`wcg ${collapsed ? 'is-collapsed' : ''}`} data-stage={stage.id}>
      <div className="wcg__hd">
        <div className="wcg__lhs">
          <button type="button" className="wcg__caret"
                  aria-label={collapsed ? 'Expand stage' : 'Collapse stage'}
                  aria-expanded={!collapsed}
                  onClick={() => onToggleCollapse(stage.id)}>
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="wcg__short">{stage.short}</span>
          <h2 className="wcg__title" onClick={() => onToggleCollapse(stage.id)} style={{ cursor: 'pointer' }}>{stage.label}</h2>
          <span className="wcg__count">{list.length} match{list.length !== 1 ? 'es' : ''}</span>
        </div>
        <div className="wcg__rhs">
          <div className="wcg__filter" role="group" aria-label="Filter matches">
            <button type="button" className={`wcg__filterbtn ${filter === 'all' ? 'is-on' : ''}`}
                    onClick={() => setFilter('all')}>
              All <span className="wcg__filtercount">{allList.length}</span>
            </button>
            <button type="button" className={`wcg__filterbtn ${filter === 'lfc' ? 'is-on' : ''}`}
                    onClick={() => setFilter('lfc')}>
              Liverpool <span className="wcg__filtercount">{lfcCount}</span>
            </button>
          </div>
          <button type="button" className="wcg__add" onClick={() => onAdd(stage.id)}>
            + Add match
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {list.length === 0 ? (
            <div className="wcg__empty">
              {filter === 'lfc' ? 'No matches with Liverpool-connected teams in this stage.' : 'No matches yet.'}
            </div>
          ) : isGroup ? (
            <div className="wcg__groups">
              {Object.keys(byGroup).sort().map(g => (
                <div className="wcg__grp" key={g}>
                  <div className="wcg__grphd">Group {g}</div>
                  <div className="wcg__list">
                    {byGroup[g].map(m => (
                      <MatchCard key={m.id} match={m} payouts={payouts}
                                 onChange={onChange} onDelete={() => onDelete(m.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="wcg__list">
              {list.map(m => (
                <MatchCard key={m.id} match={m} payouts={payouts}
                           onChange={onChange} onDelete={() => onDelete(m.id)} />
              ))}
            </div>
          )}

          {(stage.id === 'group' || stage.id === 'r32' || stage.id === 'r16') && (
            <SettleButton
              label="Settle Round"
              required={requiredMatches(stage.id, allMatches)}
              isSettled={!!settled[stage.id]}
              onSettle={() => onSettle(stage.id)}
              payouts={payouts} />
          )}

          {stage.id === 'final' && (() => {
            const req = FINAL_GROUP.flatMap(sid => requiredMatches(sid, allMatches));
            const isSet = FINAL_GROUP.every(sid => settled[sid]);
            return (
              <SettleButton
                label="Settle Up — Final Payout"
                required={req}
                isSettled={isSet}
                onSettle={() => onSettle('final-group')}
                payouts={payouts} />
            );
          })()}
        </>
      )}
    </section>
  );
}
