'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/common/Toast';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Input, Select, Textarea } from '@/components/common/FormInput';
import Modal from '@/components/common/Modal';
import {
  CurrencyDollarIcon,
  CogIcon,
  TruckIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

export default function PricingPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [resetModal, setResetModal] = useState({
    isOpen: false,
    loading: false,
  });

  const toast = useToast();

  const vehicleTypes = [
    { key: 'pickup', label: 'Pickup Truck', icon: '🚐' },
    { key: 'small_truck', label: 'Small Truck', icon: '🚚' },
    { key: 'medium_truck', label: 'Medium Truck', icon: '🚛' },
    { key: 'large_truck', label: 'Large Truck', icon: '🚜' },
    { key: 'van', label: 'Van', icon: '🚐' },
  ];

  const loadTypes = [
    { key: 'furniture', label: 'Furniture', icon: '🪑' },
    { key: 'appliances', label: 'Appliances', icon: '🔌' },
    { key: 'electronics', label: 'Electronics', icon: '📱' },
    { key: 'fragile', label: 'Fragile Items', icon: '🥃' },
    { key: 'boxes', label: 'Boxes/Packages', icon: '📦' },
    { key: 'other', label: 'Other', icon: '📋' },
  ];

  const timeMultipliers = [
    {
      key: 'peak_hours',
      label: 'Peak Hours',
      description: 'Rush hour surcharge',
    },
    { key: 'weekend', label: 'Weekend', description: 'Weekend premium' },
    { key: 'night', label: 'Night Time', description: 'Night service fee' },
  ];

  useEffect(() => {
    fetchPricingConfig();
  }, []);

  const fetchPricingConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPricing();

      if (response.data.success) {
        setConfig(response.data.data.config);
      }
    } catch (error) {
      toast.error('Failed to load pricing configuration');
      console.error('Fetch pricing config error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (section, key, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: field
          ? { ...prev[section][key], [field]: parseFloat(value) || 0 }
          : parseFloat(value) || 0,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminAPI.updatePricing(config);

      if (response.data.success) {
        toast.success('Pricing configuration updated successfully!');
        setHasChanges(false);
        setConfig(response.data.data.config);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to update pricing configuration'
      );
      console.error('Save pricing config error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetModal((prev) => ({ ...prev, loading: true }));
      const response = await adminAPI.resetPricing();

      if (response.data.success) {
        toast.success('Pricing configuration reset to defaults');
        setConfig(response.data.data.config);
        setHasChanges(false);
        closeResetModal();
      }
    } catch (error) {
      toast.error('Failed to reset pricing configuration');
      console.error('Reset pricing config error:', error);
    } finally {
      setResetModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const openResetModal = () => {
    setResetModal({ isOpen: true, loading: false });
  };

  const closeResetModal = () => {
    setResetModal({ isOpen: false, loading: false });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load pricing configuration
        </h3>
        <button onClick={fetchPricingConfig} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Pricing Configuration
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Configure base rates, multipliers, and pricing rules
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={openResetModal}
              disabled={saving}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Changes Alert */}
        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Unsaved Changes
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You have unsaved changes to the pricing configuration. Click
                  &quot;Save Changes&quot; to apply them.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Base Rates Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TruckIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Vehicle Base Rates
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicleTypes.map((vehicle) => (
              <div
                key={vehicle.key}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">{vehicle.icon}</span>
                  <h3 className="font-medium text-gray-900">{vehicle.label}</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Rate (KES)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={config.base_rates[vehicle.key]?.base || 0}
                      onChange={(e) =>
                        handleConfigChange(
                          'base_rates',
                          vehicle.key,
                          'base',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per KM (KES)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={config.base_rates[vehicle.key]?.per_km || 0}
                      onChange={(e) =>
                        handleConfigChange(
                          'base_rates',
                          vehicle.key,
                          'per_km',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per Minute (KES)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={config.base_rates[vehicle.key]?.per_minute || 0}
                      onChange={(e) =>
                        handleConfigChange(
                          'base_rates',
                          vehicle.key,
                          'per_minute',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load Type Multipliers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CogIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Load Type Multipliers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadTypes.map((load) => (
              <div
                key={load.key}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">{load.icon}</span>
                  <h3 className="font-medium text-gray-900">{load.label}</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Multiplier
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={config.load_multipliers[load.key] || 1.0}
                    onChange={(e) =>
                      handleConfigChange(
                        'load_multipliers',
                        load.key,
                        null,
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(
                      (config.load_multipliers[load.key] || 1.0) * 100 -
                      100
                    ).toFixed(0)}
                    %
                    {config.load_multipliers[load.key] > 1
                      ? ' surcharge'
                      : config.load_multipliers[load.key] < 1
                      ? ' discount'
                      : ' (no change)'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Multipliers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <ClockIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Time-based Multipliers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {timeMultipliers.map((time) => (
              <div
                key={time.key}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-medium text-gray-900 mb-1">{time.label}</h3>
                <p className="text-sm text-gray-600 mb-3">{time.description}</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Multiplier
                  </label>
                  <input
                    type="number"
                    min="1.0"
                    max="2.0"
                    step="0.1"
                    value={config.time_multipliers[time.key] || 1.0}
                    onChange={(e) =>
                      handleConfigChange(
                        'time_multipliers',
                        time.key,
                        null,
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(
                      (config.time_multipliers[time.key] || 1.0) * 100 -
                      100
                    ).toFixed(0)}
                    % surcharge
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <UserGroupIcon className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Additional Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Helper Rate</h3>
              <p className="text-sm text-gray-600 mb-3">
                Additional charge per helper for loading/unloading assistance
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate per Helper (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={config.helper_rate || 0}
                  onChange={(e) =>
                    handleConfigChange(
                      'helper_rate',
                      null,
                      null,
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Minimum Charge</h3>
              <p className="text-sm text-gray-600 mb-3">
                Minimum amount charged for any booking regardless of distance or
                time
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Amount (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={config.minimum_charge || 0}
                  onChange={(e) =>
                    handleConfigChange(
                      'minimum_charge',
                      null,
                      null,
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pricing Preview
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Example pricing for a 10km trip with furniture in a pickup truck
          </p>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 text-gray-700 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Base Rate:</span>
                <p className="font-semibold">
                  {formatCurrency(config.base_rates.pickup?.base || 0)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Distance (10km):</span>
                <p className="font-semibold">
                  {formatCurrency((config.base_rates.pickup?.per_km || 0) * 10)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Load Multiplier:</span>
                <p className="font-semibold">
                  ×{config.load_multipliers.furniture || 1.0}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Estimated Total:</span>
                <p className="font-bold text-lg text-blue-600">
                  {formatCurrency(
                    Math.max(
                      ((config.base_rates.pickup?.base || 0) +
                        (config.base_rates.pickup?.per_km || 0) * 10) *
                        (config.load_multipliers.furniture || 1.0),
                      config.minimum_charge || 0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        <Modal
          isOpen={resetModal.isOpen}
          onClose={closeResetModal}
          title="Reset Pricing Configuration"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 rounded-lg border bg-red-50 border-red-200">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Reset to Default Configuration
                </h4>
                <p className="text-sm mt-1 text-red-700">
                  This will reset all pricing settings to their default values.
                  Any custom configurations will be lost. This action cannot be
                  undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={closeResetModal}
                disabled={resetModal.loading}
                className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetModal.loading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto order-1 sm:order-2"
              >
                {resetModal.loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>Reset Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
