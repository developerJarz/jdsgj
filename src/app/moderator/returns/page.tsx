"use client";

import React from 'react';
import AdminReturnsPage from '@/app/admin/returns/page';
import { ShieldIcon } from '@/components/common/Icons';

export default function ModeratorReturnsPage() {
  return (
    <div>
      <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 flex items-center gap-2">
        <ShieldIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span><strong>Moderator Mode:</strong> Review return claims, verify proof of condition, and update claim statuses.</span>
      </div>
      <AdminReturnsPage />
    </div>
  );
}
