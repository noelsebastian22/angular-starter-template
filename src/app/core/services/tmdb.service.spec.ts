import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TmdbService } from './tmdb.service';
import { ApiResult, MovieResult, MovieDetails } from '@infrastructure/models';
import { environment } from '@environments/environment';

describe('TmdbService', () => {
  let service: TmdbService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl.replace(/\/+$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TmdbService],
    });
    service = TestBed.inject(TmdbService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should set up authorization header with environment token', () => {
      // We can't directly test private properties, but we can verify through HTTP requests
      service.getPopularMovies().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/movie/popular?page=1`);
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${environment.tmdbApiToken}`,
      );

      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });

    it('should use TMDB base URL from environment', () => {
      service.getPopularMovies().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/movie/popular?page=1`);
      expect(req.request.url).toContain(environment.apiUrl);

      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });
  });

  describe('getPopularMovies()', () => {
    const mockApiResult: ApiResult<MovieResult> = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/backdrop.jpg',
          genre_ids: [28, 12],
          id: 123,
          original_language: 'en',
          original_title: 'Test Movie',
          overview: 'A test movie',
          popularity: 100.5,
          poster_path: '/poster.jpg',
          release_date: '2023-01-01',
          title: 'Test Movie',
          video: false,
          vote_average: 8.5,
          vote_count: 1000,
        },
      ],
      total_pages: 10,
      total_results: 200,
    };

    it('should make GET request to correct URL with default page', () => {
      service.getPopularMovies().subscribe((result) => {
        expect(result).toEqual(mockApiResult);
      });

      const req = httpMock.expectOne(`${baseUrl}/movie/popular?page=1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');

      req.flush(mockApiResult);
    });

    it('should make GET request with custom page parameter', () => {
      const page = 3;

      service.getPopularMovies(page).subscribe((result) => {
        expect(result).toEqual(mockApiResult);
      });

      const req = httpMock.expectOne(`${baseUrl}/movie/popular?page=${page}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe(page.toString());

      req.flush(mockApiResult);
    });

    it('should include authorization header', () => {
      service.getPopularMovies().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/movie/popular?page=1`);
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${environment.tmdbApiToken}`,
      );

      req.flush(mockApiResult);
    });

    it('should handle HTTP error responses', () => {
      service.getPopularMovies().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/movie/popular?page=1`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors', () => {
      service.getPopularMovies().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(0);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/movie/popular?page=1`);
      req.error(new ProgressEvent('Network error'), { status: 0 });
    });
  });

  describe('getMovie()', () => {
    const mockMovieDetails: MovieDetails = {
      adult: false,
      backdrop_path: '/backdrop.jpg',
      belongs_to_collection: {
        id: 1,
        name: 'Test Collection',
        poster_path: null,
        backdrop_path: '/collection-backdrop.jpg',
      },
      budget: 100000000,
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
      ],
      homepage: 'https://example.com',
      id: 123,
      imdb_id: 'tt1234567',
      origin_country: ['US'],
      original_language: 'en',
      original_title: 'Test Movie',
      overview: 'A detailed test movie',
      popularity: 100.5,
      poster_path: '/poster.jpg',
      production_companies: [
        {
          id: 1,
          logo_path: '/logo.jpg',
          name: 'Test Studios',
          origin_country: 'US',
        },
      ],
      production_countries: [
        {
          iso_3166_1: 'US',
          name: 'United States of America',
        },
      ],
      release_date: '2023-01-01',
      revenue: 500000000,
      runtime: 120,
      spoken_languages: [
        {
          english_name: 'English',
          iso_639_1: 'en',
          name: 'English',
        },
      ],
      status: 'Released',
      tagline: 'The ultimate test',
      title: 'Test Movie',
      video: false,
      vote_average: 8.5,
      vote_count: 1000,
    };

    it('should make GET request to correct URL with movie ID', () => {
      const movieId = 123;

      service.getMovie(movieId).subscribe((result) => {
        expect(result).toEqual(mockMovieDetails);
      });

      const req = httpMock.expectOne(`${baseUrl}/movie/${movieId}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockMovieDetails);
    });

    it('should include authorization header', () => {
      const movieId = 456;

      service.getMovie(movieId).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/movie/${movieId}`);
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${environment.tmdbApiToken}`,
      );

      req.flush(mockMovieDetails);
    });

    it('should handle different movie IDs', () => {
      const movieIds = [1, 999, 12345];

      movieIds.forEach((id) => {
        service.getMovie(id).subscribe((result) => {
          expect(result).toEqual(mockMovieDetails);
        });

        const req = httpMock.expectOne(`${baseUrl}/movie/${id}`);
        expect(req.request.method).toBe('GET');

        req.flush(mockMovieDetails);
      });
    });

    it('should handle HTTP error responses', () => {
      const movieId = 999;

      service.getMovie(movieId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/movie/${movieId}`);
      req.flush('Movie not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle server errors', () => {
      const movieId = 123;

      service.getMovie(movieId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/movie/${movieId}`);
      req.flush('Internal server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  describe('searchMovies()', () => {
    const mockSearchResult: ApiResult<MovieResult> = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: '/search-backdrop.jpg',
          genre_ids: [35, 18],
          id: 789,
          original_language: 'en',
          original_title: 'Search Result Movie',
          overview: 'A movie found by search',
          popularity: 75.2,
          poster_path: '/search-poster.jpg',
          release_date: '2023-06-15',
          title: 'Search Result Movie',
          video: false,
          vote_average: 7.8,
          vote_count: 500,
        },
      ],
      total_pages: 5,
      total_results: 50,
    };

    it('should make GET request to correct URL with query and default page', () => {
      const query = 'test movie';

      service.searchMovies(query).subscribe((result) => {
        expect(result).toEqual(mockSearchResult);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/search/movie?query=${encodeURIComponent(query)}&page=1&include_adult=false`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('query')).toBe(query);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('include_adult')).toBe('false');

      req.flush(mockSearchResult);
    });

    it('should make GET request with custom page parameter', () => {
      const query = 'action movie';
      const page = 2;

      service.searchMovies(query, page).subscribe((result) => {
        expect(result).toEqual(mockSearchResult);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/search/movie?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('query')).toBe(query);
      expect(req.request.params.get('page')).toBe(page.toString());
      expect(req.request.params.get('include_adult')).toBe('false');

      req.flush(mockSearchResult);
    });

    it('should handle special characters in query', () => {
      const query = 'movie with special chars: !@#$%^&*()';

      service.searchMovies(query).subscribe((result) => {
        expect(result).toEqual(mockSearchResult);
      });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === `${baseUrl}/search/movie` &&
          request.params.get('query') === query &&
          request.params.get('page') === '1' &&
          request.params.get('include_adult') === 'false'
        );
      });
      expect(req.request.params.get('query')).toBe(query);

      req.flush(mockSearchResult);
    });

    it('should handle empty query string', () => {
      const query = '';

      service.searchMovies(query).subscribe((result) => {
        expect(result).toEqual(mockSearchResult);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/search/movie?query=&page=1&include_adult=false`,
      );
      expect(req.request.params.get('query')).toBe('');

      req.flush(mockSearchResult);
    });

    it('should always set include_adult to false', () => {
      const query = 'family movie';

      service.searchMovies(query).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/search/movie?query=${encodeURIComponent(query)}&page=1&include_adult=false`,
      );
      expect(req.request.params.get('include_adult')).toBe('false');

      req.flush(mockSearchResult);
    });

    it('should include authorization header', () => {
      const query = 'test';

      service.searchMovies(query).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/search/movie?query=${encodeURIComponent(query)}&page=1&include_adult=false`,
      );
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${environment.tmdbApiToken}`,
      );

      req.flush(mockSearchResult);
    });

    it('should handle HTTP error responses', () => {
      const query = 'nonexistent movie';

      service.searchMovies(query).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(422);
          expect(error.statusText).toBe('Unprocessable Entity');
        },
      });

      const req = httpMock.expectOne(
        `${baseUrl}/search/movie?query=${encodeURIComponent(query)}&page=1&include_adult=false`,
      );
      req.flush('Invalid query', {
        status: 422,
        statusText: 'Unprocessable Entity',
      });
    });

    it('should handle rate limiting errors', () => {
      const query = 'popular movie';

      service.searchMovies(query).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(429);
        },
      });

      const req = httpMock.expectOne(
        `${baseUrl}/search/movie?query=${encodeURIComponent(query)}&page=1&include_adult=false`,
      );
      req.flush('Rate limit exceeded', {
        status: 429,
        statusText: 'Too Many Requests',
      });
    });
  });

  describe('environment variable usage', () => {
    it('should use environment apiUrl for base URL', () => {
      service.getPopularMovies().subscribe();

      const req = httpMock.expectOne(
        `${environment.apiUrl.replace(/\/+$/, '')}/movie/popular?page=1`,
      );
      expect(req.request.url).toContain(environment.apiUrl);

      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });

    it('should use environment tmdbApiToken for authorization', () => {
      service.getMovie(123).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/movie/123`);
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${environment.tmdbApiToken}`,
      );

      req.flush({} as MovieDetails);
    });

    it('should strip trailing slashes from base URL', () => {
      // This tests the baseUrl override in the service
      service.searchMovies('test').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/search/movie?query=test&page=1&include_adult=false`,
      );
      // Check that the URL doesn't have consecutive slashes (except in protocol)
      const urlWithoutProtocol = req.request.url.replace(/^https?:\/\//, '');
      expect(urlWithoutProtocol).not.toMatch(/\/\/+/);

      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });
  });

  describe('inheritance from ResourceService', () => {
    it('should inherit HTTP request functionality', () => {
      // Test that the service properly extends ResourceService
      expect(service).toBeInstanceOf(TmdbService);

      // Verify it can make HTTP requests (inherited functionality)
      service.getPopularMovies().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/movie/popular?page=1`);
      expect(req.request.method).toBe('GET');

      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });

    it('should properly construct URLs using inherited url() method', () => {
      // Test different URL constructions
      service.getPopularMovies().subscribe();
      service.getMovie(123).subscribe();
      service.searchMovies('test').subscribe();

      const requests = httpMock.match(() => true);
      expect(requests).toHaveLength(3);

      expect(requests[0].request.url).toBe(`${baseUrl}/movie/popular`);
      expect(requests[1].request.url).toBe(`${baseUrl}/movie/123`);
      expect(requests[2].request.url).toBe(`${baseUrl}/search/movie`);

      requests.forEach((req) => req.flush({}));
    });
  });
});
