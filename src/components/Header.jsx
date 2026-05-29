import { useState, useEffect } from 'react';
import { STAGES, LFC_ONLY_STAGES, LIVERPOOL_COUNTRIES, resolveBet, payoutFor } from '../data.js';
import { saveSetting } from '../lib/db.js';

function isCounted(m) {
  if (!LFC_ONLY_STAGES.has(m.stage)) return true;
  return LIVERPOOL_COUNTRIES.has(m.home) || LIVERPOOL_COUNTRIES.has(m.away);
}

function computeStats(matches, payouts) {
  const byStage = Object.fromEntries(STAGES.map(s => [s.id, { alex:0, dad:0, push:0, pending:0 }]));
  let alexWins=0, dadWins=0, pushes=0, settled=0, totalCounted=0;
  let alexDollars=0, dadDollars=0;

  for (const m of matches) {
    const r = resolveBet(m);
    if (!byStage[m.stage]) byStage[m.stage] = { alex:0, dad:0, push:0, pending:0 };
    byStage[m.stage][r.status] += 1;
    if (!isCounted(m)) continue;
    totalCounted++;
    const p = payoutFor(m, payouts);
    if (r.status === 'alex')    { alexWins++; alexDollars += p.alex; settled++; }
    else if (r.status === 'dad') { dadWins++;  dadDollars  += p.dad;  settled++; }
    else if (r.status === 'push') { pushes++; settled++; }
  }

  return { alexWins, dadWins, pushes, settled, alexDollars, dadDollars,
           net: alexDollars - dadDollars, byStage, total: totalCounted };
}

function StatCard({ kind, label, value, sub }) {
  return (
    <div className={`wcs__card wcs__card--${kind}`}>
      <div className="wcs__lbl">{label}</div>
      <div className="wcs__val">{value}</div>
      {sub && <div className="wcs__sub">{sub}</div>}
    </div>
  );
}

function StageBreakdown({ stats }) {
  return (
    <div className="wcs__stages">
      {STAGES.map(s => {
        const b = stats.byStage[s.id] || { alex:0, dad:0, push:0, pending:0 };
        const done = b.alex + b.dad + b.push;
        const total = done + b.pending;
        return (
          <div className="wcs__stage" key={s.id}>
            <div className="wcs__stagehd">
              <span className="wcs__stagename">{s.label}</span>
              <span className="wcs__stagecount">{done}/{total || 0}</span>
            </div>
            <div className="wcs__stagebar">
              {total > 0 ? (
                <>
                  <i className="wcs__seg wcs__seg--alex" style={{ flex: b.alex }} />
                  <i className="wcs__seg wcs__seg--dad" style={{ flex: b.dad }} />
                  <i className="wcs__seg wcs__seg--push" style={{ flex: b.push }} />
                  <i className="wcs__seg wcs__seg--pending" style={{ flex: b.pending }} />
                </>
              ) : <i className="wcs__seg wcs__seg--empty" style={{ flex: 1 }} />}
            </div>
            <div className="wcs__stagelegend">
              <span className="wcs__dot wcs__dot--alex" />{b.alex}
              <span className="wcs__dot wcs__dot--dad" />{b.dad}
              {b.push > 0 && <><span className="wcs__dot wcs__dot--push" />{b.push}</>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Header({ matches, payouts, stagesOpen, onToggleStages }) {
  const s = computeStats(matches, payouts);
  const fmt = n => '$' + n.toLocaleString();
  const netSign = s.net > 0 ? '+' : s.net < 0 ? '−' : '';
  const netAbs = Math.abs(s.net);

  return (
    <header className="wcs">
      <div className="wcs__top">
        <div className="wcs__brand">
          <div className="wcs__crest" aria-hidden="true">
            <img src="/soccer-ball.png" width="36" height="36" alt="" />
          </div>
          <div className="wcs__brandtxt">
            <div className="wcs__title">World Cup Wagers</div>
            <div className="wcs__subtitle">Alex vs. Dad · 2026</div>
          </div>
        </div>

        <div className="wcs__net" aria-label="Alex's net payout">
          <div className="wcs__netlbl">Alex's payout</div>
          <div className={`wcs__netval ${s.net > 0 ? 'is-pos' : s.net < 0 ? 'is-neg' : ''}`}>
            <span className="wcs__netsign">{netSign}</span>
            <span className="wcs__netnum">${netAbs.toLocaleString()}</span>
          </div>
          <div className="wcs__netsub">{fmt(s.alexDollars)} won − {fmt(s.dadDollars)} owed</div>
        </div>
      </div>

      <div className="wcs__cards wcs__cards--3">
        <StatCard kind="alex" label="Alex"
          value={<><span className="wcs__big">{s.alexWins}</span><span className="wcs__small"> wins</span></>}
          sub={<>{fmt(s.alexDollars)} <span className="wcs__muted">· ${payouts.alex}/win</span></>} />
        <StatCard kind="dad" label="Dad"
          value={<><span className="wcs__big">{s.dadWins}</span><span className="wcs__small"> wins</span></>}
          sub={<>{fmt(s.dadDollars)} <span className="wcs__muted">· ${payouts.dad}/win</span></>} />
        <StatCard kind="settled" label="Settled"
          value={<><span className="wcs__big">{s.settled}</span><span className="wcs__small">/{s.total}</span></>}
          sub={<>{s.total - s.settled} pending{s.pushes > 0 ? ` · ${s.pushes} push${s.pushes > 1 ? 'es' : ''}` : ''}</>} />
      </div>

      <div className="wcs__stagestoggle">
        <button type="button" className="wcs__toggle" aria-expanded={stagesOpen}
                onClick={onToggleStages}>
          <span className={`wcs__caret ${stagesOpen ? 'is-open' : ''}`} aria-hidden="true">▸</span>
          <span>{stagesOpen ? 'Hide' : 'Show'} stage results</span>
        </button>
      </div>

      {stagesOpen && <StageBreakdown stats={s} />}
    </header>
  );
}
