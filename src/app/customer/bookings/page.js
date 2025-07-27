'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import { bookingAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Input, Select } from '@/components/common/FormInput';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarIcon,
  TruckIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

export default function ViewBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();
  const toast = useToast();

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'driver_assigned', label: 'Driver Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
  ];

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Apply filters when bookings, search, or filters change
  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAll();

      if (response.data.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.pickup_address
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.dropoff_address
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.pickup_date);

        switch (dateFilter) {
          case 'today':
            return bookingDate.toDateString() === now.toDateString();
          case 'this_week':
            const weekStart = new Date(
              now.setDate(now.getDate() - now.getDay())
            );
            return bookingDate >= weekStart;
          case 'this_month':
            return (
              bookingDate.getMonth() === now.getMonth() &&
              bookingDate.getFullYear() === now.getFullYear()
            );
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            return (
              bookingDate.getMonth() === lastMonth.getMonth() &&
              bookingDate.getFullYear() === lastMonth.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      driver_assigned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: ClockIcon,
      confirmed: CheckCircleIcon,
      driver_assigned: TruckIcon,
      in_progress: MapPinIcon,
      completed: CheckCircleIcon,
      cancelled: XMarkIcon,
    };
    const Icon = icons[status] || ClockIcon;
    return <Icon className="h-4 w-4" />;
  };

  const handleViewBooking = (bookingId) => {
    router.push(`/customer/bookings/${bookingId}`);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await bookingAPI.cancel(bookingId);

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings(); // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Cancel booking error:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your move bookings
          </p>
        </div>
        <button
          onClick={() => router.push('/customer/book-move')}
          className="btn-primary"
        >
          New Booking
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Status"
                name="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
              />

              <Select
                label="Date Range"
                name="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                options={dateOptions}
              />

              <div className="flex items-end">
                <button onClick={clearFilters} className="btn-secondary w-full">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div
          key={bookings.length}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
        >
          <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {bookings.length === 0 ? 'No bookings yet' : 'No bookings found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {bookings.length === 0
              ? 'Start by creating your first booking'
              : 'Try adjusting your search or filters'}
          </p>
          {bookings.length === 0 && (
            <button
              onClick={() => router.push('/customer/book-move')}
              className="btn-primary"
            >
              Book Your First Move
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  {/* Booking Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        #{booking.booking_number}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">
                            {booking.status.replace('_', ' ')}
                          </span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatCurrency(booking.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          From
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.pickup_address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">To</p>
                        <p className="text-sm text-gray-600">
                          {booking.dropoff_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {formatDate(booking.pickup_date)} at{' '}
                        {formatTime(booking.pickup_time)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <TruckIcon className="h-4 w-4" />
                      <span className="capitalize">
                        {booking.vehicle_type_required?.replace('_', ' ')}
                      </span>
                    </div>

                    {booking.calculated_distance && (
                      <div className="flex items-center space-x-2">
                        <span>{booking.calculated_distance.toFixed(1)} km</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                  <button
                    onClick={() => handleViewBooking(booking._id)}
                    className="btn-secondary flex items-center justify-center space-x-2 min-w-32"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View Details</span>
                  </button>

                  {(booking.status === 'pending' ||
                    booking.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn-outline-red flex items-center justify-center space-x-2 min-w-32"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
