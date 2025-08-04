'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/common/Toast';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Input, Select, Textarea } from '@/components/common/FormInput';
import Modal from '@/components/common/Modal';
import {
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatTimeAgo, formatCurrency } from '@/lib/utils';
import { StarIcon } from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    booking: null,
    newStatus: '',
    reason: '',
    loading: false,
  });

  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    booking: null,
  });

  const toast = useToast();
  const itemsPerPage = 20;

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'driver_assigned', label: 'Driver Assigned' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const statusUpdateOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'driver_assigned', label: 'Driver Assigned' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'booking_number', label: 'Booking Number' },
    { value: 'status', label: 'Status' },
    { value: 'total_amount', label: 'Amount' },
    { value: 'pickup_date', label: 'Pickup Date' },
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
  }, [
    currentPage,
    statusFilter,
    dateFromFilter,
    dateToFilter,
    debouncedSearchTerm,
    sortBy,
    sortOrder,
  ]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (statusFilter) params.status = statusFilter;
      if (dateFromFilter) params.date_from = dateFromFilter;
      if (dateToFilter) params.date_to = dateToFilter;
      if (debouncedSearchTerm.trim())
        params.search = debouncedSearchTerm.trim();

      const response = await adminAPI.getBookings(params);

      if (response.data.success) {
        const data = response.data.data;
        setBookings(data.bookings || []);
        setTotalBookings(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      }
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error('Fetch bookings error:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.booking || !statusModal.newStatus) return;

    try {
      setStatusModal((prev) => ({ ...prev, loading: true }));

      const response = await adminAPI.updateBookingStatus(
        statusModal.booking.id,
        {
          status: statusModal.newStatus,
          reason:
            statusModal.reason.trim() ||
            `Status updated to ${statusModal.newStatus} by admin`,
        }
      );

      if (response.data.success) {
        toast.success(`Booking status updated to ${statusModal.newStatus}`);
        fetchBookings();
        closeStatusModal();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update booking status'
      );
      console.error('Status update error:', error);
    } finally {
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const openStatusModal = (booking, newStatus) => {
    setStatusModal({
      isOpen: true,
      booking,
      newStatus,
      reason: '',
      loading: false,
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      isOpen: false,
      booking: null,
      newStatus: '',
      reason: '',
      loading: false,
    });
  };

  const openDetailsModal = (booking) => {
    setDetailsModal({
      isOpen: true,
      booking,
    });
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      isOpen: false,
      booking: null,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'confirmed':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'driver_assigned':
        return <UserIcon className="h-4 w-4" />;
      case 'in_transit':
        return <TruckIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatStatusText = (status) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Mobile Card Component - Add better text wrapping
  const BookingCard = ({ booking }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {booking.booking_number}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {booking.customer
                  ? `${booking.customer.first_name} ${booking.customer.last_name}`
                  : 'No customer'}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(booking.created_at, 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                booking.status
              )}`}
            >
              {getStatusIcon(booking.status)}
              <span className="ml-1 hidden sm:inline">
                {formatStatusText(booking.status)}
              </span>
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-gray-600">
          <div>
            <span className="font-medium">From:</span>
            <p className="mt-1 text-gray-800 break-words">
              {booking.pickup_address}
            </p>
          </div>
          <div>
            <span className="font-medium">To:</span>
            <p className="mt-1 text-gray-800 break-words">
              {booking.dropoff_address}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="font-medium">Amount:</span>
              <p className="mt-1 text-gray-800 font-semibold">
                {formatCurrency(booking.total_amount)}
              </p>
            </div>
            <div>
              <span className="font-medium">Driver:</span>
              <p className="mt-1 text-gray-800 truncate">
                {booking.driver
                  ? `${booking.driver.user.first_name} ${booking.driver.user.last_name}`
                  : 'Not assigned'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={() => openDetailsModal(booking)}
            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <div className="relative flex-shrink-0">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  openStatusModal(booking, e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-32"
            >
              <option value="">Status</option>
              {statusUpdateOptions
                .filter((option) => option.value !== booking.status)
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Booking Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Monitor and manage all bookings in the system
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Total: {totalBookings} bookings
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by booking number, address..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 text-gray-700 placeholder:text-gray-300 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center justify-center space-x-2 whitespace-nowrap flex-shrink-0"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
              {showFilters ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200">
              {/* First row of filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-4">
                <Select
                  label="Status"
                  name="statusFilter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={statusOptions}
                />

                <Input
                  label="From Date"
                  name="dateFromFilter"
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => {
                    setDateFromFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <Input
                  label="To Date"
                  name="dateToFilter"
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => {
                    setDateToFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <Select
                  label="Sort By"
                  name="sortBy"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={sortOptions}
                />

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setCurrentPage(1);
                    }}
                    className="btn-secondary w-full flex items-center justify-center space-x-1"
                  >
                    <span className="text-sm">
                      {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                    </span>
                  </button>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn-secondary w-full"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 break-words">
              Showing {bookings.length} of {totalBookings} bookings
              {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
              {statusFilter && ` with status "${statusFilter}"`}
              {dateFromFilter &&
                ` from ${formatDate(dateFromFilter, 'MMM dd, yyyy')}`}
              {dateToFilter &&
                ` to ${formatDate(dateToFilter, 'MMM dd, yyyy')}`}
            </p>
          </div>
        </div>

        {/* Bookings Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {debouncedSearchTerm ||
                statusFilter ||
                dateFromFilter ||
                dateToFilter
                  ? 'Try adjusting your search or filters'
                  : 'No bookings available'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="block lg:hidden">
                <div className="p-4 space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                          Booking
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-28">
                          Driver
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                          Route
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-[12px]">
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {booking.booking_number}
                              </div>
                              <div className="text-gray-500 truncate">
                                {formatDate(
                                  booking.created_at,
                                  'MMM dd, yyyy HH:mm'
                                )}
                              </div>
                              {booking.pickup_date && (
                                <div className="text-xs text-gray-400 truncate">
                                  Pickup:{' '}
                                  {formatDate(
                                    booking.pickup_date,
                                    'MMM dd, HH:mm'
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[12px]">
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {booking.customer
                                  ? `${booking.customer.first_name} ${booking.customer.last_name}`
                                  : 'No customer'}
                              </div>
                              {booking.customer && (
                                <>
                                  <div className="text-gray-500 truncate">
                                    {booking.customer.email}
                                  </div>
                                  <div className="text-gray-500 truncate">
                                    {booking.customer.phone}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[12px]">
                            <div className="min-w-0">
                              {booking.driver ? (
                                <>
                                  <div className="font-medium text-gray-900 truncate">
                                    {booking.driver.user.first_name}{' '}
                                    {booking.driver.user.last_name}
                                  </div>
                                  <div className="text-gray-500 truncate">
                                    {booking.driver.user.phone}
                                  </div>
                                </>
                              ) : (
                                <span className="text-gray-400 italic text-[12px]">
                                  Not assigned
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[12px]">
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-start space-x-1">
                                <MapPinIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span
                                  className="text-[12px] text-gray-900 truncate block"
                                  title={booking.pickup_address}
                                >
                                  {booking.pickup_address}
                                </span>
                              </div>
                              <div className="flex items-start space-x-1">
                                <MapPinIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span
                                  className="text-[12px] text-gray-900 truncate block"
                                  title={booking.dropoff_address}
                                >
                                  {booking.dropoff_address}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 truncate">
                                {formatStatusText(booking.status)}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[12px] font-medium text-gray-900">
                            {formatCurrency(booking.total_price)}
                          </td>
                          <td className="px-4 py-4 text-right text-sm">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openDetailsModal(booking)}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <div className="relative">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      openStatusModal(booking, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  className="text-xs border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-24"
                                >
                                  <option value="">Status</option>
                                  {statusUpdateOptions
                                    .filter(
                                      (option) =>
                                        option.value !== booking.status
                                    )
                                    .map((option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalBookings)} of{' '}
                {totalBookings} bookings
              </div>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span className="text-xs sm:text-sm text-gray-700 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        <Modal
          isOpen={statusModal.isOpen}
          onClose={closeStatusModal}
          title={`Update Booking Status`}
          size="md"
        >
          <div className="space-y-4">
            {/* Status Change Info */}
            <div className="flex items-start space-x-3 p-4 rounded-lg border bg-blue-50 border-blue-200">
              <ExclamationTriangleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Change Booking Status
                </h4>
                <p className="text-sm mt-1 text-blue-700">
                  {statusModal.booking && statusModal.newStatus && (
                    <>
                      Changing status from{' '}
                      <strong>
                        {formatStatusText(statusModal.booking.status)}
                      </strong>{' '}
                      to{' '}
                      <strong>{formatStatusText(statusModal.newStatus)}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Booking Info */}
            {statusModal.booking && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Booking Information:
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Booking Number:</strong>{' '}
                    {statusModal.booking.booking_number}
                  </p>
                  <p>
                    <strong>Customer:</strong>{' '}
                    {statusModal.booking.customer
                      ? `${statusModal.booking.customer.first_name} ${statusModal.booking.customer.last_name}`
                      : 'No customer assigned'}
                  </p>
                  <p>
                    <strong>Driver:</strong>{' '}
                    {statusModal.booking.driver
                      ? `${statusModal.booking.driver.user.first_name} ${statusModal.booking.driver.user.last_name}`
                      : 'Not assigned'}
                  </p>
                  <p>
                    <strong>Amount:</strong>{' '}
                    {formatCurrency(statusModal.booking.total_amount)}
                  </p>
                  <p>
                    <strong>Current Status:</strong>{' '}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        statusModal.booking.status
                      )}`}
                    >
                      {formatStatusText(statusModal.booking.status)}
                    </span>
                  </p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {formatDate(
                      statusModal.booking.created_at,
                      'MMM dd, yyyy HH:mm'
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Special warnings for certain status changes */}
            {statusModal.newStatus === 'cancelled' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Cancellation Notice</p>
                    <p>
                      This will cancel the booking. The customer and driver (if
                      assigned) will be notified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {statusModal.newStatus === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-700">
                    <p className="font-medium">Completion Notice</p>
                    <p>
                      This will mark the booking as completed. Final payment
                      processing will be triggered.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reason Input */}
            <div>
              <Textarea
                label="Reason for Status Change"
                name="reason"
                value={statusModal.reason}
                onChange={(e) =>
                  setStatusModal((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                placeholder={`Please provide a reason for changing status to ${statusModal.newStatus} (optional)`}
                rows={3}
                helperText="This reason will be logged and may be shared with customer/driver"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={closeStatusModal}
                disabled={statusModal.loading}
                className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={statusModal.loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto order-1 sm:order-2"
              >
                {statusModal.loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Update Status</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Booking Details Modal */}
        <Modal
          isOpen={detailsModal.isOpen}
          onClose={closeDetailsModal}
          title="Booking Details"
          size="lg"
        >
          {detailsModal.booking && (
            <div className="space-y-6">
              {/* Booking Header */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {detailsModal.booking.booking_number}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Created{' '}
                    {formatDate(
                      detailsModal.booking.created_at,
                      'MMMM dd, yyyy'
                    )}{' '}
                    at {formatDate(detailsModal.booking.created_at, 'HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      detailsModal.booking.status
                    )}`}
                  >
                    {getStatusIcon(detailsModal.booking.status)}
                    <span className="ml-2">
                      {formatStatusText(detailsModal.booking.status)}
                    </span>
                  </span>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(detailsModal.booking.total_amount)}
                  </p>
                </div>
              </div>

              {/* Booking Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Customer Information
                  </h4>
                  {detailsModal.booking.customer ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Name
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.booking.customer.first_name}{' '}
                          {detailsModal.booking.customer.last_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Email
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.booking.customer.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Phone
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.booking.customer.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No customer information available
                    </p>
                  )}
                </div>

                {/* Driver Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Driver Information
                  </h4>
                  {detailsModal.booking.driver ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Name
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.booking.driver.user.first_name}{' '}
                          {detailsModal.booking.driver.user.last_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Phone
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.booking.driver.user.phone}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Rating
                        </span>
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-900">
                            {parseFloat(
                              detailsModal.booking.driver.rating || 0
                            ).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No driver assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Route Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Route Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Pickup Location
                      </span>
                      <p className="text-sm text-gray-900">
                        {detailsModal.booking.pickup_address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Dropoff Location
                      </span>
                      <p className="text-sm text-gray-900">
                        {detailsModal.booking.dropoff_address}
                      </p>
                    </div>
                  </div>
                  {detailsModal.booking.distance && (
                    <div className="flex items-start space-x-3">
                      <TruckIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Distance
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.booking.distance} km
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Booking Details
                  </h4>
                  <div className="space-y-3">
                    {detailsModal.booking.pickup_date && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Scheduled Pickup
                        </span>
                        <p className="text-sm text-gray-900">
                          {formatDate(
                            detailsModal.booking.pickup_date,
                            'MMMM dd, yyyy HH:mm'
                          )}
                        </p>
                      </div>
                    )}
                    {detailsModal.booking.load_type && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Load Type
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.booking.load_type}
                        </p>
                      </div>
                    )}
                    {detailsModal.booking.special_instructions && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Special Instructions
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.booking.special_instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Pricing Breakdown
                  </h4>
                  <div className="space-y-3">
                    {detailsModal.booking.base_price && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Base Price
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(detailsModal.booking.base_price)}
                        </span>
                      </div>
                    )}
                    {detailsModal.booking.distance_price && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Distance Price
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(detailsModal.booking.distance_price)}
                        </span>
                      </div>
                    )}
                    {detailsModal.booking.additional_fees && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Additional Fees
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(detailsModal.booking.additional_fees)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(detailsModal.booking.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Booking Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(
                        detailsModal.booking.created_at,
                        'MMM dd, yyyy HH:mm'
                      )}
                    </span>
                  </div>
                  {detailsModal.booking.confirmed_at && (
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Confirmed:</span>
                      <span className="text-sm text-gray-900">
                        {formatDate(
                          detailsModal.booking.confirmed_at,
                          'MMM dd, yyyy HH:mm'
                        )}
                      </span>
                    </div>
                  )}
                  {detailsModal.booking.completed_at && (
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Completed:</span>
                      <span className="text-sm text-gray-900">
                        {formatDate(
                          detailsModal.booking.completed_at,
                          'MMM dd, yyyy HH:mm'
                        )}
                      </span>
                    </div>
                  )}
                  {detailsModal.booking.cancelled_at && (
                    <div className="flex items-center space-x-3">
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">Cancelled:</span>
                      <span className="text-sm text-gray-900">
                        {formatDate(
                          detailsModal.booking.cancelled_at,
                          'MMM dd, yyyy HH:mm'
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cancellation reason if cancelled */}
              {detailsModal.booking.status === 'cancelled' &&
                detailsModal.booking.cancellation_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      Cancellation Reason
                    </h4>
                    <p className="text-sm text-red-700">
                      {detailsModal.booking.cancellation_reason}
                    </p>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        closeDetailsModal();
                        openStatusModal(detailsModal.booking, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Change Status</option>
                    {statusUpdateOptions
                      .filter(
                        (option) => option.value !== detailsModal.booking.status
                      )
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
