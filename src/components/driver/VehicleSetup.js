'use client';

import { useState } from 'react';
import { driverAPI } from '@/lib/api';
import {
  TruckIcon,
  PlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/common/Toast';

export default function VehicleSetup({ onVehicleAdded }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: '',
    make: '',
    model: '',
    year: '',
    license_plate: '',
    capacity_weight: '',
    capacity_volume: '',
    color: '',
    insurance_number: '',
    insurance_expiry: '',
    registration_number: '',
  });

  const toast = useToast();

  const vehicleTypes = [
    { value: 'pickup', label: 'Pickup Truck' },
    { value: 'van', label: 'Van' },
    { value: 'small_truck', label: 'Small Truck' },
    { value: 'medium_truck', label: 'Medium Truck' },
    { value: 'large_truck', label: 'Large Truck' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate insurance expiry date
      const insuranceExpiry = new Date(formData.insurance_expiry);
      if (insuranceExpiry <= new Date()) {
        toast('Insurance expiry date must be in the future');
        setLoading(false);
        return;
      }

      await driverAPI.addVehicle({
        ...formData,
        year: parseInt(formData.year),
        capacity_weight: parseFloat(formData.capacity_weight),
        capacity_volume: parseFloat(formData.capacity_volume),
        insurance_expiry: formData.insurance_expiry,
      });

      toast('Vehicle added successfully!');
      onVehicleAdded?.();

      // Reset form
      setFormData({
        vehicle_type: '',
        make: '',
        model: '',
        year: '',
        license_plate: '',
        capacity_weight: '',
        capacity_volume: '',
        color: '',
        insurance_number: '',
        insurance_expiry: '',
        registration_number: '',
      });
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      toast(error.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Get minimum date for insurance expiry (tomorrow)
  const getMinInsuranceDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TruckIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Add Vehicle</h3>
          <p className="text-sm text-gray-600">
            Register your vehicle to start accepting jobs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Vehicle Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Vehicle Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type *
              </label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                required
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Make */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make *
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                placeholder="e.g., Toyota, Ford, Isuzu"
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="e.g., Hilux, Transit, Canter"
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* License Plate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Plate *
              </label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                required
                placeholder="e.g., KAA 123A"
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color *
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                placeholder="e.g., White, Blue, Red"
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Capacity Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Capacity Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Capacity Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight Capacity (kg) *
              </label>
              <input
                type="number"
                name="capacity_weight"
                value={formData.capacity_weight}
                onChange={handleChange}
                required
                min="100"
                max="50000"
                step="50"
                placeholder="e.g., 1000"
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum: 100kg, Maximum: 50,000kg
              </p>
            </div>

            {/* Capacity Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume Capacity (m³) *
              </label>
              <input
                type="number"
                name="capacity_volume"
                value={formData.capacity_volume}
                onChange={handleChange}
                required
                min="1"
                max="200"
                step="0.5"
                placeholder="e.g., 5.0"
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum: 1m³, Maximum: 200m³
              </p>
            </div>
          </div>
        </div>

        {/* Legal Documentation */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Legal Documentation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Insurance Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Policy Number *
              </label>
              <input
                type="text"
                name="insurance_number"
                value={formData.insurance_number}
                onChange={handleChange}
                required
                placeholder="e.g., INS-123456789"
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Insurance Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Expiry Date *
              </label>
              <input
                type="date"
                name="insurance_expiry"
                value={formData.insurance_expiry}
                onChange={handleChange}
                required
                min={getMinInsuranceDate()}
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be a future date
              </p>
            </div>

            {/* Registration Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Registration Number *
              </label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                required
                placeholder="e.g., REG-987654321"
                className="w-full border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Official vehicle registration number from NTSA
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding Vehicle...</span>
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                <span>Add Vehicle</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">
          Required Documents:
        </h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Valid vehicle insurance policy</li>
          <li>• Current vehicle registration certificate</li>
          <li>• Vehicle should be roadworthy and meet safety standards</li>
          <li>• All information must match official documents</li>
        </ul>
      </div>
    </div>
  );
}
