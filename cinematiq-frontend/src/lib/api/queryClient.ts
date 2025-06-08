/**
 * React Query Configuration for CinematIQ
 * QueryClient setup with optimized defaults and error handling
 */

import { QueryClient, type DefaultOptions } from '@tanstack/react-query';
import { APIError } from './errors';

// ============================================================================
// Query Configuration
// ============================================================================

const queryConfig: DefaultOptions = {
  queries: {
    // Cache time - how long data stays in cache after component unmounts
    gcTime: 1000 * 60 * 5, // 5 minutes
    
    // Stale time - how long data is considered fresh
    staleTime: 1000 * 60 * 2, // 2 minutes
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof APIError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      
      // Retry up to 3 times for 5xx errors and network errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus (disabled for better UX)
    refetchOnWindowFocus: false,
    
    // Refetch on reconnect
    refetchOnReconnect: 'always',
    
    // Network mode
    networkMode: 'online',
  },
  mutations: {
    // Retry mutations once
    retry: 1,
    
    // Retry delay
    retryDelay: 1000,
    
    // Network mode
    networkMode: 'online',
  },
};

// ============================================================================
// Query Client Creation
// ============================================================================

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

export default queryClient;
