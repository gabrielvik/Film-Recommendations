/**
 * React Query Provider for CinematIQ
 * Provides React Query context to the entire application
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/api';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools only in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom"
          toggleButtonProps={{
            style: {
              marginRight: '20px',
              marginBottom: '20px',
            },
          }}
        />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;
