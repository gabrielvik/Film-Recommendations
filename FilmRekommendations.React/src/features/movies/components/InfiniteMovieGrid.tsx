import { useEffect, useRef, memo } from 'react';
import { MovieCard } from './MovieCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import type { Movie } from '@/lib/api/types';

interface InfiniteMovieGridProps {
  movies: Movie[];
  isLoading: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  variant?: 'default' | 'compact' | 'featured';
  onWatchlistAdd?: (movieId: number) => void;
  onFavoriteAdd?: (movieId: number) => void;
  watchlistIds?: Set<number>;
  favoriteIds?: Set<number>;
  emptyState?: React.ReactNode;
}

export const InfiniteMovieGrid = memo(({
  movies,
  isLoading,
  hasNextPage,
  onLoadMore,
  variant = 'default',
  onWatchlistAdd,
  onFavoriteAdd,
  watchlistIds = new Set(),
  favoriteIds = new Set(),
  emptyState,
}: InfiniteMovieGridProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isLoading, onLoadMore]);

  const gridClass = {
    default: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
    compact: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
    featured: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
  }[variant];

  if (movies.length === 0 && !isLoading) {
    return emptyState || (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No movies found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={gridClass}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            variant={variant}
            onWatchlistAdd={onWatchlistAdd}
            onFavoriteAdd={onFavoriteAdd}
            isInWatchlist={watchlistIds.has(movie.id)}
            isInFavorites={favoriteIds.has(movie.id)}
          />
        ))}
        
        {isLoading && (
          <LoadingSkeleton count={variant === 'featured' ? 3 : 8} variant={variant} />
        )}
      </div>

      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-10" />
    </div>
  );
});

InfiniteMovieGrid.displayName = 'InfiniteMovieGrid';
