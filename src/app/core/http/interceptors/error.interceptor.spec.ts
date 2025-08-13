import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorNotificationService } from '@core/services/error-notification.service';
import { errorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let errorNotificationService: jest.Mocked<ErrorNotificationService>;

  beforeEach(() => {
    const errorNotificationServiceMock = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ErrorNotificationService>;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        {
          provide: ErrorNotificationService,
          useValue: errorNotificationServiceMock,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    errorNotificationService = TestBed.inject(
      ErrorNotificationService,
    ) as jest.Mocked<ErrorNotificationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('HTTP error interception', () => {
    it('should call error notification service when HTTP request fails with 4xx error', () => {
      const testUrl = '/api/test';
      const errorMessage = 'Bad Request';
      let capturedError!: HttpErrorResponse;
      httpClient.get(testUrl).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError = error;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
      expect(errorNotificationService.show).toHaveBeenCalledTimes(1);
      expect(errorNotificationService.show).toHaveBeenCalledWith(
        expect.any(HttpErrorResponse),
      );
      expect(capturedError).toBeInstanceOf(HttpErrorResponse);
      expect(capturedError.status).toBe(400);
    });

    it('should call error notification service when HTTP request fails with 5xx error', () => {
      const testUrl = '/api/test';
      const errorMessage = 'Internal Server Error';
      let capturedError!: HttpErrorResponse;
      httpClient.get(testUrl).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError = error;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.flush(errorMessage, {
        status: 500,
        statusText: 'Internal Server Error',
      });
      expect(errorNotificationService.show).toHaveBeenCalledTimes(1);
      expect(errorNotificationService.show).toHaveBeenCalledWith(
        expect.any(HttpErrorResponse),
      );
      expect(capturedError).toBeInstanceOf(HttpErrorResponse);
      expect(capturedError.status).toBe(500);
    });

    it('should handle different HTTP error status codes', () => {
      const testCases = [
        { status: 401, statusText: 'Unauthorized' },
        { status: 403, statusText: 'Forbidden' },
        { status: 404, statusText: 'Not Found' },
        { status: 422, statusText: 'Unprocessable Entity' },
        { status: 502, statusText: 'Bad Gateway' },
        { status: 503, statusText: 'Service Unavailable' },
      ];

      testCases.forEach(({ status, statusText }, index) => {
        const testUrl = `/api/test${index}`;
        let capturedError!: HttpErrorResponse;
        httpClient.get(testUrl).subscribe({
          next: () => {
            // Mock implementation
          },
          error: (error) => {
            capturedError = error;
          },
        });
        const req = httpMock.expectOne(testUrl);
        req.flush('Error', { status, statusText });
        expect(capturedError).toBeInstanceOf(HttpErrorResponse);
        expect(capturedError.status).toBe(status);
      });

      expect(errorNotificationService.show).toHaveBeenCalledTimes(
        testCases.length,
      );
    });
  });

  describe('successful response passthrough', () => {
    it('should not call error notification service for successful responses', () => {
      const testUrl = '/api/test';
      const successData = { message: 'Success' };
      let responseData: unknown;
      httpClient.get(testUrl).subscribe({
        next: (data) => {
          responseData = data;
        },
        error: () => {
          // Mock implementation
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.flush(successData);
      expect(responseData).toEqual(successData);
      expect(errorNotificationService.show).not.toHaveBeenCalled();
    });

    it('should pass through successful responses without modification', () => {
      const testUrl = '/api/test';
      const successData = { id: 1, name: 'Test', items: [1, 2, 3] };
      let responseData: unknown;
      httpClient.get(testUrl).subscribe({
        next: (data) => {
          responseData = data;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.flush(successData);
      expect(responseData).toEqual(successData);
      expect(errorNotificationService.show).not.toHaveBeenCalled();
    });

    it('should handle different successful HTTP status codes', () => {
      const testCases = [
        { status: 200, statusText: 'OK', data: { message: 'OK' } },
        { status: 201, statusText: 'Created', data: { id: 1, created: true } },
        { status: 204, statusText: 'No Content', data: null },
      ];

      testCases.forEach(({ status, statusText, data }, index) => {
        const testUrl = `/api/test${index}`;
        let responseData: unknown;
        let responseStatus: number | undefined;
        httpClient.get(testUrl, { observe: 'response' }).subscribe({
          next: (response) => {
            responseData = response.body;
            responseStatus = response.status;
          },
        });
        const req = httpMock.expectOne(testUrl);
        req.flush(data, { status, statusText });
        expect(responseData).toEqual(data);
        expect(responseStatus).toBe(status);
      });

      expect(errorNotificationService.show).not.toHaveBeenCalled();
    });
  });

  describe('X-Skip-Error-Notify header functionality', () => {
    it('should skip error notification when X-Skip-Error-Notify header is present', () => {
      const testUrl = '/api/test';
      const headers = { 'X-Skip-Error-Notify': 'true' };
      let capturedError!: HttpErrorResponse;
      httpClient.get(testUrl, { headers }).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError = error;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
      expect(capturedError).toBeInstanceOf(HttpErrorResponse);
      expect(errorNotificationService.show).not.toHaveBeenCalled();
    });

    it('should process error notification normally when X-Skip-Error-Notify header is not present', () => {
      const testUrl = '/api/test';
      const headers = { 'Content-Type': 'application/json' };
      let capturedError!: HttpErrorResponse;
      httpClient.get(testUrl, { headers }).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError = error;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
      expect(capturedError).toBeInstanceOf(HttpErrorResponse);
      expect(errorNotificationService.show).toHaveBeenCalledTimes(1);
    });

    it('should check for exact header value when determining skip behavior', () => {
      const testUrl = '/api/test';
      const headers = { 'X-Skip-Error-Notify': '' };
      let capturedError!: HttpErrorResponse;
      httpClient.get(testUrl, { headers }).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError = error;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
      expect(capturedError).toBeInstanceOf(HttpErrorResponse);
      expect(errorNotificationService.show).toHaveBeenCalledTimes(1);
    });
  });

  describe('error transformation and rethrowing', () => {
    it('should rethrow the original error after processing', () => {
      const testUrl = '/api/test';
      let capturedError!: HttpErrorResponse;
      httpClient.get(testUrl).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError = error;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.error(new ErrorEvent('Network error'), {
        status: 500,
        statusText: 'Internal Server Error',
      });
      expect(capturedError).toBeDefined();
      expect(errorNotificationService.show).toHaveBeenCalledTimes(1);
    });

    it('should preserve error details when rethrowing', () => {
      const testUrl = '/api/test';
      const errorBody = {
        message: 'Validation failed',
        errors: ['Field is required'],
      };
      let capturedError!: HttpErrorResponse;
      httpClient.get(testUrl).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError = error;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.flush(errorBody, { status: 422, statusText: 'Unprocessable Entity' });
      expect(capturedError!).toBeInstanceOf(HttpErrorResponse);
      expect(capturedError!.status).toBe(422);
      expect(capturedError!.error).toEqual(errorBody);
      expect(errorNotificationService.show).toHaveBeenCalledWith(
        capturedError!,
      );
    });
  });

  describe('error handling flow', () => {
    it('should maintain proper error handling flow with multiple interceptors', () => {
      const testUrl = '/api/test';
      let capturedError!: HttpErrorResponse;
      let errorHandled = false;
      httpClient.get(testUrl).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError = error;
          errorHandled = true;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
      expect(errorHandled).toBe(true);
      expect(capturedError).toBeInstanceOf(HttpErrorResponse);
      expect(errorNotificationService.show).toHaveBeenCalledTimes(1);
      expect(errorNotificationService.show).toHaveBeenCalledWith(capturedError);
    });

    it('should handle network errors properly', () => {
      const testUrl = '/api/test';
      let capturedError!: HttpErrorResponse;
      httpClient.get(testUrl).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError = error;
        },
      });
      const req = httpMock.expectOne(testUrl);
      req.error(
        new ErrorEvent('Network error', {
          message: 'Connection failed',
        }),
      );
      expect(capturedError).toBeInstanceOf(HttpErrorResponse);
      expect(capturedError.status).toBe(0);
      expect(errorNotificationService.show).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent error requests independently', () => {
      const testUrl1 = '/api/test1';
      const testUrl2 = '/api/test2';
      let capturedError1!: HttpErrorResponse;
      let capturedError2!: HttpErrorResponse;
      httpClient.get(testUrl1).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError1 = error;
        },
      });
      httpClient.get(testUrl2).subscribe({
        next: () => {
          // Mock implementation
        },
        error: (error) => {
          capturedError2 = error;
        },
      });
      const req1 = httpMock.expectOne(testUrl1);
      const req2 = httpMock.expectOne(testUrl2);
      req1.flush('Error 1', { status: 400, statusText: 'Bad Request' });
      req2.flush('Error 2', {
        status: 500,
        statusText: 'Internal Server Error',
      });
      expect(capturedError1).toBeInstanceOf(HttpErrorResponse);
      expect(capturedError2).toBeInstanceOf(HttpErrorResponse);
      expect(capturedError1.status).toBe(400);
      expect(capturedError2.status).toBe(500);
      expect(errorNotificationService.show).toHaveBeenCalledTimes(2);
    });
  });
});
