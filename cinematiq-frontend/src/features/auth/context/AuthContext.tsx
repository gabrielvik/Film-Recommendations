/**
 * Enhanced Authentication Context for CinematIQ
 * Comprehensive auth state management with JWT tokens
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi, type AuthResponse, type RegisterCredentials } from '@/lib/api/services/auth';
import TokenManager from '@/features/auth/utils/tokenManager';

// ============================================================================
// Enhanced Authentication Types
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  isEmailVerified?: boolean;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  // Authentication methods
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  
  // Password management
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Social authentication
  loginWithGoogle: (token: string) => Promise<void>;
  loginWithFacebook: (token: string) => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  checkAuthStatus: () => boolean;
}
// ============================================================================
// Context Creation
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const setLoading = (loading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setAuthState(prev => ({ ...prev, error }));
  };

  const setUser = (user: User | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      error: null,
    }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);
  // ============================================================================
  // Authentication Methods
  // ============================================================================

  const login = async (email: string, password: string, rememberMe = false): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AuthResponse = await authApi.login({ username: email, password });
      
      // Convert API user to context user format
      const contextUser: User = {
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        role: 'user',
        avatar: response.user.avatar_path,
        isEmailVerified: true,
        preferences: {
          theme: 'system',
          notifications: true,
          language: response.user.preferences?.language || 'en',
        },
      };
      
      setUser(contextUser);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterCredentials): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AuthResponse = await authApi.register(data);
      
      const contextUser: User = {
        id: response.user.id,
        name: data.name,
        email: response.user.email,
        role: 'user',
        avatar: response.user.avatar_path,
        isEmailVerified: false,
        preferences: {
          theme: 'system',
          notifications: true,
          language: 'en',
        },
      };
      
      setUser(contextUser);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const logout = async (): Promise<void> => {
    setLoading(true);
    
    try {
      await authApi.logout();
      setUser(null);
      localStorage.removeItem('remember_me');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      // Check if we have tokens
      if (!authApi.isAuthenticated()) {
        setLoading(false);
        return;
      }

      // Try to refresh if needed
      if (authApi.needsRefresh()) {
        await authApi.refreshToken();
      }

      // Get current user
      const user = await authApi.getCurrentUser();
      if (user) {
        const contextUser: User = {
          id: user.id,
          name: user.username,
          email: user.email,
          role: 'user',
          avatar: user.avatar_path,
          isEmailVerified: true,
          preferences: {
            theme: 'system',
            notifications: true,
            language: user.preferences?.language || 'en',
          },
        };
        setUser(contextUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  // ============================================================================
  // Password Management
  // ============================================================================

  const forgotPassword = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await authApi.forgotPassword({ email });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await authApi.resetPassword({ token, password });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await authApi.changePassword({ currentPassword, newPassword });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Password change failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // ============================================================================
  // Social Authentication
  // ============================================================================

  const loginWithGoogle = async (token: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.loginWithGoogle(token);
      
      const contextUser: User = {
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        role: 'user',
        avatar: response.user.avatar_path,
        isEmailVerified: true,
        preferences: {
          theme: 'system',
          notifications: true,
          language: 'en',
        },
      };
      
      setUser(contextUser);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithFacebook = async (token: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.loginWithFacebook(token);
      
      const contextUser: User = {
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        role: 'user',
        avatar: response.user.avatar_path,
        isEmailVerified: true,
        preferences: {
          theme: 'system',
          notifications: true,
          language: 'en',
        },
      };
      
      setUser(contextUser);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Facebook login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // ============================================================================
  // Utility Methods
  // ============================================================================

  const checkAuthStatus = useCallback((): boolean => {
    return authApi.isAuthenticated();
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  // Initialize auth state on mount
  useEffect(() => {
    refreshAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(() => {
      if (authApi.needsRefresh()) {
        refreshAuth();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [authState.isAuthenticated]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: AuthContextValue = {
    ...authState,
    login,
    register,
    logout,
    refreshAuth,
    forgotPassword,
    resetPassword,
    changePassword,
    loginWithGoogle,
    loginWithFacebook,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
// ============================================================================
// Hook Export
// ============================================================================

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types for external use
export type { User, AuthState, AuthContextValue };