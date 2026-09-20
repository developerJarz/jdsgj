import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'boolean' | 'role' | 'return';
}

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const getBadgeStyle = () => {
    const s = (status || '').toLowerCase();

    // Order status styling
    if (type === 'order') {
      switch (s) {
        case 'pending':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'confirmed':
          return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'processing':
          return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case 'packed':
          return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'shipped':
          return 'bg-cyan-50 text-cyan-700 border-cyan-200';
        case 'out_for_delivery':
          return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'delivered':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'cancelled':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'returned':
          return 'bg-yellow-50 text-yellow-800 border-yellow-200';
        case 'refunded':
          return 'bg-purple-50 text-purple-700 border-purple-200';
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    }

    // Payment status styling
    if (type === 'payment') {
      switch (s) {
        case 'paid':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'pending':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'failed':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'refunded':
          return 'bg-purple-50 text-purple-700 border-purple-200';
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    }

    // Role badge
    if (type === 'role') {
      switch (s) {
        case 'superadmin':
          return 'bg-rose-100 text-rose-800 border-rose-300 font-black';
        case 'admin':
          return 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
        case 'moderator':
          return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
        default:
          return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    }

    // Boolean or generic
    if (s === 'active' || s === 'true' || s === 'approved' || s === 'completed') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'inactive' || s === 'false' || s === 'rejected') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }

    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formattedLabel = (status || '')
    .replace(/_/g, ' ')
    .toUpperCase();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {formattedLabel}
    </span>
  );
}
