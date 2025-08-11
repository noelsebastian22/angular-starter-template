import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { setupGlobalMocks } from './src/test-helpers/mock-providers';

// Setup Angular testing environment
setupZoneTestEnv();

// Setup global mocks for consistent testing environment
setupGlobalMocks();

// Configure Jest global settings
beforeEach(() => {
  // Clear all mocks before each test for isolation (Requirement 8.4)
  jest.clearAllMocks();
});

afterEach(() => {
  // Additional cleanup if needed
  jest.restoreAllMocks();
});
