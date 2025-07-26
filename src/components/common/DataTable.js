'use client';

import { useState } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  pagination = null,
  onSort = null,
  onPageChange = null,
  className = '',
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (!onSort) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <div className="w-4 h-4" />; // placeholder
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-lg font-medium mb-2">No data found</p>
                    <p className="text-sm">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                        column.cellClassName
                      )}
                    >
                      {column.render
                        ? column.render(row[column.key], row, index)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() =>
                  onPageChange && onPageChange(pagination.current_page - 1)
                }
                disabled={pagination.current_page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  onPageChange && onPageChange(pagination.current_page + 1)
                }
                disabled={!pagination.has_more}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{pagination.offset + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(
                      pagination.offset + pagination.limit,
                      pagination.total
                    )}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() =>
                      onPageChange && onPageChange(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({
                    length: Math.min(
                      5,
                      Math.ceil(pagination.total / pagination.limit)
                    ),
                  }).map((_, i) => {
                    const pageNum = pagination.current_page - 2 + i;
                    if (
                      pageNum < 1 ||
                      pageNum > Math.ceil(pagination.total / pagination.limit)
                    )
                      return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange && onPageChange(pageNum)}
                        className={cn(
                          'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                          pageNum === pagination.current_page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      onPageChange && onPageChange(pagination.current_page + 1)
                    }
                    disabled={!pagination.has_more}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
