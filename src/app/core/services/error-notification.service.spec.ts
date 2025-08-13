import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorNotificationService } from './error-notification.service';

describe('ErrorNotificationService', () => {
  let service: ErrorNotificationService;
  let consoleSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorNotificationService);
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Mock implementation
    });
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show()', () => {
    it('should log error message to console', () => {
      const error = new Error('Test error');

      service.show(error);

      expect(consoleSpy).toHaveBeenCalledWith('[Toast]', 'Test error', error);
    });

    it('should handle HttpErrorResponse', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Resource not found' },
      });

      service.show(httpError);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Toast]',
        'Not found.',
        httpError,
      );
    });

    it('should handle unknown error types', () => {
      const unknownError = { someProperty: 'value' };

      service.show(unknownError);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Toast]',
        'An unexpected error occurred.',
        unknownError,
      );
    });
  });

  describe('toUserMessage()', () => {
    describe('HttpErrorResponse handling', () => {
      it('should return offline message when navigator is offline', () => {
        jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
        const httpError = new HttpErrorResponse({ status: 0 });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('You appear to be offline.');
      });

      it('should return network error message for status 0', () => {
        jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
        const httpError = new HttpErrorResponse({ status: 0 });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Network error. Please try again.');
      });

      it('should return session expired message for status 401', () => {
        const httpError = new HttpErrorResponse({ status: 401 });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Your session has expired. Please sign in.');
      });

      it('should return permission denied message for status 403', () => {
        const httpError = new HttpErrorResponse({ status: 403 });

        const message = service.toUserMessage(httpError);

        expect(message).toBe(
          'You do not have permission to perform this action.',
        );
      });

      it('should return not found message for status 404', () => {
        const httpError = new HttpErrorResponse({ status: 404 });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Not found.');
      });

      it('should return server error message for status >= 500', () => {
        const httpError = new HttpErrorResponse({ status: 500 });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Server error. Please try again later.');
      });

      it('should return server error message for status 503', () => {
        const httpError = new HttpErrorResponse({ status: 503 });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Server error. Please try again later.');
      });

      it('should extract server message from error body when available', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          error: { message: 'Custom server error message' },
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Custom server error message');
      });

      it('should extract server message from errors array when available', () => {
        const httpError = new HttpErrorResponse({
          status: 422,
          error: { errors: ['Validation failed', 'Another error'] },
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Validation failed');
      });

      it('should extract string error body', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          error: 'Simple string error',
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Simple string error');
      });

      it('should fallback to generic message with status code', () => {
        const httpError = new HttpErrorResponse({
          status: 418,
          error: null,
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Request failed (418).');
      });

      it('should handle complex error body with JSON stringify fallback', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          error: { complex: { nested: 'object' }, without: 'message' },
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe(
          '{"complex":{"nested":"object"},"without":"message"}',
        );
      });
    });

    describe('Non-HTTP error handling', () => {
      it('should return Error message when error is Error instance', () => {
        const error = new Error('Custom error message');

        const message = service.toUserMessage(error);

        expect(message).toBe('Custom error message');
      });

      it('should return default message when Error has no message', () => {
        const error = new Error('');

        const message = service.toUserMessage(error);

        expect(message).toBe('An unexpected error occurred.');
      });

      it('should return default message for unknown error types', () => {
        const unknownError = { someProperty: 'value' };

        const message = service.toUserMessage(unknownError);

        expect(message).toBe('An unexpected error occurred.');
      });

      it('should return default message for null error', () => {
        const message = service.toUserMessage(null);

        expect(message).toBe('An unexpected error occurred.');
      });

      it('should return default message for undefined error', () => {
        const message = service.toUserMessage(undefined);

        expect(message).toBe('An unexpected error occurred.');
      });

      it('should return default message for string error', () => {
        const message = service.toUserMessage('string error');

        expect(message).toBe('An unexpected error occurred.');
      });

      it('should return default message for number error', () => {
        const message = service.toUserMessage(42);

        expect(message).toBe('An unexpected error occurred.');
      });
    });

    describe('extractServerMessage edge cases', () => {
      it('should handle error body with non-string message property', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          error: { message: 123 },
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('{"message":123}');
      });

      it('should handle error body with non-array errors property', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          error: { errors: 'not an array' },
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('{"errors":"not an array"}');
      });

      it('should handle error body with empty errors array', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          error: { errors: [] },
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('{"errors":[]}');
      });

      it('should handle error body with non-string first error', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          error: { errors: [123, 'second error'] },
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('{"errors":[123,"second error"]}');
      });

      it('should handle circular reference in error body', () => {
        const circularObj: Record<string, unknown> = { prop: 'value' };
        circularObj.circular = circularObj;

        const httpError = new HttpErrorResponse({
          status: 400,
          error: circularObj,
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Request failed (400).');
      });

      it('should handle null error body', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          error: null,
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Request failed (400).');
      });

      it('should handle undefined error body', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          error: undefined,
        });

        const message = service.toUserMessage(httpError);

        expect(message).toBe('Request failed (400).');
      });
    });
  });
});
