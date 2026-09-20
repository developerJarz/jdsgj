import React, { useState, useMemo } from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T | string;
  filterComponent?: React.ReactNode;
  actions?: React.ReactNode;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKey,
  filterComponent,
  actions,
  pageSize = 10,
  loading = false,
  emptyMessage = 'No matching records found.',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((item) => {
        if (searchKey && item[searchKey]) {
          return String(item[searchKey]).toLowerCase().includes(q);
        }
        // General search across string/number properties
        return Object.values(item).some(
          (val) => val && String(val).toLowerCase().includes(q)
        );
      });
    }

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
      });
    }

    return result;
  }, [data, search, searchKey, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header controls */}
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink"
            />
          </div>
          {filterComponent}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/75 text-xs uppercase font-semibold text-gray-400 border-b border-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() =>
                    col.sortable && col.accessor && handleSort(col.accessor as string)
                  }
                  className={`px-5 py-3.5 ${
                    col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''
                  } ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && sortField === col.accessor && (
                      <span className="text-sg-pink font-bold">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sg-pink border-t-transparent mb-2"></div>
                  <p className="text-xs">Loading records...</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-gray-400">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="font-medium text-gray-600">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr key={row._id || row.id || rowIdx} className="hover:bg-gray-50/70 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-5 py-4 ${col.className || ''}`}>
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? row[col.accessor]
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredData.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/40">
          <span>
            Showing <strong className="text-gray-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-gray-800">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </strong>{' '}
            of <strong className="text-gray-800">{filteredData.length}</strong> records
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Previous
            </button>
            <span className="px-2 font-bold text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
