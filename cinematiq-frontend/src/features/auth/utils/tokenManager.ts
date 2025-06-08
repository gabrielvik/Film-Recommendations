/**
 * Enhanced Token Management for CinematIQ Authentication
 * Handles JWT tokens, refresh logic, and secure storage
 */

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'cinematiq_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'cinematiq_refresh_token';
  private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in ms

  /**
   * Store token pair securely
   */
  static setTokens(tokens: TokenPair): void {
    // Use secure cookies in production, localStorage for development
    if (process.env.NODE_ENV === 'production') {
      Cookies.set(this.ACCESS_TOKEN_KEY, tokens.accessToken, {
        secure: true,
        sameSite: 'strict',
        expires: 1, // 1 day
      });
      Cookies.set(this.REFRESH_TOKEN_KEY, tokens.refreshToken, {
        secure: true,
        sameSite: 'strict',
        expires: 7, // 7 days
        httpOnly: false, // Need access from JS for refresh
      });
    } else {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  }
  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    if (process.env.NODE_ENV === 'production') {
      return Cookies.get(this.ACCESS_TOKEN_KEY) || null;
    }
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    if (process.env.NODE_ENV === 'production') {
      return Cookies.get(this.REFRESH_TOKEN_KEY) || null;
    }
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    if (process.env.NODE_ENV === 'production') {
      Cookies.remove(this.ACCESS_TOKEN_KEY);
      Cookies.remove(this.REFRESH_TOKEN_KEY);
    } else {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
    // Also clear legacy tokens
    localStorage.removeItem('cinematiq_auth_token');
    localStorage.removeItem('auth_token');
  }

  /**
   * Decode token payload
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  }
  /**
   * Check if token is expired or about to expire
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const now = Date.now();
    const expiry = payload.exp * 1000; // Convert to ms
    
    // Consider token expired if it expires within the buffer time
    return now >= (expiry - this.TOKEN_EXPIRY_BUFFER);
  }

  /**
   * Check if access token needs refresh
   */
  static needsRefresh(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;
    
    return this.isTokenExpired(accessToken);
  }

  /**
   * Get token expiry time
   */
  static getTokenExpiry(token: string): Date | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    return new Date(payload.exp * 1000);
  }

  /**
   * Get user info from token
   */
  static getUserFromToken(token: string): { id: string; email: string; role: string } | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
  /**
   * Generate mock JWT tokens for development
   */
  static generateMockTokens(user: { id: string; email: string; role: string }): TokenPair {
    const now = Math.floor(Date.now() / 1000);
    
    // Mock access token (15 minutes)
    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + (15 * 60), // 15 minutes
    };

    // Mock refresh token (7 days)
    const refreshPayload = {
      sub: user.id,
      type: 'refresh',
      iat: now,
      exp: now + (7 * 24 * 60 * 60), // 7 days
    };

    // In a real app, these would be properly signed JWTs
    const accessToken = `mock.${btoa(JSON.stringify(accessPayload))}.signature`;
    const refreshToken = `mock.${btoa(JSON.stringify(refreshPayload))}.signature`;

    return { accessToken, refreshToken };
  }
}

export default TokenManager;
export type { TokenPayload, TokenPair };