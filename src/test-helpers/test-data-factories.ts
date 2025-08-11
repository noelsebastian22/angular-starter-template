import { AuthState } from '../app/features/auth/store/auth.state';
import {
  MovieResult,
  MovieDetails,
  ApiResult,
} from '../app/infrastructure/models/tmdb.model';

/**
 * Test data factories for creating consistent mock data across all spec files
 * Following Requirement 8.3 for proper mocking strategies
 */

// Auth-related test data factories
export const createMockUser = (
  overrides?: Partial<{ id: string; name: string }>,
): { id: string; name: string } => ({
  id: '1',
  name: 'Test User',
  ...overrides,
});

export const createMockAuthState = (
  overrides?: Partial<AuthState>,
): AuthState => ({
  user: null,
  loading: false,
  error: null,
  ...overrides,
});

export const createMockAuthStateWithUser = (
  userOverrides?: Partial<{ id: string; name: string }>,
): AuthState => ({
  user: createMockUser(userOverrides),
  loading: false,
  error: null,
});

export const createMockAuthStateLoading = (): AuthState => ({
  user: null,
  loading: true,
  error: null,
});

export const createMockAuthStateWithError = (
  error = 'Test error',
): AuthState => ({
  user: null,
  loading: false,
  error,
});

// TMDB-related test data factories
export const createMockMovieResult = (
  overrides?: Partial<MovieResult>,
): MovieResult => ({
  adult: false,
  backdrop_path: '/test-backdrop.jpg',
  genre_ids: [28, 12, 16],
  id: 1,
  original_language: 'en',
  original_title: 'Test Movie',
  overview: 'This is a test movie overview for testing purposes.',
  popularity: 7.5,
  poster_path: '/test-poster.jpg',
  release_date: '2024-01-01',
  title: 'Test Movie',
  video: false,
  vote_average: 8.5,
  vote_count: 1000,
  ...overrides,
});

export const createMockMovieDetails = (
  overrides?: Partial<MovieDetails>,
): MovieDetails => ({
  adult: false,
  backdrop_path: '/test-backdrop.jpg',
  belongs_to_collection: {
    id: 1,
    name: 'Test Collection',
    poster_path: null,
    backdrop_path: '/test-collection-backdrop.jpg',
  },
  budget: 100000000,
  genres: [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
  ],
  homepage: 'https://test-movie.com',
  id: 1,
  imdb_id: 'tt1234567',
  origin_country: ['US'],
  original_language: 'en',
  original_title: 'Test Movie',
  overview: 'This is a test movie overview for testing purposes.',
  popularity: 7.5,
  poster_path: '/test-poster.jpg',
  production_companies: [
    {
      id: 1,
      logo_path: '/test-logo.jpg',
      name: 'Test Studios',
      origin_country: 'US',
    },
  ],
  production_countries: [
    {
      iso_3166_1: 'US',
      name: 'United States of America',
    },
  ],
  release_date: '2024-01-01',
  revenue: 500000000,
  runtime: 120,
  spoken_languages: [
    {
      english_name: 'English',
      iso_639_1: 'en',
      name: 'English',
    },
  ],
  status: 'Released',
  tagline: 'Test tagline for the movie',
  title: 'Test Movie',
  video: false,
  vote_average: 8.5,
  vote_count: 1000,
  ...overrides,
});

export const createMockApiResult = <T>(
  results: T[],
  overrides?: Partial<ApiResult<T>>,
): ApiResult<T> => ({
  page: 1,
  results,
  total_pages: 1,
  total_results: results.length,
  ...overrides,
});

export const createMockMovieApiResult = (
  movieCount = 3,
  overrides?: Partial<ApiResult<MovieResult>>,
): ApiResult<MovieResult> => {
  const movies = Array.from({ length: movieCount }, (_, index) =>
    createMockMovieResult({ id: index + 1, title: `Test Movie ${index + 1}` }),
  );
  return createMockApiResult(movies, overrides);
};

// HTTP Error test data factories
export const createMockHttpErrorResponse = (
  status = 500,
  statusText = 'Internal Server Error',
) => ({
  status,
  statusText,
  error: {
    message: `HTTP ${status} error occurred`,
    details: 'Test error details',
  },
  headers: new Map(),
  url: 'http://test-api.com/test-endpoint',
});

// Generic error factories
export const createMockError = (message = 'Test error'): Error => {
  return new Error(message);
};

export const createMockUnknownError = (): unknown => ({
  someProperty: 'unknown error object',
  nested: {
    error: 'nested error message',
  },
});

// Environment mock factory
export const createMockEnvironment = (overrides?: Record<string, unknown>) => ({
  production: false,
  apiUrl: 'http://localhost:3000/api',
  tmdbApiToken: 'test-tmdb-token',
  tmdbApiUrl: 'https://api.themoviedb.org/3',
  ...overrides,
});

// Form data factories for component testing
export const createMockFormData = (overrides?: Record<string, unknown>) => ({
  username: 'testuser',
  password: 'testpassword',
  ...overrides,
});

// Observable test data factories
export const createMockObservableData = <T>(data: T) => ({
  subscribe: (callback: (data: T) => void) => callback(data),
});

export const createMockObservableError = (error: Error) => ({
  subscribe: (callbacks: {
    next?: () => void;
    error?: (err: Error) => void;
  }) => {
    if (callbacks.error) {
      callbacks.error(error);
    }
  },
});
