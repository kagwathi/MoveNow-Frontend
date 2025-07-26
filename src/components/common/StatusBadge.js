import { cn } from '@/lib/utils';

export default function StatusBadge({ status, size = 'md', className = '' }) {
  const statusConfig = {
    // Booking statuses
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    accepted: { color: 'bg-blue-100 text-blue-800', label: 'Accepted' },
    driver_assigned: {
      color: 'bg-purple-100 text-purple-800',
      label: 'Driver Assigned',
    },
    driver_en_route: {
      color: 'bg-indigo-100 text-indigo-800',
      label: 'En Route',
    },
    arrived_pickup: { color: 'bg-cyan-100 text-cyan-800', label: 'At Pickup' },
    loading: { color: 'bg-orange-100 text-orange-800', label: 'Loading' },
    in_transit: { color: 'bg-violet-100 text-violet-800', label: 'In Transit' },
    arrived_destination: {
      color: 'bg-teal-100 text-teal-800',
      label: 'At Destination',
    },
    unloading: { color: 'bg-amber-100 text-amber-800', label: 'Unloading' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },

    // Driver statuses
    available: { color: 'bg-green-100 text-green-800', label: 'Available' },
    busy: { color: 'bg-red-100 text-red-800', label: 'Busy' },
    offline: { color: 'bg-gray-100 text-gray-800', label: 'Offline' },

    // Payment statuses
    paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
    processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
    refunded: { color: 'bg-purple-100 text-purple-800', label: 'Refunded' },

    // User statuses
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    verified: { color: 'bg-blue-100 text-blue-800', label: 'Verified' },
    unverified: { color: 'bg-yellow-100 text-yellow-800', label: 'Unverified' },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800',
    label: status,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Priority Badge
export function PriorityBadge({ priority, className = '' }) {
  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1.5 text-sm font-medium rounded-full',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
