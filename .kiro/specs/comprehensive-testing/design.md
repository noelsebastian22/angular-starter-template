# Design Document

## Overview

This design outlines a comprehensive testing strategy to achieve 100% test coverage for the Angular starter template project. The approach focuses on creating maintainable, reliable unit tests for all 31 TypeScript files currently missing spec files, following Angular testing best practices and ensuring proper isolation and mocking strategies. The design addresses all eight requirement categories: complete test coverage, service testing, component testing, state management testing, interceptor and error handler testing, utility and helper testing, configuration and setup testing, and test quality standards.

## Architecture

### Testing Framework Stack

- **Jest**: Primary testing framework (if configured) or Jasmine/Karma (Angular default)
- **Angular Testing Utilities**: TestBed, ComponentFixture, HttpClientTestingModule
- **NgRx Testing**: MockStore, provideMockStore for state management testing
- **Test Doubles**: Spies, mocks, and stubs for dependency isolation

### Test Organization Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── *.service.ts
│   │   │   └── *.service.spec.ts
│   │   ├── http/interceptors/
│   │   │   ├── *.interceptor.ts
│   │   │   └── *.interceptor.spec.ts
│   │   └── errors/
│   │       ├── *.handler.ts
│   │       └── *.handler.spec.ts
│   ├── features/
│   │   └── auth/
│   │       ├── store/
│   │       │   ├── *.ts
│   │       │   └── *.spec.ts
│   │       └── services/
│   └── shared/
│       └── utils/
│           ├── *.util.ts
│           └── *.util.spec.ts
```

## Components and Interfaces

### 1. Service Testing Strategy (Requirement 2)

#### HTTP Services (TmdbService, AuthService)

- **Mock HttpClient**: Use HttpClientTestingModule for HTTP request testing per Requirement 2.2
- **Request Verification**: Verify correct URLs, headers, and parameters per Requirement 2.1
- **Response Handling**: Test successful responses and error scenarios per Requirement 2.3
- **Environment Dependencies**: Mock environment variables
- **Dependency Injection**: Test proper service instantiation and DI per Requirement 2.4

```typescript
// Example test structure
describe("TmdbService", () => {
  let service: TmdbService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TmdbService],
    });
  });

  // Test methods: getPopularMovies, getMovie, searchMovies
});
```

#### Utility Services (LoadingService, ErrorNotificationService)

- **State Management**: Test loading state changes
- **Event Emission**: Verify observables emit correct values
- **Method Interactions**: Test public API methods

### 2. Component Testing Strategy (Requirement 3)

#### Auth Component

- **Component Initialization**: Verify component setup and lifecycle hooks per Requirement 3.1
- **Input/Output Properties**: Test @Input and @Output bindings per Requirement 3.2
- **Template Rendering**: Verify form elements render correctly per Requirement 3.4
- **User Interactions**: Test form submission, input validation per Requirement 3.3
- **State Integration**: Test NgRx store interactions per Requirement 3.3
- **Navigation**: Test routing behavior
- **Lifecycle Hooks**: Test ngOnInit and other lifecycle methods per Requirement 3.5

```typescript
// Example component test structure
describe("AuthComponent", () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideMockStore()],
    });
  });
});
```

#### Spinner Component

- **Conditional Rendering**: Test show/hide logic
- **Input Properties**: Test @Input bindings
- **Styling**: Verify CSS classes applied correctly

### 3. State Management Testing Strategy

#### Actions Testing

- **Action Creators**: Verify actions return correct type and payload
- **Type Safety**: Ensure action types are properly defined

```typescript
describe("Auth Actions", () => {
  it("should create login action", () => {
    const username = "test";
    const password = "pass";
    const action = AuthActions.login({ username, password });

    expect(action.type).toBe("[Auth] Login");
    expect(action.username).toBe(username);
    expect(action.password).toBe(password);
  });
});
```

#### Reducers Testing

- **State Transitions**: Test all action handlers
- **Immutability**: Verify state is not mutated
- **Initial State**: Test default state values

```typescript
describe("Auth Reducer", () => {
  it("should handle login action", () => {
    const action = AuthActions.login({ username: "test", password: "pass" });
    const state = authReducer(initialAuthState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });
});
```

#### Effects Testing

- **Side Effects**: Mock service calls and test outcomes
- **Action Dispatching**: Verify correct actions are dispatched
- **Error Handling**: Test error scenarios

```typescript
describe("Auth Effects", () => {
  let effects: AuthEffects;
  let actions$: Observable<any>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj("AuthService", ["login"]);
    TestBed.configureTestingModule({
      providers: [AuthEffects, provideMockActions(() => actions$), { provide: AuthService, useValue: spy }],
    });
  });
});
```

#### Selectors Testing

- **State Selection**: Test selector functions with various state shapes
- **Memoization**: Verify selectors return same reference for same input
- **Composition**: Test composed selectors

### 4. Interceptor Testing Strategy (Requirement 5)

#### Loading Interceptor

- **Request Interception**: Verify loading service is called per Requirement 5.1
- **Response Handling**: Test loading stop on completion per Requirement 5.2
- **Skip Header**: Test X-Skip-Loading header functionality
- **Error Scenarios**: Test interceptor behavior during HTTP errors per Requirement 5.2

```typescript
describe("LoadingInterceptor", () => {
  let httpMock: HttpTestingController;
  let loadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj("LoadingService", ["start", "stop"]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useValue: loadingInterceptor, multi: true },
        { provide: LoadingService, useValue: spy },
      ],
    });
  });
});
```

#### Error Interceptor

- **Error Handling**: Test different HTTP error scenarios
- **Error Transformation**: Verify error processing logic
- **Notification Triggering**: Test error notification calls

### 5. Abstract Class Testing Strategy

#### ResourceService Abstract Class

- **Inheritance Testing**: Create concrete test implementation
- **Method Testing**: Test all CRUD operations
- **URL Building**: Test URL construction logic
- **Header Merging**: Test header combination logic

```typescript
class TestResourceService extends ResourceService<any> {
  constructor() {
    super("test-resource", { "X-Test": "true" });
  }
}

