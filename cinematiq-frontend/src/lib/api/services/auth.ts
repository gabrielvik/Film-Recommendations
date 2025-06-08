/**
 * Real Authentication API Service for CinematIQ
 * Integrates with .NET backend authentication endpoints
 */

import { backendClient } from '../backendClient';
import type { User } from '../types';
import TokenManager from '@/features/auth/utils/tokenManager';

// ============================================================================
// Authentication Types matching backend DTOs
// ============================================================================

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  userId: string;
}

interface AuthResult {
  user: User;
  token: string;
}

// ============================================================================
// Real Authentication Service
// ============================================================================

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: { username: string; password: string }): Promise<AuthResult> => {
    try {
      const loginRequest: LoginRequest = {
        email: credentials.username, // Assuming username is email
        password: credentials.password
      };

      const response = await backendClient.post<AuthResponse>('/api/Auth/login', loginRequest);
      const { token, userId } = response.data;

      // Create user object from token claims
      const userInfo = TokenManager.getUserFromToken(token);
      const mockUser: User = {
        id: userId,
        username: userInfo?.name || credentials.username,
        email: userInfo?.email || credentials.username,
        avatar_path: undefined,
        preferences: {
          adult_content: false,
          language: 'en',
          country: 'US',
          genres: [],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store token
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      console.log('✅ Login successful');
      return { user: mockUser, token };

    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Login failed');
      }
    }
  },

  /**
   * Register new user
   */
  register: async (credentials: { name: string; email: string; password: string }): Promise<AuthResult> => {
    try {
      const registerRequest: RegisterRequest = {
        userName: credentials.name,
        email: credentials.email,
        password: credentials.password
      };

      const response = await backendClient.post<AuthResponse>('/api/Auth/register', registerRequest);
      const { token, userId } = response.data;

      // Create user object
      const mockUser: User = {
        id: userId,
        username: credentials.name,
        email: credentials.email,
        avatar_path: undefined,
        preferences: {
          adult_content: false,
          language: 'en',
          country: 'US',
          genres: [],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store token
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      console.log('✅ Registration successful');
      return { user: mockUser, token };

    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      if (error.response?.status === 400) {
        const errors = error.response?.data?.errors;
        if (Array.isArray(errors)) {
          throw new Error(errors.join(', '));
        } else {
          throw new Error('Registration failed. Please check your information.');
        }
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Registration failed');
      }
    }
  },

  /**
   * Logout - clear local storage
   */
  logout: async (): Promise<void> => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    console.log('✅ Logout successful');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    // Check if token is expired
    if (TokenManager.isTokenExpired(token)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }

    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch {
        localStorage.removeItem('user');
      }
    }

    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    return !TokenManager.isTokenExpired(token);
  },

  /**
   * Get auth token for API calls
   */
  getAuthToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Legacy methods for compatibility - not used with real backend
  refreshToken: async () => {
    throw new Error('Token refresh not implemented for real backend');
  },
  
  needsRefresh: (): boolean => {
    return false; // Real backend handles this differently
  },

  // Placeholder methods for features not yet implemented
  forgotPassword: async (request: { email: string }): Promise<void> => {
    throw new Error('Password reset not implemented yet');
  },
  
  resetPassword: async (request: { token: string; password: string }): Promise<void> => {
    throw new Error('Password reset not implemented yet');
  },
  
  changePassword: async (request: { currentPassword: string; newPassword: string }): Promise<void> => {
    throw new Error('Change password not implemented yet');
  },
  
  loginWithGoogle: async (googleToken: string) => {
    throw new Error('Google login not implemented yet');
  },
  
  loginWithFacebook: async (facebookToken: string) => {
    throw new Error('Facebook login not implemented yet');
  },
};

// Export types
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthResult,
};