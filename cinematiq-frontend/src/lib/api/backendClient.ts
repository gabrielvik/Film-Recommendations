/**
 * Backend API Client Configuration for CinematIQ
 * Axios setup with .NET backend API integration, JWT authentication, and error handling
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { handleAPIError } from './errors';
import { authTokens } from './authTokens';

// ============================================================================
// Configuration
// ============================================================================

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7295/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// Backend Axios Instance Creation
// ============================================================================

export const backendClient: AxiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================================================
// Request Interceptors
// ============================================================================

backendClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = authTokens.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 Backend API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        hasAuth: !!token,
      });
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

backendClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ Backend API Response:', {
        status: response.status,
        url: response.config.url,
        dataSize: JSON.stringify(response.data).length,
      });
    }

    return response;
  },
  async (error) => {
    const apiError = handleAPIError(error);
    
    console.error('❌ Backend API Error:', {
      message: apiError.message,
      statusCode: apiError.statusCode,
      userMessage: apiError.userMessage,
      url: error.config?.url,
    });

    // Handle 401 errors by clearing tokens
    if (error.response?.status === 401) {
      authTokens.clearTokens();
    }

    return Promise.reject(apiError);
  }
);

// ============================================================================
// Helper Functions
// ============================================================================

export function isBackendAvailable(): boolean {
  return !!BACKEND_BASE_URL;
}

export function getBackendUrl(): string {
  return BACKEND_BASE_URL;
}

// Export default instance
export default backendClient;