describe("ResourceService", () => {
  let service: TestResourceService;
  let httpMock: HttpTestingController;

  // Test all inherited methods
});
```

### 6. Error Handler Testing Strategy

#### Global Error Handler

- **Error Processing**: Test different error types
- **HTTP Error Filtering**: Verify HTTP errors are handled correctly
- **Notification Integration**: Test error notification service calls
- **Environment Handling**: Test production vs development behavior

### 7. Utility Function Testing Strategy (Requirement 6)

#### Error Utilities

- **Error Message Extraction**: Test various error formats per Requirement 6.1
- **Edge Cases**: Test null, undefined, and malformed errors per Requirement 6.1
- **Type Safety**: Verify proper type handling per Requirement 6.2
- **Return Value Validation**: Ensure outputs match expected results per Requirement 6.3

#### Local Storage Sync Utilities

- **State Persistence**: Test localStorage synchronization functionality
- **Error Handling**: Test localStorage access failures and fallbacks
- **Data Serialization**: Verify proper JSON serialization/deserialization

### 8. Configuration and Setup Testing Strategy (Requirement 7)

#### Application Configuration (app.config.ts)

- **Provider Setup**: Verify all providers are correctly configured per Requirement 7.1
- **Dependency Injection**: Test service registration and DI configuration
- **Routing Configuration**: Test route provider setup and navigation guards
- **Interceptor Registration**: Verify HTTP interceptors are properly registered

#### Route Configuration Testing

- **Route Definitions**: Test route path definitions and component mappings per Requirement 7.2
- **Route Guards**: Test authentication and authorization guards
- **Lazy Loading**: Verify feature module lazy loading configuration
- **Route Parameters**: Test parameter handling and route resolution

#### Index File Testing

- **Export Verification**: Test all module exports are accessible per Requirement 7.3
- **Barrel Exports**: Verify public API exposure through index files
- **Module Organization**: Test proper module encapsulation and interfaces

**Design Decision**: Configuration testing focuses on verifying the application bootstrap process and ensuring all dependencies are properly wired, which is critical for application stability and prevents runtime configuration errors.

## Data Models

### Test Data Factories

Create reusable test data factories for consistent test data:

```typescript
// test-data/auth.factory.ts
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: "1",
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});

// test-data/movie.factory.ts
export const createMockMovie = (overrides?: Partial<MovieResult>): MovieResult => ({
  id: 1,
  title: "Test Movie",
  overview: "Test overview",
  ...overrides,
});
```

### Mock Configurations

Standardized mock configurations for common dependencies:

```typescript
// test-helpers/mock-providers.ts
export const mockEnvironment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  tmdbApiToken: "test-token",
};

