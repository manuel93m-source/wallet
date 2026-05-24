import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, ArrowRight, Check, ChevronRight, Database, Eye, GitBranch,
  Hash, Layers, Lock, Network, Radio, ShieldCheck, Terminal, Zap,
  AlertTriangle, FileText, Settings2, Wallet, Repeat, Box, X, ChevronDown
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   CORE WALLET & FX — INTERACTIVE ARCHITECTURE EXPLORER
   Aesthetic: industrial terminal × editorial fintech
   ───────────────────────────────────────────────────────────── */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
`;

/* fake deterministic hash for demo visuals */
const fakeHash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const a = (Math.abs(h) >>> 0).toString(16).padStart(8, '0');
  const b = (Math.abs(h * 31) >>> 0).toString(16).padStart(8, '0');
  const c = (Math.abs(h * 17 + 7) >>> 0).toString(16).padStart(8, '0');
  const d = (Math.abs(h * 41 + 13) >>> 0).toString(16).padStart(8, '0');
  return (a + b + c + d).slice(0, 32);
};

const truncHash = (h, n = 6) => `${h.slice(0, n)}…${h.slice(-4)}`;

const fmt = (n, ccy) => {
  const opts = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${Number(n).toLocaleString('en-US', opts)} ${ccy}`;
};

const fmtNum = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const RATES = {
  'USD/USDT': 1.0000,
  'USD/USDC': 1.0000,
  'USD/COP': 4150.00,
  'USDT/USDC': 1.0000,
  'USDT/COP': 4148.50,
};

const TIER_FEE = { B2B: 0.015, B2C: 0.025, INTERNAL: 0.000 };
const TIER_SPREAD_BPS = { B2B: 15, B2C: 35, INTERNAL: 0 };

/* ─────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
   ───────────────────────────────────────────────────────────── */

const SectionMarker = ({ num, label, sub }) => (
  <div className="flex items-baseline gap-4 mb-10">
    <span className="font-mono text-xs text-stone-500 tracking-widest">{num}</span>
    <div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif" }} className="text-4xl text-stone-100 italic leading-none">
        {label}
      </h2>
      {sub && <div className="font-mono text-xs text-stone-500 mt-2 tracking-wide uppercase">{sub}</div>}
    </div>
  </div>
);

