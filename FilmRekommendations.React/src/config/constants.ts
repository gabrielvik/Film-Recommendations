// Application configuration constants

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7103/api',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  TIMEOUT: 10000,
} as const;

export const APP_CONFIG = {
  APP_NAME: 'CinematIQ',
  APP_DESCRIPTION: 'Your Modern Movie Discovery Platform',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const ROUTES = {
  HOME: '/',
  MOVIES: '/movies',
  MOVIE_DETAILS: '/movie/:id',
  SEARCH: '/search',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  NOT_FOUND: '/404',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'cinematiq_auth_token',
  REFRESH_TOKEN: 'cinematiq_refresh_token',
  USER_PREFERENCES: 'cinematiq_user_preferences',
  THEME: 'cinematiq_theme',
} as const;

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const IMAGE_SIZES = {
  POSTER: {
    SMALL: 'w185',
    MEDIUM: 'w342',
    LARGE: 'w500',
    EXTRA_LARGE: 'w780',
    ORIGINAL: 'original',
  },
  BACKDROP: {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280',
    ORIGINAL: 'original',
  },
} as const;
