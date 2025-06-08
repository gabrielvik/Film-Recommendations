import { memo } from 'react';
import { Card } from '@/components/ui/card';

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'default' | 'compact' | 'featured';
}

export const LoadingSkeleton = memo(({ count = 8, variant = 'default' }: LoadingSkeletonProps) => {
  if (variant === 'compact') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="p-3 animate-pulse">
            <div className="flex space-x-3">
              <div className="w-16 h-24 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </>
    );
  }

  if (variant === 'featured') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="relative overflow-hidden animate-pulse">
            <div className="h-80 bg-muted" />
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </Card>
        ))}
      </>
    );
  }

  // Default variant
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden animate-pulse">
          <div className="aspect-[2/3] bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="space-y-1">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
            <div className="flex space-x-1">
              <div className="h-5 bg-muted rounded w-12" />
              <div className="h-5 bg-muted rounded w-16" />
            </div>
          </div>
        </Card>
      ))}
    </>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';
