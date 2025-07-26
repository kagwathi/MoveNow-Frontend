'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Input, Select } from './FormInput';
import { cn } from '@/lib/utils';

export default function SearchFilter({
  onSearch,
  onFilter,
  filters = [],
  placeholder = 'Search...',
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onSearch?.('');
    onFilter?.({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors',
              showFilters && 'bg-gray-50',
              activeFilterCount > 0 && 'border-blue-300 bg-blue-50'
            )}
          >
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && filters.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Filter Options
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <Select
                  label={filter.label}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) =>
                    handleFilterChange(filter.key, e.target.value)
                  }
                  options={filter.options}
                  placeholder={`All ${filter.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Active filters:
          </span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find((f) => f.key === key);
            const option = filter?.options.find((o) => o.value === value);

            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
              >
                {filter?.label}: {option?.label || value}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-2 hover:text-blue-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
