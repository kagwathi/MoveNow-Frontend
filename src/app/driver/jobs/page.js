'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { driverAPI } from '@/lib/api';
import VehicleSetup from '@/components/driver/VehicleSetup';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/common/Toast';

export default function AvailableJobs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleSetup, setShowVehicleSetup] = useState(false);
  const [filters, setFilters] = useState({
    radius: 10,
    vehicle_types: [],
    limit: 20,
    offset: 0,
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();

  const vehicleTypes = [
    'pickup',
    'van',
    'small_truck',
    'medium_truck',
    'large_truck',
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      fetchAvailableJobs();
    }
  }, [
    filters.radius,
    filters.vehicle_types,
    filters.limit,
    filters.offset,
    vehicles,
  ]);

  const fetchVehicles = async () => {
    try {
      const response = await driverAPI.getVehicles();
      const driverVehicles = response.data.data.vehicles || [];
      setVehicles(driverVehicles);

      if (driverVehicles.length === 0) {
        setShowVehicleSetup(true);
        setError(
          'You need to register at least one vehicle before you can see available jobs.'
        );
      } else {
        // If we have vehicles, don't show the setup by default
        setShowVehicleSetup(false);
        setError(null);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchAvailableJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await driverAPI.getAvailableJobs(filters);
      const data = response.data.data;

      if (filters.offset === 0) {
        setJobs(data.jobs || []);
      } else {
        setJobs((prev) => [...prev, ...(data.jobs || [])]);
      }

      setTotal(data.total || 0);
      setHasMore(data.has_more || false);

      // Handle special case when driver status is not available (from backend message)
      if (response.data.message && data.jobs.length === 0) {
        setError({
          type: 'warning',
          title: 'Status Notice',
          message: response.data.message,
          actionable: true,
        });
      }
    } catch (error) {
      console.error('Failed to fetch available jobs:', error);

      if (error.response) {
        const { status, data } = error.response;
        const { code, message } = data;

        switch (code) {
          case 'DRIVER_NOT_FOUND':
            setError({
              type: 'error',
              title: 'Profile Not Found',
              message: message,
              actionable: false,
              suggestion: 'Please contact support for assistance.',
            });
            break;

          case 'NO_ACTIVE_VEHICLE':
            setError({
              type: 'warning',
              title: 'No Active Vehicles',
              message: message,
              actionable: true,
              suggestion:
                'Add a vehicle or activate an existing one to start accepting jobs.',
            });
            setShowVehicleSetup(true);
            break;

          case 'DRIVER_NOT_APPROVED':
            setError({
              type: 'info',
              title: 'Account Pending Approval',
              message: message,
              actionable: false,
              suggestion:
                'You will receive an email notification once your account is approved.',
            });
            break;

          case 'SERVER_ERROR':
          default:
            setError({
              type: 'error',
              title: 'Unable to Load Jobs',
              message:
                message || 'An unexpected error occurred while loading jobs.',
              actionable: true,
              suggestion:
                'Please try refreshing the page or contact support if the issue persists.',
            });
            break;
        }
      } else {
        // Network or other errors
        setError({
          type: 'error',
          title: 'Connection Error',
          message:
            'Unable to connect to the server. Please check your internet connection.',
          actionable: true,
          suggestion:
            'Try refreshing the page or check your network connection.',
        });
      }

      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleAdded = () => {
    setShowVehicleSetup(false);
    fetchVehicles();
  };

  const handleAcceptJob = async (jobId) => {
    try {
      setAccepting(jobId);
      await driverAPI.acceptJob(jobId);

      // Remove the accepted job from the list
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      setTotal((prev) => prev - 1);

      toast.success(
        'Job accepted successfully! Check your current job status.'
      );
    } catch (error) {
      console.error('Failed to accept job:', error);
      alert(
        error.response?.data?.message ||
          'Failed to accept job. Please try again.'
      );
    } finally {
      setAccepting(null);
    }
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

  const getVehicleTypeLabel = (type) => {
    const labels = {
      pickup: 'Pickup Truck',
      van: 'Van',
      small_truck: 'Small Truck',
      medium_truck: 'Medium Truck',
      large_truck: 'Large Truck',
    };
    return labels[type] || type;
  };

  const getLoadTypeColor = (loadType) => {
    const colors = {
      furniture: 'bg-blue-100 text-blue-800',
      appliances: 'bg-green-100 text-green-800',
      boxes: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[loadType] || colors.other;
  };

  const formatDistance = (distance) => {
    if (distance === null) return 'Distance N/A';
    return `${distance} km away`;
  };

  const formatTravelTime = (time) => {
    if (time === null) return '';
    return `~${time} min drive`;
  };

  const ErrorDisplay = ({ error, onRetry, onAddVehicle }) => {
    const getErrorStyles = (type) => {
      const styles = {
        error: {
          bg: 'bg-red-50 border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700',
          suggestionColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
          bg: 'bg-yellow-50 border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700',
          suggestionColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        },
        info: {
          bg: 'bg-blue-50 border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700',
          suggestionColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        },
      };
      return styles[type] || styles.error;
    };

    const styles = getErrorStyles(error.type);

    return (
      <div className={`${styles.bg} border rounded-lg p-6`}>
        <div className="flex items-start">
          <div className={`p-2 ${styles.iconBg} rounded-lg`}>
            <ExclamationTriangleIcon
              className={`h-6 w-6 ${styles.iconColor}`}
            />
          </div>
          <div className="ml-4 flex-1">
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {error.title}
            </h3>
            <p className={`${styles.messageColor} mt-1`}>{error.message}</p>
            {error.suggestion && (
              <p className={`text-sm ${styles.suggestionColor} mt-2`}>
                💡 {error.suggestion}
              </p>
            )}

            {error.actionable && (
              <div className="mt-4 flex space-x-3">
                {error.type === 'warning' &&
                error.title === 'No Active Vehicles' ? (
                  <button
                    onClick={onAddVehicle}
                    className={`${styles.buttonColor} text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
                  >
                    <TruckIcon className="h-4 w-4" />
                    <span>Add Vehicle</span>
                  </button>
                ) : (
                  <button
                    onClick={onRetry}
                    className={`${styles.buttonColor} text-white px-4 py-2 rounded-lg transition-colors`}
                  >
                    Try Again
                  </button>
                )}

                {error.type === 'warning' &&
                  error.title === 'Status Notice' && (
                    <button
                      onClick={() =>
                        (window.location.href = '/driver/dashboard')
                      }
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show vehicle setup if no vehicles
  if (showVehicleSetup && vehicles.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vehicle Registration Required
          </h1>
          <p className="text-gray-600 mt-1">
            You need to register at least one vehicle to start accepting jobs.
          </p>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <VehicleSetup onVehicleAdded={handleVehicleAdded} />
      </div>
    );
  }

  {
    error && (
      <ErrorDisplay
        error={error}
        onRetry={fetchAvailableJobs}
        onAddVehicle={() => setShowVehicleSetup(true)}
      />
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Available Jobs</h1>
          <p className="text-gray-600 mt-1">
            {total} jobs available in your area
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={fetchAvailableJobs}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-600 text-white rounded-lg px-4 py-2 hover:bg-gray-700 disabled:opacity-50"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setShowVehicleSetup(true)}
            className="flex items-center space-x-2 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
          >
            <TruckIcon className="h-4 w-4" />
            <span>Add Vehicle</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {!error && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">
                Status: Available for Jobs
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Setup Modal */}
      {showVehicleSetup && vehicles.length > 0 && (
        <div className="fixed inset-0 bg-black/50 h-screen flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Add New Vehicle
                </h2>
                <button
                  onClick={() => setShowVehicleSetup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <VehicleSetup onVehicleAdded={handleVehicleAdded} />
            </div>
          </div>
        </div>
      )}

      {/* Current Vehicles Display */}
      {vehicles.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Vehicles ({vehicles.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                  <p className="text-sm text-gray-600">
                    {getVehicleTypeLabel(vehicle.vehicle_type)} •{' '}
                    {vehicle.license_plate} • {vehicle.color}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    vehicle.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {vehicle.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Jobs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {filters.radius} km
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={filters.radius}
                onChange={(e) =>
                  handleFilterChange('radius', parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Vehicle Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Types
              </label>
              <div className="space-y-2">
                {vehicleTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.vehicle_types.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('vehicle_types', [
                            ...filters.vehicle_types,
                            type,
                          ]);
                        } else {
                          handleFilterChange(
                            'vehicle_types',
                            filters.vehicle_types.filter((t) => t !== type)
                          );
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {getVehicleTypeLabel(type)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => {
                setFilters({
                  radius: 10,
                  vehicle_types: [],
                  limit: 20,
                  offset: 0,
                });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-yellow-900">Notice</h3>
              <p className="text-yellow-700 mt-1">{error}</p>
              {error.includes('available') && (
                <p className="text-sm text-yellow-600 mt-2">
                  Make sure your status is set to &apos;Available&apos; in the
                  dashboard to see jobs.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TruckIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.booking_number}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getLoadTypeColor(
                            job.load_type
                          )}`}
                        >
                          {job.load_type}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {getVehicleTypeLabel(job.vehicle_type_required)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="space-y-2 mb-4">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(job.pickup_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="text-sm font-medium text-gray-900">
                          {job.estimated_distance} km
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Payment</p>
                        <p className="text-sm font-medium text-gray-900">
                          KES {job.total_price?.toLocaleString()}
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
                  </div>

                  {/* Distance from driver */}
                  {job.distance_from_driver !== null && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span>{formatDistance(job.distance_from_driver)}</span>
                      {job.estimated_travel_time && (
                        <span>
                          • {formatTravelTime(job.estimated_travel_time)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Special Instructions */}
                  {job.special_instructions && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Special Instructions:
                      </p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {job.special_instructions}
                      </p>
                    </div>
                  )}

                  {/* Helpers Required */}
                  {job.requires_helpers && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        {job.helpers_count} Helper
                        {job.helpers_count !== 1 ? 's' : ''} Required
                      </span>
                    </div>
                  )}
                </div>

                {/* Accept Button */}
                <div className="ml-6">
                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    disabled={accepting === job.id}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px] justify-center"
                  >
                    {accepting === job.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Accepting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Accept Job</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : !loading && !error ? (
          <div className="text-center py-12">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs available
            </h3>
            <p className="text-gray-600">
              Check back later or adjust your filters to see more jobs.
            </p>
          </div>
        ) : null}
      </div>

      {/* Load More Button */}
      {hasMore && (
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
    </div>
  );
}
