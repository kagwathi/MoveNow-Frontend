'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { driverAPI, authAPI } from '@/lib/api';
import {
  UserCircleIcon,
  TruckIcon,
  DocumentTextIcon,
  StarIcon,
  PencilIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function DriverProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [driverProfile, setDriverProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [locationForm, setLocationForm] = useState({
    latitude: '',
    longitude: '',
    address: '',
  });

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: UserCircleIcon },
    { id: 'driver', label: 'Driver Details', icon: IdentificationIcon },
    { id: 'vehicles', label: 'My Vehicles', icon: TruckIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'settings', label: 'Settings', icon: PencilIcon },
  ];

  useEffect(() => {
    fetchProfile();
    fetchVehicles();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.getProfile();
      const profileData = response.data.data.user;

      setDriverProfile(profileData);
      setPersonalInfo({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
      });

      // Set current location if available
      if (profileData.driverProfile?.current_location_lat) {
        setLocationForm({
          latitude: profileData.driverProfile.current_location_lat,
          longitude: profileData.driverProfile.current_location_lng,
          address: profileData.driverProfile.current_address || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await driverAPI.getVehicles();
      setVehicles(response.data.data.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const handlePersonalInfoUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      // Update user info via auth API
      const response = await authAPI.updateProfile(personalInfo);

      setSuccess('Personal information updated successfully');
      updateUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to update personal info:', error);
      setError(
        error.response?.data?.message || 'Failed to update personal information'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      await authAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      setSuccess('Password changed successfully');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setShowPasswordChange(false);
    } catch (error) {
      console.error('Failed to change password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      await driverAPI.updateLocation({
        latitude: parseFloat(locationForm.latitude),
        longitude: parseFloat(locationForm.longitude),
        address: locationForm.address,
      });

      setSuccess('Location updated successfully');
      setShowLocationUpdate(false);
      await fetchProfile(); // Refresh profile
    } catch (error) {
      console.error('Failed to update location:', error);
      setError(error.response?.data?.message || 'Failed to update location');
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setUpdating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        setUpdating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to get your current location');
        setUpdating(false);
      }
    );
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </div>

        <button
          onClick={fetchProfile}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="ml-3 text-sm text-green-700">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {driverProfile?.first_name} {driverProfile?.last_name}
            </h2>
            <p className="text-blue-100 mt-1">{driverProfile?.email}</p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <StarIcon className="h-5 w-5 text-yellow-300" />
                <span>
                  {parseFloat(
                    driverProfile?.driverProfile?.rating || 0
                  ).toFixed(1)}{' '}
                  Rating
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TruckIcon className="h-5 w-5 text-blue-200" />
                <span>
                  {driverProfile?.driverProfile?.total_trips || 0} Trips
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-blue-200" />
                <span>
                  Member since {formatDate(driverProfile?.created_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`px-3 py-1 rounded-full text-sm text-center font-medium ${
                driverProfile?.driverProfile?.is_approved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {driverProfile?.driverProfile?.is_approved
                ? 'Approved'
                : 'Pending Approval'}
            </div>
            <p className="text-sm text-blue-100 mt-2">
              Joined {formatDate(driverProfile?.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>

              <form onSubmit={handlePersonalInfoUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={personalInfo.first_name}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={personalInfo.last_name}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Information'}
                </button>
              </form>
            </div>
          )}

          {/* Driver Details Tab */}
          {activeTab === 'driver' && driverProfile?.driverProfile && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Driver Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={driverProfile.driverProfile.license_number}
                        readOnly
                        className="flex-1 bg-gray-50 border text-gray-700 border-gray-300 rounded-lg px-3 py-2"
                      />
                      {driverProfile.driverProfile.documents_verified && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Expiry
                    </label>
                    <input
                      type="text"
                      value={formatDate(
                        driverProfile.driverProfile.license_expiry
                      )}
                      readOnly
                      className="w-full bg-gray-50 border text-gray-700 border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Years
                    </label>
                    <input
                      type="text"
                      value={`${driverProfile.driverProfile.experience_years} years`}
                      readOnly
                      className="w-full bg-gray-50 border text-gray-700 border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <StarIcon className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">
                        {parseFloat(driverProfile.driverProfile.rating).toFixed(
                          1
                        )}{' '}
                        / 5.0
                      </span>
                      <span className="text-gray-500">
                        ({driverProfile.driverProfile.total_ratings} reviews)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Trips
                    </label>
                    <input
                      type="text"
                      value={driverProfile.driverProfile.total_trips}
                      readOnly
                      className="w-full bg-gray-50 border text-gray-700 border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          driverProfile.driverProfile.is_approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {driverProfile.driverProfile.is_approved
                          ? 'Approved'
                          : 'Pending'}
                      </span>
                      {driverProfile.driverProfile.is_approved && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Location */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">
                    Current Location
                  </h4>
                  <button
                    onClick={() => setShowLocationUpdate(!showLocationUpdate)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Update Location
                  </button>
                </div>

                {driverProfile.driverProfile.current_location_lat ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {driverProfile.driverProfile.current_address ||
                            'Address not provided'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Lat:{' '}
                          {driverProfile.driverProfile.current_location_lat},
                          Lng:{' '}
                          {driverProfile.driverProfile.current_location_lng}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    No current location set
                  </p>
                )}

                {/* Location Update Form */}
                {showLocationUpdate && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <form onSubmit={handleLocationUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={locationForm.latitude}
                            onChange={(e) =>
                              setLocationForm((prev) => ({
                                ...prev,
                                latitude: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={locationForm.longitude}
                            onChange={(e) =>
                              setLocationForm((prev) => ({
                                ...prev,
                                longitude: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address (Optional)
                        </label>
                        <input
                          type="text"
                          value={locationForm.address}
                          onChange={(e) =>
                            setLocationForm((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          placeholder="Enter your current address"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={updating}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {updating
                            ? 'Getting Location...'
                            : 'Use Current Location'}
                        </button>

                        <button
                          type="submit"
                          disabled={updating}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Update Location
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowLocationUpdate(false)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  My Vehicles
                </h3>
                <button
                  onClick={() => (window.location.href = '/driver/jobs')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Vehicle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <TruckIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {vehicle.make} {vehicle.model}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {getVehicleTypeLabel(vehicle.vehicle_type)}
                            </p>
                          </div>
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

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Year:</span>
                          <span className="font-medium text-gray-700">
                            {vehicle.year}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">License Plate:</span>
                          <span className="font-medium text-gray-700">
                            {vehicle.license_plate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Registration Number:
                          </span>
                          <span className="font-medium text-gray-700">
                            {vehicle.registration_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Color:</span>
                          <span className="font-medium text-gray-700">
                            {vehicle.color}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium text-gray-700">
                            {vehicle.capacity_weight} kg,{' '}
                            {vehicle.capacity_volume} m³
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Insurance:</span>
                          <span className="font-medium text-gray-700">
                            {vehicle.insurance_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Insurance Expiry:
                          </span>
                          <span className="font-medium text-gray-700">
                            {formatDate(vehicle.insurance_expiry)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Vehicles Added
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Add your first vehicle to start accepting jobs
                    </p>
                    <button
                      onClick={() => (window.location.href = '/driver/jobs')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add Vehicle
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Documents Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Driver&apos;s License
                      </p>
                      <p className="text-sm text-gray-600">
                        {driverProfile?.driverProfile?.license_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {driverProfile?.driverProfile?.documents_verified ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">
                          Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                        <span className="text-yellow-600 font-medium">
                          Pending
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <TruckIcon className="h-6 w-6 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Vehicle Documents - {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-sm text-gray-600">
                          Insurance: {vehicle.insurance_number} | Registration:{' '}
                          {vehicle.registration_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {vehicle.is_active ? (
                        <>
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          <span className="text-green-600 font-medium">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                          <span className="text-red-600 font-medium">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Document Requirements
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Valid driver&apos;s license (not expired)</li>
                    <li>• Vehicle registration certificates</li>
                    <li>• Current insurance policies for all vehicles</li>
                    <li>• All documents must be clearly readable</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Account Settings
              </h3>

              {/* Availability Status */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">
                  Availability Status
                </h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      driverProfile?.driverProfile?.availability_status ===
                      'available'
                        ? 'bg-green-100 text-green-800'
                        : driverProfile?.driverProfile?.availability_status ===
                          'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {driverProfile?.driverProfile?.availability_status ||
                      'offline'}
                  </span>
                  <button
                    onClick={() => (window.location.href = '/driver/dashboard')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Change Status
                  </button>
                </div>
              </div>

              {/* Password Change */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Password</h4>
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    {showPasswordChange ? (
                      <>
                        <EyeSlashIcon className="h-4 w-4" />
                        <span>Cancel</span>
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4" />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                </div>

                {showPasswordChange ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            current_password: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            new_password: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        minLength="6"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirm_password: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        minLength="6"
                        required
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={updating}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating ? 'Changing...' : 'Change Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordForm({
                            current_password: '',
                            new_password: '',
                            confirm_password: '',
                          });
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm text-gray-600">
                    Password was last updated on{' '}
                    {formatDate(driverProfile?.updated_at)}
                  </p>
                )}
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">
                  Account Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Created:</span>
                    <span className="font-medium text-gray-700">
                      {formatDate(driverProfile?.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium text-gray-700">
                      {driverProfile?.last_login
                        ? formatDate(driverProfile.last_login)
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email Verified:</span>
                    <span
                      className={`font-medium ${
                        driverProfile?.is_verified
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {driverProfile?.is_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Status:</span>
                    <span
                      className={`font-medium ${
                        driverProfile?.is_active
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {driverProfile?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Preferences</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Job Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive notifications for new jobs
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">SMS Alerts</p>
                      <p className="text-sm text-gray-600">
                        Receive SMS for important updates
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Updates</p>
                      <p className="text-sm text-gray-600">
                        Receive weekly summary emails
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h4 className="font-medium text-red-900 mb-4">Danger Zone</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">
                        Deactivate Account
                      </p>
                      <p className="text-sm text-red-700">
                        Temporarily disable your driver account
                      </p>
                    </div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
                      Deactivate
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">Delete Account</p>
                      <p className="text-sm text-red-700">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
