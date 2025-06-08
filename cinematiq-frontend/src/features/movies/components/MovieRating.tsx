import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MovieRatingProps {
  currentRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MovieRating: React.FC<MovieRatingProps> = ({
  currentRating = 0,
  onRate,
  readonly = false,
  size = 'md',
  className,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  const displayRating = hoveredRating || currentRating;

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
        <button
          key={rating}
          onClick={() => !readonly && onRate?.(rating)}
          onMouseEnter={() => !readonly && setHoveredRating(rating)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
          disabled={readonly}
          className={cn(
            'transition-colors',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              rating <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            )}
          />
        </button>
      ))}
      
      {displayRating > 0 && (
        <span className="ml-2 font-semibold">
          {displayRating}/10
        </span>
      )}
    </div>
  );
};