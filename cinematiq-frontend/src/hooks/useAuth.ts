/**
 * Authentication React Query Hooks for CinematIQ
 * Custom hooks for authentication with React Query
 */

import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { type User, type LoginCredentials, QUERY_KEYS } from '@/lib/api/types';

// ============================================================================
// Authentication Hooks
// ============================================================================

export function useCurrentUser(): UseQueryResult<User | null> {
  return useQuery({
    queryKey: QUERY_KEYS.auth.user(),
    queryFn: () => authApi.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry auth queries
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(QUERY_KEYS.auth.user(), data.user);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.all });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear user cache
      queryClient.setQueryData(QUERY_KEYS.auth.user(), null);
      
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
}

export function useIsAuthenticated(): boolean {
  return authApi.isAuthenticated();
}
