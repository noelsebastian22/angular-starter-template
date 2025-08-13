import * as InfrastructureModule from './index';

describe('Infrastructure Module', () => {
  describe('Module Exports', () => {
    it('should export HTTP module components', () => {
      expect(InfrastructureModule.ResourceService).toBeDefined();
    });

    it('should export model types', () => {
      // Test that we can use the exported types
      expect(() => {
        const apiResult: InfrastructureModule.ApiResult<InfrastructureModule.MovieResult> =
          {
            page: 1,
            results: [],
            total_pages: 1,
            total_results: 0,
          };
        return apiResult;
      }).not.toThrow();
    });
  });

  describe('Module Organization', () => {
    it('should provide a unified infrastructure API', () => {
      const moduleKeys = Object.keys(InfrastructureModule);

      // Should include ResourceService from HTTP module
      expect(moduleKeys).toContain('ResourceService');

      // Should have exports from both HTTP and models modules
      expect(moduleKeys.length).toBeGreaterThan(0);
    });

    it('should not expose internal implementation details', () => {
      const moduleKeys = Object.keys(InfrastructureModule);
      const internalKeys = moduleKeys.filter(
        (key) =>
          key.startsWith('_') ||
          key.includes('private') ||
          key.includes('internal'),
      );

      expect(internalKeys).toHaveLength(0);
    });
  });

  describe('Type Integration', () => {
    it('should allow using HTTP services with model types', () => {
      // Test that ResourceService can be used with model types
      expect(() => {
        class MovieService extends InfrastructureModule.ResourceService<InfrastructureModule.MovieResult> {
          constructor() {
            super('movies');
          }
        }
        return MovieService;
      }).not.toThrow();
    });

    it('should support API result patterns with models', () => {
      const movieResults: InfrastructureModule.MovieResult[] = [];
      const apiResult: InfrastructureModule.ApiResult<InfrastructureModule.MovieResult> =
        {
          page: 1,
          results: movieResults,
          total_pages: 1,
          total_results: 0,
        };

      expect(apiResult.results).toBe(movieResults);
      expect(Array.isArray(apiResult.results)).toBe(true);
    });
  });

  describe('Public API', () => {
    it('should provide access to all infrastructure components', () => {
      // Verify that the main infrastructure components are accessible
      expect(InfrastructureModule.ResourceService).toBeDefined();

      // Test that types can be used
      expect(() => {
        const movieResult: InfrastructureModule.MovieResult = {} as unknown;
        const movieDetails: InfrastructureModule.MovieDetails = {} as unknown;
        const apiResult: InfrastructureModule.ApiResult<unknown> =
          {} as unknown;

        return { movieResult, movieDetails, apiResult };
      }).not.toThrow();
    });
  });
});
