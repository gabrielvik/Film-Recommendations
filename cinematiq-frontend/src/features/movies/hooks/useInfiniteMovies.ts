import { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/services/movies';
import type { Movie, PaginatedResponse } from '@/lib/api/types';
import type { FilterState } from '../components/FilterPanel';

interface UseInfiniteMoviesOptions {
  filters: FilterState;
  enabled?: boolean;
}

export const useInfiniteMovies = ({ filters, enabled = true }: UseInfiniteMoviesOptions) => {
  const queryKey = ['movies', 'infinite', filters];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      if (filters.query.trim()) {
        // Search movies
        return moviesApi.search({
          query: filters.query,
          page: pageParam,
          include_adult: filters.includeAdult,
        });
      } else {
        // Discover movies with filters
        const params: Record<string, any> = {
          page: pageParam,
          sort_by: filters.sortBy,
          include_adult: filters.includeAdult,
        };

        if (filters.genres.length > 0) {
          params.with_genres = filters.genres.join(',');
        }

        if (filters.yearFrom) {
          params['primary_release_date.gte'] = `${filters.yearFrom}-01-01`;
        }

        if (filters.yearTo) {
          params['primary_release_date.lte'] = `${filters.yearTo}-12-31`;
        }

        if (filters.ratingFrom > 0) {
          params['vote_average.gte'] = filters.ratingFrom;
        }

        if (filters.ratingTo < 10) {
          params['vote_average.lte'] = filters.ratingTo;
        }

        return moviesApi.discover(params);
      }
    },
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) => {
      return lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten all pages into a single array of movies
  const movies: Movie[] = data?.pages.flatMap(page => page.results) ?? [];
  const totalResults = data?.pages[0]?.total_results ?? 0;

  return {
    movies,
    totalResults,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useMovieFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    genres: [],
    yearFrom: null,
    yearTo: null,
    ratingFrom: 0,
    ratingTo: 10,
    sortBy: 'popularity.desc',
    includeAdult: false,
  });

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      genres: [],
      yearFrom: null,
      yearTo: null,
      ratingFrom: 0,
      ratingTo: 10,
      sortBy: 'popularity.desc',
      includeAdult: false,
    });
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters,
    setFilters,
  };
};
