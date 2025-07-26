'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';

export default function CustomerLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'customer') {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'customer') {
    return null;
  }

  const sidebarItems = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: '🏠' },
    { name: 'Book a Move', href: '/customer/book-move', icon: '📦' },
    { name: 'My Bookings', href: '/customer/bookings', icon: '📋' },
    { name: 'Profile', href: '/customer/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
