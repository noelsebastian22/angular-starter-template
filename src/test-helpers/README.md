# Test Helpers

This directory contains shared test utilities, mock providers, and data factories for consistent testing across the Angular application.

## Overview

The test helpers are organized into several modules:

- **test-data-factories.ts**: Factory functions for creating consistent mock data
- **mock-providers.ts**: Mock providers and services for dependency injection
- **test-utilities.ts**: Helper classes and utilities for common testing patterns
- **test-config.ts**: Configuration utilities for TestBed setup

## Usage

### Importing Test Helpers

```typescript
import { createMockUser, createMockAuthState, mockStoreProviders, DOMTestHelper, configureComponentTestBed } from "@test-helpers";
```

### Test Data Factories

Create consistent mock data for your tests:

```typescript
// Create mock user
const user = createMockUser({ name: "Custom User" });

// Create mock auth state
const authState = createMockAuthState({ loading: true });

// Create mock movie data
const movie = createMockMovieResult({ title: "Test Movie" });
```

### Mock Providers

Set up consistent mock providers:

```typescript
describe("MyComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [...mockStoreProviders(), ...mockRouterProviders(), ...mockHttpProviders()],
    }).compileComponents();
  });
});
```

### Test Utilities

Use helper classes for common testing patterns:

```typescript
describe("MyComponent", () => {
  let domHelper: DOMTestHelper;

  beforeEach(() => {
    domHelper = new DOMTestHelper(fixture);
  });

  it("should handle form submission", () => {
    domHelper.setInputValue("#username", "testuser");
    domHelper.setInputValue("#password", "testpass");
    domHelper.submitForm();

    expect(component.username).toBe("testuser");
  });
});
```

### Test Configuration

Use configuration utilities for consistent TestBed setup:

```typescript
describe("MyService", () => {
  beforeEach(() => {
    configureServiceTestBed({
      providers: [MyService],
    });
  });
});
```

## Best Practices

1. **Use Factory Functions**: Always use the provided factory functions for creating test data to ensure consistency.

2. **Follow AAA Pattern**: Use the TestSetupHelper for organizing tests with Arrange-Act-Assert pattern.

3. **Mock Dependencies**: Use the provided mock services and providers to isolate units under test.

4. **Clean Up**: The global setup automatically clears mocks between tests, but you can use cleanupTest() for additional cleanup.

5. **Async Testing**: Use AsyncTestHelper utilities for handling promises and observables in tests.

## Requirements Compliance

This test infrastructure addresses the following requirements:

- **Requirement 8.1**: AAA pattern implementation through TestSetupHelper
- **Requirement 8.3**: Proper mocking strategies with mock providers and services
- **Requirement 8.4**: Test isolation through automatic mock cleanup
- **Requirement 8.5**: Async operation handling with AsyncTestHelper

## Recent Updates

### Angular 20 Compatibility

- **Replaced deprecated `HttpClientTestingModule`** with `provideHttpClient()` and `provideHttpClientTesting()`
- **Replaced deprecated `RouterTestingModule`** with `provideRouter()`
- **Updated type definitions** to handle `EnvironmentProviders` alongside `Provider`
- **Fixed global references** to use `globalThis` instead of `global`
- **Updated spy utilities** to use Jest instead of Jasmine

## Path Aliases

The following TypeScript path aliases are configured for easy imports:

- `@test-helpers/*`: Points to test-helpers directory
- `@test-helpers`: Points to test-helpers/index.ts
- `@app/*`: Points to src/app directory
- `@core/*`: Points to src/app/core directory
- `@features/*`: Points to src/app/features directory
- `@infrastructure/*`: Points to src/app/infrastructure directory
