import { Provider, EnvironmentProviders } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  createMockAuthState,
  createMockEnvironment,
} from './test-data-factories';

/**
 * Mock providers for consistent dependency injection across all spec files
 * Following Requirements 8.3 and 8.4 for proper mocking and test isolation
 */

// Default mock store state
export const defaultMockState = {
  auth: createMockAuthState(),
};

// Mock store providers
export const mockStoreProviders = (
  initialState = defaultMockState,
): Provider[] => [provideMockStore({ initialState })];

// Mock router providers
export const mockRouterProviders = (): (Provider | EnvironmentProviders)[] => [
  provideRouter([]), // Empty routes for testing
];

// Mock HTTP client providers
export const mockHttpProviders = (): (Provider | EnvironmentProviders)[] => [
  provideHttpClient(),
  provideHttpClientTesting(),
];

// Mock environment provider
export const mockEnvironmentProvider = (
  environmentOverrides?: Record<string, unknown>,
): Provider => ({
  provide: 'environment',
  useValue: createMockEnvironment(environmentOverrides),
});

// Common test providers for component testing
export const commonTestProviders = (): (Provider | EnvironmentProviders)[] => [
  ...mockHttpProviders(),
];

// Complete mock providers setup for component testing
export const createComponentTestProviders = (
  storeState = defaultMockState,
  environmentOverrides?: Record<string, unknown>,
): (Provider | EnvironmentProviders)[] => [
  ...mockStoreProviders(storeState),
  ...mockRouterProviders(),
  ...mockHttpProviders(),
  mockEnvironmentProvider(environmentOverrides),
];

// Service testing providers (without component-specific dependencies)
export const createServiceTestProviders = (
  environmentOverrides?: Record<string, unknown>,
): (Provider | EnvironmentProviders)[] => [
  ...mockHttpProviders(),
  mockEnvironmentProvider(environmentOverrides),
];

// Mock services for dependency injection
export const createMockLoadingService = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  loading$: {
    subscribe: jest.fn(),
    pipe: jest.fn().mockReturnThis(),
  },
});

export const createMockErrorNotificationService = () => ({
  showError: jest.fn(),
  clearError: jest.fn(),
});

export const createMockAuthService = () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
});

export const createMockTmdbService = () => ({
  getPopularMovies: jest.fn(),
  getMovie: jest.fn(),
  searchMovies: jest.fn(),
});

// HTTP interceptor testing utilities
export const createMockHttpRequest = (url = '/test', method = 'GET') => ({
  url,
  method,
  headers: new Map(),
  clone: jest.fn().mockReturnThis(),
});

export const createMockHttpHandler = () => ({
  handle: jest.fn(),
});

// NgRx testing utilities
export const createMockActions = () => ({
  pipe: jest.fn().mockReturnThis(),
  subscribe: jest.fn(),
});

export const createMockEffectsRunner = () => ({
  queue: jest.fn(),
});

// Local storage mock for testing localStorage sync
export const createMockLocalStorage = () => {
  const storage: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    length: 0,
    key: jest.fn(),
  };
};

// Global mocks setup function
export const setupGlobalMocks = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: createMockLocalStorage(),
    writable: true,
  });

  // Mock console methods to avoid noise in tests
  globalThis.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  };

  // Mock window.location for navigation testing
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      reload: jest.fn(),
      assign: jest.fn(),
    },
    writable: true,
  });
};

// Cleanup function for test isolation
export const cleanupGlobalMocks = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};
