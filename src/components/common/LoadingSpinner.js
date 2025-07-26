import { cn } from '@/lib/utils';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

// Alternative spinner designs
export function PulseLoader({ className = '' }) {
  return (
    <div className={cn('flex space-x-2 ', className)}>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
    </div>
  );
}

export function SkeletonLoader({ lines = 3, className = '' }) {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-gray-200 rounded mb-3',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}
