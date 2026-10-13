"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { useAdminAccess } from '@/context/AdminAccessContext';
import { AUDIT_RETENTION_OPTIONS } from '@/lib/auditRetention';

export default function AdminAuditLogPage() {
  const { access } = useAdminAccess();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState<number>(AUDIT_RETENTION_OPTIONS[AUDIT_RETENTION_OPTIONS.length - 1]);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

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

  const deleteOldLogs = async () => {
    if (!confirm(`Permanently delete audit entries older than ${months} month${months > 1 ? 's' : ''}? This cannot be undone.`)) return;
    setDeleting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/audit-log', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not delete audit entries.');
      setNotice({ ok: true, text: `Deleted ${json.deletedCount} audit entr${json.deletedCount === 1 ? 'y' : 'ies'}.` });
      await loadLogs();
    } catch (e) {
      setNotice({ ok: false, text: e instanceof Error ? e.message : 'Could not delete audit entries.' });
    } finally {
      setDeleting(false);
    }
  };

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
        <div className="flex flex-wrap items-center gap-2">
          {access.canDeleteAuditLogs && (
            <>
              <label htmlFor="audit-retention" className="sr-only">Delete entries older than</label>
              <select
                id="audit-retention"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                disabled={deleting}
                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                {AUDIT_RETENTION_OPTIONS.map((m) => (
                  <option key={m} value={m}>Older than {m} month{m > 1 ? 's' : ''}</option>
                ))}
              </select>
              <button
                onClick={deleteOldLogs}
                disabled={deleting}
                className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100 disabled:opacity-50 transition-all"
              >
                {deleting ? 'Deleting...' : 'Delete old entries'}
              </button>
            </>
          )}
          <button
            onClick={loadLogs}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-xs hover:bg-gray-50 flex items-center gap-1.5 transition-all"
          >
            <span>🔄 Refresh Logs</span>
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className={`rounded-xl border p-3 text-xs font-semibold ${notice.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {notice.text}
        </p>
      )}

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Search audit events..."
      />
    </div>
  );
}
