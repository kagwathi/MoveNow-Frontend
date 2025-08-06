'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/common/Toast';
import { Input, PasswordInput } from '@/components/common/FormInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || null;

  useEffect(() => {
    // If user is already logged in, redirect to their dashboard
    if (user) {
      const dashboards = {
        customer: '/customer/dashboard',
        driver: '/driver/dashboard',
        admin: '/admin/dashboard',
      };
      router.push(redirectTo || dashboards[user.role] || '/customer/dashboard');
    }
  }, [user, router, redirectTo]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const user = await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      toast.success(`Welcome back, ${user.first_name}!`);

      // Redirect based on role or redirect URL
      const dashboards = {
        customer: '/customer/dashboard',
        driver: '/driver/dashboard',
        admin: '/admin/dashboard',
      };

      const targetUrl =
        redirectTo || dashboards[user.role] || '/customer/dashboard';
      router.push(targetUrl);
    } catch (error) {
      toast.error(error.message);

      // Handle specific error types
      if (error.message.includes('Invalid email or password')) {
        setErrors({
          general:
            'Invalid email or password. Please check your credentials and try again.',
        });
      } else if (error.message.includes('deactivated')) {
        setErrors({
          general: 'Your account has been deactivated. Please contact support.',
        });
      } else {
        setErrors({ general: error.message });
        console.log(error);
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

  const fillDemoCredentials = (role) => {
    const demoCredentials = {
      customer: { email: 'customer@demo.com', password: 'password123' },
      driver: { email: 'driver@demo.com', password: 'password123' },
      admin: { email: 'admin@movenow.com', password: 'Admin123!' },
    };

    const credentials = demoCredentials[role];
    if (credentials) {
      setFormData({
        ...formData,
        ...credentials,
      });
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl">
              <span className="font-bold text-2xl">MN</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="Enter your email"
            autoComplete="email"
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
