# Implementation Plan

- [x] 1. Set up test infrastructure and utilities
  - Create test data factories and mock providers for consistent test data across all spec files
  - Set up shared test utilities and helper functions for common testing patterns
  - Configure test environment with proper TypeScript paths and imports
  - _Requirements: 8.1, 8.3, 8.4_

- [x] 2. Create utility and helper function tests
- [x] 2.1 Implement error.util.spec.ts
  - Write unit tests for extractErrorMessage function covering all error types (string, Error object, HttpErrorResponse, unknown)
  - Test edge cases including null, undefined, circular references, and malformed objects
  - Verify JSON.stringify fallback behavior and error handling
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2.2 Implement local-storage-sync.spec.ts
  - Write tests for localStorage synchronization functionality
  - Test state persistence and retrieval from localStorage
  - Mock localStorage methods and verify proper error handling
  - _Requirements: 6.1, 6.3_

- [x] 3. Create core service tests
- [x] 3.1 Implement loading.service.spec.ts
  - Write tests for start(), stop(), and loading state management
  - Test observable emissions and subscription handling
  - Verify loading counter logic and concurrent request handling
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3.2 Implement error-notification.service.spec.ts
  - Write tests for error notification display and management
  - Test different error message formats and user notification triggers
  - Mock notification dependencies and verify proper error handling
  - _Requirements: 2.1, 2.3, 5.4_

- [x] 3.3 Implement tmdb.service.spec.ts
  - Write tests for getPopularMovies(), getMovie(), and searchMovies() methods
  - Mock HttpClient using HttpClientTestingModule and verify HTTP requests
  - Test request parameters, headers, and response handling
  - Test error scenarios and environment variable usage
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Create HTTP interceptor tests
- [x] 4.1 Implement loading.interceptor.spec.ts
  - Write tests for HTTP request interception and loading service integration
  - Test X-Skip-Loading header functionality and request modification
  - Mock LoadingService and verify start/stop calls with proper timing
  - Test finalize operator behavior on request completion and errors
  - _Requirements: 5.1, 5.2_

- [x] 4.2 Implement error.interceptor.spec.ts
  - Write tests for HTTP error interception and processing
  - Test different HTTP error status codes (4xx, 5xx) and error transformation
  - Mock error notification service and verify error handling flow
  - Test request passthrough for successful responses
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. Create error handler tests
- [x] 5.1 Implement global-error.handler.spec.ts
  - Write tests for handleError method with various error types
  - Test HttpErrorResponse filtering to avoid double-reporting
  - Mock ErrorNotificationService and verify error notification calls
  - Test production vs development environment behavior
  - _Requirements: 5.3, 5.4_

- [x] 6. Create NgRx state management tests
- [x] 6.1 Implement auth.actions.spec.ts
  - Write tests for all action creators (login, loginSuccess, loginFailure, logout)
  - Verify action types and payload structures match expected interfaces
  - Test action creator return values and type safety
  - _Requirements: 4.1_

- [x] 6.2 Implement auth.reducer.spec.ts
  - Write tests for all action handlers in the auth reducer
  - Test state transitions for login, loginSuccess, loginFailure, and logout actions
  - Verify state immutability and proper error message extraction
  - Test initial state and state shape consistency
  - _Requirements: 4.2_

- [x] 6.3 Implement auth.effects.spec.ts
  - Write tests for login$ effect using provideMockActions and TestBed
  - Mock AuthService and test successful login flow with loginSuccess action dispatch
  - Test error scenarios with loginFailure action dispatch and error handling
  - Verify switchMap operator behavior and observable stream handling
  - _Requirements: 4.3_

- [x] 6.4 Implement auth.selectors.spec.ts
  - Write tests for all auth selectors with various state shapes
  - Test selector memoization and reference equality for same inputs
  - Verify selector composition and derived state calculations
  - _Requirements: 4.4_

- [x] 6.5 Implement auth.state.spec.ts
  - Write tests for initial auth state definition and structure
  - Verify state interface compliance and default values
  - Test state type definitions and property accessibility
  - _Requirements: 4.5_

- [x] 7. Create app-level state management tests
- [x] 7.1 Implement app.reducer.spec.ts
  - Write tests for root app reducer and state combination
  - Test reducer composition and state tree structure
  - Verify action routing to appropriate feature reducers
  - _Requirements: 4.2_

- [x] 7.2 Implement meta-reducers.spec.ts
  - Write tests for meta-reducer functionality and store enhancement
  - Test localStorage sync meta-reducer integration
  - Verify meta-reducer execution order and state transformation
  - _Requirements: 4.2_

