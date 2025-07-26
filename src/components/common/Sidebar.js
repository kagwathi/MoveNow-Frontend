'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export default function Sidebar({ items }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div
      className={cn(
        'h-[calc(100vh-5rem)] bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
              isActive(item.href)
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
            title={collapsed ? item.name : ''}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="font-medium">{item.name}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>MoveNow v1.0.0</p>
            <p>© 2025 All rights reserved</p>
          </div>
        </div>
      )}
    </div>
  );
}
