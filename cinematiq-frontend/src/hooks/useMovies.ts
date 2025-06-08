/**
 * Movies React Query Hooks for CinematIQ
 * Custom hooks for movie data fetching with React Query
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api';
import {
  type Movie,
  type MovieDetails,
  type PaginatedResponse,
  type Credits,
  type Genre,
  QUERY_KEYS,
} from '@/lib/api/types';

// ============================================================================
// Movie List Hooks
// ============================================================================

export function usePopularMovies(page: number = 1): UseQueryResult<PaginatedResponse<Movie>> {
  return useQuery({
    queryKey: QUERY_KEYS.movies.list('popular', page),
    queryFn: () => moviesApi.getPopular(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTopRatedMovies(page: number = 1): UseQueryResult<PaginatedResponse<Movie>> {
  return useQuery({
    queryKey: QUERY_KEYS.movies.list('top_rated', page),
    queryFn: () => moviesApi.getTopRated(page),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useUpcomingMovies(page: number = 1): UseQueryResult<PaginatedResponse<Movie>> {
  return useQuery({
    queryKey: QUERY_KEYS.movies.list('upcoming', page),
    queryFn: () => moviesApi.getUpcoming(page),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useNowPlayingMovies(page: number = 1): UseQueryResult<PaginatedResponse<Movie>> {
  return useQuery({
    queryKey: QUERY_KEYS.movies.list('now_playing', page),
    queryFn: () => moviesApi.getNowPlaying(page),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// ============================================================================
// Movie Details Hooks
// ============================================================================

export function useMovieDetails(movieId: number): UseQueryResult<MovieDetails> {
  return useQuery({
    queryKey: QUERY_KEYS.movies.detail(movieId),
    queryFn: () => moviesApi.getDetails(movieId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!movieId,
  });
}

export function useMovieCredits(movieId: number): UseQueryResult<Credits> {
  return useQuery({
    queryKey: QUERY_KEYS.credits.movie(movieId),
    queryFn: () => moviesApi.getCredits(movieId),
    staleTime: 1000 * 60 * 60, // 1 hour (credits rarely change)
    enabled: !!movieId,
  });
}

export function useMovieGenres(): UseQueryResult<{ genres: Genre[] }> {
  return useQuery({
    queryKey: QUERY_KEYS.genres.movies(),
    queryFn: () => moviesApi.getGenres(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (genres rarely change)
  });
}

export function useSearchMovies(query: string, page: number = 1): UseQueryResult<PaginatedResponse<Movie>> {
  return useQuery({
    queryKey: QUERY_KEYS.movies.searchQuery(query, page),
    queryFn: () => moviesApi.search({ query, page }),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: query.length > 0, // Only search when there's a query
  });
}

export function useSimilarMovies(movieId: number, page: number = 1): UseQueryResult<PaginatedResponse<Movie>> {
  return useQuery({
    queryKey: [...QUERY_KEYS.movies.detail(movieId), 'similar', page],
    queryFn: () => moviesApi.getSimilar(movieId, page),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!movieId,
  });
}

export function useRecommendedMovies(movieId: number, page: number = 1): UseQueryResult<PaginatedResponse<Movie>> {
  return useQuery({
    queryKey: [...QUERY_KEYS.movies.detail(movieId), 'recommendations', page],
    queryFn: () => moviesApi.getRecommendations(movieId, page),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!movieId,
  });
}
