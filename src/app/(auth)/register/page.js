'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/common/Toast';
import {
  Input,
  PasswordInput,
  RadioGroup,
} from '@/components/common/FormInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'customer';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: initialRole,
    terms_accepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    // If user is already logged in, redirect to their dashboard
    if (user) {
      const dashboards = {
        customer: '/customer/dashboard',
        driver: '/driver/dashboard',
        admin: '/admin/dashboard',
      };
      router.push(dashboards[user.role] || '/customer/dashboard');
    }
  }, [user, router]);

  const roleOptions = [
    {
      value: 'customer',
      label: 'Customer',
      description: 'Book transport services for your moving needs',
    },
    {
      value: 'driver',
      label: 'Driver',
      description: 'Earn money by providing transport services',
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.first_name.trim())) {
      newErrors.first_name = 'First name can only contain letters and spaces';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.last_name.trim())) {
      newErrors.last_name = 'Last name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.password
      )
    ) {
      newErrors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const userData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.replace(/\s/g, ''),
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role,
      };

      const user = await register(userData);
      toast.success(`Welcome to MoveNow, ${user.first_name}!`);

      // Redirect based on role
      const dashboards = {
        customer: '/customer/dashboard',
        driver: '/driver/dashboard',
        admin: '/admin/dashboard',
      };

      router.push(dashboards[user.role] || '/customer/dashboard');
    } catch (error) {
      toast.error(error.message);

      // Handle specific backend validation errors
      if (error.message.includes('Email address already exists')) {
        setErrors({
          email: 'This email is already registered. Try logging in instead.',
        });
      } else if (error.message.includes('Phone number already exists')) {
        setErrors({ phone: 'This phone number is already registered.' });
      } else if (error.message.includes('Validation error')) {
        // Parse validation errors from backend
        setErrors({ general: error.message });
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    if (errors.general) {
      setErrors({
        ...errors,
        general: '',
      });
    }
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  console.log(formData.password);
  console.log(formData.confirm_password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex">
      {/* Left Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl">
                <span className="font-bold text-2xl">MN</span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Join MoveNow
            </h2>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <RadioGroup
              label="I want to:"
              options={roleOptions}
              value={formData.role}
              onChange={handleRoleChange}
              name="role"
              required
            />

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
                placeholder="John"
                autoComplete="given-name"
              />
              <Input
                label="Last Name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
                placeholder="Doe"
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="john@example.com"
              autoComplete="email"
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
              placeholder="254712345678"
              helperText="Include country code (e.g., 254 for Kenya)"
              autoComplete="tel"
            />

            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="Create a secure password"
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm Password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              error={errors.confirm_password}
              required
              placeholder="Confirm your password"
              autoComplete="new-password"
            />

            <div className="space-y-2">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:text-blue-700"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-700"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </div>
              {errors.terms_accepted && (
                <p className="text-red-600 text-sm">{errors.terms_accepted}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                `Create ${
                  formData.role === 'customer' ? 'Customer' : 'Driver'
                } Account`
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {formData.role === 'customer'
                ? 'Move with Confidence'
                : 'Drive and Earn'}
            </h1>
            <p className="text-xl text-purple-100 max-w-md">
              {formData.role === 'customer'
                ? 'Join thousands of satisfied customers who trust MoveNow for their transport needs'
                : 'Turn your vehicle into a source of income with flexible working hours'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-sm">
            {formData.role === 'customer' ? (
              <>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-semibold">Instant Booking</div>
                  <div className="text-sm text-purple-100">
                    Book in under 2 minutes
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">🛡️</div>
                  <div className="font-semibold">Fully Insured</div>
                  <div className="text-sm text-purple-100">
                    Your items are protected
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">📍</div>
                  <div className="font-semibold">Real-time Tracking</div>
                  <div className="text-sm text-purple-100">
                    Monitor your move live
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-semibold">Earn Well</div>
                  <div className="text-sm text-purple-100">
                    Up to KSh 3,000 per day
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="font-semibold">Flexible Hours</div>
                  <div className="text-sm text-purple-100">
                    Work when you want
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="font-semibold">Easy to Use</div>
                  <div className="text-sm text-purple-100">
                    Simple app interface
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Animated elements */}
        <div className="absolute top-1/4 right-20 w-20 h-20 bg-white/10 rounded-full floating-element"></div>
        <div className="absolute bottom-1/3 left-16 w-16 h-16 bg-white/10 rounded-full floating-element-delayed"></div>
      </div>
    </div>
  );
}
