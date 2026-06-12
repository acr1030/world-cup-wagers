import { useState } from 'react';
import { STAGES, LFC_ONLY_STAGES, LIVERPOOL_COUNTRIES, resolveBet, payoutFor } from '../data.js';

function isCounted(m) {
  if (!LFC_ONLY_STAGES.has(m.stage)) return true;
  return LIVERPOOL_COUNTRIES.has(m.home) || LIVERPOOL_COUNTRIES.has(m.away)
      || m.home === 'United States' || m.away === 'United States';
}

function computeStats(matches, payouts) {
  const byStage = Object.fromEntries(STAGES.map(s => [s.id, { alex:0, dad:0, push:0, pending:0 }]));
  let alexWins=0, dadWins=0, pushes=0, totalCounted=0;
  let alexDollars=0, dadDollars=0;

  for (const m of matches) {
    const r = resolveBet(m);
    if (!byStage[m.stage]) byStage[m.stage] = { alex:0, dad:0, push:0, pending:0 };
    byStage[m.stage][r.status] += 1;
    if (!isCounted(m)) continue;
    totalCounted++;
    const p = payoutFor(m, payouts);
    if (r.status === 'alex')     { alexWins++; alexDollars += p.alex; }
    else if (r.status === 'dad') { dadWins++;  dadDollars  += p.dad;  }
    else if (r.status === 'push') { pushes++; }
  }

  return { alexWins, dadWins, pushes, alexDollars, dadDollars,
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

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10.5 3.5l-.75 7a.5.5 0 01-.5.45H3.75a.5.5 0 01-.5-.45L2.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PaymentLog({ payments, onAdd, onDelete }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const n = parseFloat(input);
    if (!n || n <= 0) return;
    onAdd(n);
    setInput('');
  };

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ minWidth: 220, textAlign: 'left' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase',
                    color: 'rgba(41,38,27,.45)', marginBottom: 8 }}>
        Amount Paid to Date
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: payments.length ? 10 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto', width: 130,
                      border: '1px solid rgba(0,0,0,.15)', borderRadius: 8,
                      background: 'rgba(255,255,255,.7)', overflow: 'hidden', height: 32 }}>
          <span style={{ padding: '0 4px 0 10px', color: 'rgba(41,38,27,.5)', fontSize: 13 }}>$</span>
          <input
            type="number" min="0" step="1" value={input} placeholder="0"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ flex: 1, border: 0, background: 'transparent', outline: 'none',
                     fontSize: 13, color: '#29261b', padding: '0 8px 0 0',
                     MozAppearance: 'textfield', width: 0 }} />
        </div>
        <button
          type="button" onClick={handleAdd}
          style={{ height: 32, padding: '0 14px', borderRadius: 8, border: '1px solid rgba(0,0,0,.15)',
                   background: 'rgba(41,38,27,.06)', color: '#29261b', fontSize: 12,
                   fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          Log
        </button>
        {total > 0 && (
          <span style={{ fontSize: 12, color: 'rgba(41,38,27,.5)', flexShrink: 0 }}>
            Total: <b style={{ color: '#29261b' }}>${total.toLocaleString()}</b>
          </span>
        )}
      </div>
      {payments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {payments.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                   fontSize: 12, color: 'rgba(41,38,27,.65)' }}>
              <span>{new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>${p.amount.toLocaleString()}</span>
                <button
                  type="button" onClick={() => onDelete(i)}
                  title="Delete payment"
                  style={{ appearance: 'none', border: 0, background: 'transparent', padding: 2,
                           cursor: 'pointer', color: 'rgba(41,38,27,.35)', lineHeight: 1,
                           borderRadius: 4, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(41,38,27,.35)'}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({ matches, payouts, stagesOpen, onToggleStages, payments, onAddPayment, onDeletePayment }) {
  const s = computeStats(matches, payouts);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = s.net - totalPaid;
  const fmt = n => '$' + n.toLocaleString();
  const remSign = remaining > 0 ? '+' : remaining < 0 ? '−' : '';
  const remAbs = Math.abs(remaining);

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

        <div className="wcs__topright">
          <div className="wcs__net" aria-label="Alex's net payout">
            <div className="wcs__netlbl">Alex's payout</div>
            <div className={`wcs__netval ${remaining > 0 ? 'is-pos' : remaining < 0 ? 'is-neg' : ''}`}>
              <span className="wcs__netsign">{remSign}</span>
              <span className="wcs__netnum">${remAbs.toLocaleString()}</span>
            </div>
            <div className="wcs__netsub">
              {fmt(s.net)} won − {fmt(totalPaid)} paid
            </div>
          </div>
          <PaymentLog payments={payments} onAdd={onAddPayment} onDelete={onDeletePayment} />
        </div>
      </div>

      <div className="wcs__cards wcs__cards--2">
        <StatCard kind="alex" label="Alex"
          value={<><span className="wcs__big">{s.alexWins}</span><span className="wcs__small"> wins</span></>}
          sub={<>{fmt(s.alexDollars)} <span className="wcs__muted">· ${payouts.alex}/win</span></>} />
        <StatCard kind="dad" label="Dad"
          value={<><span className="wcs__big">{s.dadWins}</span><span className="wcs__small"> wins</span></>}
          sub={<>{fmt(s.dadDollars)} <span className="wcs__muted">· ${payouts.dad}/win</span></>} />
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
