/**
 * API Module Index for CinematIQ
 * Central export point for all API-related functionality
 */

// Export API client and configuration
export { default as apiClient, createImageUrl, createBackdropUrl } from './client';

// Export types
export type * from './types';

// Export error handling
export * from './errors';

// Export services
export { moviesApi } from './services/movies';
export { authApi } from './services/auth';
