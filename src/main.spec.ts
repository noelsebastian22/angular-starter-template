// Mock console.error to test error handling
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {
  // Mock implementation
});

// Mock the bootstrapApplication function
const mockBootstrapApplication = jest.fn();

jest.mock('@angular/platform-browser', () => ({
  bootstrapApplication: mockBootstrapApplication,
}));

describe('main.ts', () => {
  beforeEach(() => {
    mockBootstrapApplication.mockClear();
    mockConsoleError.mockClear();
    // Clear the module cache to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('Application Bootstrap', () => {
    it('should call bootstrapApplication with correct component and configuration', async () => {
      // Arrange
      const mockPromise = Promise.resolve();
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Assert
      expect(mockBootstrapApplication).toHaveBeenCalledTimes(1);
    });

    it('should pass the App component as the first parameter', async () => {
      // Arrange
      const mockPromise = Promise.resolve();
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Assert
      expect(mockBootstrapApplication).toHaveBeenCalled();
      const [component] = mockBootstrapApplication.mock.calls[0];
      expect(component).toBeDefined();
      expect(typeof component).toBe('function');
    });

    it('should pass the appConfig as the second parameter', async () => {
      // Arrange
      const mockPromise = Promise.resolve();
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Assert
      expect(mockBootstrapApplication).toHaveBeenCalled();
      const [, config] = mockBootstrapApplication.mock.calls[0];
      expect(config).toBeDefined();
      expect(config).toHaveProperty('providers');
    });
  });

  describe('Configuration Verification', () => {
    let appConfig: { providers: unknown[] };

    beforeEach(async () => {
      const configModule = await import('./app/app.config');
      appConfig = configModule.appConfig;
    });

    it('should verify appConfig contains required providers', () => {
      // Assert
      expect(appConfig.providers).toBeDefined();
      expect(Array.isArray(appConfig.providers)).toBe(true);
      expect(appConfig.providers.length).toBeGreaterThan(0);
    });

    it('should have exactly 8 providers configured', () => {
      // Assert - Based on app.config.ts, we expect 8 providers
      expect(appConfig.providers.length).toBe(8);
    });

    it('should have all providers defined and not null', () => {
      // Assert
      appConfig.providers.forEach((provider: unknown) => {
        expect(provider).toBeDefined();
        expect(provider).not.toBeNull();
      });
    });

    it('should include object-based providers', () => {
      // Assert
      const hasObjectProviders = appConfig.providers.some(
        (provider: unknown) =>
          typeof provider === 'object' && provider !== null,
      );
      expect(hasObjectProviders).toBe(true);
    });

    it('should include custom error handler provider', () => {
      // Assert
      const hasErrorHandlerProvider = appConfig.providers.some(
        (provider: unknown) =>
          typeof provider === 'object' &&
          provider !== null &&
          'provide' in provider &&
          'useClass' in provider,
      );
      expect(hasErrorHandlerProvider).toBe(true);
    });

    it('should have providers with correct structure', () => {
      // Assert - Verify each provider is either a function or object
      appConfig.providers.forEach((provider: unknown, _index: number) => {
        expect(['function', 'object'].includes(typeof provider)).toBe(true);
        if (typeof provider === 'object') {
          expect(provider).not.toBeNull();
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle bootstrap errors and log them to console', async () => {
      // Arrange
      const testError = new Error('Bootstrap failed');
      const mockPromise = Promise.reject(testError);
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Wait for the promise to be handled
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledWith(testError);
    });

    it('should handle network-related bootstrap errors', async () => {
      // Arrange
      const networkError = new Error('Network error during bootstrap');
      const mockPromise = Promise.reject(networkError);
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Wait for the promise to be handled
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(networkError);
    });

    it('should handle configuration-related bootstrap errors', async () => {
      // Arrange
      const configError = new Error('Invalid configuration');
      const mockPromise = Promise.reject(configError);
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Wait for the promise to be handled
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(configError);
    });

    it('should handle dependency injection errors during bootstrap', async () => {
      // Arrange
      const diError = new Error('Dependency injection failed');
      const mockPromise = Promise.reject(diError);
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Wait for the promise to be handled
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(diError);
    });
  });

  describe('Dependency Injection Setup', () => {
    let appConfig: { providers: unknown[] };

    beforeEach(async () => {
      const configModule = await import('./app/app.config');
      appConfig = configModule.appConfig;
    });

    it('should verify provider configuration structure', () => {
      // Assert
      expect(appConfig).toHaveProperty('providers');
      expect(appConfig.providers).toBeInstanceOf(Array);
    });

    it('should have all providers properly configured', () => {
      // Assert - All providers should be valid
      appConfig.providers.forEach((provider: unknown) => {
        expect(provider).toBeDefined();
        expect(provider).not.toBeNull();
      });
      expect(appConfig.providers.length).toBe(8);
    });

    it('should have providers that are not null or undefined', () => {
      // Assert
      appConfig.providers.forEach((provider: unknown) => {
        expect(provider).toBeDefined();
        expect(provider).not.toBeNull();
      });
    });

    it('should include error handler configuration', () => {
      // Assert
      const errorHandlerProvider = appConfig.providers.find(
        (provider: unknown) =>
          typeof provider === 'object' &&
          provider !== null &&
          'provide' in provider &&
          'useClass' in provider,
      );
      expect(errorHandlerProvider).toBeDefined();
      expect(errorHandlerProvider?.provide).toBeDefined();
      expect(errorHandlerProvider?.useClass).toBeDefined();
    });
  });

  describe('Application Initialization', () => {
    it('should successfully initialize when all dependencies are available', async () => {
      // Arrange
      const mockApplicationRef = {
        bootstrap: jest.fn(),
        tick: jest.fn(),
        destroy: jest.fn(),
      };
      const mockPromise = Promise.resolve(mockApplicationRef);
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');
      const result = await mockPromise;

      // Assert
      expect(result).toBe(mockApplicationRef);
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should handle successful bootstrap without errors', async () => {
      // Arrange
      const mockPromise = Promise.resolve({});
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');
      await mockPromise;

      // Assert
      expect(mockBootstrapApplication).toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('Module Loading', () => {
    it('should import required modules without errors', async () => {
      // Act & Assert - if we reach this point, imports were successful
      const appModule = await import('./app/app');
      const configModule = await import('./app/app.config');

      expect(appModule.App).toBeDefined();
      expect(configModule.appConfig).toBeDefined();
    });

    it('should have valid App component reference', async () => {
      // Act
      const appModule = await import('./app/app');

      // Assert
      expect(appModule.App).toBeDefined();
      expect(typeof appModule.App).toBe('function');
    });

    it('should have valid appConfig reference', async () => {
      // Act
      const configModule = await import('./app/app.config');

      // Assert
      expect(configModule.appConfig).toBeDefined();
      expect(typeof configModule.appConfig).toBe('object');
      expect(configModule.appConfig.providers).toBeDefined();
    });
  });

  describe('Bootstrap Process Integration', () => {
    it('should call bootstrapApplication with App component and appConfig', async () => {
      // Arrange
      const mockPromise = Promise.resolve();
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Assert
      expect(mockBootstrapApplication).toHaveBeenCalledTimes(1);
      const [component, config] = mockBootstrapApplication.mock.calls[0];

      // Verify component is the App class
      expect(component).toBeDefined();
      expect(typeof component).toBe('function');

      // Verify config has the expected structure
      expect(config).toBeDefined();
      expect(config).toHaveProperty('providers');
      expect(Array.isArray(config.providers)).toBe(true);
    });

    it('should handle the bootstrap promise chain correctly', async () => {
      // Arrange
      const mockApplicationRef = { destroy: jest.fn() };
      const mockPromise = Promise.resolve(mockApplicationRef);
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Wait for promise resolution
      await mockPromise;

      // Assert
      expect(mockBootstrapApplication).toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should properly handle async bootstrap errors with catch block', async () => {
      // Arrange
      const bootstrapError = new Error('Async bootstrap failure');
      const mockPromise = Promise.reject(bootstrapError);
      mockBootstrapApplication.mockReturnValue(mockPromise);

      // Act
      await import('./main');

      // Wait for error handling
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert
      expect(mockBootstrapApplication).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(bootstrapError);
    });
  });

  describe('Provider Configuration Details', () => {
    let appConfig: { providers: unknown[] };

    beforeEach(async () => {
      const configModule = await import('./app/app.config');
      appConfig = configModule.appConfig;
    });

    it('should verify all providers are properly configured', () => {
      // Assert
      expect(appConfig.providers).toHaveLength(8);

      // Verify all providers are defined
      appConfig.providers.forEach((provider: unknown) => {
        expect(provider).toBeDefined();
        expect(provider).not.toBeNull();
      });
    });

    it('should have providers that support Angular dependency injection', () => {
      // Assert - All providers should be valid DI providers
      appConfig.providers.forEach((provider: unknown, _index: number) => {
        // All providers should be defined and not null
        expect(provider).toBeDefined();
        expect(provider).not.toBeNull();

        // Providers can be functions or objects
        expect(['function', 'object'].includes(typeof provider)).toBe(true);
      });
    });

    it('should include the expected number of providers from app.config.ts', () => {
      // Assert - Verify we have all the providers defined in app.config.ts:
      // 1. provideBrowserGlobalErrorListeners()
      // 2. provideZoneChangeDetection({ eventCoalescing: true })
      // 3. provideHttpClient(withInterceptors([loadingInterceptor, errorInterceptor]))
      // 4. { provide: ErrorHandler, useClass: GlobalErrorHandler }
      // 5. provideRouter(routes)
      // 6. provideStore(reducers, { metaReducers })
      // 7. provideEffects([AuthEffects])
      // 8. provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
      expect(appConfig.providers).toHaveLength(8);
    });

    it('should have at least one provider with provide/useClass structure', () => {
      // Assert - The ErrorHandler provider should have this structure
      const classBasedProvider = appConfig.providers.find(
        (provider: unknown) =>
          typeof provider === 'object' &&
          provider !== null &&
          'provide' in provider &&
          'useClass' in provider,
      );
      expect(classBasedProvider).toBeDefined();
    });
  });
});
