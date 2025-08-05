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
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/common/Toast';

export default function CurrentJob() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const toast = useToast();

  // Status workflow definitions
  const statusWorkflow = {
    accepted: {
      label: 'Job Accepted',
      next: 'driver_en_route',
      nextLabel: 'Start Journey to Pickup',
      color: 'bg-yellow-100 text-yellow-800',
      description:
        'Job has been accepted. Start your journey to the pickup location.',
    },
    driver_en_route: {
      label: 'En Route to Pickup',
      next: 'arrived_pickup',
      nextLabel: 'Arrive at Pickup',
      color: 'bg-blue-100 text-blue-800',
      description: 'Driver is on the way to pickup location.',
    },
    arrived_pickup: {
      label: 'Arrived at Pickup',
      next: 'loading',
      nextLabel: 'Start Loading',
      color: 'bg-orange-100 text-orange-800',
      description:
        'Driver has arrived at pickup location. Ready to load items.',
    },
    loading: {
      label: 'Loading Items',
      next: 'in_transit',
      nextLabel: 'Start Transit',
      color: 'bg-purple-100 text-purple-800',
      description: 'Items are being loaded onto the vehicle.',
    },
    in_transit: {
      label: 'In Transit',
      next: 'arrived_destination',
      nextLabel: 'Arrive at Destination',
      color: 'bg-indigo-100 text-indigo-800',
      description: 'Items are loaded and vehicle is en route to destination.',
    },
    arrived_destination: {
      label: 'Arrived at Destination',
      next: 'unloading',
      nextLabel: 'Start Unloading',
      color: 'bg-pink-100 text-pink-800',
      description: 'Driver has arrived at the destination.',
    },
    unloading: {
      label: 'Unloading Items',
      next: 'completed',
      nextLabel: 'Complete Job',
      color: 'bg-green-100 text-green-800',
      description: 'Items are being unloaded at the destination.',
    },
  };

  useEffect(() => {
    fetchCurrentJob();
  }, []);

  const fetchCurrentJob = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await driverAPI.getCurrentJob();
      const job = response.data.data.job;

      setCurrentJob(job);

      if (!job) {
        setError({
          type: 'info',
          title: 'No Active Job',
          message: "You don't currently have any active jobs.",
          suggestion:
            'Check the Available Jobs page to find new opportunities.',
        });
      }
    } catch (error) {
      console.error('Failed to fetch current job:', error);
      setError({
        type: 'error',
        title: 'Unable to Load Job',
        message: 'Failed to load your current job details.',
        suggestion: 'Please try refreshing the page.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);

      await driverAPI.updateJobStatus(currentJob.id, { status: newStatus });

      // Refresh the job data
      await fetchCurrentJob();

      // Show success message
      const statusInfo = statusWorkflow[newStatus];
      toast.info(`Status updated to: ${statusInfo?.label || newStatus}`);
    } catch (error) {
      console.error('Failed to update job status:', error);
      // alert(error.response?.data?.message || 'Failed to update job status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelJob = async () => {
    if (!cancellationReason.trim()) {
      toast.info('Please provide a reason for cancellation');
      return;
    }

    try {
      setUpdating(true);

      await driverAPI.updateJobStatus(currentJob.id, {
        status: 'cancelled',
        cancellation_reason: cancellationReason,
      });

      setShowCancelModal(false);
      setCancellationReason('');

      // Refresh to show no current job
      await fetchCurrentJob();

      toast.success('Job has been cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel job:', error);
      // alert(error.response?.data?.message || 'Failed to cancel job');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusInfo = (status) => {
    return (
      statusWorkflow[status] || {
        label: status,
        color: 'bg-gray-100 text-gray-800',
        description: 'Unknown status',
      }
    );
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Current Job</h1>
          <p className="text-gray-600 mt-1">Manage your active job status</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900">
                {error.title}
              </h3>
              <p className="text-blue-700 mt-1">{error.message}</p>
              {error.suggestion && (
                <p className="text-sm text-blue-600 mt-2">
                  💡 {error.suggestion}
                </p>
              )}
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => (window.location.href = '/driver/jobs')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Available Jobs
                </button>
                <button
                  onClick={fetchCurrentJob}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentJob.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Current Job</h1>
          <p className="text-gray-600 mt-1">Manage your active job</p>
        </div>

        <button
          onClick={fetchCurrentJob}
          disabled={loading}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Job Details Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TruckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentJob.booking_number}
              </h2>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              KES {currentJob.total_price?.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Payment</p>
          </div>
        </div>

        {/* Status Description */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{statusInfo.description}</p>
        </div>

        {/* Route Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pickup Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Pickup Location
            </h3>
            <div className="pl-5">
              <p className="font-medium text-gray-900">
                {currentJob.pickup_address}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {formatDateTime(currentJob.pickup_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Dropoff Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              Drop-off Location
            </h3>
            <div className="pl-5">
              <p className="font-medium text-gray-900">
                {currentJob.dropoff_address}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {currentJob.estimated_distance} km
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Information
          </h3>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <UserIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {currentJob.customer?.first_name}{' '}
                  {currentJob.customer?.last_name}
                </p>
                <p className="text-sm text-gray-600">Customer</p>
              </div>
            </div>

            <a
              href={`tel:${currentJob.customer?.phone}`}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <PhoneIcon className="h-4 w-4" />
              <span>{currentJob.customer?.phone}</span>
            </a>
          </div>
        </div>

        {/* Vehicle Information */}
        {currentJob.vehicle && (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vehicle Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">
                {currentJob.vehicle.make} {currentJob.vehicle.model}
              </p>
              <p className="text-sm text-gray-600">
                {currentJob.vehicle.vehicle_type} •{' '}
                {currentJob.vehicle.license_plate}
              </p>
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {currentJob.special_instructions && (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Special Instructions
            </h3>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800">
                {currentJob.special_instructions}
              </p>
            </div>
          </div>
        )}

        {/* Helpers Required */}
        {currentJob.requires_helpers && (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-orange-800 font-medium">
                ⚠️ {currentJob.helpers_count} Helper
                {currentJob.helpers_count !== 1 ? 's' : ''} Required
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Job Actions
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Next Status Button */}
          {statusInfo.next && (
            <button
              onClick={() => handleStatusUpdate(statusInfo.next)}
              disabled={updating}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>{statusInfo.nextLabel}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          {/* Cancel Job Button */}
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={updating}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <XMarkIcon className="h-5 w-5" />
            <span>Cancel Job</span>
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cancel Job
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Please provide a reason for cancelling this job:
            </p>

            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows="3"
            />

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Keep Job
              </button>
              <button
                onClick={handleCancelJob}
                disabled={updating || !cancellationReason.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {updating ? 'Cancelling...' : 'Cancel Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
