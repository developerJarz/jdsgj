"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-log?limit=100');
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const columns: Column<any>[] = [
    {
      header: 'Operator',
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900 text-xs">{row.userName || 'System'}</p>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            {row.userRole || 'admin'}
          </span>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Target Entity',
      accessor: 'target',
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-800 text-xs">{row.target}</span>
          {row.targetId && (
            <p className="text-[10px] text-gray-400 font-mono">ID: {row.targetId.slice(-8)}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Details & Changes',
      render: (row) => <p className="text-xs text-gray-600 max-w-md">{row.details || '—'}</p>,
    },
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Security Audit Trail</h1>
          <p className="text-xs text-gray-500 mt-1">
            Immutable chronicle of administrative changes, status updates, and entity mutations
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-xs hover:bg-gray-50 flex items-center gap-1.5 transition-all"
        >
          <span>🔄 Refresh Logs</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Search audit events..."
      />
    </div>
  );
}
