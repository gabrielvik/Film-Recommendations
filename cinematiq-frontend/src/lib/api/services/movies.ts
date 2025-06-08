/**
 * Movies API Service for CinematIQ
 * TMDB API integration for movie data
 */

import { apiClient } from '../client';
import type {
  Movie,
  MovieDetails,
  PaginatedResponse,
  Credits,
  SearchQuery,
  Genre,
} from '../types';

// ============================================================================
// Movies API Service
// ============================================================================

export const moviesApi = {
  // Get popular movies
  getPopular: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movie/popular', {
      params: { page },
    });
    return response.data;
  },

  // Get top rated movies
  getTopRated: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movie/top_rated', {
      params: { page },
    });
    return response.data;
  },

  // Get upcoming movies
  getUpcoming: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movie/upcoming', {
      params: { page },
    });
    return response.data;
  },

  // Get now playing movies
  getNowPlaying: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movie/now_playing', {
      params: { page },
    });
    return response.data;
  },

  // Get movie details
  getDetails: async (movieId: number): Promise<MovieDetails> => {
    const response = await apiClient.get(`/movie/${movieId}`);
    return response.data;
  },

  // Get movie credits (cast and crew)
  getCredits: async (movieId: number): Promise<Credits> => {
    const response = await apiClient.get(`/movie/${movieId}/credits`);
    return response.data;
  },

  // Search movies
  search: async (searchQuery: SearchQuery): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/search/movie', {
      params: searchQuery,
    });
    return response.data;
  },

  // Get movie genres
  getGenres: async (): Promise<{ genres: Genre[] }> => {
    const response = await apiClient.get('/genre/movie/list');
    return response.data;
  },

  // Discover movies with filters
  discover: async (params: Record<string, any> = {}): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/discover/movie', {
      params: {
        sort_by: 'popularity.desc',
        page: 1,
        ...params,
      },
    });
    return response.data;
  },

  // Get similar movies
  getSimilar: async (movieId: number, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get(`/movie/${movieId}/similar`, {
      params: { page },
    });
    return response.data;
  },

  // Get recommended movies
  getRecommendations: async (movieId: number, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get(`/movie/${movieId}/recommendations`, {
      params: { page },
    });
    return response.data;
  },
};
