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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-6 inline-block">
              <span className="text-4xl font-bold">MN</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome Back to MoveNow</h1>
            <p className="text-xl text-blue-100 max-w-md">
              Continue your journey with Kenya&apos;s leading transport platform
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🚛</div>
              <div className="font-semibold">500+ Drivers</div>
              <div className="text-sm text-blue-100">Verified & Ready</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-semibold">4.9/5 Rating</div>
              <div className="text-sm text-blue-100">Customer Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Animated elements */}
        <div className="absolute top-1/4 left-20 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-16 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-300"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
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

          {/* Demo Accounts */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-center text-sm text-gray-500 mb-4">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials('customer')}
                disabled={loading}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Fill Customer Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('driver')}
                disabled={loading}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Fill Driver Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                disabled={loading}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Fill Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
