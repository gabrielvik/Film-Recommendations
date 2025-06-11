/**
 * HTTP Client Configuration for CinematIQ
 * Axios setup with TMDB API integration, interceptors, and error handling
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { handleAPIError } from './errors';
import TokenManager from '@/features/auth/utils/tokenManager';

// ============================================================================
// Configuration
// ============================================================================

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'demo_key';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// Axios Instance Creation
// ============================================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================================================
// Request Interceptors
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    // Add API key to all requests
    config.params = {
      api_key: TMDB_API_KEY,
      ...config.params,
    };

    // Add authentication token from TokenManager
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(handleAPIError(error));
  }
);

// ============================================================================
// Response Interceptors
// ============================================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken && !TokenManager.isTokenExpired(refreshToken)) {
          // Import authApi dynamically to avoid circular dependency
          const { authApi } = await import('./services/auth');
          const newTokens = await authApi.refreshToken();
          
          // Update the authorization header and retry the request
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        } else {
          // Refresh token is invalid, redirect to login
          TokenManager.clearTokens();
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    const apiError = handleAPIError(error);
    
    console.error('❌ API Error:', {
      message: apiError.message,
      statusCode: apiError.statusCode,
      userMessage: apiError.userMessage,
    });

    return Promise.reject(apiError);
  }
);

// ============================================================================
// Helper Functions
// ============================================================================

export function createImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path) return '/placeholder-movie.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function createBackdropUrl(path: string | null, size: string = 'w1280'): string {
  if (!path) return '/placeholder-backdrop.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Export default instance
export default apiClient;
