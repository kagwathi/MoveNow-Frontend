'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/common/Toast';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Input, Select } from '@/components/common/FormInput';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedDateRange, setSelectedDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 days ago
    end_date: new Date().toISOString().split('T')[0], // today
  });

  const toast = useToast();

  const reportTypes = [
    {
      key: 'revenue',
      title: 'Revenue Report',
      description: 'Financial performance and earnings analysis',
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      key: 'bookings',
      title: 'Bookings Report',
      description: 'Booking trends and status breakdown',
      icon: TruckIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      key: 'drivers',
      title: 'Drivers Report',
      description: 'Driver performance and statistics',
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      key: 'customers',
      title: 'Customers Report',
      description: 'Customer activity and engagement metrics',
      icon: UserGroupIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  useEffect(() => {
    // Generate all reports on initial load
    reportTypes.forEach((report) => {
      generateReport(report.key);
    });
  }, [selectedDateRange]);

  const generateReport = async (reportType) => {
    try {
      setLoading((prev) => ({ ...prev, [reportType]: true }));

      const params = {
        start_date: selectedDateRange.start_date,
        end_date: selectedDateRange.end_date,
      };

      const response = await adminAPI.generateReport(reportType, params);

      if (response.data.success) {
        setReports((prev) => ({
          ...prev,
          [reportType]: response.data.data,
        }));
      }
    } catch (error) {
      toast.error(`Failed to generate ${reportType} report`);
      console.error(`Generate ${reportType} report error:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [reportType]: false }));
    }
  };

  const handleDateRangeChange = (field, value) => {
    setSelectedDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const exportReport = (reportType) => {
    const report = reports[reportType];
    if (!report) return;

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report_${selectedDateRange.start_date}_to_${selectedDateRange.end_date}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Revenue Report Component
  const RevenueReportCard = ({ report, isLoading }) => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      );
    }

    if (!report) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Report
            </h3>
          </div>
          <button
            onClick={() => exportReport('revenue')}
            className="btn-secondary flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {formatCurrency(report.summary.total_revenue)}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Total Bookings
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              {report.summary.total_bookings}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Average Value
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-2">
              {formatCurrency(report.summary.average_booking_value)}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Platform Fees
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-2">
              {formatCurrency(report.summary.platform_fees)}
            </p>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Daily Revenue Breakdown
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bookings
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Avg Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.daily_breakdown.slice(0, 10).map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(day.date, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(day.revenue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {day.bookings}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(day.average_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {report.daily_breakdown.length > 10 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing first 10 days. Export for complete data.
            </p>
          )}
        </div>
      </div>
    );
  };

  // Bookings Report Component
  const BookingsReportCard = ({ report, isLoading }) => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      );
    }

    if (!report) return null;

    const getStatusColor = (status) => {
      const colors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
        driver_assigned: 'bg-purple-100 text-purple-800 border-purple-200',
        in_transit: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
      };
      return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TruckIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Bookings Report
            </h3>
          </div>
          <button
            onClick={() => exportReport('bookings')}
            className="btn-secondary flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Status Breakdown
            </h4>
            <div className="space-y-3">
              {report.status_breakdown.map((status, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        status.status
                      )}`}
                    >
                      {status.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Type Breakdown */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Vehicle Type Performance
            </h4>
            <div className="space-y-3">
              {report.vehicle_type_breakdown.map((vehicle, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {vehicle.vehicle_type?.replace('_', ' ') ||
                        'Not specified'}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      {vehicle.count} bookings
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Avg Price: {formatCurrency(vehicle.average_price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Drivers Report Component
  const DriversReportCard = ({ report, isLoading }) => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      );
    }

    if (!report) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Drivers Report
            </h3>
          </div>
          <button
            onClick={() => exportReport('drivers')}
            className="btn-secondary flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-900">
              {report.summary.total_drivers}
            </p>
            <p className="text-sm text-purple-600">Total Drivers</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-900">
              {report.summary.approved_drivers}
            </p>
            <p className="text-sm text-green-600">Approved</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-900">
              {report.summary.pending_drivers}
            </p>
            <p className="text-sm text-yellow-600">Pending</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">
              {report.summary.active_drivers}
            </p>
            <p className="text-sm text-blue-600">Active</p>
          </div>
        </div>

        {/* Top Performers */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Top Performing Drivers
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Driver
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trips
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.driver_details
                  .sort((a, b) => b.total_trips - a.total_trips)
                  .slice(0, 10)
                  .map((driver, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {driver.name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            driver.is_approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {driver.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {driver.total_trips}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                          <span>{driver.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(driver.joined_date, 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Customers Report Component
  const CustomersReportCard = ({ report, isLoading }) => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      );
    }

    if (!report) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Customers Report
            </h3>
          </div>
          <button
            onClick={() => exportReport('customers')}
            className="btn-secondary flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-900">
              {report.summary.total_customers}
            </p>
            <p className="text-sm text-orange-600">Total Customers</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-900">
              {report.summary.active_customers}
            </p>
            <p className="text-sm text-green-600">Active Customers</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">
              {report.summary.customers_with_bookings}
            </p>
            <p className="text-sm text-blue-600">With Bookings</p>
          </div>
        </div>

        {/* Top Customers */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Top Customers by Spending
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bookings
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.customer_details
                  .sort((a, b) => b.total_spent - a.total_spent)
                  .slice(0, 10)
                  .map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {customer.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {customer.total_bookings}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(customer.total_spent)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(customer.joined_date, 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Comprehensive business insights and performance metrics
            </p>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Date Range</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={selectedDateRange.start_date}
              onChange={(e) =>
                handleDateRangeChange('start_date', e.target.value)
              }
            />
            <Input
              label="End Date"
              type="date"
              value={selectedDateRange.end_date}
              onChange={(e) =>
                handleDateRangeChange('end_date', e.target.value)
              }
            />
            <div className="flex items-end">
              <button
                onClick={() => {
                  reportTypes.forEach((report) => {
                    generateReport(report.key);
                  });
                }}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <ChartBarIcon className="h-4 w-4" />
                <span>Generate Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="space-y-8">
          <RevenueReportCard
            report={reports.revenue}
            isLoading={loading.revenue}
          />

          <BookingsReportCard
            report={reports.bookings}
            isLoading={loading.bookings}
          />

          <DriversReportCard
            report={reports.drivers}
            isLoading={loading.drivers}
          />

          <CustomersReportCard
            report={reports.customers}
            isLoading={loading.customers}
          />
        </div>
      </div>
    </div>
  );
}
