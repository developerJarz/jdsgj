import React from 'react';

export const ACTIVITY_LABELS: Record<string, { label: string; dot: string }> = {
  page_view: { label: 'Viewed page', dot: 'bg-gray-300' },
  product_view: { label: 'Viewed', dot: 'bg-sky-400' },
  add_to_cart: { label: 'Added to bag', dot: 'bg-amber-400' },
  wishlist_add: { label: 'Wishlisted', dot: 'bg-pink-400' },
  search: { label: 'Searched', dot: 'bg-violet-400' },
  checkout_start: { label: 'Started checkout', dot: 'bg-indigo-500' },
  order_placed: { label: 'Placed an order', dot: 'bg-emerald-500' },
  login: { label: 'Logged in', dot: 'bg-slate-400' },
  signup: { label: 'Created an account', dot: 'bg-teal-500' },
};

export interface ActivityFeedEvent {
  _id: string;
  type: string;
  path?: string;
  productName?: string;
  query?: string;
  value?: number;
  userName?: string;
  device?: string;
  createdAt: string;
}

export function timeAgo(date: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function describe(e: ActivityFeedEvent) {
  switch (e.type) {
    case 'product_view':
    case 'add_to_cart':
    case 'wishlist_add':
      return e.productName;
    case 'search':
      return e.query ? `“${e.query}”` : undefined;
    case 'order_placed':
      return e.value ? `৳${Math.round(e.value).toLocaleString('en-US')}` : undefined;
    case 'page_view':
      return e.path;
    default:
      return undefined;
  }
}

export function ActivityFeed({ events, compact = false }: { events: ActivityFeedEvent[]; compact?: boolean }) {
  if (events.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">No activity yet. Events appear here as shoppers browse.</p>;
  }

  return (
    <ul className="space-y-0.5">
      {events.map((e) => {
        const meta = ACTIVITY_LABELS[e.type] ?? { label: e.type, dot: 'bg-gray-300' };
        const detail = describe(e);
        return (
          <li key={e._id} className={`flex items-start gap-2.5 px-2 ${compact ? 'py-1.5' : 'py-2.5'} rounded-lg hover:bg-gray-50`}>
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-700 leading-snug">
                <span className="font-bold text-gray-900">{e.userName || 'Guest'}</span>{' '}
                {meta.label.toLowerCase()}
                {detail && <span className="font-semibold text-gray-900"> {detail}</span>}
              </p>
              {!compact && e.device && <p className="text-[10px] text-gray-400 capitalize">{e.device}</p>}
            </div>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(e.createdAt)}</span>
          </li>
        );
      })}
    </ul>
  );
}