const Tag = ({ children, kind = 'neutral' }) => {
  const kinds = {
    debit: 'bg-orange-400/10 text-orange-300 border-orange-400/30',
    credit: 'bg-lime-300/10 text-lime-300 border-lime-300/30',
    system: 'bg-sky-300/10 text-sky-300 border-sky-300/30',
    wallet: 'bg-violet-300/10 text-violet-300 border-violet-300/30',
    success: 'bg-lime-300/10 text-lime-300 border-lime-300/30',
    pending: 'bg-amber-300/10 text-amber-300 border-amber-300/30',
    failed: 'bg-red-400/10 text-red-300 border-red-400/30',
    neutral: 'bg-stone-700/30 text-stone-400 border-stone-600/40',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium border rounded-sm tracking-wider ${kinds[kind]}`}>
      {children}
    </span>
  );
};

const Panel = ({ children, className = '', label }) => (
  <div className={`relative border border-stone-800 bg-stone-950/40 ${className}`}>
    {label && (
      <div className="absolute -top-2 left-4 px-2 bg-[#0a0a09] font-mono text-[10px] tracking-widest text-stone-500 uppercase">
        {label}
      </div>
    )}
    {children}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   00 — ARCHITECTURE OVERVIEW (Hero)
   ───────────────────────────────────────────────────────────── */

const Overview = () => (
  <section id="overview" className="min-h-screen flex flex-col justify-center py-24 px-12 lg:px-24 border-b border-stone-900">
    <div className="max-w-6xl">
      <div className="font-mono text-xs text-stone-500 tracking-widest mb-8">
        ANTHROPIC × MANUEL ▸ ARCHITECTURE EXPLORER ▸ v1.0
      </div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif" }} className="text-6xl lg:text-8xl text-stone-100 leading-[0.95] mb-8">
        Core Wallet<br />
        <span className="italic text-stone-400">&</span> FX Engine
      </h1>
      <p className="font-mono text-sm text-stone-400 max-w-2xl leading-relaxed mb-12">
        Atomic double-entry ledger, multi-currency wallets, on-chain ingress with TRC-20 sweeping,
        admin console with auditable hash-chain, and a transaction state machine immune to double-spend.
        <span className="text-stone-200"> Click through each module to see it run.</span>
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-stone-800 border border-stone-800 mb-16">
        {[
          { k: 'LEDGER', v: 'append-only', sub: 'double-entry' },
          { k: 'CURRENCIES', v: '5+', sub: 'fiat & crypto' },
          { k: 'NETWORKS', v: 'TRC20 · ERC20 · BTC', sub: 'extensible' },
          { k: 'SETTLEMENT', v: '<1s', sub: 'internal transfers' },
        ].map((s, i) => (
          <div key={i} className="bg-[#0a0a09] p-6">
            <div className="font-mono text-[10px] text-stone-500 tracking-widest mb-2">{s.k}</div>
            <div style={{ fontFamily: "'Instrument Serif', serif" }} className="text-3xl text-stone-100 italic">{s.v}</div>
            <div className="font-mono text-[10px] text-stone-500 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <ArchitectureDiagram />
    </div>
  </section>
);

const ArchitectureDiagram = () => (
  <Panel label="System Topology" className="p-10">
    <svg viewBox="0 0 900 380" className="w-full h-auto">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#57534e" />
        </marker>
      </defs>

      {/* Layers */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#a8a29e">
        {/* Edge */}
        <rect x="20" y="20" width="860" height="60" fill="none" stroke="#292524" strokeDasharray="2,3" />
        <text x="30" y="36" fill="#78716c" fontSize="9">EDGE / RAILS</text>
        <g>
          <rect x="50" y="42" width="140" height="28" fill="#0c0a09" stroke="#44403c" />
          <text x="60" y="59">Bank ACH / Wire</text>
          <rect x="210" y="42" width="140" height="28" fill="#0c0a09" stroke="#44403c" />
          <text x="220" y="59">TRC-20 Watcher</text>
          <rect x="370" y="42" width="140" height="28" fill="#0c0a09" stroke="#44403c" />
          <text x="380" y="59">ERC-20 Watcher</text>
          <rect x="530" y="42" width="140" height="28" fill="#0c0a09" stroke="#44403c" />
          <text x="540" y="59">Public API</text>
          <rect x="690" y="42" width="170" height="28" fill="#0c0a09" stroke="#44403c" />
          <text x="700" y="59">Admin Console</text>
        </g>

        {/* Core */}
        <rect x="20" y="110" width="860" height="140" fill="none" stroke="#3f3f46" />
        <text x="30" y="128" fill="#78716c" fontSize="9">CORE SERVICES</text>
        <g>
          <rect x="50" y="140" width="160" height="90" fill="#0c0a09" stroke="#bef264" strokeWidth="0.5" />
          <text x="60" y="158" fill="#bef264" fontSize="11" fontWeight="600">Ledger Engine</text>
          <text x="60" y="178" fill="#a8a29e">double-entry</text>
          <text x="60" y="194" fill="#a8a29e">hash-chained</text>
          <text x="60" y="210" fill="#a8a29e">ACID + serializable</text>

          <rect x="230" y="140" width="160" height="90" fill="#0c0a09" stroke="#fb923c" strokeWidth="0.5" />
          <text x="240" y="158" fill="#fb923c" fontSize="11" fontWeight="600">FX Engine</text>
          <text x="240" y="178" fill="#a8a29e">quote_lock TTL</text>
          <text x="240" y="194" fill="#a8a29e">mid + spread</text>
          <text x="240" y="210" fill="#a8a29e">atomic swap</text>

          <rect x="410" y="140" width="160" height="90" fill="#0c0a09" stroke="#7dd3fc" strokeWidth="0.5" />
          <text x="420" y="158" fill="#7dd3fc" fontSize="11" fontWeight="600">Wallet Service</text>
          <text x="420" y="178" fill="#a8a29e">multi-currency</text>
          <text x="420" y="194" fill="#a8a29e">HD addresses</text>
          <text x="420" y="210" fill="#a8a29e">pessimistic lock</text>

          <rect x="590" y="140" width="160" height="90" fill="#0c0a09" stroke="#c4b5fd" strokeWidth="0.5" />
          <text x="600" y="158" fill="#c4b5fd" fontSize="11" fontWeight="600">Risk / AML</text>
          <text x="600" y="178" fill="#a8a29e">sanctions</text>
          <text x="600" y="194" fill="#a8a29e">velocity</text>
          <text x="600" y="210" fill="#a8a29e">chain analytics</text>

          <rect x="770" y="140" width="90" height="90" fill="#0c0a09" stroke="#44403c" />
          <text x="780" y="158" fill="#a8a29e" fontSize="11" fontWeight="600">Sweeper</text>
          <text x="780" y="178" fill="#a8a29e">gas mgmt</text>
          <text x="780" y="194" fill="#a8a29e">consolida-</text>
          <text x="780" y="210" fill="#a8a29e">tion</text>
        </g>

        {/* Data */}
        <rect x="20" y="280" width="860" height="80" fill="none" stroke="#292524" strokeDasharray="2,3" />
        <text x="30" y="298" fill="#78716c" fontSize="9">PERSISTENCE</text>
        <g>
          <rect x="50" y="310" width="200" height="36" fill="#0c0a09" stroke="#44403c" />
          <text x="60" y="332">Postgres · ledger (append-only)</text>
          <rect x="270" y="310" width="200" height="36" fill="#0c0a09" stroke="#44403c" />
          <text x="280" y="332">Redis · locks · quote_locks</text>
          <rect x="490" y="310" width="200" height="36" fill="#0c0a09" stroke="#44403c" />
          <text x="500" y="332">Kafka · event bus</text>
          <rect x="710" y="310" width="150" height="36" fill="#0c0a09" stroke="#44403c" />
          <text x="720" y="332">HSM · keys</text>
        </g>

        {/* Connectors */}
        <line x1="120" y1="70" x2="120" y2="140" stroke="#57534e" markerEnd="url(#arrow)" />
        <line x1="280" y1="70" x2="280" y2="140" stroke="#57534e" markerEnd="url(#arrow)" />
        <line x1="440" y1="70" x2="440" y2="140" stroke="#57534e" markerEnd="url(#arrow)" />
        <line x1="600" y1="70" x2="600" y2="140" stroke="#57534e" markerEnd="url(#arrow)" />
        <line x1="775" y1="70" x2="600" y2="140" stroke="#57534e" markerEnd="url(#arrow)" />

        <line x1="130" y1="230" x2="130" y2="310" stroke="#57534e" markerEnd="url(#arrow)" />
        <line x1="350" y1="230" x2="350" y2="310" stroke="#57534e" markerEnd="url(#arrow)" />
        <line x1="570" y1="230" x2="570" y2="310" stroke="#57534e" markerEnd="url(#arrow)" />
        <line x1="780" y1="230" x2="780" y2="310" stroke="#57534e" markerEnd="url(#arrow)" />
      </g>
    </svg>
  </Panel>
);

/* ─────────────────────────────────────────────────────────────
   01 — LEDGER ENGINE (Interactive FX Swap)
   ───────────────────────────────────────────────────────────── */

const LedgerEngine = () => {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('USDT');
  const [tier, setTier] = useState('B2B');
  const [entries, setEntries] = useState([]);
  const [running, setRunning] = useState(false);
  const [txId, setTxId] = useState(null);
  const seqRef = useRef(10000);
  const prevHashRef = useRef('genesis000000000000000000000000000');

  const pairKey = `${from}/${to}`;
  const rate = RATES[pairKey] || (1 / (RATES[`${to}/${from}`] || 1));
  const feePct = TIER_FEE[tier];
  const spreadBps = TIER_SPREAD_BPS[tier];

  const amtNum = parseFloat(amount) || 0;
  const feeAmt = +(amtNum * feePct).toFixed(2);
  const netInput = +(amtNum - feeAmt).toFixed(2);
  const appliedRate = rate * (1 - spreadBps / 10000);
  const netOutput = +(netInput * appliedRate).toFixed(2);

  const executeSwap = async () => {
    if (running || amtNum <= 0) return;
    setRunning(true);
    setEntries([]);

    const newTxId = `txn_${Date.now().toString(36).toUpperCase()}`;
    setTxId(newTxId);

    const legs = [
      { account: `WLT_user42_${from}`, kind: 'WALLET', sub: 'Liability', dr: amtNum, cr: 0, ccy: from },
      { account: `SYS_FX_BOOK_${from}`, kind: 'SYSTEM', sub: 'Asset', dr: 0, cr: netInput, ccy: from },
      { account: `SYS_FEE_INCOME_${from}`, kind: 'SYSTEM', sub: 'Revenue', dr: 0, cr: feeAmt, ccy: from },
      { account: `SYS_FX_BOOK_${to}`, kind: 'SYSTEM', sub: 'Asset', dr: netOutput, cr: 0, ccy: to },
      { account: `WLT_user42_${to}`, kind: 'WALLET', sub: 'Liability', dr: 0, cr: netOutput, ccy: to },
    ];

    for (let i = 0; i < legs.length; i++) {
      await new Promise((r) => setTimeout(r, 280));
      setEntries((prev) => {
        const seq = ++seqRef.current;
        const prevH = prev.length ? prev[prev.length - 1].hash : prevHashRef.current;
        const payload = `${seq}|${newTxId}|${legs[i].account}|${legs[i].dr}|${legs[i].cr}|${prevH}`;
        const hash = fakeHash(payload);
        return [...prev, { ...legs[i], seq, hash, prevHash: prevH, ts: new Date().toISOString() }];
      });
    }

    await new Promise((r) => setTimeout(r, 280));
    prevHashRef.current = `${seqRef.current}-final`;
    setRunning(false);
  };

  // Balance verification by currency
  const balanceCheck = entries.reduce((acc, e) => {
    if (!acc[e.ccy]) acc[e.ccy] = { dr: 0, cr: 0 };
    acc[e.ccy].dr += e.dr;
    acc[e.ccy].cr += e.cr;
    return acc;
  }, {});

  return (
    <section id="ledger" className="py-24 px-12 lg:px-24 border-b border-stone-900">
      <SectionMarker num="01" label="Ledger Engine" sub="Atomic double-entry · hash-chained · append-only" />

      <div className="grid lg:grid-cols-[380px_1fr] gap-8">
        {/* CONTROLS */}
        <Panel label="FX Swap Builder" className="p-6 h-fit">
          <div className="space-y-5">
            <Field label="Amount">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 px-3 py-2.5 font-mono text-lg text-stone-100 focus:outline-none focus:border-lime-400/50"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="From">
                <Select value={from} onChange={setFrom} options={['USD', 'COP', 'USDT', 'USDC']} />
              </Field>
              <Field label="To">
                <Select value={to} onChange={setTo} options={['USDT', 'USDC', 'USD', 'COP'].filter((c) => c !== from)} />
              </Field>
            </div>

            <Field label="User Tier">
              <div className="grid grid-cols-3 gap-1">
                {['B2B', 'B2C', 'INTERNAL'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`px-2 py-2 font-mono text-xs border transition-colors ${
                      tier === t
                        ? 'border-lime-400/60 bg-lime-400/10 text-lime-300'
                        : 'border-stone-800 text-stone-500 hover:border-stone-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <div className="border-t border-stone-800 pt-4 space-y-2 font-mono text-xs">
              <Row k="mid_rate" v={rate.toFixed(4)} />
              <Row k="spread_bps" v={spreadBps} />
              <Row k="applied_rate" v={appliedRate.toFixed(4)} />
              <Row k="fee" v={`${(feePct * 100).toFixed(2)}% · ${fmtNum(feeAmt)} ${from}`} accent="orange" />
              <Row k="net_output" v={`${fmtNum(netOutput)} ${to}`} accent="lime" />
            </div>

            <button
              onClick={executeSwap}
              disabled={running}
              className="w-full py-3 bg-lime-300 text-stone-950 font-mono text-xs tracking-widest uppercase font-semibold hover:bg-lime-200 disabled:bg-stone-700 disabled:text-stone-500 transition-colors flex items-center justify-center gap-2"
            >
              {running ? (
                <>
                  <Activity size={14} className="animate-pulse" /> Settling…
                </>
              ) : (
                <>
                  <Zap size={14} /> Execute Atomic Swap
                </>
              )}
            </button>
          </div>
        </Panel>

        {/* LEDGER */}
        <div className="space-y-6">
          <Panel label="ledger_entries (append-only)" className="overflow-hidden">
            <div className="px-6 py-3 border-b border-stone-800 flex items-center justify-between font-mono text-[10px] tracking-widest text-stone-500 uppercase">
              <span>{txId ? `tx ▸ ${txId}` : 'no transaction yet'}</span>
              <span>{entries.length} / 5 legs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead className="text-stone-500 text-[10px] tracking-widest uppercase">
                  <tr className="border-b border-stone-800">
                    <th className="text-left px-4 py-3 font-normal">seq</th>
                    <th className="text-left px-4 py-3 font-normal">account</th>
                    <th className="text-left px-4 py-3 font-normal">kind</th>
                    <th className="text-right px-4 py-3 font-normal">debit</th>
                    <th className="text-right px-4 py-3 font-normal">credit</th>
                    <th className="text-left px-4 py-3 font-normal">ccy</th>
                    <th className="text-left px-4 py-3 font-normal">hash ← prev</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-stone-600 py-12 italic">
                        Awaiting transaction. Configure parameters and execute.
                      </td>
                    </tr>
                  )}
                  {entries.map((e, i) => (
                    <tr key={e.seq} className="border-b border-stone-900 hover:bg-stone-950/60 entry-row" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="px-4 py-3 text-stone-500">{e.seq}</td>
                      <td className="px-4 py-3 text-stone-200">{e.account}</td>
                      <td className="px-4 py-3">
                        <Tag kind={e.kind === 'WALLET' ? 'wallet' : 'system'}>{e.sub}</Tag>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {e.dr > 0 ? <span className="text-orange-300">{fmtNum(e.dr)}</span> : <span className="text-stone-700">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {e.cr > 0 ? <span className="text-lime-300">{fmtNum(e.cr)}</span> : <span className="text-stone-700">—</span>}
                      </td>
                      <td className="px-4 py-3 text-stone-500">{e.ccy}</td>
                      <td className="px-4 py-3 text-stone-500 text-[10px]">
                        <span className="text-stone-400">{truncHash(e.hash)}</span>
                        <span className="text-stone-700"> ← {truncHash(e.prevHash)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* BALANCE CHECK */}
          {Object.keys(balanceCheck).length > 0 && (
            <Panel label="Balance Invariant Check" className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(balanceCheck).map(([ccy, b]) => {
                  const balanced = Math.abs(b.dr - b.cr) < 0.001;
                  return (
                    <div key={ccy} className={`p-4 border ${balanced ? 'border-lime-400/30 bg-lime-300/5' : 'border-amber-400/30 bg-amber-300/5'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-stone-300">{ccy} leg</span>
                        {balanced ? (
                          <span className="flex items-center gap-1 text-lime-300 font-mono text-[10px]">
                            <Check size={12} /> BALANCED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-300 font-mono text-[10px]">
                            <AlertTriangle size={12} /> SETTLING
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs text-stone-500">
                        <span className="text-orange-300">DR {fmtNum(b.dr)}</span>
                        <span className="mx-2 text-stone-700">=</span>
                        <span className="text-lime-300">CR {fmtNum(b.cr)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-stone-800 font-mono text-[10px] text-stone-500">
                <span className="text-stone-400">CHECK_TRIGGER:</span> SUM(debit) = SUM(credit) per currency, per transaction_id ▸ enforced at COMMIT
              </div>
            </Panel>
          )}
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block font-mono text-[10px] text-stone-500 tracking-widest uppercase mb-2">{label}</label>
    {children}
  </div>
);

const Row = ({ k, v, accent }) => (
  <div className="flex justify-between items-baseline">
    <span className="text-stone-500">{k}</span>
    <span className={accent === 'orange' ? 'text-orange-300' : accent === 'lime' ? 'text-lime-300' : 'text-stone-200'}>{v}</span>
  </div>
);

const Select = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-stone-950 border border-stone-800 px-3 py-2.5 font-mono text-sm text-stone-100 focus:outline-none focus:border-lime-400/50 pr-8"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   02 — CRYPTO DEPOSIT PIPELINE
   ───────────────────────────────────────────────────────────── */

const DEPOSIT_STEPS = [
  { id: 1, label: 'Transaction broadcasted', sub: 'mempool', detail: 'to: TRfX...c9Y7 · amount: 500 USDT · contract: TR7NHq...gjLj6t' },
  { id: 2, label: 'Confirmations', sub: 'TRON network', detail: 'block 64,829,011 · 27/27 confirmations · finality reached' },
  { id: 3, label: 'chain-watcher event', sub: 'Kafka publish', detail: 'topic: onchain.tron.transfer · partition: 4' },
  { id: 4, label: 'Idempotency check', sub: 'unique key', detail: "WHERE idempotency_key = 'CHAIN:TRX:0x8af2...c1:log0' ▸ MISS" },
  { id: 5, label: 'AML / sanctions screen', sub: 'Chainalysis', detail: 'from_address risk_score: 0.04 ▸ PASS' },
  { id: 6, label: 'Ledger commit', sub: 'serializable txn', detail: 'DR SYS_HOT_WALLET_USDT · CR WLT_user42_USDT · 500.00' },
  { id: 7, label: 'User notified', sub: 'fan-out', detail: 'websocket · push · email · balance refreshed' },
];

const CryptoDeposit = () => {
  const [activeStep, setActiveStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const simulate = async () => {
    if (running) return;
    setRunning(true);
    setActiveStep(-1);
    setCompleted(false);
    for (let i = 0; i < DEPOSIT_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 650));
      setActiveStep(i);
    }
    await new Promise((r) => setTimeout(r, 400));
    setCompleted(true);
    setRunning(false);
  };

  return (
    <section id="deposit" className="py-24 px-12 lg:px-24 border-b border-stone-900">
      <SectionMarker num="02" label="Crypto Deposit Pipeline" sub="TRC-20 USDT · webhook · idempotent · AML-gated" />

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <Panel label="Pipeline Stages" className="overflow-hidden">
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="font-mono text-xs">
              <span className="text-stone-500">user</span>
              <span className="text-stone-300 ml-2">user_42</span>
              <span className="mx-3 text-stone-700">▸</span>
              <span className="text-stone-500">address</span>
              <span className="text-stone-300 ml-2">TRfX2vKpM9aLqBnRsHzYwCxJ8oUePc9Y7</span>
            </div>
            <button
              onClick={simulate}
              disabled={running}
              className="px-4 py-2 bg-stone-100 text-stone-950 font-mono text-[10px] tracking-widest uppercase font-semibold hover:bg-white disabled:bg-stone-700 disabled:text-stone-500 transition-colors flex items-center gap-2"
            >
              {running ? (
                <>
                  <Radio size={12} className="animate-pulse" /> Processing
                </>
              ) : (
                <>
                  <Network size={12} /> Simulate 500 USDT deposit
                </>
              )}
            </button>
          </div>

          <div className="relative">
            {DEPOSIT_STEPS.map((s, i) => {
              const state = i < activeStep ? 'done' : i === activeStep ? 'active' : 'idle';
              return (
                <div
                  key={s.id}
                  className={`flex gap-5 px-6 py-5 border-b border-stone-900 transition-all ${
                    state === 'active' ? 'bg-lime-300/5' : ''
                  } ${state === 'idle' ? 'opacity-30' : 'opacity-100'}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-[10px] transition-colors ${
                        state === 'done'
                          ? 'border-lime-300 bg-lime-300 text-stone-950'
                          : state === 'active'
                          ? 'border-lime-300 text-lime-300 animate-pulse'
                          : 'border-stone-800 text-stone-600'
                      }`}
                    >
                      {state === 'done' ? <Check size={14} /> : s.id.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <h4 className="font-mono text-sm text-stone-100">{s.label}</h4>
                      <span className="font-mono text-[10px] text-stone-500 tracking-widest uppercase">{s.sub}</span>
                    </div>
                    <div className="font-mono text-xs text-stone-500">{s.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {completed && (
            <div className="p-6 bg-lime-300/5 border-t border-lime-300/30 font-mono text-xs entry-row">
              <div className="flex items-center gap-2 text-lime-300 mb-2">
                <Check size={14} /> SETTLED
              </div>
              <div className="text-stone-400">
                Balance updated · user_42 USDT wallet: 1,150.00 → <span className="text-stone-100">1,650.00</span>
              </div>
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel label="Confirmation Threshold Policy" className="p-5">
            <div className="font-mono text-xs space-y-3">
              <ThresholdRow range="< 1,000 USDT" conf="19 conf" risk="standard" />
              <ThresholdRow range="1k – 10k USDT" conf="27 conf" risk="full irreversibility" />
              <ThresholdRow range="> 10,000 USDT" conf="27 conf + manual" risk="risk review" />
            </div>
          </Panel>

          <Panel label="Sweeping Job (deferred)" className="p-5">
            <div className="font-mono text-xs space-y-3 text-stone-400">
              <div>
                <span className="text-stone-500">trigger:</span> balance &gt; 100 USDT OR age &gt; 3d
              </div>
              <div>
                <span className="text-stone-500">flow:</span> gas_station.TRX → user_address → sweep USDT → HOT_WALLET
              </div>
              <div className="pt-3 border-t border-stone-800">
                <span className="text-stone-500">ledger impact:</span>
                <div className="mt-2 text-[11px] leading-relaxed">
                  <div>DR <span className="text-orange-300">SYS_GAS_EXPENSE_TRX</span></div>
                  <div>CR <span className="text-lime-300">SYS_GAS_STATION_TRX</span></div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel label="Reconciliation" className="p-5">
            <div className="font-mono text-xs text-stone-400 leading-relaxed">
              Nightly job compares <span className="text-stone-200">SUM(ledger)</span> of HOT_WALLET against on-chain
              <span className="text-stone-200"> getBalance()</span> via RPC. Any delta ▸ Ops ticket.
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
};

const ThresholdRow = ({ range, conf, risk }) => (
  <div className="flex items-baseline justify-between border-b border-stone-900 pb-2 last:border-0">
    <span className="text-stone-300">{range}</span>
    <div className="text-right">
      <div className="text-lime-300">{conf}</div>
      <div className="text-stone-500 text-[10px]">{risk}</div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   03 — ADMIN CONSOLE
   ───────────────────────────────────────────────────────────── */

const INITIAL_FEES = [
  { id: 'fr_001', op: 'FX_SWAP', from: 'USD', to: '*', tier: 'B2B', type: 'PERCENTAGE', val: 1.50, spread: 15 },
  { id: 'fr_002', op: 'FX_SWAP', from: 'USD', to: '*', tier: 'B2C', type: 'PERCENTAGE', val: 2.50, spread: 35 },
  { id: 'fr_003', op: 'WITHDRAWAL', from: 'USDT', to: null, tier: 'B2B', type: 'FIXED', val: 1.50, spread: 0 },
  { id: 'fr_004', op: 'WITHDRAWAL', from: 'USDT', to: null, tier: 'B2C', type: 'FIXED', val: 2.50, spread: 0 },
  { id: 'fr_005', op: 'P2P', from: '*', to: null, tier: '*', type: 'PERCENTAGE', val: 0.00, spread: 0 },
  { id: 'fr_006', op: 'DEPOSIT', from: 'USD', to: null, tier: 'B2C', type: 'PERCENTAGE', val: 0.50, spread: 0 },
];

const INITIAL_LOG = [
  { id: 'ADM-2410', admin: 'adm_carolina_v', action: 'MANUAL_CREDIT', reason: 'ONCHAIN_DEPOSIT_LOST_BLOCK_REORG', target: 'user_88', amt: '500.00 USDC', hash: fakeHash('adm-2410-init'), ts: '2026-05-23T14:22:08Z' },
  { id: 'ADM-2409', admin: 'adm_carolina_v', action: 'FEE_OVERRIDE', reason: 'PROMOTIONAL_TIER_UPGRADE', target: 'user_142', amt: '— · fee waived', hash: fakeHash('adm-2409-init'), ts: '2026-05-23T13:11:44Z' },
  { id: 'ADM-2408', admin: 'adm_diego_r', action: 'FREEZE', reason: 'AML_INVESTIGATION', target: 'user_67', amt: '— · all wallets', hash: fakeHash('adm-2408-init'), ts: '2026-05-23T11:08:02Z' },
];

const AdminConsole = () => {
  const [fees] = useState(INITIAL_FEES);
  const [log, setLog] = useState(INITIAL_LOG);
  const [adjUser, setAdjUser] = useState('user_88');
  const [adjAmt, setAdjAmt] = useState('500');
  const [adjCcy, setAdjCcy] = useState('USDC');
  const [adjReason, setAdjReason] = useState('ONCHAIN_DEPOSIT_LOST_BLOCK_REORG');
  const [posting, setPosting] = useState(false);

  const submitAdjustment = async () => {
    if (posting) return;
    setPosting(true);
    await new Promise((r) => setTimeout(r, 600));
    const newId = `ADM-${(2410 + log.length).toString()}`;
    const prevHash = log[0]?.hash || 'genesis';
    const hash = fakeHash(`${newId}|${adjUser}|${adjAmt}|${adjCcy}|${prevHash}`);
    setLog((prev) => [
      {
        id: newId,
        admin: 'adm_you',
        action: 'MANUAL_CREDIT',
        reason: adjReason,
        target: adjUser,
        amt: `${fmtNum(parseFloat(adjAmt))} ${adjCcy}`,
        hash,
        prevHash,
        ts: new Date().toISOString(),
        fresh: true,
      },
      ...prev,
    ]);
    setPosting(false);
  };

  return (
    <section id="admin" className="py-24 px-12 lg:px-24 border-b border-stone-900">
      <SectionMarker num="03" label="Admin Console" sub="Fee rules · manual adjustments · immutable hash chain" />

      <div className="space-y-8">
        {/* FEE RULES */}
        <Panel label="fee_rules · active policy" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead className="text-stone-500 text-[10px] tracking-widest uppercase">
                <tr className="border-b border-stone-800">
                  <th className="text-left px-5 py-3 font-normal">rule_id</th>
                  <th className="text-left px-5 py-3 font-normal">operation</th>
                  <th className="text-left px-5 py-3 font-normal">currency</th>
                  <th className="text-left px-5 py-3 font-normal">tier</th>
                  <th className="text-left px-5 py-3 font-normal">type</th>
                  <th className="text-right px-5 py-3 font-normal">value</th>
                  <th className="text-right px-5 py-3 font-normal">spread_bps</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id} className="border-b border-stone-900 hover:bg-stone-950/60">
                    <td className="px-5 py-3 text-stone-500">{f.id}</td>
                    <td className="px-5 py-3">
                      <Tag kind={f.op === 'FX_SWAP' ? 'system' : f.op === 'WITHDRAWAL' ? 'pending' : 'neutral'}>{f.op}</Tag>
                    </td>
                    <td className="px-5 py-3 text-stone-200">
                      {f.from} {f.to ? <span className="text-stone-600">→ {f.to}</span> : ''}
                    </td>
                    <td className="px-5 py-3 text-stone-300">{f.tier}</td>
                    <td className="px-5 py-3 text-stone-400">{f.type}</td>
                    <td className="px-5 py-3 text-right text-stone-100 tabular-nums">
                      {f.type === 'PERCENTAGE' ? `${f.val.toFixed(2)}%` : `${f.val.toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3 text-right text-stone-400 tabular-nums">{f.spread}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-stone-800 font-mono text-[10px] text-stone-500">
            <span className="text-stone-400">RESOLUTION_ORDER:</span> exact_match ▸ wildcard ▸ tier_default · highest priority wins
          </div>
        </Panel>

        {/* MANUAL ADJUSTMENT + AUDIT LOG */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          <Panel label="Manual Adjustment" className="p-6 h-fit">
            <div className="space-y-4">
              <Field label="Target user_id">
                <input
                  value={adjUser}
                  onChange={(e) => setAdjUser(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-2.5 font-mono text-sm text-stone-100 focus:outline-none focus:border-lime-400/50"
                />
              </Field>

              <div className="grid grid-cols-[1fr_120px] gap-3">
                <Field label="Amount">
                  <input
                    type="number"
                    value={adjAmt}
                    onChange={(e) => setAdjAmt(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-2.5 font-mono text-sm text-stone-100 focus:outline-none focus:border-lime-400/50"
                  />
                </Field>
                <Field label="Currency">
                  <Select value={adjCcy} onChange={setAdjCcy} options={['USDC', 'USDT', 'USD', 'COP']} />
                </Field>
              </div>

              <Field label="Reason Code">
                <Select
                  value={adjReason}
                  onChange={setAdjReason}
                  options={[
                    'ONCHAIN_DEPOSIT_LOST_BLOCK_REORG',
                    'CHARGEBACK_REVERSAL',
                    'RECONCILIATION_GOODWILL',
                    'PROMOTIONAL_CREDIT',
                    'COMPLIANCE_RESTITUTION',
                  ]}
                />
              </Field>

              <div className="border-t border-stone-800 pt-4 font-mono text-[10px] text-stone-500 space-y-1">
                <div>▸ will hit SYS_SUSPENSE_{adjCcy} (DR) and WLT_{adjUser}_{adjCcy} (CR)</div>
                <div>▸ admin_id, reason_code, payload → SHA256 hash</div>
                <div>▸ hash chained to ADM-{(2410 + log.length).toString().padStart(4, '0')}</div>
              </div>

              <button
                onClick={submitAdjustment}
                disabled={posting}
                className="w-full py-3 bg-orange-300 text-stone-950 font-mono text-xs tracking-widest uppercase font-semibold hover:bg-orange-200 disabled:bg-stone-700 disabled:text-stone-500 transition-colors flex items-center justify-center gap-2"
              >
                {posting ? (
                  <>
                    <Activity size={14} className="animate-pulse" /> Posting…
                  </>
                ) : (
                  <>
                    <FileText size={14} /> Post Adjustment
                  </>
                )}
              </button>
            </div>
          </Panel>

          <Panel label="admin_actions · hash chain" className="overflow-hidden">
            <div className="divide-y divide-stone-900">
              {log.map((l) => (
                <div key={l.id} className={`p-5 ${l.fresh ? 'bg-orange-300/5 entry-row' : ''}`}>
                  <div className="flex items-start justify-between mb-2 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-stone-100">{l.id}</span>
                      <Tag kind={l.action === 'MANUAL_CREDIT' ? 'credit' : l.action === 'FREEZE' ? 'failed' : 'pending'}>
                        {l.action}
                      </Tag>
                    </div>
                    <span className="font-mono text-[10px] text-stone-500 flex-shrink-0">{l.ts.slice(0, 19).replace('T', ' ')}</span>
                  </div>
                  <div className="font-mono text-xs text-stone-400 space-y-1">
                    <div>
                      <span className="text-stone-600">target:</span> {l.target} <span className="text-stone-600">·</span>{' '}
                      <span className="text-stone-200">{l.amt}</span>
                    </div>
                    <div>
                      <span className="text-stone-600">reason:</span> <span className="text-stone-300">{l.reason}</span>
                    </div>
                    <div>
                      <span className="text-stone-600">admin:</span> {l.admin}
                    </div>
                    <div className="pt-1 flex items-center gap-2 text-[10px]">
                      <Hash size={10} className="text-stone-600" />
                      <span className="text-stone-400">{truncHash(l.hash, 10)}</span>
                      {l.prevHash && (
                        <>
                          <span className="text-stone-700">←</span>
                          <span className="text-stone-600">{truncHash(l.prevHash, 10)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   04 — TRANSACTION FEED
   ───────────────────────────────────────────────────────────── */

const SAMPLE_TX = [
  {
    id: 'txn_01HQXZ7A2KM',
    type: 'FX_SWAP',
    status: 'SETTLED',
    ts: '2026-05-23T14:08:23Z',
    summary: '1,000.00 USD → 985.00 USDT',
    legs: [
      { wallet: 'wlt_usd_42', dir: 'DEBIT', amt: 1000.00, ccy: 'USD' },
      { wallet: 'wlt_usdt_42', dir: 'CREDIT', amt: 985.00, ccy: 'USDT' },
    ],
    fx: { pair: 'USD/USDT', mid: '1.0000', applied: '0.9850', spread_bps: 150, fee: '15.00 USD' },
    snapshot: {
      USD: { before: '3,200.00', after: '2,200.00' },
      USDT: { before: '150.00', after: '1,135.00' },
    },
    audit: 'ledger_seq_10001-10005',
  },
  {
    id: 'txn_01HQXZ4FB2P',
    type: 'DEPOSIT',
    status: 'SETTLED',
    ts: '2026-05-23T13:42:11Z',
    summary: '+ 500.00 USDT',
    legs: [
      { wallet: 'sys_hot_usdt_trc20', dir: 'DEBIT', amt: 500.00, ccy: 'USDT' },
      { wallet: 'wlt_usdt_42', dir: 'CREDIT', amt: 500.00, ccy: 'USDT' },
    ],
    onchain: { network: 'TRC20', tx_hash: '0x8af2f5c1e9b34a2c1', block: 64829011, confirmations: 27 },
    snapshot: { USDT: { before: '650.00', after: '1,150.00' } },
    audit: 'ledger_seq_9988-9989',
  },
  {
    id: 'txn_01HQXYM8T1J',
    type: 'WITHDRAWAL',
    status: 'PENDING',
    ts: '2026-05-23T12:01:55Z',
    summary: '− 250.00 USDT',
    legs: [
      { wallet: 'wlt_usdt_42', dir: 'DEBIT', amt: 250.00, ccy: 'USDT' },
      { wallet: 'sys_pending_settle_usdt', dir: 'CREDIT', amt: 250.00, ccy: 'USDT' },
    ],
    onchain: { network: 'TRC20', tx_hash: 'pending', block: null, confirmations: 0 },
    snapshot: { USDT: { before: '900.00', after: '650.00' } },
    audit: 'ledger_seq_9975-9976',
  },
  {
    id: 'txn_01HQXY1Z0KQ',
    type: 'P2P',
    status: 'SETTLED',
    ts: '2026-05-23T10:14:02Z',
    summary: '− 50.00 USDT → user_113',
    legs: [
      { wallet: 'wlt_usdt_42', dir: 'DEBIT', amt: 50.00, ccy: 'USDT' },
      { wallet: 'wlt_usdt_113', dir: 'CREDIT', amt: 50.00, ccy: 'USDT' },
    ],
    snapshot: { USDT: { before: '950.00', after: '900.00' } },
    audit: 'ledger_seq_9961-9962',
  },
];

const TransactionFeed = () => {
  const [selected, setSelected] = useState(null);

  return (
    <section id="feed" className="py-24 px-12 lg:px-24 border-b border-stone-900">
      <SectionMarker num="04" label="Transaction Feed" sub="GET /v1/users/user_42/transactions" />

      <div className={`grid gap-8 ${selected ? 'lg:grid-cols-[1fr_480px]' : ''}`}>
        <Panel label="Recent activity · user_42" className="overflow-hidden">
          <div className="divide-y divide-stone-900">
            {SAMPLE_TX.map((tx) => {
              const isSelected = selected?.id === tx.id;
              return (
                <button
                  key={tx.id}
                  onClick={() => setSelected(isSelected ? null : tx)}
                  className={`w-full text-left p-5 flex items-center gap-5 hover:bg-stone-950/60 transition-colors ${
                    isSelected ? 'bg-stone-950' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {tx.type === 'FX_SWAP' && <Repeat size={18} className="text-orange-300" />}
                    {tx.type === 'DEPOSIT' && <ArrowRight size={18} className="text-lime-300" />}
                    {tx.type === 'WITHDRAWAL' && <ArrowRight size={18} className="text-stone-400 rotate-180" />}
                    {tx.type === 'P2P' && <GitBranch size={18} className="text-sky-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Tag kind="neutral">{tx.type}</Tag>
                      <Tag kind={tx.status === 'SETTLED' ? 'success' : 'pending'}>{tx.status}</Tag>
                      <span className="font-mono text-[10px] text-stone-500">{tx.id}</span>
                    </div>
                    <div className="font-mono text-sm text-stone-100">{tx.summary}</div>
                  </div>
                  <div className="font-mono text-[10px] text-stone-500 text-right flex-shrink-0">
                    {tx.ts.slice(0, 19).replace('T', ' ')}
                  </div>
                  <ChevronRight size={16} className={`text-stone-600 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                </button>
              );
            })}
          </div>
        </Panel>

        {selected && <TxDetail tx={selected} onClose={() => setSelected(null)} />}
      </div>
    </section>
  );
};

const TxDetail = ({ tx, onClose }) => (
  <Panel label={`tx detail · ${tx.id}`} className="h-fit lg:sticky lg:top-8 entry-row">
    <div className="p-5 border-b border-stone-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Tag kind="neutral">{tx.type}</Tag>
        <Tag kind={tx.status === 'SETTLED' ? 'success' : 'pending'}>{tx.status}</Tag>
      </div>
      <button onClick={onClose} className="text-stone-500 hover:text-stone-200">
        <X size={16} />
      </button>
    </div>
    <div className="p-5 space-y-5 font-mono text-xs">
      <div>
        <div className="text-stone-500 text-[10px] tracking-widest uppercase mb-2">Legs</div>
        <div className="space-y-1.5">
          {tx.legs.map((l, i) => (
            <div key={i} className="flex items-center justify-between border border-stone-800 px-3 py-2 bg-stone-950/40">
              <span className="text-stone-400 truncate mr-2">{l.wallet}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Tag kind={l.dir === 'DEBIT' ? 'debit' : 'credit'}>{l.dir}</Tag>
                <span className={l.dir === 'DEBIT' ? 'text-orange-300' : 'text-lime-300'}>
                  {fmtNum(l.amt)} {l.ccy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {tx.fx && (
        <div>
          <div className="text-stone-500 text-[10px] tracking-widest uppercase mb-2">FX Detail</div>
          <div className="space-y-1 text-stone-400">
            <div><span className="text-stone-600">pair:</span> {tx.fx.pair}</div>
            <div><span className="text-stone-600">mid_rate:</span> {tx.fx.mid}</div>
            <div><span className="text-stone-600">applied_rate:</span> {tx.fx.applied}</div>
            <div><span className="text-stone-600">spread_bps:</span> {tx.fx.spread_bps}</div>
            <div><span className="text-stone-600">fee:</span> <span className="text-orange-300">{tx.fx.fee}</span></div>
          </div>
        </div>
      )}

      {tx.onchain && (
        <div>
          <div className="text-stone-500 text-[10px] tracking-widest uppercase mb-2">On-chain</div>
          <div className="space-y-1 text-stone-400">
            <div><span className="text-stone-600">network:</span> {tx.onchain.network}</div>
            <div><span className="text-stone-600">tx_hash:</span> <span className="text-stone-300">{tx.onchain.tx_hash}</span></div>
            <div><span className="text-stone-600">block:</span> {tx.onchain.block ?? '—'}</div>
            <div>
              <span className="text-stone-600">confirmations:</span>{' '}
              <span className={tx.onchain.confirmations >= 27 ? 'text-lime-300' : 'text-amber-300'}>
                {tx.onchain.confirmations}/27
              </span>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="text-stone-500 text-[10px] tracking-widest uppercase mb-2">Balance snapshot</div>
        <div className="space-y-1.5">
          {Object.entries(tx.snapshot).map(([ccy, s]) => (
            <div key={ccy} className="flex justify-between border border-stone-800 px-3 py-2 bg-stone-950/40">
              <span className="text-stone-400">{ccy}</span>
              <span className="text-stone-500">
                {s.before} <span className="text-stone-700 mx-1">→</span> <span className="text-stone-100">{s.after}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-stone-800 text-[10px] text-stone-600">
        audit_ref · <span className="text-stone-400">{tx.audit}</span>
      </div>
    </div>
  </Panel>
);

/* ─────────────────────────────────────────────────────────────
   05 — SECURITY STACK
   ───────────────────────────────────────────────────────────── */

const SECURITY_LAYERS = [
  {
    n: 'L1', title: 'Idempotency keys',
    body: 'Every POST /withdrawals requires Idempotency-Key. Persisted with request hash. Retries return the same TX. Neutralizes double-clicks, gateway retries, network failures.',
  },
  {
    n: 'L2', title: 'Pessimistic locking',
    body: 'Reserve phase: SELECT … FOR UPDATE on wallet inside SERIALIZABLE transaction. Balance reflects deduction at COMMIT, before broadcast.',
  },
  {
    n: 'L3', title: 'State machine (DB-enforced)',
    body: 'DRAFT → PENDING → AUTHORIZED → BROADCASTING → SETTLED. Unidirectional. Enum + trigger reject illegal transitions, not just app code.',
  },
  {
    n: 'L4', title: 'Distributed lock on broadcaster',
    body: 'Redis Redlock per transaction_id with TTL. On worker crash, next worker queries chain by pre-persisted tx_hash before retrying. Never blind retries.',
  },
  {
    n: 'L5', title: 'tx_hash persisted before broadcast',
    body: 'Nonce computed, tx_hash predicted, both persisted. Then sendRawTransaction. If crash between persist and send, resume queries by hash and reconciles.',
  },
  {
    n: 'L6', title: 'Idempotent confirmation webhooks',
    body: 'Only on-chain (or bank ACK) finality flips to SETTLED. tx_hash has UNIQUE constraint at DB level. No way to settle the same TX twice.',
  },
  {
    n: 'L7', title: 'Append-only reversal',
    body: 'If broadcast rejects (dropped, replaced, NACK), compensating ledger entries (REVERSE_OF=TXN-X) restore funds. Original entries never mutated. Ledger is append-only forever.',
  },
];

const SecurityStack = () => {
  const [open, setOpen] = useState(0);
  return (
    <section id="security" className="py-24 px-12 lg:px-24">
      <SectionMarker num="05" label="Security Stack" sub="Seven layers against double-spend & re-entry" />

      <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-start">
        <div className="space-y-2">
          {SECURITY_LAYERS.map((s, i) => (
            <button
              key={s.n}
              onClick={() => setOpen(i)}
              className={`w-full text-left border transition-all ${
                open === i
                  ? 'border-stone-100 bg-stone-100/5'
                  : 'border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="px-5 py-4 flex items-center gap-4">
                <span className={`font-mono text-[10px] tracking-widest ${open === i ? 'text-stone-100' : 'text-stone-500'}`}>{s.n}</span>
                <span className={`flex-1 font-mono text-sm ${open === i ? 'text-stone-100' : 'text-stone-400'}`}>{s.title}</span>
                <ChevronRight size={14} className={`transition-transform ${open === i ? 'rotate-90 text-stone-100' : 'text-stone-600'}`} />
              </div>
            </button>
          ))}
        </div>

        <Panel className="p-8 h-fit lg:sticky lg:top-8 min-h-[400px]">
          <div className="font-mono text-[10px] text-stone-500 tracking-widest uppercase mb-4">{SECURITY_LAYERS[open].n}</div>
          <h3 style={{ fontFamily: "'Instrument Serif', serif" }} className="text-3xl text-stone-100 italic leading-tight mb-6">
            {SECURITY_LAYERS[open].title}
          </h3>
          <p className="font-mono text-sm text-stone-400 leading-relaxed">
            {SECURITY_LAYERS[open].body}
          </p>

          <div className="mt-8 pt-6 border-t border-stone-800 font-mono text-[10px] text-stone-600">
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} />
              <span>defense-in-depth · failure of any single layer does not compromise the ledger</span>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   SHELL
   ───────────────────────────────────────────────────────────── */

const NAV = [
  { id: 'overview', n: '00', label: 'Architecture' },
  { id: 'ledger', n: '01', label: 'Ledger Engine' },
  { id: 'deposit', n: '02', label: 'Crypto Deposit' },
  { id: 'admin', n: '03', label: 'Admin Console' },
  { id: 'feed', n: '04', label: 'Transaction Feed' },
  { id: 'security', n: '05', label: 'Security Stack' },
];

export default function App() {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const handler = () => {
      let current = 'overview';
      for (const item of NAV) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 200) current = item.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }} className="min-h-screen bg-[#0a0a09] text-stone-200">
      <style>{`
        ${FONTS}
        body { background: #0a0a09; }
        .tabular-nums { font-variant-numeric: tabular-nums; }
        .entry-row { animation: slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::selection { background: #bef264; color: #0a0a09; }
        /* dotted background pattern */
        .bg-grid {
          background-image: radial-gradient(circle at 1px 1px, rgba(120,113,108,0.08) 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>

      {/* Fixed sidebar nav */}
      <nav className="fixed left-0 top-0 h-screen w-[200px] border-r border-stone-900 p-8 hidden lg:flex flex-col justify-between bg-[#0a0a09]/95 backdrop-blur z-50">
        <div>
          <div className="font-mono text-[10px] text-stone-500 tracking-widest mb-12">
            CORE WALLET<br />EXPLORER
          </div>
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => jump(n.id)}
                  className={`w-full text-left py-2 flex items-baseline gap-3 transition-colors font-mono text-xs ${
                    active === n.id ? 'text-stone-100' : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  <span className="text-[9px] tracking-widest">{n.n}</span>
                  <span>{n.label}</span>
                  {active === n.id && <span className="ml-auto w-1 h-1 rounded-full bg-lime-300" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="font-mono text-[9px] text-stone-600 leading-relaxed">
          INTERACTIVE MOCK<br />
          all data simulated<br />
          no real funds moved
        </div>
      </nav>

      <main className="lg:ml-[200px] bg-grid">
        <Overview />
        <LedgerEngine />
        <CryptoDeposit />
        <AdminConsole />
        <TransactionFeed />
        <SecurityStack />

        <footer className="px-12 lg:px-24 py-12 border-t border-stone-900 font-mono text-[10px] text-stone-600 flex justify-between">
          <span>END OF MOCK · core-wallet-explorer · v1.0</span>
          <span>built for Manuel · 2026</span>
        </footer>
      </main>
    </div>
  );
}
