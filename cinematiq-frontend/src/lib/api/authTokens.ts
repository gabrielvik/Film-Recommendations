/**
 * Simple Auth Token Utility for Backend API
 * Works with existing auth system to provide tokens for backend calls
 */

export const authTokens = {
  /**
   * Get auth token for API calls - works with both mock and real systems
   */
  getToken(): string | null {
    // First try the real auth token (for when we switch to real backend)
    let token = localStorage.getItem('authToken');
    
    // If no auth token, check if we're in mock mode with TokenManager
    if (!token) {
      try {
        const { default: TokenManager } = require('@/features/auth/utils/tokenManager');
        token = TokenManager.getAccessToken();
      } catch (e) {
        // TokenManager not available or failed
      }
    }
    
    return token;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Simple token expiration check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (e) {
      // Invalid token format
      return false;
    }
  },

  /**
   * Clear all auth tokens
   */
  clearTokens(): void {
    localStorage.removeItem('authToken');
    try {
      const { default: TokenManager } = require('@/features/auth/utils/tokenManager');
      TokenManager.clearTokens();
    } catch (e) {
      // TokenManager not available
    }
  }
};
