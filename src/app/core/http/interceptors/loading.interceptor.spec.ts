import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingService } from '@core/services/loading.service';
import { loadingInterceptor } from './loading.interceptor';

describe('LoadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: jest.Mocked<LoadingService>;

  beforeEach(() => {
    const loadingServiceMock = {
      start: jest.fn(),
      stop: jest.fn(),
    } as unknown as jest.Mocked<LoadingService>;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        {
          provide: LoadingService,
          useValue: loadingServiceMock,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(
      LoadingService,
    ) as jest.Mocked<LoadingService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('HTTP request interception', () => {
    it('should call loading.start() when intercepting a request', () => {
      const testUrl = '/api/test';
      httpClient.get(testUrl).subscribe();
      expect(loadingService.start).toHaveBeenCalledTimes(1);
      const req = httpMock.expectOne(testUrl);
      req.flush({});
    });

    it('should call loading.stop() when request completes successfully', () => {
      const testUrl = '/api/test';
      const testData = { message: 'success' };
      httpClient.get(testUrl).subscribe();
      expect(loadingService.start).toHaveBeenCalledTimes(1);
      expect(loadingService.stop).not.toHaveBeenCalled();
      const req = httpMock.expectOne(testUrl);
      req.flush(testData);
      expect(loadingService.stop).toHaveBeenCalledTimes(1);
    });

    it('should call loading.stop() when request fails with error', () => {
      const testUrl = '/api/test';
      const errorMessage = 'Server error';
      httpClient.get(testUrl).subscribe({
        next: () => {
          // Mock implementation
        },
        error: () => {
          // Mock implementation
        },
      });
      expect(loadingService.start).toHaveBeenCalledTimes(1);
      expect(loadingService.stop).not.toHaveBeenCalled();
      const req = httpMock.expectOne(testUrl);
      req.flush(errorMessage, {
        status: 500,
        statusText: 'Internal Server Error',
      });
      expect(loadingService.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('X-Skip-Loading header functionality', () => {
    it('should skip loading service calls when X-Skip-Loading header is present', () => {
      const testUrl = '/api/test';
      const headers = { 'X-Skip-Loading': 'true' };
      httpClient.get(testUrl, { headers }).subscribe();
      expect(loadingService.start).not.toHaveBeenCalled();
      expect(loadingService.stop).not.toHaveBeenCalled();
      const req = httpMock.expectOne(testUrl);
      req.flush({});
      expect(loadingService.start).not.toHaveBeenCalled();
      expect(loadingService.stop).not.toHaveBeenCalled();
    });

    it('should remove X-Skip-Loading header from the request', () => {
      const testUrl = '/api/test';
      const headers = {
        'X-Skip-Loading': 'true',
        'Content-Type': 'application/json',
      };
      httpClient.get(testUrl, { headers }).subscribe();
      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('X-Skip-Loading')).toBe(false);
      expect(req.request.headers.has('Content-Type')).toBe(true);
      req.flush({});
    });

    it('should process normally when X-Skip-Loading header is not present', () => {
      const testUrl = '/api/test';
      const headers = { 'Content-Type': 'application/json' };
      httpClient.get(testUrl, { headers }).subscribe();
      expect(loadingService.start).toHaveBeenCalledTimes(1);
      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('X-Skip-Loading')).toBe(false);
      expect(req.request.headers.has('Content-Type')).toBe(true);
      req.flush({});
      expect(loadingService.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('finalize operator behavior', () => {
    it('should handle concurrent requests properly', () => {
      const testUrl1 = '/api/test1';
      const testUrl2 = '/api/test2';
      httpClient.get(testUrl1).subscribe();
      httpClient.get(testUrl2).subscribe();
      expect(loadingService.start).toHaveBeenCalledTimes(2);
      const req1 = httpMock.expectOne(testUrl1);
      req1.flush({});
      expect(loadingService.stop).toHaveBeenCalledTimes(1);
      const req2 = httpMock.expectOne(testUrl2);
      req2.flush({});
      expect(loadingService.stop).toHaveBeenCalledTimes(2);
    });

    it('should call loading.stop() when request is cancelled', () => {
      const testUrl = '/api/test';
      const subscription = httpClient.get(testUrl).subscribe();
      expect(loadingService.start).toHaveBeenCalledTimes(1);
      expect(loadingService.stop).not.toHaveBeenCalled();

      subscription.unsubscribe();
      expect(loadingService.stop).toHaveBeenCalledTimes(1);

      // Clean up any pending requests
      httpMock.expectOne(testUrl);
    });
  });

  describe('request modification', () => {
    it('should pass through original request when no X-Skip-Loading header', () => {
      const testUrl = '/api/test';
      const originalHeaders = {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
      };
      httpClient.get(testUrl, { headers: originalHeaders }).subscribe();
      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.has('X-Skip-Loading')).toBe(false);
      req.flush({});
    });

    it('should preserve all other headers when removing X-Skip-Loading', () => {
      const testUrl = '/api/test';
      const originalHeaders = {
        'X-Skip-Loading': 'true',
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
      };
      httpClient.get(testUrl, { headers: originalHeaders }).subscribe();
      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('X-Skip-Loading')).toBe(false);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
      req.flush({});
    });
  });
});
