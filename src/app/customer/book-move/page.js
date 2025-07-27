'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import { bookingAPI, pricingAPI } from '@/lib/api';
import {
  Input,
  Select,
  Textarea,
  RadioGroup,
} from '@/components/common/FormInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LocationPicker from '@/components/common/MapWrapper';
import AddressSearch from '@/components/common/AddressSearch';
import {
  MapPinIcon,
  TruckIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

export default function BookMovePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [estimates, setEstimates] = useState(null);
  const [errors, setErrors] = useState({});

  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    pickup_address: '',
    pickup_lat: null,
    pickup_lng: null,
    dropoff_address: '',
    dropoff_lat: null,
    dropoff_lng: null,
    calculated_distance: null,
    calculated_duration: null,
    pickup_date: '',
    pickup_time: '',
    vehicle_type_required: '',
    load_type: 'other',
    load_description: '',
    estimated_weight: '',
    requires_helpers: false,
    helpers_count: 0,
    special_instructions: '',
  });

  const steps = [
    { id: 1, name: 'Locations', icon: MapPinIcon },
    { id: 2, name: 'Schedule', icon: CalendarIcon },
    { id: 3, name: 'Load Details', icon: TruckIcon },
    { id: 4, name: 'Pricing', icon: CurrencyDollarIcon },
  ];

  const vehicleTypes = [
    {
      value: 'pickup',
      label: 'Pickup Truck',
      description: 'Perfect for small moves and furniture',
      capacity: '500kg',
      icon: '🛻',
    },
    {
      value: 'small_truck',
      label: 'Small Truck',
      description: 'Great for apartment moves',
      capacity: '2 tonnes',
      icon: '🚚',
    },
    {
      value: 'medium_truck',
      label: 'Medium Truck',
      description: 'Ideal for house moves',
      capacity: '5 tonnes',
      icon: '🚛',
    },
    {
      value: 'large_truck',
      label: 'Large Truck',
      description: 'For large houses and offices',
      capacity: '10 tonnes',
      icon: '🚜',
    },
    {
      value: 'van',
      label: 'Van',
      description: 'Perfect for boxes and small items',
      capacity: '1 tonne',
      icon: '🚐',
    },
  ];

  const loadTypes = [
    { value: 'furniture', label: 'Furniture' },
    { value: 'appliances', label: 'Appliances' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fragile', label: 'Fragile Items' },
    { value: 'other', label: 'Other' },
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum time for today
  const getMinTime = () => {
    if (formData.pickup_date === getMinDate()) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30); // 30 minutes from now
      return now.toTimeString().slice(0, 5);
    }
    return '06:00'; // 6 AM for future dates
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Locations
        if (!formData.pickup_address) {
          newErrors.pickup_address = 'Pickup address is required';
        }
        if (!formData.dropoff_address) {
          newErrors.dropoff_address = 'Dropoff address is required';
        }
        // In a real app, you'd validate coordinates here
        break;

      case 2: // Schedule
        if (!formData.pickup_date) {
          newErrors.pickup_date = 'Pickup date is required';
        }
        if (!formData.pickup_time) {
          newErrors.pickup_time = 'Pickup time is required';
        }
        break;

      case 3: // Load Details
        if (!formData.vehicle_type_required) {
          newErrors.vehicle_type_required = 'Please select a vehicle type';
        }
        if (!formData.load_type) {
          newErrors.load_type = 'Please select load type';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        // Before going to pricing, get estimates
        await getPricingEstimates();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePickupLocationSelect = useCallback(
    (lat, lng, address) => {
      setFormData((prev) => ({
        ...prev,
        pickup_address: address,
        pickup_lat: lat,
        pickup_lng: lng,
      }));

      if (errors.pickup_address) {
        setErrors((prev) => ({
          ...prev,
          pickup_address: '',
        }));
      }
    },
    [errors.pickup_address]
  );

  const handleDropoffLocationSelect = useCallback(
    (lat, lng, address) => {
      setFormData((prev) => ({
        ...prev,
        dropoff_address: address,
        dropoff_lat: lat,
        dropoff_lng: lng,
      }));

      if (errors.dropoff_address) {
        setErrors((prev) => ({
          ...prev,
          dropoff_address: '',
        }));
      }
    },
    [errors.dropoff_address]
  );

  const handleRouteCalculated = useCallback((routeInfo) => {
    setFormData((prev) => ({
      ...prev,
      calculated_distance: routeInfo.distance,
      calculated_duration: routeInfo.duration,
    }));
  }, []);

  const getPricingEstimates = async () => {
    setPriceLoading(true);
    try {
      const response = await pricingAPI.estimate({
        pickup_lat: formData.pickup_lat,
        pickup_lng: formData.pickup_lng,
        dropoff_lat: formData.dropoff_lat,
        dropoff_lng: formData.dropoff_lng,
        calculated_distance: formData.calculated_distance,
        calculated_duration: formData.calculated_duration,
        pickup_date: formData.pickup_date,
        pickup_time: formData.pickup_time,
        load_type: formData.load_type,
        requires_helpers: formData.requires_helpers,
        helpers_count: formData.helpers_count,
      });

      setEstimates(response.data.data.estimates);
    } catch (error) {
      toast.error('Failed to get pricing estimates');
      console.error('Pricing error:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  const submitBooking = async () => {
    setLoading(true);
    try {
      const bookingData = {
        ...formData,
      };

      const response = await bookingAPI.create(bookingData);

      if (response.data.success) {
        toast.success('Booking created successfully!');
        router.push(`/customer/bookings`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book a Move</h1>
        <p className="text-gray-600 mt-1">
          Let&apos;s get your items moved safely and efficiently
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li
                key={step.name}
                className={`relative ${
                  stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                      step.id < currentStep
                        ? 'bg-green-600 text-white'
                        : step.id === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`ml-4 text-sm font-medium ${
                      step.id < currentStep
                        ? 'text-green-600'
                        : step.id === currentStep
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Step 1: Locations */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Where are we moving from and to?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <AddressSearch
                  label="Pickup Address"
                  name="pickup_address"
                  value={formData.pickup_address}
                  onChange={handleInputChange}
                  onLocationSelect={handlePickupLocationSelect}
                  error={errors.pickup_address}
                  placeholder="Search for pickup location"
                  required
                />
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <InformationCircleIcon className="h-4 w-4 mr-1" />
                  Start typing to search for locations in Kenya
                </div>
              </div>

              <div>
                <AddressSearch
                  label="Dropoff Address"
                  name="dropoff_address"
                  value={formData.dropoff_address}
                  onChange={handleInputChange}
                  onLocationSelect={handleDropoffLocationSelect}
                  error={errors.dropoff_address}
                  placeholder="Search for dropoff location"
                  required
                />
              </div>
            </div>

            {/* Interactive Map - REPLACE THE PLACEHOLDER WITH THIS */}
            <LocationPicker
              onLocationSelect={handleRouteCalculated}
              pickupAddress={formData.pickup_address}
              dropoffAddress={formData.dropoff_address}
              pickupCoords={
                formData.pickup_lat && formData.pickup_lng
                  ? {
                      lat: formData.pickup_lat,
                      lng: formData.pickup_lng,
                    }
                  : null
              }
              dropoffCoords={
                formData.dropoff_lat && formData.dropoff_lng
                  ? {
                      lat: formData.dropoff_lat,
                      lng: formData.dropoff_lng,
                    }
                  : null
              }
            />

            {/* Location Summary */}
            {formData.pickup_address && formData.dropoff_address && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2">
                  Route Summary
                </h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>
                    <strong>From:</strong> {formData.pickup_address}
                  </p>
                  <p>
                    <strong>To:</strong> {formData.dropoff_address}
                  </p>
                  {formData.calculated_distance && (
                    <p>
                      <strong>Distance:</strong>{' '}
                      {formData.calculated_distance.toFixed(1)} km
                    </p>
                  )}
                  {formData.calculated_duration && (
                    <p>
                      <strong>Estimated Time:</strong>{' '}
                      {Math.round(formData.calculated_duration)} minutes
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Schedule */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                When would you like to move?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Pickup Date"
                type="date"
                name="pickup_date"
                value={formData.pickup_date}
                onChange={handleInputChange}
                error={errors.pickup_date}
                min={getMinDate()}
                required
              />

              <Input
                label="Pickup Time"
                type="time"
                name="pickup_time"
                value={formData.pickup_time}
                onChange={handleInputChange}
                error={errors.pickup_time}
                min={getMinTime()}
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Booking Tips
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Book at least 30 minutes in advance</li>
                      <li>Peak hours (7-9 AM, 5-7 PM) may have higher rates</li>
                      <li>Weekend bookings may incur additional charges</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Load Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tell us about your load
              </h2>
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Choose Your Vehicle <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicleTypes.map((vehicle) => (
                  <label
                    key={vehicle.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.vehicle_type_required === vehicle.value
                        ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicle_type_required"
                      value={vehicle.value}
                      checked={formData.vehicle_type_required === vehicle.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col">
                      <div className="text-2xl mb-2">{vehicle.icon}</div>
                      <div className="font-medium text-gray-900">
                        {vehicle.label}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {vehicle.description}
                      </div>
                      <div className="text-xs font-medium text-blue-600">
                        Capacity: {vehicle.capacity}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.vehicle_type_required && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.vehicle_type_required}
                </p>
              )}
            </div>

            {/* Load Type */}
            <Select
              label="What are you moving?"
              name="load_type"
              value={formData.load_type}
              onChange={handleInputChange}
              options={loadTypes}
              error={errors.load_type}
              required
            />

            {/* Load Description */}
            <Textarea
              label="Load Description"
              name="load_description"
              value={formData.load_description}
              onChange={handleInputChange}
              placeholder="Describe your items (e.g., 3-seater sofa, dining table, 10 boxes)"
              rows={3}
              helperText="Help drivers prepare for your move"
            />

            {/* Estimated Weight */}
            <Input
              label="Estimated Weight (kg)"
              type="number"
              name="estimated_weight"
              value={formData.estimated_weight}
              onChange={handleInputChange}
              placeholder="e.g., 500"
              helperText="Optional - helps us suggest the right vehicle"
            />

            {/* Helpers */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requires_helpers"
                  checked={formData.requires_helpers}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  I need helpers for loading/unloading
                </label>
              </div>

              {formData.requires_helpers && (
                <Select
                  label="Number of Helpers"
                  name="helpers_count"
                  value={formData.helpers_count}
                  onChange={handleInputChange}
                  options={[
                    { value: 1, label: '1 Helper' },
                    { value: 2, label: '2 Helpers' },
                    { value: 3, label: '3 Helpers' },
                  ]}
                />
              )}
            </div>

            {/* Special Instructions */}
            <Textarea
              label="Special Instructions"
              name="special_instructions"
              value={formData.special_instructions}
              onChange={handleInputChange}
              placeholder="Any special requirements or instructions for the driver"
              rows={3}
            />
          </div>
        )}

        {/* Step 4: Pricing */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pricing & Confirmation
              </h2>
            </div>

            {priceLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Calculating pricing...</p>
              </div>
            ) : estimates ? (
              <div className="space-y-6">
                {/* Selected Vehicle Pricing */}
                {estimates[formData.vehicle_type_required] && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-900">
                        Your Booking Summary
                      </h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          estimates[formData.vehicle_type_required].total_price
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Trip Details
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>From: {formData.pickup_address}</p>
                          <p>To: {formData.dropoff_address}</p>
                          <p>
                            Date: {formData.pickup_date} at{' '}
                            {formData.pickup_time}
                          </p>
                          <p>
                            Vehicle:{' '}
                            {
                              vehicleTypes.find(
                                (v) =>
                                  v.value === formData.vehicle_type_required
                              )?.label
                            }
                          </p>
                          <p>
                            Load:{' '}
                            {
                              loadTypes.find(
                                (l) => l.value === formData.load_type
                              )?.label
                            }
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Price Breakdown
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Base rate:</span>
                            <span>
                              {formatCurrency(
                                estimates[formData.vehicle_type_required]
                                  .base_price
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>
                              Distance (
                              {formData.calculated_distance?.toFixed(1) || 0}
                              km):
                            </span>
                            <span>
                              {formatCurrency(
                                estimates[formData.vehicle_type_required]
                                  .distance_price
                              )}
                            </span>
                          </div>
                          {estimates[formData.vehicle_type_required]
                            .helper_charges > 0 && (
                            <div className="flex justify-between">
                              <span>Helpers:</span>
                              <span>
                                {formatCurrency(
                                  estimates[formData.vehicle_type_required]
                                    .helper_charges
                                )}
                              </span>
                            </div>
                          )}
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>Total:</span>
                            <span>
                              {formatCurrency(
                                estimates[formData.vehicle_type_required]
                                  .total_price
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Terms & Conditions
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Payment is due upon completion of the move</p>
                    <p>
                      • Cancellation must be made at least 2 hours in advance
                    </p>
                    <p>
                      • Additional charges may apply for delays or extra
                      services
                    </p>
                    <p>• All items are insured up to KSh 100,000</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Unable to load pricing. Please try again.
                </p>
                <button
                  onClick={getPricingEstimates}
                  className="mt-4 btn-primary"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submitBooking}
              disabled={loading || !estimates}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Creating Booking...</span>
                </>
              ) : (
                <>
                  <span>Confirm Booking</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
