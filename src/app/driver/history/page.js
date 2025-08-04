'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { driverAPI } from '@/lib/api';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function JobHistory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: '',
    limit: 20,
    offset: 0,
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    totalEarnings: 0,
  });

  const jobStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'driver_en_route', label: 'En Route' },
    { value: 'arrived_pickup', label: 'At Pickup' },
    { value: 'loading', label: 'Loading' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'arrived_destination', label: 'At Destination' },
    { value: 'unloading', label: 'Unloading' },
  ];

  useEffect(() => {
    fetchJobHistory();
  }, [
    filters.status,
    filters.start_date,
    filters.end_date,
    filters.limit,
    filters.offset,
  ]);

  useEffect(() => {
    // Calculate stats when jobs change
    calculateStats();
  }, [jobs]);

  const fetchJobHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await driverAPI.getJobHistory(filters);
      const data = response.data.data;

      if (filters.offset === 0) {
        setJobs(data.jobs || []);
      } else {
        setJobs((prev) => [...prev, ...(data.jobs || [])]);
      }

      setTotal(data.total || 0);
      setHasMore(data.has_more || false);
    } catch (error) {
      console.error('Failed to fetch job history:', error);
      setError('Failed to load job history. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(
      (job) => job.status === 'completed'
    ).length;
    const cancelledJobs = jobs.filter(
      (job) => job.status === 'cancelled'
    ).length;
    const totalEarnings = jobs
      .filter((job) => job.status === 'completed')
      .reduce((sum, job) => sum + (job.total_price || 0), 0);

    setStats({
      totalJobs,
      completedJobs,
      cancelledJobs,
      totalEarnings: Math.round(totalEarnings * 0.8), // 80% driver share
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
      offset: 0, // Reset pagination when filters change
    }));
  };

  const loadMoreJobs = () => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      accepted: 'bg-yellow-100 text-yellow-800',
      driver_en_route: 'bg-blue-100 text-blue-800',
      arrived_pickup: 'bg-orange-100 text-orange-800',
      loading: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      arrived_destination: 'bg-pink-100 text-pink-800',
      unloading: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircleIcon className="h-4 w-4" />;
    if (status === 'cancelled') return <XCircleIcon className="h-4 w-4" />;
    return <ClockIcon className="h-4 w-4" />;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDateRangePresets = () => {
    const today = new Date();
    const presets = [
      {
        label: 'Last 7 days',
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        end: today.toISOString().split('T')[0],
      },
      {
        label: 'Last 30 days',
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        end: today.toISOString().split('T')[0],
      },
      {
        label: 'This month',
        start: new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split('T')[0],
        end: today.toISOString().split('T')[0],
      },
    ];
    return presets;
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      job.booking_number?.toLowerCase().includes(searchLower) ||
      job.pickup_address?.toLowerCase().includes(searchLower) ||
      job.dropoff_address?.toLowerCase().includes(searchLower) ||
      job.customer?.first_name?.toLowerCase().includes(searchLower) ||
      job.customer?.last_name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job History</h1>
          <p className="text-gray-600 mt-1">View and manage your past jobs</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={fetchJobHistory}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalJobs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedJobs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.cancelledJobs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Earnings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                KES {stats.totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by booking number, address, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-gray-700 placeholder:text-gray-300 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Jobs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {jobStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange('start_date', e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Presets */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Date Ranges
            </label>
            <div className="flex flex-wrap gap-2">
              {getDateRangePresets().map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleFilterChange('start_date', preset.start);
                    handleFilterChange('end_date', preset.end);
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => {
                  handleFilterChange('start_date', '');
                  handleFilterChange('end_date', '');
                }}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Clear Dates
              </button>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => {
                setFilters({
                  status: '',
                  start_date: '',
                  end_date: '',
                  limit: 20,
                  offset: 0,
                });
                setSearchTerm('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-900">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchJobHistory}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TruckIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.booking_number}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {getStatusIcon(job.status)}
                          <span>{job.status.replace('_', ' ')}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(job.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Pickup
                        </p>
                        <p className="text-sm text-gray-600">
                          {job.pickup_address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Drop-off
                        </p>
                        <p className="text-sm text-gray-600">
                          {job.dropoff_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(job.pickup_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="text-sm font-medium text-gray-900">
                          {job.customer?.first_name} {job.customer?.last_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Total Payment</p>
                        <p className="text-sm font-medium text-gray-900">
                          KES {job.total_price?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">
                          {job.status === 'completed'
                            ? 'Completed'
                            : job.status === 'cancelled'
                            ? 'Cancelled'
                            : 'Status'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {job.completed_at
                            ? formatDateTime(job.completed_at)
                            : job.cancelled_at
                            ? formatDateTime(job.cancelled_at)
                            : job.accepted_at
                            ? formatDateTime(job.accepted_at)
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings */}
                <div className="ml-6 text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {job.status === 'completed'
                      ? `KES ${Math.round(
                          job.total_price * 0.8
                        ).toLocaleString()}`
                      : '-'}
                  </p>
                  <p className="text-sm text-gray-600">Your Earnings</p>
                </div>
              </div>
            </div>
          ))
        ) : !loading ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching jobs found' : 'No job history'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms or filters.'
                : 'Once you complete jobs, they will appear here.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Load More Button */}
      {hasMore && !searchTerm && (
        <div className="text-center">
          <button
            onClick={loadMoreJobs}
            disabled={loading}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Jobs'}
          </button>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-center text-sm text-gray-600">
        {searchTerm ? (
          <p>
            Showing {filteredJobs.length} of {jobs.length} jobs matching &quot;
            {searchTerm}&quot;
          </p>
        ) : (
          <p>
            Showing {jobs.length} of {total} total jobs
          </p>
        )}
      </div>
    </div>
  );
}
