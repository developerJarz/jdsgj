"use client";

import React, { useState, useEffect } from 'react';

export default function CustomerRewardsPage() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRewards() {
      try {
        const res = await fetch('/api/account/rewards');
        const json = await res.json();
        if (json.success) {
          setPoints(json.points || 0);
          setHistory(json.history || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRewards();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Beauty Reward Points</h1>
        <p className="text-xs text-gray-500 mt-1">
          Earn points on every purchase and redeem for instant discounts at checkout
        </p>
      </div>

      {/* Points Balance Hero Card */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
            Available Balance
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">{points}</h2>
            <span className="text-sm font-bold text-purple-200">Points</span>
          </div>
          <p className="text-xs text-purple-200/80">
            Worth approximately <strong className="text-white">৳{(points / 2).toFixed(0)}</strong> in shopping discount credits
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-4 rounded-xl text-xs space-y-1.5 max-w-xs">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span>✨</span>
            <span>How to earn more points:</span>
          </p>
          <p className="text-purple-200 text-[11px]">• 1 Point earned for every ৳20 spent</p>
          <p className="text-purple-200 text-[11px]">• 50 Points bonus on registration</p>
          <p className="text-purple-200 text-[11px]">• 20 Points on verified product reviews</p>
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Points Activity Log</h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading rewards history...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No point transactions recorded yet. Complete an order to earn points!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((h, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-gray-800">{h.description}</p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(h.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`font-black text-xs ${
                    h.type === 'earned' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {h.type === 'earned' ? `+${h.points}` : `-${h.points}`} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
