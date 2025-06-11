/**
 * API Response Types for CinematIQ
 * Comprehensive TypeScript definitions for TMDB API responses
 */

// ============================================================================
// Base API Types
// ============================================================================

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface ErrorResponse {
  success: false;
  status_code: number;
  status_message: string;
}

// ============================================================================
// Movie Types (TMDB API)
// ============================================================================

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  video: boolean;
}

export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: Genre[];
  homepage: string;
  imdb_id: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
}

// ============================================================================
// Cast & Crew Types
// ============================================================================

export interface CastMember {
  id: number;
  name: string;
  character: string;
  credit_id: string;
  order: number;
  adult: boolean;
  gender: number;
  known_for_department: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  credit_id: string;
  adult: boolean;
  gender: number;
  known_for_department: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

export interface Credits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

// ============================================================================
// Video Types
// ============================================================================

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

// ============================================================================
// Authentication & Query Types
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_path?: string;
  preferences: {
    adult_content: boolean;
    language: string;
    country: string;
    genres: number[];
  };
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SearchQuery {
  query: string;
  page?: number;
  include_adult?: boolean;
  region?: string;
  year?: number;
}

// ============================================================================
// Query Keys for React Query
// ============================================================================

export const QUERY_KEYS = {
  movies: {
    all: ['movies'] as const,
    lists: () => [...QUERY_KEYS.movies.all, 'list'] as const,
    list: (category: string, page: number) => [...QUERY_KEYS.movies.lists(), category, page] as const,
    details: () => [...QUERY_KEYS.movies.all, 'detail'] as const,
    detail: (id: number) => [...QUERY_KEYS.movies.details(), id] as const,
    search: () => [...QUERY_KEYS.movies.all, 'search'] as const,
    searchQuery: (query: string, page: number) => [...QUERY_KEYS.movies.search(), query, page] as const,
  },
  genres: {
    all: ['genres'] as const,
    movies: () => [...QUERY_KEYS.genres.all, 'movies'] as const,
  },
  credits: {
    all: ['credits'] as const,
    movie: (id: number) => [...QUERY_KEYS.credits.all, 'movie', id] as const,
  },
  auth: {
    all: ['auth'] as const,
    user: () => [...QUERY_KEYS.auth.all, 'user'] as const,
  },
} as const;
