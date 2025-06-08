/**
 * Enhanced Authentication API Service for CinematIQ
 * Comprehensive auth service with JWT token management
 */

import type { User, LoginCredentials } from '../types';
import TokenManager, { type TokenPair } from '@/features/auth/utils/tokenManager';

// ============================================================================
// Enhanced Authentication Types
// ============================================================================

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

interface ResetPasswordRequest {
  email: string;
}

interface ResetPasswordConfirm {
  token: string;
  password: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface SocialLoginResponse {
  user: User;
  tokens: TokenPair;
  isNewUser: boolean;
}

// ============================================================================
// Enhanced Authentication Service
// ============================================================================

export const authApi = {
  /**
   * Enhanced login with JWT tokens
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation
    if (credentials.username === 'demo' && credentials.password === 'password') {
      const mockUser: User = {
        id: '1',
        username: credentials.username,
        email: 'demo@cinematiq.com',
        avatar_path: undefined,
        preferences: {
          adult_content: false,
          language: 'en',
          country: 'US',
          genres: [28, 12, 16, 35, 80],
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date().toISOString(),
      };

      const tokens = TokenManager.generateMockTokens({
        id: mockUser.id,
        email: mockUser.email,
        role: 'user',
      });
      
      // Store tokens securely
      TokenManager.setTokens(tokens);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { user: mockUser, tokens };
    }
    
    throw new Error('Invalid credentials');
  },

  /**
   * Enhanced register with JWT tokens
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock user creation
    const mockUser: User = {
      id: Date.now().toString(),
      username: credentials.email.split('@')[0],
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
    const tokens = TokenManager.generateMockTokens({
      id: mockUser.id,
      email: mockUser.email,
      role: 'user',
    });
    
    TokenManager.setTokens(tokens);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return { user: mockUser, tokens };
  },

  /**
   * Enhanced logout with token cleanup
   */
  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    TokenManager.clearTokens();
    localStorage.removeItem('user');
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<TokenPair> => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock token refresh
    const userInfo = TokenManager.getUserFromToken(refreshToken);
    if (!userInfo) {
      throw new Error('Invalid refresh token');
    }

    const newTokens = TokenManager.generateMockTokens(userInfo);
    TokenManager.setTokens(newTokens);
    
    return newTokens;
  },
  /**
   * Get current user from token
   */
  getCurrentUser: async (): Promise<User | null> => {
    const accessToken = TokenManager.getAccessToken();
    if (!accessToken) return null;

    const userInfo = TokenManager.getUserFromToken(accessToken);
    if (!userInfo) return null;

    // Try to get user from localStorage first
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch {
        // If parsing fails, clear invalid data
        localStorage.removeItem('user');
      }
    }

    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const accessToken = TokenManager.getAccessToken();
    if (!accessToken) return false;

    return !TokenManager.isTokenExpired(accessToken);
  },

  /**
   * Check if token needs refresh
   */
  needsRefresh: (): boolean => {
    return TokenManager.needsRefresh();
  },

  /**
   * Forgot password request
   */
  forgotPassword: async (request: ResetPasswordRequest): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock email sending
    console.log(`Password reset email sent to: ${request.email}`);
  },
  /**
   * Reset password confirmation
   */
  resetPassword: async (request: ResetPasswordConfirm): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock password reset
    console.log(`Password reset for token: ${request.token}`);
  },

  /**
   * Change password
   */
  changePassword: async (request: ChangePasswordRequest): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock password change
    console.log('Password changed successfully');
  },

  /**
   * Social login (Google)
   */
  loginWithGoogle: async (googleToken: string): Promise<SocialLoginResponse> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock Google login
    const mockUser: User = {
      id: 'google_' + Date.now().toString(),
      username: 'google_user',
      email: 'google@example.com',
      avatar_path: 'https://lh3.googleusercontent.com/a/default-user',
      preferences: {
        adult_content: false,
        language: 'en',
        country: 'US',
        genres: [],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const tokens = TokenManager.generateMockTokens({
      id: mockUser.id,
      email: mockUser.email,
      role: 'user',
    });
    
    TokenManager.setTokens(tokens);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return { user: mockUser, tokens, isNewUser: true };
  },
  /**
   * Social login (Facebook)
   */
  loginWithFacebook: async (facebookToken: string): Promise<SocialLoginResponse> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock Facebook login
    const mockUser: User = {
      id: 'facebook_' + Date.now().toString(),
      username: 'facebook_user',
      email: 'facebook@example.com',
      avatar_path: 'https://graph.facebook.com/me/picture',
      preferences: {
        adult_content: false,
        language: 'en',
        country: 'US',
        genres: [],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const tokens = TokenManager.generateMockTokens({
      id: mockUser.id,
      email: mockUser.email,
      role: 'user',
    });
    
    TokenManager.setTokens(tokens);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return { user: mockUser, tokens, isNewUser: false };
  },
};

// Export types
export type {
  RegisterCredentials,
  AuthResponse,
  ResetPasswordRequest,
  ResetPasswordConfirm,
  ChangePasswordRequest,
  SocialLoginResponse,
};