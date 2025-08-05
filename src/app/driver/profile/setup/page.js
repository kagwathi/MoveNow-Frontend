'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import {
  TruckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  IdentificationIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function DriverProfileSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    license_number: '',
    license_expiry: '',
    experience_years: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // License number validation
    if (!formData.license_number.trim()) {
      errors.license_number = 'License number is required';
    } else if (formData.license_number.trim().length < 5) {
      errors.license_number = 'License number must be at least 5 characters';
    }

    // License expiry validation
    if (!formData.license_expiry) {
      errors.license_expiry = 'License expiry date is required';
    } else {
      const expiryDate = new Date(formData.license_expiry);
      const today = new Date();
      if (expiryDate <= today) {
        errors.license_expiry = 'License must not be expired';
      }
    }

    // Experience years validation
    if (!formData.experience_years) {
      errors.experience_years = 'Experience years is required';
    } else {
      const years = parseInt(formData.experience_years);
      if (isNaN(years) || years < 0) {
        errors.experience_years = 'Experience must be a valid number';
      } else if (years > 50) {
        errors.experience_years = 'Experience cannot exceed 50 years';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.registerDriver({
        license_number: formData.license_number.trim(),
        license_expiry: formData.license_expiry,
        experience_years: parseInt(formData.experience_years),
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/driver/dashboard';
        }, 3000);
      }
    } catch (err) {
      console.error('Driver profile creation error:', err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create driver profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Profile Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your driver profile has been submitted for review. Our admin team
              will approve your account within 24-48 hours.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-green-900 mb-2">
                What&apos;s Next:
              </h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Admin team will review your profile and documents</li>
                <li>• You&apos;ll receive an email once approved</li>
                <li>• Then you can start accepting jobs and earning!</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <TruckIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Driver Profile
          </h1>
          <p className="text-gray-600">
            Welcome {user?.first_name}! Let&apos;s set up your driver profile to
            start earning with MoveNow.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">
                Account Created
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">
                Driver Profile
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">
                Admin Approval
              </span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* License Number */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <IdentificationIcon className="h-4 w-4 mr-2" />
                Driving License Number
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                placeholder="Enter your driving license number"
                className={`w-full px-4 py-3 border text-gray-700 placeholder:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.license_number
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {formErrors.license_number && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.license_number}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter your valid driving license number as it appears on your
                license
              </p>
            </div>

            {/* License Expiry */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 mr-2" />
                License Expiry Date
              </label>
              <input
                type="date"
                name="license_expiry"
                value={formData.license_expiry}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border text-gray-700 placeholder:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.license_expiry
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {formErrors.license_expiry && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.license_expiry}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Your license must be valid for at least 6 months
              </p>
            </div>

            {/* Experience Years */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="h-4 w-4 mr-2" />
                Years of Driving Experience
              </label>
              <select
                name="experience_years"
                value={formData.experience_years}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border text-gray-700 placeholder:text-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.experience_years
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select your experience</option>
                {[...Array(21)].map((_, i) => (
                  <option key={i} value={i}>
                    {i === 0
                      ? 'Less than 1 year'
                      : `${i} year${i > 1 ? 's' : ''}`}
                  </option>
                ))}
                <option value="21">21+ years</option>
              </select>
              {formErrors.experience_years && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.experience_years}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Total years of driving experience (including personal driving)
              </p>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-900">
                    After Profile Creation
                  </h3>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• Your profile will be reviewed by our admin team</li>
                    <li>• Approval typically takes 24-48 hours</li>
                    <li>• You&apos;ll be notified via email once approved</li>
                    <li>
                      • Then you can start accepting jobs and earning money!
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Profile...
                  </div>
                ) : (
                  'Create Driver Profile'
                )}
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = '/driver/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help setting up your profile?{' '}
            <a
              href="/help/driver-setup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Setup Guide
            </a>{' '}
            or{' '}
            <a
              href="/contact-support"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
