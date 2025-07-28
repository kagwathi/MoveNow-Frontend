'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/common/Toast';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Input, Select, Textarea } from '@/components/common/FormInput';
import Modal, { ConfirmModal } from '@/components/common/Modal';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null,
    reason: '',
    loading: false,
  });

  const toast = useToast();
  const itemsPerPage = 20;

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'customer', label: 'Customers' },
    { value: 'driver', label: 'Drivers' },
    { value: 'admin', label: 'Admins' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Joined' },
    { value: 'first_name', label: 'First Name' },
    { value: 'last_name', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'last_login', label: 'Last Login' },
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when debounced search term or other filters change
  useEffect(() => {
    fetchUsers();
  }, [
    currentPage,
    roleFilter,
    statusFilter,
    debouncedSearchTerm,
    sortBy,
    sortOrder,
  ]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearchTerm.trim())
        params.search = debouncedSearchTerm.trim();

      const response = await adminAPI.getUsers(params);

      if (response.data.success) {
        const data = response.data.data;
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      }
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Fetch users error:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await adminAPI.updateUserStatus(userId, {
        is_active: newStatus,
        reason: `Status changed by admin to ${
          newStatus ? 'active' : 'inactive'
        }`,
      });

      if (response.data.success) {
        toast.success(
          `User ${newStatus ? 'activated' : 'deactivated'} successfully`
        );
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Update status error:', error);
    }
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setDeleteModal({
      isOpen: true,
      user,
      reason: '',
      loading: false,
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      user: null,
      reason: '',
      loading: false,
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;

    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));

      const response = await adminAPI.deleteUser(
        deleteModal.user.id,
        deleteModal.reason.trim() || 'No reason provided'
      );

      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
        closeDeleteModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
      console.error('Delete user error:', error);
    } finally {
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      driver: 'bg-blue-100 text-blue-800 border-blue-200',
      customer: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (user) => {
    if (!user.is_active) {
      return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }
    if (!user.is_verified) {
      return <XCircleIcon className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
  };

  // Mobile Card Component
  const UserCard = ({ user }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">
              {user.first_name?.[0] || '?'}
              {user.last_name?.[0] || ''}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            {user.phone && (
              <p className="text-xs text-gray-400">{user.phone}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon(user)}
          <span className="text-xs text-gray-600">
            {!user.is_active
              ? 'Inactive'
              : !user.is_verified
              ? 'Pending'
              : 'Active'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
        <div>
          <span className="font-medium">Role:</span>
          <div className="mt-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                user.role
              )}`}
            >
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </span>
          </div>
        </div>
        <div>
          <span className="font-medium">Joined:</span>
          <p className="mt-1">
            {user.created_at
              ? formatDate(user.created_at, 'MMM dd, yyyy')
              : '-'}
          </p>
        </div>
        <div className="col-span-2">
          <span className="font-medium">Last Active:</span>
          <p className="mt-1">
            {user.last_login ? formatTimeAgo(user.last_login) : 'Never'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => {
            /* Handle view user */
          }}
          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
          title="View Details"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            /* Handle edit user */
          }}
          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
          title="Edit User"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleToggleStatus(user.id, user.is_active)}
          className={`p-2 rounded-md transition-colors ${
            user.is_active
              ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
          }`}
          title={user.is_active ? 'Deactivate' : 'Activate'}
        >
          {user.is_active ? (
            <XCircleIcon className="h-4 w-4" />
          ) : (
            <CheckCircleIcon className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => openDeleteModal(user)}
          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
          title="Delete User"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

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
            User Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage customers, drivers, and administrators
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
              {/* Search indicator */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <Select
                label="Role"
                name="roleFilter"
                value={roleFilter}
                onChange={handleRoleFilter}
                options={roleOptions}
              />

              <Select
                label="Status"
                name="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilter}
                options={statusOptions}
              />

              <Select
                label="Sort By"
                name="sortBy"
                value={sortBy}
                onChange={handleSortChange}
                options={sortOptions}
              />

              <div className="flex items-end">
                <button
                  onClick={toggleSortOrder}
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
            Showing {users.length} of {totalUsers} users
            {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
            {roleFilter && ` with role "${roleFilter}"`}
            {statusFilter && ` with status "${statusFilter}"`}
          </p>
        </div>
      </div>

      {/* Users Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {debouncedSearchTerm || roleFilter || statusFilter
                ? 'Try adjusting your search or filters'
                : 'No users available'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="block lg:hidden">
              <div className="p-4 space-y-4">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-gray-700">
                              {user.first_name?.[0] || '?'}
                              {user.last_name?.[0] || ''}
                            </span>
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 truncate">
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role?.charAt(0).toUpperCase() +
                            user.role?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(user)}
                          <span className="text-sm text-gray-900">
                            {!user.is_active
                              ? 'Inactive'
                              : !user.is_verified
                              ? 'Pending'
                              : 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.created_at
                          ? formatDate(user.created_at, 'MMM dd, yyyy')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login
                          ? formatTimeAgo(user.last_login)
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              /* Handle view user */
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              /* Handle edit user */
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                            title="Edit User"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(user.id, user.is_active)
                            }
                            className={`p-1 rounded ${
                              user.is_active
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? (
                              <XCircleIcon className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Delete User"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers}{' '}
              users
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

      {/* Delete User Modal - Rest of the modal code remains the same */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete User"
        size="md"
      >
        <div className="space-y-4">
          {/* Warning */}
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Permanent Action Warning
              </h4>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. The user will be permanently
                removed from the system.
              </p>
            </div>
          </div>

          {/* User Info */}
          {deleteModal.user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                User to be deleted:
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Name:</strong> {deleteModal.user.first_name}{' '}
                  {deleteModal.user.last_name}
                </p>
                <p>
                  <strong>Email:</strong> {deleteModal.user.email}
                </p>
                <p>
                  <strong>Role:</strong> {deleteModal.user.role}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  {deleteModal.user.is_active ? 'Active' : 'Inactive'}
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
                setDeleteModal((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Please provide a reason for deleting this user (optional)"
              rows={3}
              helperText="This reason will be logged for audit purposes"
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
              onClick={handleDeleteConfirm}
              disabled={deleteModal.loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto order-1 sm:order-2"
            >
              {deleteModal.loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
