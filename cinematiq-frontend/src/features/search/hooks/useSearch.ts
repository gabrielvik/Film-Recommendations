/**
 * AI Search Hook for CinematIQ
 * React hook for managing AI-powered movie search state and operations
 */

import { useState, useCallback } from 'react';
import { searchApi, type MovieRecommendation } from '@/lib/api/services/search';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface UseSearchState {
  movies: MovieRecommendation[];
  isLoading: boolean;
  error: string | null;
  lastQuery: string | null;
}

interface UseSearchActions {
  search: (prompt: string) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export const useSearch = (): UseSearchState & UseSearchActions => {
  const [movies, setMovies] = useState<MovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(
    () => sessionStorage.getItem('lastSearchQuery')
  );

  const { isAuthenticated } = useAuth();

  const search = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError('Please enter a search query');
      return;
    }

    // Check authentication first
    if (!isAuthenticated) {
      setError('Please log in to get movie recommendations');
      setMovies([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const recommendations = await searchApi.getRecommendations(prompt);
      
      setMovies(recommendations);
      setLastQuery(prompt);
      
      // Save to session storage like the original
      sessionStorage.setItem('lastSearchQuery', prompt);
      sessionStorage.setItem('movieRecommendations', JSON.stringify(recommendations));
      
      if (recommendations.length === 0) {
        setError('No recommendations found. Please try a different search.');
      }
      
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to get recommendations');
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const clearResults = useCallback(() => {
    setMovies([]);
    setError(null);
    setLastQuery(null);
    sessionStorage.removeItem('lastSearchQuery');
    sessionStorage.removeItem('movieRecommendations');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    movies,
    isLoading,
    error,
    lastQuery,
    search,
    clearResults,
    clearError
  };
};
