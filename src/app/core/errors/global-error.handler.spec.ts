import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalErrorHandler } from './global-error.handler';
import { ErrorNotificationService } from '../services/error-notification.service';
import { environment } from '@environments/environment';

// Mock the environment module
jest.mock('@environments/environment', () => ({
  environment: {
    production: false,
    apiUrl: 'http://localhost:3000/api',
    tmdbApiToken: 'test-token',
  },
}));

describe('GlobalErrorHandler', () => {
  let service: GlobalErrorHandler;
  let errorNotificationService: jest.Mocked<ErrorNotificationService>;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    const errorNotificationServiceMock = {
      show: jest.fn(),
      toUserMessage: jest.fn(),
    } as jest.Mocked<ErrorNotificationService>;

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        {
          provide: ErrorNotificationService,
          useValue: errorNotificationServiceMock,
        },
      ],
    });

    service = TestBed.inject(GlobalErrorHandler);
    errorNotificationService = TestBed.inject(
      ErrorNotificationService,
    ) as jest.Mocked<ErrorNotificationService>;

    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Mock implementation
    });
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
      // Mock implementation
    });
  });

  afterEach(() => {
    // Reset console spies
    consoleErrorSpy.mockReset();
    consoleWarnSpy.mockReset();
    // Reset environment mock
    environment.production = false;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleError', () => {
    describe('HttpErrorResponse handling', () => {
      it('should not call notification service for HttpErrorResponse to avoid double-reporting', () => {
        // Arrange
        const httpError = new HttpErrorResponse({
          error: 'Server error',
          status: 500,
          statusText: 'Internal Server Error',
        });

        // Act
        service.handleError(httpError);

        // Assert
        expect(errorNotificationService.show).not.toHaveBeenCalled();
      });

      it('should log HttpErrorResponse to console in development environment', () => {
        // Arrange
        environment.production = false;
        const httpError = new HttpErrorResponse({
          error: 'Server error',
          status: 404,
          statusText: 'Not Found',
        });

        // Act
        service.handleError(httpError);

        // Assert
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[HTTP caught in ErrorHandler]',
          httpError,
        );
      });

      it('should not log HttpErrorResponse to console in production environment', () => {
        // Arrange
        environment.production = true;
        const httpError = new HttpErrorResponse({
          error: 'Server error',
          status: 500,
          statusText: 'Internal Server Error',
        });

        // Act
        service.handleError(httpError);

        // Assert
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('Non-HTTP error handling', () => {
      it('should call notification service for regular Error objects', () => {
        // Arrange
        const error = new Error('Something went wrong');

        // Act
        service.handleError(error);

        // Assert
        expect(errorNotificationService.show).toHaveBeenCalledWith(error);
      });

      it('should call notification service for string errors', () => {
        // Arrange
        const error = 'String error message';

        // Act
        service.handleError(error);

        // Assert
        expect(errorNotificationService.show).toHaveBeenCalledWith(error);
      });

      it('should call notification service for null errors', () => {
        // Arrange
        const error = null;

        // Act
        service.handleError(error);

        // Assert
        expect(errorNotificationService.show).toHaveBeenCalledWith(error);
      });
    });

    describe('Development environment behavior', () => {
      beforeEach(() => {
        environment.production = false;
      });

      it('should log non-HTTP errors to console in development', () => {
        // Arrange
        const error = new Error('Development error');

        // Act
        service.handleError(error);

        // Assert
        expect(consoleErrorSpy).toHaveBeenCalledWith('[Uncaught error]', error);
      });
    });

    describe('Production environment behavior', () => {
      beforeEach(() => {
        environment.production = true;
      });

      it('should not log non-HTTP errors to console in production', () => {
        // Arrange
        const error = new Error('Production error');

        // Act
        service.handleError(error);

        // Assert
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it('should still call notification service in production', () => {
        // Arrange
        const error = new Error('Production error');

        // Act
        service.handleError(error);

        // Assert
        expect(errorNotificationService.show).toHaveBeenCalledWith(error);
      });
    });

    describe('isProd function error handling', () => {
      it('should handle environment access errors gracefully', () => {
        // This test covers the catch block in the isProd function
        // by creating a scenario where environment access might fail

        // Temporarily break the environment object to trigger the catch block
        const originalProduction = environment.production;

        // Create a getter that throws an error
        Object.defineProperty(environment, 'production', {
          get: () => {
            throw new Error('Environment access error');
          },
          configurable: true,
        });

        try {
          // Arrange
          const error = new Error('Test error with broken environment');

          // Act - this should not throw even if environment access fails
          expect(() => {
            service.handleError(error);
          }).not.toThrow();

          // Assert
          expect(errorNotificationService.show).toHaveBeenCalledWith(error);
        } finally {
          // Restore the original environment
          Object.defineProperty(environment, 'production', {
            value: originalProduction,
            writable: true,
            configurable: true,
          });
        }
      });
    });
  });
});
