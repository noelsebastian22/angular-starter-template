import * as ModelsModule from './index';

describe('Infrastructure Models Module', () => {
  describe('Module Exports', () => {
    it('should export model types from tmdb.model', () => {
      // Since TypeScript interfaces don't exist at runtime, we test that the module
      // can be imported and the types can be used
      expect(ModelsModule).toBeDefined();
    });

    it('should allow importing types for use in code', () => {
      // Test that we can import and use the types
      expect(() => {
        // This would fail at compile time if the exports weren't available
        const testApiResult: ModelsModule.ApiResult<ModelsModule.MovieResult> =
          {
            page: 1,
            results: [],
            total_pages: 1,
            total_results: 0,
          };
        return testApiResult;
      }).not.toThrow();
    });
  });

  describe('Type Definitions', () => {
    it('should provide ApiResult interface that can be used with generics', () => {
      // Test that ApiResult can be used as a generic type
      const mockApiResult: ModelsModule.ApiResult<ModelsModule.MovieResult> = {
        page: 1,
        results: [],
        total_pages: 10,
        total_results: 100,
      };

      expect(mockApiResult.page).toBe(1);
      expect(Array.isArray(mockApiResult.results)).toBe(true);
      expect(mockApiResult.total_pages).toBe(10);
      expect(mockApiResult.total_results).toBe(100);
    });

    it('should provide MovieResult interface with correct structure', () => {
      const mockMovieResult: ModelsModule.MovieResult = {
        adult: false,
        backdrop_path: '/backdrop.jpg',
        genre_ids: [1, 2, 3],
        id: 123,
        original_language: 'en',
        original_title: 'Test Movie',
        overview: 'A test movie overview',
        popularity: 8.5,
        poster_path: '/poster.jpg',
        release_date: '2023-01-01',
        title: 'Test Movie',
        video: false,
        vote_average: 7.5,
        vote_count: 1000,
      };

      expect(typeof mockMovieResult.adult).toBe('boolean');
      expect(typeof mockMovieResult.backdrop_path).toBe('string');
      expect(Array.isArray(mockMovieResult.genre_ids)).toBe(true);
      expect(typeof mockMovieResult.id).toBe('number');
      expect(typeof mockMovieResult.original_language).toBe('string');
      expect(typeof mockMovieResult.original_title).toBe('string');
      expect(typeof mockMovieResult.overview).toBe('string');
      expect(typeof mockMovieResult.popularity).toBe('number');
      expect(typeof mockMovieResult.poster_path).toBe('string');
      expect(typeof mockMovieResult.release_date).toBe('string');
      expect(typeof mockMovieResult.title).toBe('string');
      expect(typeof mockMovieResult.video).toBe('boolean');
      expect(typeof mockMovieResult.vote_average).toBe('number');
      expect(typeof mockMovieResult.vote_count).toBe('number');
    });
  });

  describe('Type Compatibility', () => {
    it('should allow ApiResult to work with MovieResult', () => {
      const movieResults: ModelsModule.MovieResult[] = [];
      const apiResult: ModelsModule.ApiResult<ModelsModule.MovieResult> = {
        page: 1,
        results: movieResults,
        total_pages: 1,
        total_results: 0,
      };

      expect(apiResult.results).toBe(movieResults);
      expect(Array.isArray(apiResult.results)).toBe(true);
    });
  });
});
