'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { driverAPI } from '@/lib/api';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  TruckIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function DriverEarnings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [earnings, setEarnings] = useState(null);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [error, setError] = useState(null);
  const [customDateRange, setCustomDateRange] = useState({
    start_date: '',
    end_date: '',
  });

  const periodOptions = [
    { value: 'week', label: 'This Week', days: 7 },
    { value: 'month', label: 'This Month', days: 30 },
    { value: 'all', label: 'All Time', days: null },
    { value: 'custom', label: 'Custom Range', days: null },
  ];

  useEffect(() => {
    fetchEarnings();
    fetchEarningsHistory();
  }, [selectedPeriod, customDateRange]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { period: selectedPeriod };

      if (
        selectedPeriod === 'custom' &&
        customDateRange.start_date &&
        customDateRange.end_date
      ) {
        params.start_date = customDateRange.start_date;
        params.end_date = customDateRange.end_date;
      }

      const response = await driverAPI.getEarnings(params);
      setEarnings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      setError('Failed to load earnings data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningsHistory = async () => {
    try {
      // Fetch last 6 periods for trend analysis
      const periods = ['week', 'month'];
      const history = [];

      for (const period of periods) {
        const response = await driverAPI.getEarnings({ period });
        history.push({
          period,
          ...response.data.data,
        });
      }

      setEarningsHistory(history);
    } catch (error) {
      console.error('Failed to fetch earnings history:', error);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      setCustomDateRange({ start_date: '', end_date: '' });
    }
  };

  const handleCustomDateChange = (field, value) => {
    setCustomDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateTrend = () => {
    if (earningsHistory.length < 2) return null;

    const current = earningsHistory.find((h) => h.period === selectedPeriod);
    const previous = earningsHistory.find((h) => h.period !== selectedPeriod);

    if (!current || !previous) return null;

    const change = current.total_earnings - previous.total_earnings;
    const percentage =
      previous.total_earnings > 0
        ? (change / previous.total_earnings) * 100
        : 0;

    return {
      change,
      percentage: Math.abs(percentage),
      isPositive: change >= 0,
    };
  };

  const formatCurrency = (amount) => {
    return `KES ${Math.round(amount || 0).toLocaleString()}`;
  };

  const exportEarnings = () => {
    if (!earnings || !earnings.jobs) return;

    const csvContent = [
      ['Date', 'Booking Number', 'Customer', 'Amount', 'Your Earnings'].join(
        ','
      ),
      ...earnings.jobs.map((job) =>
        [
          new Date(job.completed_at || job.pickup_date).toLocaleDateString(),
          job.booking_number || '',
          `"${job.customer?.first_name || ''} ${
            job.customer?.last_name || ''
          }"`,
          job.total_price || 0,
          Math.round((job.total_price || 0) * 0.8),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${selectedPeriod}-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const trend = calculateTrend();

  if (loading && !earnings) {
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
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">
            Track your income and performance
          </p>
        </div>

        <div className="flex space-x-3">
          {earnings && earnings.jobs && earnings.jobs.length > 0 && (
            <button
              onClick={exportEarnings}
              className="flex items-center space-x-2 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}

          <button
            onClick={fetchEarnings}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Period
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedPeriod === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <div className="text-center">
                <p className="font-medium">{option.label}</p>
                {option.days && (
                  <p className="text-sm text-gray-500">
                    Last {option.days} days
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        {selectedPeriod === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customDateRange.start_date}
                onChange={(e) =>
                  handleCustomDateChange('start_date', e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customDateRange.end_date}
                onChange={(e) =>
                  handleCustomDateChange('end_date', e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

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
                onClick={fetchEarnings}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {earnings && (
        <>
          {/* Main Earnings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Earnings */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Earnings</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(earnings.total_earnings)}
                  </p>
                  {trend && (
                    <div className="flex items-center mt-2">
                      {trend.isPositive ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-200" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-200" />
                      )}
                      <span className="text-sm text-green-100 ml-1">
                        {trend.percentage.toFixed(1)}% vs last period
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-green-400 rounded-lg">
                  <CurrencyDollarIcon className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(earnings.total_revenue)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Before platform fees
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Platform Fees */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Platform Fees
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(earnings.platform_fees)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">20% of revenue</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Total Jobs */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {earnings.total_jobs}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Avg: {formatCurrency(earnings.average_per_job)} per job
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Breakdown */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Earnings Breakdown
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gross Revenue</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(earnings.total_revenue)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-red-600">
                  <span>Platform Fee (20%)</span>
                  <span>-{formatCurrency(earnings.platform_fees)}</span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900">Net Earnings</span>
                    <span className="text-green-600">
                      {formatCurrency(earnings.total_earnings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(earnings.average_per_job)}
                    </p>
                    <p className="text-sm text-gray-600">Avg per Job</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {earnings.total_jobs}
                    </p>
                    <p className="text-sm text-gray-600">Jobs Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Completed Jobs
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {earnings.jobs && earnings.jobs.length > 0 ? (
                  earnings.jobs.slice(0, 10).map((job, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          Job #{job.booking_number || `${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(
                            job.completed_at || job.pickup_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(job.total_price * 0.8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Revenue: {formatCurrency(job.total_price)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      No completed jobs in this period
                    </p>
                  </div>
                )}
              </div>

              {earnings.jobs && earnings.jobs.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Showing 10 of {earnings.jobs.length} jobs
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Earnings Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {selectedPeriod === 'custom'
                    ? 'Custom Period'
                    : periodOptions.find((p) => p.value === selectedPeriod)
                        ?.label}{' '}
                  Summary
                </h3>
                <p className="text-blue-700 mt-1">
                  You earned {formatCurrency(earnings.total_earnings)} from{' '}
                  {earnings.total_jobs} completed jobs
                </p>
                {earnings.total_jobs > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    That&apos;s an average of{' '}
                    {formatCurrency(earnings.average_per_job)} per job!
                    {earnings.total_jobs >= 10 && ' Great work! 🎉'}
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Tips for Better Earnings */}
          {earnings.total_jobs < 5 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                💡 Tips to Increase Your Earnings
              </h3>
              <ul className="space-y-2 text-yellow-800">
                <li>
                  • Accept more jobs during peak hours (mornings and evenings)
                </li>
                <li>• Keep your availability status updated</li>
                <li>• Provide excellent service to get repeat customers</li>
                <li>• Complete jobs quickly and efficiently</li>
                <li>• Consider expanding your service area</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