export const mockStoreProviders = [
  provideMockStore({
    initialState: {
      auth: initialAuthState,
    },
  }),
];
```

## Error Handling

### Test Error Scenarios

- **Network Errors**: Test offline/timeout scenarios
- **HTTP Errors**: Test 4xx and 5xx responses
- **Validation Errors**: Test form and input validation
- **State Errors**: Test invalid state transitions

### Error Assertion Patterns

```typescript
// Async error testing
it("should handle login failure", fakeAsync(() => {
  const error = new Error("Invalid credentials");
  authService.login.and.returnValue(throwError(error));

  component.login();
  tick(1000);

  expect(component.errorMessage).toBe("Invalid credentials");
}));
```

## Testing Strategy

### Test Categories

#### Unit Tests (Primary Focus)

- **Isolation**: Test individual units in isolation following Requirement 8.4
- **Fast Execution**: Quick feedback loop with tests completing in under 30 seconds
- **High Coverage**: Target 100% line coverage as specified in Requirement 1.2

#### Integration Tests (Secondary)

- **Component Integration**: Test component-service interactions per Requirement 3.3
- **Store Integration**: Test complete state management flows per Requirement 4

### Coverage Requirements (Requirement 1.4)

- **Lines**: 100% - Every line of code must be executed during tests
- **Functions**: 100% - All public and private methods must be tested
- **Branches**: 100% - All conditional logic paths must be covered
- **Statements**: 100% - All executable statements must be tested

### Test Naming Conventions (Requirement 8.2)

Following descriptive test naming standards to ensure clarity and maintainability:

```typescript
describe("ServiceName", () => {
  describe("methodName", () => {
    it("should return expected result when given valid input", () => {});
    it("should throw error when given invalid input", () => {});
    it("should handle edge case scenario", () => {});
  });
});
```

**Design Decision**: Descriptive test names follow the "should [expected behavior] when [condition]" pattern to clearly communicate test intent and make failures easier to diagnose.

### Test Quality Standards (Requirement 8)

#### AAA Pattern Implementation (Requirement 8.1)

All tests must follow the Arrange-Act-Assert pattern for clarity and maintainability:

```typescript
it("should calculate total when given valid numbers", () => {
  // Arrange
  const calculator = new Calculator();
  const a = 5;
  const b = 3;

  // Act
  const result = calculator.add(a, b);

  // Assert
  expect(result).toBe(8);
});
```

**Design Decision**: The AAA pattern ensures tests are readable, maintainable, and follow a consistent structure that makes test intent clear to all developers.

#### Mocking Strategies (Requirement 8.3)

- **Jasmine Spies**: For method mocking and behavior verification
- **TestBed Overrides**: For dependency injection mocking in Angular tests
- **HttpClientTestingModule**: For HTTP request mocking and verification
- **MockStore**: For NgRx store mocking and state management testing

#### Test Isolation (Requirement 8.4)

- **Independent Tests**: Each test must be able to run independently
- **Clean State**: Use beforeEach/afterEach for setup and teardown
- **No Shared State**: Avoid test interdependencies and shared mutable state

#### Async Testing Patterns (Requirement 8.5)

- **fakeAsync/tick**: For testing timers and delays with synchronous control
- **waitForAsync**: For testing async operations and promises
- **Observable Testing**: Using marble testing for complex RxJS streams
- **Proper Cleanup**: Ensure subscriptions are properly managed in tests

## Implementation Approach

### Phase 1: Core Services and Utilities

1. Error utilities and handlers
2. Loading service
3. HTTP interceptors
4. Abstract resource service

### Phase 2: Feature Services

1. Auth service
2. TMDB service
3. Error notification service

### Phase 3: State Management

1. Auth actions
2. Auth reducer
3. Auth effects
4. Auth selectors
5. App reducer and meta-reducers

### Phase 4: Components

1. Auth component
2. Spinner component

### Phase 5: Configuration and Setup

1. App config
2. Route configurations
3. Index files
4. Main.ts

### Quality Gates

- All tests must pass
- Coverage reports must show 100%
- No console errors during test execution
- Tests must run in under 30 seconds total
