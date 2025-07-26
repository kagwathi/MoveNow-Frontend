'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bookingAPI } from '@/lib/api';
import {
  formatCurrency,
  formatTimeAgo,
  getStatusColor,
  formatStatus,
} from '@/lib/utils';
import Link from 'next/link';
import {
  PlusIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_bookings: 0,
    active_bookings: 0,
    completed_bookings: 0,
    total_spent: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch recent bookings
      const bookingsResponse = await bookingAPI.getAll({ limit: 5 });
      const bookings = bookingsResponse.data.data.bookings;
      setRecentBookings(bookings);

      // Calculate stats
      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(
        (b) => !['completed', 'cancelled'].includes(b.status)
      ).length;
      const completedBookings = bookings.filter(
        (b) => b.status === 'completed'
      ).length;
      const totalSpent = bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + b.total_price, 0);

      setStats({
        total_bookings: totalBookings,
        active_bookings: activeBookings,
        completed_bookings: completedBookings,
        total_spent: totalSpent,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to move? Book your next transport service.
          </p>
        </div>
        <Link
          href="/customer/book-move"
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Book a Move</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total_bookings}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.active_bookings}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TruckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed_bookings}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 font-bold">KSh</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.total_spent)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Bookings
          </h2>
          <Link
            href="/customer/bookings"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by booking your first move
            </p>
            <Link href="/customer/book-move" className="btn-primary">
              Book Your First Move
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        #{booking.booking_number}
                      </h3>
                      <span
                        className={`status-badge ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="truncate">
                        {booking.pickup_address} → {booking.dropoff_address}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatTimeAgo(booking.created_at)}</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(booking.total_price)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/customer/bookings/${booking.id}`}
                    className="ml-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/customer/book-move"
          className="card hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Book a Move</h3>
            <p className="text-gray-600 text-sm">
              Schedule your next moving service
            </p>
          </div>
        </Link>

        <Link
          href="/customer/bookings"
          className="card hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Track Bookings</h3>
            <p className="text-gray-600 text-sm">
              Monitor your active bookings
            </p>
          </div>
        </Link>

        <div className="card hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Get Support</h3>
            <p className="text-gray-600 text-sm">Contact our support team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
