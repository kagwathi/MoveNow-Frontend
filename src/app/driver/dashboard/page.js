'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { driverAPI, authAPI } from '@/lib/api';
import {
  TruckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [stats, setStats] = useState({
    availableJobs: 0,
    currentJob: null,
    todayEarnings: 0,
    weekEarnings: 0,
    completedTrips: 0,
    rating: 0,
  });
  const [availabilityStatus, setAvailabilityStatus] = useState('offline');
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, fetch driver profile to check status
      const profileRes = await authAPI.getProfile();
      const profile = profileRes.data.data.user;
      setDriverProfile(profile);

      // Check if driver profile exists at all
      if (!profile.driverProfile) {
        setError({
          type: 'no_profile',
          message: 'You need to create your driver profile to start earning.',
          action: 'Create Driver Profile',
        });
        setLoading(false);
        return;
      }

      // Set availability status from the fetched driver profile
      setAvailabilityStatus(
        profile.driverProfile?.availability_status || 'offline'
      );

      // Check if driver profile is pending approval
      if (!profile.driverProfile?.is_approved) {
        setError({
          type: 'pending_approval',
          message:
            'Your driver profile is under review. Please wait for admin approval.',
          submittedDate: profile.driverProfile?.createdAt,
          documentsVerified: profile.driverProfile?.documents_verified,
        });
        setLoading(false);
        return;
      }

      // If approved, fetch dashboard data
      await fetchDashboardData(profile);
    } catch (error) {
      console.error('Failed to fetch driver profile:', error);
      setError({
        type: 'fetch_error',
        message: 'Failed to load profile information. Please try again.',
      });
      setLoading(false);
    }
  };

  const fetchDashboardData = async (profile = driverProfile) => {
    try {
      // Fetch data with individual error handling
      const results = await Promise.allSettled([
        driverAPI.getAvailableJobs({ limit: 1 }),
        driverAPI.getCurrentJob(),
        driverAPI.getEarnings({ period: 'week' }),
        driverAPI.getJobHistory({ limit: 5 }),
      ]);

      // Process results
      const [availableJobsRes, currentJobRes, weekEarningsRes, historyRes] =
        results;

      // Set stats with fallbacks
      setStats({
        availableJobs:
          availableJobsRes.status === 'fulfilled'
            ? availableJobsRes.value.data.data.total || 0
            : 0,
        currentJob:
          currentJobRes.status === 'fulfilled'
            ? currentJobRes.value.data.data.job
            : null,
        todayEarnings: 0, // Will be calculated from week data
        weekEarnings:
          weekEarningsRes.status === 'fulfilled'
            ? weekEarningsRes.value.data.data?.total_earnings || 0
            : 0,
        completedTrips:
          weekEarningsRes.status === 'fulfilled'
            ? weekEarningsRes.value.data.data?.total_jobs || 0
            : 0,
        rating: parseFloat(profile?.driverProfile?.rating || 0),
      });

      setRecentJobs(
        historyRes.status === 'fulfilled'
          ? historyRes.value.data.data.jobs || []
          : []
      );

      // Check for any failed requests
      const failedRequests = results.filter(
        (result) => result.status === 'rejected'
      );
      if (failedRequests.length > 0) {
        console.warn('Some requests failed:', failedRequests);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (newStatus) => {
    try {
      await driverAPI.updateAvailability(newStatus);
      setAvailabilityStatus(newStatus);

      // Update the driver profile state
      setDriverProfile((prev) => ({
        ...prev,
        driverProfile: {
          ...prev.driverProfile,
          availability_status: newStatus,
        },
      }));
    } catch (error) {
      console.error('Failed to update availability:', error);
      // alert('Failed to update availability status. Please try again.');
    }
  };

  const getAvailabilityColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      busy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      offline: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || colors.offline;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      in_transit: 'bg-blue-100 text-blue-800',
      accepted: 'bg-yellow-100 text-yellow-800',
      driver_en_route: 'bg-blue-100 text-blue-800',
      arrived_pickup: 'bg-orange-100 text-orange-800',
      loading: 'bg-purple-100 text-purple-800',
      arrived_destination: 'bg-indigo-100 text-indigo-800',
      unloading: 'bg-pink-100 text-pink-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* No Driver Profile Created */}
        {error.type === 'no_profile' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-blue-900">
                  Complete Your Driver Setup
                </h3>
                <p className="text-blue-700 mt-1">{error.message}</p>
                <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    What&apos;s Next:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Create your driver profile with vehicle details</li>
                    <li>
                      • Upload required documents (license, insurance, etc.)
                    </li>
                    <li>• Wait for admin approval (usually 24-48 hours)</li>
                    <li>• Start accepting jobs and earning money!</li>
                  </ul>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() =>
                      (window.location.href = '/driver/profile/setup')
                    }
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {error.action}
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = '/help/driver-setup')
                    }
                    className="bg-white text-blue-600 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Need Help?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approval */}
        {error.type === 'pending_approval' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-yellow-900">
                  Profile Under Review
                </h3>
                <p className="text-yellow-700 mt-1">{error.message}</p>

                <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-yellow-900">
                        Application Status:
                      </p>
                      <p className="text-yellow-700">Pending Admin Review</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">
                        Submitted Date:
                      </p>
                      <p className="text-yellow-700">
                        {error.submittedDate
                          ? new Date(error.submittedDate).toLocaleDateString()
                          : 'Recently'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">
                        Documents Status:
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          error.documentsVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {error.documentsVerified ? 'Verified' : 'Under Review'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">
                        Expected Timeline:
                      </p>
                      <p className="text-yellow-700">24-48 hours</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
                  <p className="text-sm text-yellow-800">
                    <strong>What happens next?</strong>
                    <br />
                    Our admin team is reviewing your profile and documents.
                    You&apos;ll receive an email notification once your account
                    is approved and you can start accepting jobs.
                  </p>
                </div>

                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => (window.location.href = '/driver/profile')}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    View My Profile
                  </button>
                  <button
                    onClick={() => (window.location.href = '/contact-support')}
                    className="bg-white text-yellow-600 border border-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors"
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-white text-yellow-600 border border-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors"
                  >
                    Refresh Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Fetch Error */}
        {error.type === 'fetch_error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-900">
                  Connection Error
                </h3>
                <p className="text-red-700 mt-1">{error.message}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {driverProfile?.first_name}!
            </h1>
            <p className="text-blue-100 mt-1">
              Ready to earn some money today?
            </p>
            {driverProfile?.driverProfile && (
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-blue-100">
                  Rating:{' '}
                  {parseFloat(driverProfile.driverProfile.rating).toFixed(1)}
                  /5.0 ({driverProfile.driverProfile.total_ratings} reviews)
                </span>
                <span className="text-sm text-blue-100">
                  Total Trips: {driverProfile.driverProfile.total_trips}
                </span>
                <span className="text-sm text-blue-100">
                  Experience: {driverProfile.driverProfile.experience_years}{' '}
                  years
                </span>
              </div>
            )}
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Status:</span>
            <select
              value={availabilityStatus}
              onChange={(e) => handleAvailabilityChange(e.target.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium text-black ${getAvailabilityColor(
                availabilityStatus
              )}`}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Driver Approval Status */}
      {driverProfile?.driverProfile?.is_approved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="ml-2 text-sm font-medium text-green-800">
              Driver Account Approved - You can now accept jobs!
            </span>
            {driverProfile.driverProfile.approval_date && (
              <span className="ml-4 text-xs text-green-600">
                Approved on{' '}
                {new Date(
                  driverProfile.driverProfile.approval_date
                ).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Driver Details Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Driver Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">License Number</p>
            <p className="font-medium text-gray-900">
              {driverProfile?.driverProfile?.license_number}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">License Expiry</p>
            <p className="font-medium text-gray-900">
              {new Date(
                driverProfile?.driverProfile?.license_expiry
              ).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Documents Status</p>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                driverProfile?.driverProfile?.documents_verified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {driverProfile?.driverProfile?.documents_verified
                ? 'Verified'
                : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Available Jobs
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.availableJobs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                This Week&apos;s Earnings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                KES {stats.weekEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Completed Trips
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedTrips}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.rating.toFixed(1)}/5.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Job Alert */}
      {stats.currentJob && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-orange-900">
                You have an active job
              </h3>
              <p className="text-orange-700 mt-1">
                {stats.currentJob.pickup_address} →{' '}
                {stats.currentJob.dropoff_address}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    stats.currentJob.status
                  )}`}
                >
                  {stats.currentJob.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-orange-600">
                  KES {stats.currentJob.total_price?.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = '/driver/current-job')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Earnings */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            This Week&apos;s Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Earnings</span>
              <span className="font-semibold text-gray-900">
                KES {stats.weekEarnings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Jobs</span>
              <span className="font-semibold text-gray-900">
                {stats.completedTrips}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average per Job</span>
              <span className="font-semibold text-gray-900">
                KES{' '}
                {stats.completedTrips > 0
                  ? Math.round(
                      stats.weekEarnings / stats.completedTrips
                    ).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Jobs
          </h3>
          <div className="space-y-3">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {job.booking_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {job.pickup_address?.substring(0, 30)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      KES {job.total_price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent jobs</p>
            )}
          </div>
          {recentJobs.length > 0 && (
            <button
              onClick={() => (window.location.href = '/driver/history')}
              className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All Jobs →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
