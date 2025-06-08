/**
 * Authentication API Service for CinematIQ
 * Mock authentication service for development
 */

import type { User, LoginCredentials } from '../types';

// ============================================================================
// Mock Authentication Service
// ============================================================================

export const authApi = {
  // Mock login function
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
          genres: [28, 12, 16, 35, 80], // Action, Adventure, Animation, Comedy, Crime
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date().toISOString(),
      };

      const mockToken = 'mock_jwt_token_' + Date.now();
      
      // Store token in localStorage
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { user: mockUser, token: mockToken };
    }
    
    throw new Error('Invalid credentials');
  },

  // Mock logout function
  logout: async (): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clear stored data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Get current user from storage
  getCurrentUser: async (): Promise<User | null> => {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (!userJson || !token) {
      return null;
    }
    
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },
};
