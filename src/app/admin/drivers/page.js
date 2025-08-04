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
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentCheckIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatTimeAgo, formatCurrency } from '@/lib/utils';
import { TrashIcon } from 'lucide-react';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    driver: null,
    reason: '',
    loading: false,
  });

  // Modal states
  const [approvalModal, setApprovalModal] = useState({
    isOpen: false,
    driver: null,
    action: '', // 'approve' or 'reject'
    reason: '',
    loading: false,
  });

  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    driver: null,
  });

  const toast = useToast();
  const itemsPerPage = 20;

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const approvalOptions = [
    { value: '', label: 'All Approvals' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const availabilityOptions = [
    { value: '', label: 'All Availability' },
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'busy', label: 'Busy' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Joined' },
    { value: 'first_name', label: 'First Name' },
    { value: 'last_name', label: 'Last Name' },
    { value: 'rating', label: 'Rating' },
    { value: 'total_trips', label: 'Total Trips' },
    { value: 'last_login', label: 'Last Active' },
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch drivers when filters change
  useEffect(() => {
    fetchDrivers();
  }, [
    currentPage,
    statusFilter,
    approvalFilter,
    availabilityFilter,
    debouncedSearchTerm,
    sortBy,
    sortOrder,
  ]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);

      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        role: 'driver', // Filter for drivers only
      };

      if (statusFilter) params.status = statusFilter;
      if (approvalFilter) params.approval_status = approvalFilter;
      if (availabilityFilter) params.availability = availabilityFilter;
      if (debouncedSearchTerm.trim())
        params.search = debouncedSearchTerm.trim();

      const response = await adminAPI.getUsers(params);

      if (response.data.success) {
        const data = response.data.data;
        // Filter to only include users with driverProfile
        const driversWithProfiles = (data.users || []).filter(
          (user) => user.driverProfile !== null
        );

        setDrivers(driversWithProfiles);
        setTotalDrivers(driversWithProfiles.length); // Update to reflect filtered count
        setTotalPages(Math.ceil(driversWithProfiles.length / itemsPerPage));
      }
    } catch (error) {
      toast.error('Failed to load drivers');
      console.error('Fetch drivers error:', error);
      setDrivers([]);
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

  const handleApprovalAction = async () => {
    if (!approvalModal.driver) return;

    try {
      setApprovalModal((prev) => ({ ...prev, loading: true }));

      const driverId = approvalModal.driver.driverProfile?.id;

      if (!driverId) {
        toast.error(
          'Driver profile not found. This user may not have completed driver registration.'
        );
        return;
      }

      const response = await adminAPI.updateDriverApproval(driverId, {
        is_approved: approvalModal.action === 'approve',
        reason:
          approvalModal.reason.trim() ||
          `Driver ${approvalModal.action}d by admin`,
      });

      if (response.data.success) {
        toast.success(`Driver ${approvalModal.action}d successfully`);
        fetchDrivers();
        closeApprovalModal();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${approvalModal.action} driver`
      );
      console.error('Approval error:', error);
    } finally {
      setApprovalModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.driver) return;

    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));

      const response = await adminAPI.deleteUser(
        deleteModal.driver.id,
        deleteModal.reason.trim() || 'Deleted by admin'
      );

      if (response.data.success) {
        toast.success('Driver deleted successfully');
        fetchDrivers();
        closeDeleteModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete driver');
      console.error('Delete error:', error);
    } finally {
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const openApprovalModal = (driver, action) => {
    console.log('Opening approval modal for driver:', driver);
    console.log('Driver profile:', driver.driverProfile);
    console.log('is_approved status:', driver.driverProfile?.is_approved);

    setApprovalModal({
      isOpen: true,
      driver,
      action,
      reason: '',
      loading: false,
    });
  };

  const closeApprovalModal = () => {
    setApprovalModal({
      isOpen: false,
      driver: null,
      action: '',
      reason: '',
      loading: false,
    });
  };

  const openDetailsModal = (driver) => {
    setDetailsModal({
      isOpen: true,
      driver,
    });
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      isOpen: false,
      driver: null,
    });
  };

  const openDeleteModal = (driver) => {
    setDeleteModal({
      isOpen: true,
      driver,
      reason: '',
      loading: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      driver: null,
      reason: '',
      loading: false,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setStatusFilter('');
    setApprovalFilter('');
    setAvailabilityFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getApprovalColor = (driver) => {
    const driverProfile = driver.driverProfile;

    if (driverProfile.is_approved === false)
      return 'bg-red-100 text-red-800 border-red-200';
    if (driverProfile.is_approved === true)
      return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getApprovalText = (driver) => {
    const driverProfile = driver.driverProfile;

    if (driverProfile.is_approved === false) return 'Rejected';
    if (driverProfile.is_approved === true) return 'Approved';
    return 'Pending';
  };

  const getAvailabilityColor = (status) => {
    const colors = {
      online: 'bg-green-100 text-green-800 border-green-200',
      offline: 'bg-gray-100 text-gray-800 border-gray-200',
      busy: 'bg-blue-100 text-blue-800 border-blue-200',
      available: 'bg-green-100 text-green-800 border-green-200', // Add available status
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (driver) => {
    if (!driver.is_active) {
      return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }
    const driverProfile = driver.driverProfile;
    if (driverProfile.is_approved !== true) {
      return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
  };

  // Helper function to get driver profile data
  const getDriverData = (driver) => {
    return (
      driver.driverProfile || {
        rating: 0,
        total_ratings: 0,
        total_trips: 0,
        availability_status: 'offline',
        vehicle_type: 'Not specified',
        license_number: 'Not provided',
        experience_years: 0,
        is_approved: null,
        documents_verified: false,
      }
    );
  };

  // Mobile Card Component
  const DriverCard = ({ driver }) => {
    const driverData = getDriverData(driver);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {driver.first_name} {driver.last_name}
              </h3>
              <p className="text-sm text-gray-500 truncate">{driver.email}</p>
              {driver.phone && (
                <p className="text-xs text-gray-400">{driver.phone}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon(driver)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
          <div>
            <span className="font-medium">Approval:</span>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getApprovalColor(
                  driver
                )}`}
              >
                {getApprovalText(driver)}
              </span>
            </div>
          </div>
          <div>
            <span className="font-medium">Availability:</span>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(
                  driverData.availability_status
                )}`}
              >
                {driverData.availability_status?.charAt(0).toUpperCase() +
                  driverData.availability_status?.slice(1) || 'Unknown'}
              </span>
            </div>
          </div>
          <div>
            <span className="font-medium">Rating:</span>
            <div className="flex items-center mt-1">
              <StarIcon className="h-3 w-3 text-yellow-500 mr-1" />
              <span>{driverData.rating || '0.0'}</span>
              <span className="text-gray-400 ml-1">
                ({driverData.total_ratings || 0})
              </span>
            </div>
          </div>
          <div>
            <span className="font-medium">Trips:</span>
            <p className="mt-1">{driverData.total_trips || 0}</p>
          </div>
          <div className="col-span-2">
            <span className="font-medium">Vehicle:</span>
            <p className="mt-1">{driverData.vehicle_type || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => openDetailsModal(driver)}
            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {/* Show approval buttons only for pending drivers */}
          {driverData.is_approved === null && (
            <>
              <button
                onClick={() => openApprovalModal(driver, 'approve')}
                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                title="Approve Driver"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => openApprovalModal(driver, 'reject')}
                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                title="Reject Driver"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={() => openDeleteModal(driver)}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Driver"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Driver Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage driver approvals, status, and performance
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
            className="btn-secondary flex items-center justify-center space-x-2 whitespace-nowrap"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
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

              <Select
                label="Approval"
                name="approvalFilter"
                value={approvalFilter}
                onChange={(e) => {
                  setApprovalFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={approvalOptions}
              />

              <Select
                label="Availability"
                name="availabilityFilter"
                value={availabilityFilter}
                onChange={(e) => {
                  setAvailabilityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={availabilityOptions}
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
                    {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full sm:w-auto"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing {drivers.length} of {totalDrivers} drivers with profiles
            {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
            {statusFilter && ` with status "${statusFilter}"`}
            {approvalFilter && ` with approval "${approvalFilter}"`}
            {availabilityFilter && ` with availability "${availabilityFilter}"`}
          </p>
        </div>
      </div>

      {/* Drivers Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {drivers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No drivers with profiles found
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {debouncedSearchTerm ||
              statusFilter ||
              approvalFilter ||
              availabilityFilter
                ? 'Try adjusting your search or filters'
                : 'No drivers with completed profiles available'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="block lg:hidden">
              <div className="p-4 space-y-4">
                {drivers.map((driver) => (
                  <DriverCard key={driver.id} driver={driver} />
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trips
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.map((driver) => {
                    const driverData = getDriverData(driver);

                    return (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <TruckIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {driver.first_name} {driver.last_name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {driver.email}
                              </div>
                              {driver.phone && (
                                <div className="text-sm text-gray-500 truncate">
                                  {driver.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(driver)}
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getApprovalColor(
                                driver
                              )}`}
                            >
                              {getApprovalText(driver)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAvailabilityColor(
                              driverData.availability_status
                            )}`}
                          >
                            {driverData.availability_status
                              ?.charAt(0)
                              .toUpperCase() +
                              driverData.availability_status?.slice(1) ||
                              'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-gray-900">
                              {driverData.rating || '0.0'}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({driverData.total_ratings || 0})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {driverData.total_trips || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {driverData.vehicle_type || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openDetailsModal(driver)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {/* Show approval buttons only for pending drivers */}
                            {driverData.is_approved === null && (
                              <>
                                <button
                                  onClick={() =>
                                    openApprovalModal(driver, 'approve')
                                  }
                                  className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                  title="Approve Driver"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    openApprovalModal(driver, 'reject')
                                  }
                                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                  title="Reject Driver"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => openDeleteModal(driver)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Delete Driver"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
              {Math.min(currentPage * itemsPerPage, totalDrivers)} of{' '}
              {totalDrivers} drivers with profiles
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

      {/* Driver Approval Modal */}
      <Modal
        isOpen={approvalModal.isOpen}
        onClose={closeApprovalModal}
        title={`${
          approvalModal.action === 'approve' ? 'Approve' : 'Reject'
        } Driver`}
        size="md"
      >
        <div className="space-y-4">
          {/* Action Info */}
          <div
            className={`flex items-start space-x-3 p-4 rounded-lg border ${
              approvalModal.action === 'approve'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {approvalModal.action === 'approve' ? (
              <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4
                className={`text-sm font-medium ${
                  approvalModal.action === 'approve'
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}
              >
                {approvalModal.action === 'approve'
                  ? 'Approve Driver Application'
                  : 'Reject Driver Application'}
              </h4>
              <p
                className={`text-sm mt-1 ${
                  approvalModal.action === 'approve'
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {approvalModal.action === 'approve'
                  ? 'This will allow the driver to accept bookings and start earning.'
                  : 'This will prevent the driver from accessing the platform.'}
              </p>
            </div>
          </div>

          {/* Driver Info */}
          {approvalModal.driver && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Driver Information:
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Name:</strong> {approvalModal.driver.first_name}{' '}
                  {approvalModal.driver.last_name}
                </p>
                <p>
                  <strong>Email:</strong> {approvalModal.driver.email}
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  {approvalModal.driver.phone || 'Not provided'}
                </p>
                {(() => {
                  const driverData = getDriverData(approvalModal.driver);
                  return (
                    <>
                      <p>
                        <strong>Vehicle Type:</strong>{' '}
                        {driverData.vehicle_type || 'Not specified'}
                      </p>
                      <p>
                        <strong>License Number:</strong>{' '}
                        {driverData.license_number || 'Not provided'}
                      </p>
                      <p>
                        <strong>Experience:</strong>{' '}
                        {driverData.experience_years || 0} years
                      </p>
                    </>
                  );
                })()}
                <p>
                  <strong>Applied:</strong>{' '}
                  {formatDate(approvalModal.driver.created_at, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <Textarea
              label={`Reason for ${
                approvalModal.action === 'approve' ? 'Approval' : 'Rejection'
              }`}
              name="reason"
              value={approvalModal.reason}
              onChange={(e) =>
                setApprovalModal((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              placeholder={`Please provide a reason for ${approvalModal.action}ing this driver (optional)`}
              rows={3}
              helperText="This reason will be logged and may be shared with the driver"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              onClick={closeApprovalModal}
              disabled={approvalModal.loading}
              className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleApprovalAction}
              disabled={approvalModal.loading}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto order-1 sm:order-2 ${
                approvalModal.action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {approvalModal.loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>
                    {approvalModal.action === 'approve'
                      ? 'Approving...'
                      : 'Rejecting...'}
                  </span>
                </>
              ) : (
                <>
                  {approvalModal.action === 'approve' ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : (
                    <XCircleIcon className="h-4 w-4" />
                  )}
                  <span>
                    {approvalModal.action === 'approve'
                      ? 'Approve Driver'
                      : 'Reject Driver'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Driver Details Modal */}
      <Modal
        isOpen={detailsModal.isOpen}
        onClose={closeDetailsModal}
        title="Driver Details"
        size="lg"
      >
        {detailsModal.driver &&
          (() => {
            const driverData = getDriverData(detailsModal.driver);

            return (
              <div className="space-y-6">
                {/* Driver Header */}
                <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <TruckIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {detailsModal.driver.first_name}{' '}
                      {detailsModal.driver.last_name}
                    </h3>
                    <p className="text-gray-600">{detailsModal.driver.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getApprovalColor(
                          detailsModal.driver
                        )}`}
                      >
                        {getApprovalText(detailsModal.driver)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(
                          driverData.availability_status
                        )}`}
                      >
                        {driverData.availability_status
                          ?.charAt(0)
                          .toUpperCase() +
                          driverData.availability_status?.slice(1) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Phone Number
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.driver.phone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Email
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.driver.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Member Since
                        </span>
                        <p className="text-sm text-gray-900">
                          {formatDate(
                            detailsModal.driver.created_at,
                            'MMMM dd, yyyy'
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Last Active
                        </span>
                        <p className="text-sm text-gray-900">
                          {detailsModal.driver.last_login
                            ? formatTimeAgo(detailsModal.driver.last_login)
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Specific Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Driver Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          License Number
                        </span>
                        <p className="text-sm text-gray-900">
                          {driverData.license_number || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          License Expiry
                        </span>
                        <p className="text-sm text-gray-900">
                          {driverData.license_expiry
                            ? formatDate(
                                driverData.license_expiry,
                                'MMM dd, yyyy'
                              )
                            : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Experience
                        </span>
                        <p className="text-sm text-gray-900">
                          {driverData.experience_years || 0} years
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Vehicle Type
                        </span>
                        <p className="text-sm text-gray-900">
                          {driverData.vehicle_type || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                        <span className="text-2xl font-bold text-gray-900">
                          {parseFloat(driverData.rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Average Rating</p>
                      <p className="text-xs text-gray-500">
                        ({driverData.total_ratings || 0} reviews)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {driverData.total_trips || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Trips</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {driverData.total_earnings
                          ? formatCurrency(driverData.total_earnings)
                          : formatCurrency(0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {driverData.completion_rate?.toFixed(1) || '0.0'}%
                      </p>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                    </div>
                  </div>
                </div>

                {/* Current Location */}
                {driverData.current_address && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Current Location
                    </h4>
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {driverData.current_address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Documents Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Document Verification
                  </h4>
                  <div className="flex items-center space-x-2">
                    <DocumentCheckIcon
                      className={`h-5 w-5 ${
                        driverData.documents_verified
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        driverData.documents_verified
                          ? 'text-green-700'
                          : 'text-yellow-700'
                      }`}
                    >
                      {driverData.documents_verified
                        ? 'Documents Verified'
                        : 'Documents Pending Verification'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Only show for pending approval */}
                {driverData.is_approved === null && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        closeDetailsModal();
                        openApprovalModal(detailsModal.driver, 'reject');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span>Reject Driver</span>
                    </button>
                    <button
                      onClick={() => {
                        closeDetailsModal();
                        openApprovalModal(detailsModal.driver, 'approve');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Approve Driver</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
      </Modal>

      {/* Driver Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete Driver"
        size="md"
      >
        <div className="space-y-4">
          {/* Warning Info */}
          <div className="flex items-start space-x-3 p-4 rounded-lg border bg-red-50 border-red-200">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Delete Driver Account
              </h4>
              <p className="text-sm mt-1 text-red-700">
                This action will permanently delete the driver&apos;s account
                and cannot be undone. The driver will lose access to the
                platform and all associated data.
              </p>
            </div>
          </div>

          {/* Driver Info */}
          {deleteModal.driver && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Driver to be deleted:
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Name:</strong> {deleteModal.driver.first_name}{' '}
                  {deleteModal.driver.last_name}
                </p>
                <p>
                  <strong>Email:</strong> {deleteModal.driver.email}
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  {deleteModal.driver.phone || 'Not provided'}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getApprovalColor(
                      deleteModal.driver
                    )}`}
                  >
                    {getApprovalText(deleteModal.driver)}
                  </span>
                </p>
                <p>
                  <strong>Joined:</strong>{' '}
                  {formatDate(deleteModal.driver.created_at, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <Textarea
              label="Reason for Deletion"
              name="reason"
              value={deleteModal.reason}
              onChange={(e) =>
                setDeleteModal((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              placeholder="Please provide a reason for deleting this driver (optional)"
              rows={3}
              helperText="This reason will be logged for audit purposes"
            />
          </div>

          {/* Confirmation Input */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>
                To confirm deletion, type &quot;DELETE&quot; below:
              </strong>
            </p>
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2 border text-gray-700 placeholder:text-gray-300 border-yellow-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              onChange={(e) => {
                const isConfirmed = e.target.value === 'DELETE';
                setDeleteModal((prev) => ({ ...prev, confirmed: isConfirmed }));
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              onClick={closeDeleteModal}
              disabled={deleteModal.loading}
              className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={deleteModal.loading || !deleteModal.confirmed}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto order-1 sm:order-2"
            >
              {deleteModal.loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete Driver</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
