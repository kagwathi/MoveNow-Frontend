import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date, pattern = 'PPP') => {
  return format(new Date(date), pattern);
};

export const formatTime = (time) => {
  if (!time) return '';

  // If time is in HH:MM format, convert to 12-hour format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatTimeAgo = (date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    driver_en_route: 'bg-purple-100 text-purple-800',
    in_transit: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    accepted: 'Accepted',
    driver_assigned: 'Driver Assigned',
    driver_en_route: 'Driver En Route',
    arrived_pickup: 'Arrived at Pickup',
    loading: 'Loading',
    in_transit: 'In Transit',
    arrived_destination: 'Arrived at Destination',
    unloading: 'Unloading',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[0-9]{10,15}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const generateBookingId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `MN${timestamp}${randomStr}`.toUpperCase();
};
