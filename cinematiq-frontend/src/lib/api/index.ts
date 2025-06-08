/**
 * API Module Index for CinematIQ
 * Central export point for all API-related functionality
 */

// Export API client and configuration
export { default as apiClient, createImageUrl, createBackdropUrl } from './client';
export { default as queryClient } from './queryClient';

// Export types
export type * from './types';
export { QUERY_KEYS } from './types';

// Export error handling
export * from './errors';

// Export services
export { moviesApi } from './services/movies';
export { authApi } from './services/auth';

// Export React Query configuration
export { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export { ReactQueryDevtools } from '@tanstack/react-query-devtools';
