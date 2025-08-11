import {
  createMockUser,
  createMockAuthState,
  createMockMovieResult,
  createMockEnvironment,
  mockStoreProviders,
  AsyncTestHelper,
  SpyHelper,
  configureServiceTestBed,
} from '@test-helpers';

/**
 * Test suite to verify test infrastructure is working correctly
 * This validates Requirements 8.1, 8.3, and 8.4
 */
describe('Test Infrastructure', () => {
  describe('Test Data Factories', () => {
    it('should create mock user with default values', () => {
      const user = createMockUser();

      expect(user).toEqual({
        id: '1',
        name: 'Test User',
      });
    });

    it('should create mock user with overrides', () => {
      const user = createMockUser({ name: 'Custom User', id: '123' });

      expect(user).toEqual({
        id: '123',
        name: 'Custom User',
      });
    });

    it('should create mock auth state', () => {
      const authState = createMockAuthState();

      expect(authState).toEqual({
        user: null,
        loading: false,
        error: null,
      });
    });

    it('should create mock movie result', () => {
      const movie = createMockMovieResult();

      expect(movie).toHaveProperty('id');
      expect(movie).toHaveProperty('title');
      expect(movie).toHaveProperty('overview');
      expect(movie.title).toBe('Test Movie');
    });

    it('should create mock environment', () => {
      const env = createMockEnvironment();

      expect(env).toHaveProperty('production', false);
      expect(env).toHaveProperty('apiUrl');
      expect(env).toHaveProperty('tmdbApiToken');
    });
  });

  describe('Mock Providers', () => {
    it('should create mock store providers', () => {
      const providers = mockStoreProviders();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });
  });

  describe('Async Test Helper', () => {
    it('should create resolved promise', async () => {
      const promise = AsyncTestHelper.createResolvedPromise('test value');
      const result = await promise;

      expect(result).toBe('test value');
    });

    it('should create rejected promise', async () => {
      const promise = AsyncTestHelper.createRejectedPromise(
        new Error('test error'),
      );

      await expect(promise).rejects.toThrow('test error');
    });

    it('should create observable', (done) => {
      const observable = AsyncTestHelper.createObservable('test value');

      observable.subscribe((value) => {
        expect(value).toBe('test value');
        done();
      });
    });
  });

  describe('Spy Helper', () => {
    it('should create spy object', () => {
      interface TestService {
        method1(): string;
        method2(param: number): boolean;
        [key: string]: unknown;
      }

      const spy = SpyHelper.createSpyObj<TestService>('TestService', [
        'method1',
        'method2',
      ]);

      expect(spy.method1).toBeDefined();
      expect(spy.method2).toBeDefined();
      expect(typeof spy.method1).toBe('function');
    });
  });

  describe('Service Test Configuration', () => {
    beforeEach(() => {
      configureServiceTestBed({
        providers: [],
      });
    });

    it('should configure service test bed', () => {
      // This test verifies that configureServiceTestBed doesn't throw errors
      expect(true).toBe(true);
    });
  });
});
