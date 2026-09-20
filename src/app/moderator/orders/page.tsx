"use client";

import React from 'react';
import AdminOrdersPage from '@/app/admin/orders/page';
import { ShieldIcon } from '@/components/common/Icons';

export default function ModeratorOrdersPage() {
  return (
    <div>
      <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 flex items-center gap-2">
        <ShieldIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span><strong>Moderator Mode:</strong> You have permission to view orders, advance fulfillment status, and add tracking details.</span>
      </div>
      <AdminOrdersPage />
    </div>
  );
}
