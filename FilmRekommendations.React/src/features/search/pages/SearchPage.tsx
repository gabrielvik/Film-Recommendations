import { useState } from 'react';
import { FilterPanel, InfiniteMovieGrid } from '@/features/movies/components';
import { useInfiniteMovies, useMovieFilters } from '@/features/movies/hooks/useInfiniteMovies';
import { Card } from '@/components/ui/card';
import { Search, TrendingUp, Star, Calendar } from 'lucide-react';

const SearchPage = () => {
  const { filters, updateFilters, resetFilters } = useMovieFilters();
  const [watchlistIds] = useState<Set<number>>(new Set());
  const [favoriteIds] = useState<Set<number>>(new Set());

  const {
    movies,
    totalResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteMovies({ filters });

  const handleWatchlistAdd = (movieId: number) => {
    // TODO: Implement watchlist functionality
    console.log('Add to watchlist:', movieId);
  };

  const handleFavoriteAdd = (movieId: number) => {
    // TODO: Implement favorites functionality
    console.log('Add to favorites:', movieId);
  };

  const emptyState = (
    <div className="text-center py-12">
      <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
      <p className="text-muted-foreground mb-6">
        {filters.query.trim() 
          ? `No movies found for "${filters.query}"`
          : 'Enter a movie title or apply filters to discover movies'
        }
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
        <Card className="p-4 text-center">
          <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Trending</p>
          <p className="text-xs text-muted-foreground">Popular movies</p>
        </Card>
        <Card className="p-4 text-center">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm font-medium">Top Rated</p>
          <p className="text-xs text-muted-foreground">Highly rated films</p>
        </Card>
        <Card className="p-4 text-center">
          <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium">New Releases</p>
          <p className="text-xs text-muted-foreground">Latest movies</p>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search & Discover Movies</h1>
        <p className="text-muted-foreground">
          Find your next favorite movie with our advanced search and filtering system
        </p>
      </div>

      <FilterPanel
        filters={filters}
        onFiltersChange={updateFilters}
        onReset={resetFilters}
        isLoading={isLoading}
        resultsCount={totalResults}
      />

      <InfiniteMovieGrid
        movies={movies}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        onLoadMore={fetchNextPage}
        onWatchlistAdd={handleWatchlistAdd}
        onFavoriteAdd={handleFavoriteAdd}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        emptyState={emptyState}
      />
    </div>
  );
};

export default SearchPage;
