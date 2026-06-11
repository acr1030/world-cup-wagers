import { useState } from 'react';
import MatchCard from './MatchCard.jsx';
import { involvesLiverpool } from '../data.js';

export default function StageSection({ stage, matches, allMatches, onChange, onDelete, onAdd,
                                       collapsed, onToggleCollapse, payouts }) {
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

        </>
      )}
    </section>
  );
}
