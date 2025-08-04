'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';

export default function DriverLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'driver') {
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

  if (!user || user.role !== 'driver') {
    return null;
  }

  const sidebarItems = [
    { name: 'Dashboard', href: '/driver/dashboard', icon: '📊' },
    { name: 'Available Jobs', href: '/driver/jobs', icon: '💼' },
    { name: 'Current Job', href: '/driver/current-job', icon: '🚛' },
    { name: 'Job History', href: '/driver/history', icon: '📋' },
    { name: 'Earnings', href: '/driver/earnings', icon: '💰' },
    { name: 'Profile', href: '/driver/profile', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header user={user} />
      <div className="flex">
        <Sidebar items={sidebarItems} onToggle={setSidebarCollapsed} />
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
