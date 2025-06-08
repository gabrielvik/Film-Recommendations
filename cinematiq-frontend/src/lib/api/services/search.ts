/**
 * AI Search Service for CinematIQ
 * Service for handling AI-powered movie recommendations using the .NET backend API
 */

import { backendClient } from '../backendClient';
import type { Movie } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface SearchRequest {
  prompt: string;
}

export interface SearchResponse {
  movies: Movie[];
  searchQuery: string;
}

export interface MovieRecommendation {
  movie_id: number;
  movie_name: string;
  release_year: number;
  poster_path: string;
  overview?: string;
  genres?: string[];
  tmdb_id?: number;
}

// ============================================================================
// AI Search Service
// ============================================================================

export const searchApi = {
  /**
   * Get AI-powered movie recommendations
   * Matches the original frontend API call exactly
   */
  getRecommendations: async (prompt: string): Promise<MovieRecommendation[]> => {
    if (!prompt.trim()) {
      throw new Error('Search prompt cannot be empty');
    }

    try {
      // Use the exact same endpoint as the original frontend
      const response = await backendClient.get('/FilmRecomendations/GetFilmRecommendation', {
        params: {
          prompt: prompt.trim()
        }
      });

      // The API returns an array of movie recommendations directly
      const movies: MovieRecommendation[] = response.data;

      if (!Array.isArray(movies)) {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      console.log(`✅ Received ${movies.length} movie recommendations for: "${prompt}"`);
      return movies;

    } catch (error: any) {
      console.error('❌ Error fetching movie recommendations:', error);
      
      // Handle specific error types
      if (error.response?.status === 401) {
        throw new Error('Please log in to get movie recommendations');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid search query. Please try again with a different prompt.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.message || 'Failed to get movie recommendations');
      }
    }
  },

  /**
   * Search with predefined suggestions
   * Helper method for suggestion chips
   */
  searchWithSuggestion: async (suggestion: string): Promise<MovieRecommendation[]> => {
    return searchApi.getRecommendations(suggestion);
  }
};

// Export types
export type { MovieRecommendation };
