/**
 * Loading Indicator Component
 * Shows loading state during AI search requests
 */

import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingIndicator = ({ 
  className, 
  size = 'md', 
  message = 'Searching for movies...' 
}: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-6',
      className
    )}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size]
      )} />
      {message && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );
};
