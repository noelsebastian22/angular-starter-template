import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import { defaultMockState } from './mock-providers';

/**
 * Test configuration utilities for consistent test setup
 * Following Requirements 8.3 and 8.4 for proper mocking and test isolation
 */

// Common testing modules that are frequently needed
export const COMMON_TESTING_MODULES = [ReactiveFormsModule, FormsModule];

// Common testing providers
export const COMMON_TESTING_PROVIDERS = [
  provideMockStore({ initialState: defaultMockState }),
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([]),
];

/**
 * Configure TestBed with common testing setup
 */
export const configureTestBed = (
  config: {
    imports?: unknown[];
    providers?: unknown[];
    declarations?: unknown[];
  } = {},
) => {
  return TestBed.configureTestingModule({
    imports: [...COMMON_TESTING_MODULES, ...(config.imports || [])],
    providers: [...COMMON_TESTING_PROVIDERS, ...(config.providers || [])],
    declarations: config.declarations || [],
  });
};

/**
 * Configure TestBed for component testing with minimal setup
 */
export const configureComponentTestBed = (
  component: unknown,
  additionalConfig: {
    imports?: unknown[];
    providers?: unknown[];
  } = {},
) => {
  return configureTestBed({
    imports: [component, ...(additionalConfig.imports || [])],
    providers: additionalConfig.providers || [],
  });
};

/**
 * Configure TestBed for service testing
 */
export const configureServiceTestBed = (
  config: {
    providers?: unknown[];
    imports?: unknown[];
  } = {},
) => {
  return TestBed.configureTestingModule({
    imports: [...(config.imports || [])],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      ...(config.providers || []),
    ],
  });
};

/**
 * Standard test cleanup function
 */
export const cleanupTest = () => {
  TestBed.resetTestingModule();
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

/**
 * Test timeout configuration
 */
export const TEST_TIMEOUT = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
};

/**
 * Common test expectations for better consistency
 */
export const commonExpectations = {
  /**
   * Expect component to be created successfully
   */
  componentCreated: (component: unknown) => {
    expect(component).toBeTruthy();
    expect(component).toBeDefined();
  },

  /**
   * Expect service to be created successfully
   */
  serviceCreated: (service: unknown) => {
    expect(service).toBeTruthy();
    expect(service).toBeDefined();
  },

  /**
   * Expect method to be called with specific arguments
   */
  methodCalledWith: (spy: jest.SpyInstance, ...args: unknown[]) => {
    expect(spy).toHaveBeenCalledWith(...args);
  },

  /**
   * Expect method to be called specific number of times
   */
  methodCalledTimes: (spy: jest.SpyInstance, times: number) => {
    expect(spy).toHaveBeenCalledTimes(times);
  },

  /**
   * Expect observable to emit specific value
   */
  observableEmits: <T>(
    observable: Observable<T>,
    expectedValue: T,
    done: () => void,
  ) => {
    observable.subscribe((value: T) => {
      expect(value).toEqual(expectedValue);
      done();
    });
  },

  /**
   * Expect observable to emit error
   */
  observableEmitsError: (
    observable: Observable<unknown>,
    expectedError: unknown,
    done: () => void,
  ) => {
    observable.subscribe({
      next: () => fail('Expected error but got value'),
      error: (error: unknown) => {
        expect(error).toEqual(expectedError);
        done();
      },
    });
  },
};
