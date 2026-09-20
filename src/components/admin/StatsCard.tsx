import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  gradient?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  isPositive = true,
  subtitle,
  gradient = 'from-sg-pink to-rose-500',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h3>
        </div>
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{change}</span>
            </span>
          )}
          {subtitle && <span className="text-gray-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
