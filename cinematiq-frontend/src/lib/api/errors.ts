/**
 * API Error Handling for CinematIQ
 * Comprehensive error handling with user-friendly messages
 */

import { AxiosError } from 'axios';
import type { ErrorResponse } from './types';

// ============================================================================
// Error Classes
// ============================================================================

export class APIError extends Error {
  public statusCode: number;
  public originalError?: AxiosError;
  public userMessage: string;

  constructor(
    message: string,
    statusCode: number = 500,
    originalError?: AxiosError,
    userMessage?: string
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.userMessage = userMessage || this.getUserFriendlyMessage(statusCode);
  }

  private getUserFriendlyMessage(statusCode: number): string {
    const errorMessages: Record<number, string> = {
      400: 'The request was invalid. Please check your input and try again.',
      401: 'You need to log in to access this feature.',
      403: 'You don\'t have permission to access this resource.',
      404: 'The requested resource was not found.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'An internal server error occurred. Please try again later.',
      502: 'Service is temporarily unavailable. Please try again later.',
      503: 'Service is temporarily unavailable. Please try again later.',
    };

    return errorMessages[statusCode] || 'An unexpected error occurred. Please try again.';
  }
}

export class NetworkError extends APIError {
  constructor(originalError?: AxiosError) {
    super(
      'Network error occurred',
      0,
      originalError,
      'Unable to connect to the server. Please check your internet connection.'
    );
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends APIError {
  constructor(originalError?: AxiosError) {
    super(
      'Request timed out',
      408,
      originalError,
      'The request took too long to complete. Please try again.'
    );
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// Error Handler Functions
// ============================================================================

export function handleAPIError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof AxiosError) {
    return handleAxiosError(error);
  }

  if (error instanceof Error) {
    return new APIError(error.message);
  }

  return new APIError('An unknown error occurred');
}

function handleAxiosError(error: AxiosError): APIError {
  if (error.code === 'ECONNABORTED') {
    return new TimeoutError(error);
  }

  if (error.code === 'ERR_NETWORK') {
    return new NetworkError(error);
  }

  if (error.response) {
    const { status, data } = error.response;
    const errorData = data as ErrorResponse;
    
    return new APIError(
      errorData?.status_message || error.message,
      status,
      error
    );
  }

  return new APIError(error.message, 0, error);
}

export function isRetryableError(error: APIError): boolean {
  const retryableCodes = [408, 429, 500, 502, 503, 504];
  return retryableCodes.includes(error.statusCode) || error instanceof NetworkError;
}
