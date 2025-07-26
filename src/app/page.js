'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  TruckIcon,
  ClockIcon,
  ShieldCheckIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    // Redirect authenticated users to their dashboard
    if (user) {
      const dashboards = {
        customer: '/customer/dashboard',
        driver: '/driver/dashboard',
        admin: '/admin/dashboard',
      };
      router.push(dashboards[user.role] || '/customer/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Happy Customers', value: '10,000+', icon: '😊' },
    { label: 'Successful Moves', value: '25,000+', icon: '📦' },
    { label: 'Verified Drivers', value: '500+', icon: '🚛' },
    { label: 'Cities Covered', value: '5+', icon: '🏙️' },
  ];

  const features = [
    {
      icon: ClockIcon,
      title: 'Instant Booking',
      description: 'Book your move in under 2 minutes with real-time pricing',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TruckIcon,
      title: 'Verified Drivers',
      description: 'Professional drivers with background checks and insurance',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Insured',
      description: 'Your belongings are protected with comprehensive insurance',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MapPinIcon,
      title: 'Real-time Tracking',
      description: 'Track your move live from pickup to delivery',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Kimani',
      role: 'Marketing Manager',
      content:
        'MoveNow made my apartment move so easy! The driver arrived on time and handled everything professionally.',
      rating: 5,
      avatar: '👩‍💼',
    },
    {
      name: 'John Mwangi',
      role: 'Business Owner',
      content:
        'As a driver, MoveNow has given me consistent income and flexible working hours. Highly recommend!',
      rating: 5,
      avatar: '👨‍🔧',
    },
    {
      name: 'Grace Achieng',
      role: 'Teacher',
      content:
        'The app is so user-friendly and the pricing is transparent. No hidden fees, no surprises!',
      rating: 5,
      avatar: '👩‍🏫',
    },
  ];

  const vehicleTypes = [
    {
      name: 'Pickup Truck',
      capacity: '500kg',
      image: '🛻',
      price: 'From KSh 500',
    },
    {
      name: 'Small Truck',
      capacity: '2 tonnes',
      image: '🚚',
      price: 'From KSh 800',
    },
    {
      name: 'Medium Truck',
      capacity: '5 tonnes',
      image: '🚛',
      price: 'From KSh 1,200',
    },
    {
      name: 'Large Truck',
      capacity: '10 tonnes',
      image: '🚜',
      price: 'From KSh 1,800',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl">
                <span className="font-bold text-xl">MN</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MoveNow
                </h1>
                <p className="text-xs text-gray-500">Transport Solutions</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Reviews
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Contact
              </a>
            </nav>

            <div className="flex space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div
              className={`transform transition-all duration-1000 ${
                isVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Move Anything,
                </span>
                <br />
                <span className="text-gray-900">Anywhere</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Book reliable trucks and professional drivers for your moving
                needs. Fast, secure, and affordable transport solutions across
                Kenya.
              </p>
            </div>

            <div
              className={`transform transition-all duration-1000 delay-300 ${
                isVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/register?role=customer"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Book Your Move</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/register?role=driver"
                  className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <TruckIcon className="w-5 h-5" />
                  <span>Drive & Earn</span>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`transform transition-all duration-700 delay-${
                      500 + index * 100
                    } ${
                      isVisible
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-10 opacity-0'
                    }`}
                  >
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-purple-400/20 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-pink-400/20 rounded-full animate-ping delay-700"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MoveNow?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;ve reimagined the moving experience with cutting-edge
              technology and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                ></div>
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Vehicle
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From small moves to large relocations, we have the right vehicle
              for every job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vehicleTypes.map((vehicle, index) => (
              <div
                key={vehicle.name}
                className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {vehicle.image}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {vehicle.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  Capacity: {vehicle.capacity}
                </p>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  {vehicle.price}
                </div>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
                  Select Vehicle
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, fast, and reliable. Get your move completed in 3 easy
              steps.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: '01',
                  title: 'Book Online',
                  description:
                    'Enter pickup and delivery details, choose your vehicle, and get instant pricing.',
                  icon: '📱',
                },
                {
                  step: '02',
                  title: 'Get Matched',
                  description:
                    'We connect you with verified drivers in your area within minutes.',
                  icon: '🤝',
                },
                {
                  step: '03',
                  title: 'Move Complete',
                  description:
                    'Track your move in real-time and rate your experience.',
                  icon: '✅',
                },
              ].map((step, index) => (
                <div key={step.step} className="text-center relative">
                  <div className="relative z-10 bg-white">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                      {step.step}
                    </div>
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Users Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust MoveNow for their
              moving needs.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[activeTestimonial].rating)].map(
                  (_, i) => (
                    <StarIcon
                      key={i}
                      className="w-6 h-6 text-yellow-400 fill-current"
                    />
                  )
                )}
              </div>

              <blockquote className="text-2xl text-gray-700 mb-8 leading-relaxed">
                &quot;{testimonials[activeTestimonial].content}&quot;
              </blockquote>

              <div className="flex items-center justify-center space-x-4">
                <div className="text-4xl">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[activeTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Move?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of happy customers and experience the future of
            moving today.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/register?role=customer"
              className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Start Moving Now</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/register?role=driver"
              className="group px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <TruckIcon className="w-5 h-5" />
              <span>Become a Driver</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl">
                  <span className="font-bold text-xl">MN</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">MoveNow</h3>
                  <p className="text-gray-400 text-sm">Transport Solutions</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Making moving simple, fast, and affordable across Kenya.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span>📘</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                  <span>🐦</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                  <span>📷</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    House Moving
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Office Relocation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Furniture Delivery
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Appliance Transport
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Safety
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span>+254 700 123 456</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>support@movenow.co.ke</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Nairobi, Kenya</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 MoveNow. All rights reserved. Built with ❤️ in Kenya.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
