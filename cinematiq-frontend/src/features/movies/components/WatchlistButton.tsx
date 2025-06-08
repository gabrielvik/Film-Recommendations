import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Heart, Plus, Check } from 'lucide-react';

interface WatchlistButtonProps {
  movieId: number;
  movieTitle: string;
  initialIsInWatchlist?: boolean;
  onToggle?: (isInWatchlist: boolean) => void;
  className?: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  movieId,
  movieTitle,
  initialIsInWatchlist = false,
  onToggle,
  className,
}) => {
  const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual watchlist API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newStatus = !isInWatchlist;
      setIsInWatchlist(newStatus);
      onToggle?.(newStatus);
      
      // Show feedback
      console.log(
        newStatus 
          ? `Added "${movieTitle}" to watchlist` 
          : `Removed "${movieTitle}" from watchlist`
      );
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isInWatchlist ? "default" : "outline"}
      onClick={handleToggle}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isInWatchlist ? (
        <Check className="h-4 w-4 mr-2" />
      ) : (
        <Plus className="h-4 w-4 mr-2" />
      )}
      {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
    </Button>
  );
};