- [x] 7.3 Implement app.state.spec.ts
  - Write tests for root application state interface and structure
  - Verify state tree composition and feature state integration
  - Test state type definitions and nested state access
  - _Requirements: 4.5_

- [x] 8. Create component tests
- [x] 8.1 Implement auth.component.spec.ts (enhance existing)
  - Enhance existing tests to achieve 100% coverage of component logic
  - Test form validation, user interactions, and template rendering
  - Mock NgRx store using MockStore and test state integration
  - Test navigation behavior and route transitions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8.2 Implement spinner.component.spec.ts
  - Write tests for spinner component rendering and visibility logic
  - Test @Input property bindings and conditional display
  - Verify CSS classes and styling application
  - Test component lifecycle and change detection
  - _Requirements: 3.1, 3.4_

- [x] 9. Create configuration and setup tests
- [x] 9.1 Implement app.config.spec.ts
  - Write tests for application configuration and provider setup
  - Test dependency injection configuration and service registration
  - Verify routing configuration and guard setup
  - Test interceptor and error handler registration
  - _Requirements: 7.1_

- [x] 9.2 Implement app.routes.spec.ts
  - Write tests for route configuration and path definitions
  - Test route guards, resolvers, and lazy loading setup
  - Verify route parameter handling and navigation behavior
  - _Requirements: 7.2_

- [x] 9.3 Implement auth.routes.spec.ts
  - Write tests for auth feature routing configuration
  - Test auth-specific route guards and navigation logic
  - Verify route component loading and parameter handling
  - _Requirements: 7.2_

- [x] 10. Create index file tests
- [x] 10.1 Implement core/index.spec.ts
  - Write tests for core module exports and public API
  - Verify all exported services and utilities are accessible
  - Test module barrel export functionality
  - _Requirements: 7.3_

- [x] 10.2 Implement infrastructure/index.spec.ts
  - Write tests for infrastructure module exports
  - Verify HTTP services and models are properly exported
  - Test module organization and public interface
  - _Requirements: 7.3_

- [x] 10.3 Implement infrastructure/http/index.spec.ts
  - Write tests for HTTP module exports and ResourceService availability
  - Verify abstract class export and inheritance support
  - Test module encapsulation and interface definitions
  - _Requirements: 7.3_

- [x] 10.4 Implement infrastructure/models/index.spec.ts
  - Write tests for model exports and type definitions
  - Verify all model interfaces are accessible and properly typed
  - Test model structure and property definitions
  - _Requirements: 7.3_

- [x] 10.5 Implement features/auth/store/index.spec.ts
  - Write tests for auth store module exports
  - Verify all actions, reducers, effects, and selectors are exported
  - Test store module organization and public API
  - _Requirements: 7.3_

- [x] 10.6 Implement store/index.spec.ts
  - Write tests for root store module exports
  - Verify app state, reducers, and meta-reducers are accessible
  - Test store configuration and module structure
  - _Requirements: 7.3_

- [x] 11. Create main application tests
- [x] 11.1 Implement main.spec.ts
  - Write tests for application bootstrap and initialization
  - Mock bootstrapApplication and verify configuration passing
  - Test error handling during app startup
  - Verify provider configuration and dependency injection setup
  - _Requirements: 7.1_

- [x] 12. Enhance existing tests for 100% coverage
- [x] 12.1 Enhance app.spec.ts
  - Review existing app component tests and identify coverage gaps
  - Add missing test cases for component initialization and lifecycle
  - Test component template rendering and basic functionality
  - Ensure all component methods and properties are tested
  - _Requirements: 3.1, 3.4_

- [x] 12.2 Enhance resource.abstract.spec.ts
  - Review existing ResourceService tests and identify coverage gaps
  - Add tests for all CRUD methods (list, getById, create, update, patch, delete)
  - Test URL building, header merging, and parameter handling
  - Test error scenarios and edge cases for abstract class functionality
  - _Requirements: 6.4_

- [x] 13. Run coverage analysis and fix gaps
- [x] 13.1 Generate coverage report and identify remaining gaps
  - Run test coverage analysis using Angular CLI or Jest
  - Identify any remaining uncovered lines, branches, or functions
  - Create additional test cases to cover missed scenarios
  - _Requirements: 1.3, 1.4_

- [x] 13.2 Optimize test performance and reliability
  - Review test execution time and optimize slow tests
  - Ensure test isolation and remove any test interdependencies
  - Verify all async operations are properly handled with fakeAsync/waitForAsync
  - _Requirements: 8.4, 8.5_
