"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ActivityFeed, timeAgo } from '@/components/admin/ActivityFeed';

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
];

const REFRESH_MS = 15_000;

function Kpi({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function Panel({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function AdminActivityPage() {
  const [range, setRange] = useState('today');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/activity?range=${range}`);
        const json = await res.json();
        if (cancelled) return;
        if (json.success) {
          setData(json.data);
          setError(null);
          setLastUpdated(new Date().toISOString());
        } else {
          setError(json.error || 'Could not load activity');
        }
      } catch {
        if (!cancelled) setError('Could not reach the server');
      }
    }
    load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [range]);

  const totals = data?.totals ?? {};
  const traffic: { label: string; views: number; visitors: number }[] = data?.traffic ?? [];
  const maxViews = Math.max(1, ...traffic.map((t) => t.views));
  const funnel: { step: string; sessions: number }[] = data?.funnel ?? [];
  const funnelTop = Math.max(1, funnel[0]?.sessions ?? 0);
  const devices: { device: string; visitors: number }[] = data?.devices ?? [];
  const deviceTotal = Math.max(1, devices.reduce((sum, d) => sum + d.visitors, 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Store Activity</h1>
          <p className="text-xs text-gray-500 mt-1">
            What shoppers are doing on your website • auto-refreshes every 15s
            {lastUpdated && <> • updated {timeAgo(lastUpdated)}</>}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === r.key ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Live now + KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="col-span-2 md:col-span-1 bg-slate-900 text-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-400" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Live now</p>
          </div>
          <p className="text-3xl font-extrabold mt-1">{data?.live?.visitors ?? 0}</p>
          <p className="text-[11px] text-slate-400">active in the last 5 min</p>
        </div>
        <Kpi label="Visitors" value={totals.visitors ?? 0} hint={`${totals.sessions ?? 0} sessions`} />
        <Kpi label="Page views" value={totals.pageViews ?? 0} hint={`${totals.pagesPerSession ?? 0} per session`} />
        <Kpi label="Added to bag" value={totals.addToCarts ?? 0} hint={`${totals.productViews ?? 0} product views`} />
        <Kpi label="Orders" value={totals.orders ?? 0} hint={`৳${Math.round(totals.revenue ?? 0).toLocaleString('en-US')}`} />
        <Kpi label="Conversion" value={`${totals.conversionRate ?? 0}%`} hint={`${totals.signups ?? 0} signups • ${totals.logins ?? 0} logins`} />
      </div>

      {/* Traffic + funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Panel title="Traffic" subtitle={range === 'today' ? 'Page views by hour' : 'Page views by day'}>
            {traffic.every((t) => t.views === 0) ? (
              <div className="h-44 flex items-center justify-center text-xs text-gray-400">No visits recorded in this period yet.</div>
            ) : (
              <>
                <div className="h-44 flex items-end gap-[3px]">
                  {traffic.map((t) => (
                    <div key={t.label} className="flex-1 h-full flex flex-col justify-end group relative" title={`${t.label}: ${t.views} views, ${t.visitors} visitors`}>
                      <div style={{ height: `${Math.max(2, (t.views / maxViews) * 100)}%` }} className="w-full rounded-t-md bg-indigo-400/80 group-hover:bg-indigo-500 transition-colors" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                  <span>{traffic[0]?.label}</span>
                  <span>{traffic[traffic.length - 1]?.label}</span>
                </div>
              </>
            )}
          </Panel>
        </div>

        <Panel title="Shopping Funnel" subtitle="Sessions reaching each step">
          <div className="space-y-3">
            {funnel.map((f, i) => {
              const pct = Math.round((f.sessions / funnelTop) * 100);
              const prev = i > 0 ? funnel[i - 1].sessions : null;
              const dropOff = prev ? Math.round(((prev - f.sessions) / Math.max(1, prev)) * 100) : null;
              return (
                <div key={f.step}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">{f.step}</span>
                    <span className="font-bold text-gray-900">
                      {f.sessions}
                      {dropOff !== null && dropOff > 0 && <span className="text-[10px] font-semibold text-rose-500 ml-1.5">−{dropOff}%</span>}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sg-pink to-[#ff6b8b] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Top Pages">
          <ul className="space-y-2">
            {(data?.topPages ?? []).length === 0 && <li className="text-xs text-gray-400">No data yet.</li>}
            {(data?.topPages ?? []).map((p: any) => (
              <li key={p.path} className="flex items-center justify-between gap-3 text-xs">
                <Link href={p.path} target="_blank" className="truncate font-medium text-gray-700 hover:text-sg-pink">{p.path}</Link>
                <span className="shrink-0 text-gray-500"><b className="text-gray-900">{p.views}</b> views</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Most Viewed Products">
          <ul className="space-y-2">
            {(data?.topProducts ?? []).length === 0 && <li className="text-xs text-gray-400">No data yet.</li>}
            {(data?.topProducts ?? []).map((p: any) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-medium text-gray-700">{p.name || p.id}</span>
                <span className="shrink-0 text-gray-500">
                  <b className="text-gray-900">{p.views}</b> views • <b className="text-amber-600">{p.carts}</b> bag
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Top Searches" subtitle="What shoppers are looking for">
          <ul className="space-y-2">
            {(data?.topSearches ?? []).length === 0 && <li className="text-xs text-gray-400">No searches yet.</li>}
            {(data?.topSearches ?? []).map((s: any) => (
              <li key={s.query} className="flex items-center justify-between gap-3 text-xs">
                <Link href={`/shop?q=${encodeURIComponent(s.query)}`} target="_blank" className="truncate font-medium text-gray-700 hover:text-sg-pink">
                  {s.query}
                </Link>
                <span className="shrink-0 font-bold text-gray-900">{s.count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Feed, live pages, devices, staff actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Panel title="Live Feed" subtitle="Latest shopper actions">
            <div className="max-h-[420px] overflow-y-auto custom-scroll -mx-2">
              <ActivityFeed events={data?.feed ?? []} />
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Being Viewed Right Now">
            <ul className="space-y-2">
              {(data?.live?.pages ?? []).length === 0 && <li className="text-xs text-gray-400">Nobody is browsing right now.</li>}
              {(data?.live?.pages ?? []).map((p: any) => (
                <li key={p.path} className="flex items-center justify-between text-xs">
                  <span className="truncate text-gray-700">{p.path}</span>
                  <span className="font-bold text-emerald-600">{p.count}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Devices">
            <div className="space-y-2.5">
              {devices.length === 0 && <p className="text-xs text-gray-400">No data yet.</p>}
              {devices.map((d) => (
                <div key={d.device}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize font-semibold text-gray-700">{d.device}</span>
                    <span className="text-gray-500">{Math.round((d.visitors / deviceTotal) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 rounded-full" style={{ width: `${(d.visitors / deviceTotal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Staff Actions"
            subtitle="Recent admin & moderator changes"
            action={<Link href="/admin/audit-log" className="text-xs font-bold text-sg-pink hover:underline">All →</Link>}
          >
            <ul className="space-y-2.5">
              {(data?.adminActions ?? []).length === 0 && <li className="text-xs text-gray-400">No staff actions yet.</li>}
              {(data?.adminActions ?? []).map((a: any) => (
                <li key={a._id} className="text-xs">
                  <p className="text-gray-700 leading-snug">
                    <b className="text-gray-900">{a.userName}</b> {a.details || `${a.action} ${a.target}`}
                  </p>
                  <p className="text-[10px] text-gray-400">{timeAgo(a.createdAt)}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
