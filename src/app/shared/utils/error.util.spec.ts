import { extractErrorMessage } from './error.util';

describe('extractErrorMessage', () => {
  describe('when given null or undefined', () => {
    it('should return "Unknown error" when given null', () => {
      const result = extractErrorMessage(null);
      expect(result).toBe('Unknown error');
    });

    it('should return "Unknown error" when given undefined', () => {
      const result = extractErrorMessage(undefined);
      expect(result).toBe('Unknown error');
    });

    it('should return "Unknown error" when given empty string', () => {
      const result = extractErrorMessage('');
      expect(result).toBe('Unknown error');
    });

    it('should return "Unknown error" when given 0', () => {
      const result = extractErrorMessage(0);
      expect(result).toBe('Unknown error');
    });

    it('should return "Unknown error" when given false', () => {
      const result = extractErrorMessage(false);
      expect(result).toBe('Unknown error');
    });
  });

  describe('when given string errors', () => {
    it('should return the string when given a string error', () => {
      const errorMessage = 'This is a string error';
      const result = extractErrorMessage(errorMessage);
      expect(result).toBe(errorMessage);
    });

    it('should return the string when given a non-empty string', () => {
      const errorMessage = 'Network connection failed';
      const result = extractErrorMessage(errorMessage);
      expect(result).toBe(errorMessage);
    });

    it('should return the string when given a string with special characters', () => {
      const errorMessage = 'Error: 404 - Not Found!';
      const result = extractErrorMessage(errorMessage);
      expect(result).toBe(errorMessage);
    });
  });

  describe('when given Error objects', () => {
    it('should return the message when given a standard Error object', () => {
      const error = new Error('Standard error message');
      const result = extractErrorMessage(error);
      expect(result).toBe('Standard error message');
    });

    it('should return the message when given a TypeError', () => {
      const error = new TypeError('Type error message');
      const result = extractErrorMessage(error);
      expect(result).toBe('Type error message');
    });

    it('should return the message when given a ReferenceError', () => {
      const error = new ReferenceError('Reference error message');
      const result = extractErrorMessage(error);
      expect(result).toBe('Reference error message');
    });

    it('should handle Error object with empty message', () => {
      const error = new Error('');
      const result = extractErrorMessage(error);
      expect(result).toBe('{}');
    });

    it('should handle Error object without message property', () => {
      const error = Object.create(Error.prototype);
      const result = extractErrorMessage(error);
      expect(result).toBe('{}');
    });

    it('should handle Error object with falsy message', () => {
      const error = new Error();
      error.message = '';
      const result = extractErrorMessage(error);
      expect(result).toBe('{"message":""}');
    });
  });

  describe('when given HttpErrorResponse-like objects', () => {
    it('should return error field when given object with string error property', () => {
      const httpError = { error: 'HTTP error message', status: 404 };
      const result = extractErrorMessage(httpError);
      expect(result).toBe('HTTP error message');
    });

    it('should return error field when given nested error structure', () => {
      const httpError = {
        error: 'Validation failed',
        status: 400,
        statusText: 'Bad Request',
      };
      const result = extractErrorMessage(httpError);
      expect(result).toBe('Validation failed');
    });

    it('should handle object with non-string error property', () => {
      const httpError = { error: { message: 'Nested error' }, status: 500 };
      const result = extractErrorMessage(httpError);
      expect(result).toBe('{"error":{"message":"Nested error"},"status":500}');
    });

    it('should handle object with null error property', () => {
      const httpError = { error: null, status: 500 };
      const result = extractErrorMessage(httpError);
      expect(result).toBe('{"error":null,"status":500}');
    });

    it('should handle object with undefined error property', () => {
      const httpError = { error: undefined, status: 500 };
      const result = extractErrorMessage(httpError);
      expect(result).toBe('{"status":500}');
    });
  });

  describe('when given unknown object types', () => {
    it('should return JSON.stringify result for plain objects', () => {
      const error = { message: 'Custom error', code: 123 };
      const result = extractErrorMessage(error);
      expect(result).toBe('{"message":"Custom error","code":123}');
    });

    it('should return JSON.stringify result for arrays', () => {
      const error = ['error1', 'error2'];
      const result = extractErrorMessage(error);
      expect(result).toBe('["error1","error2"]');
    });

    it('should return JSON.stringify result for numbers', () => {
      const error = 404;
      const result = extractErrorMessage(error);
      expect(result).toBe('404');
    });

    it('should return JSON.stringify result for booleans', () => {
      const error = true;
      const result = extractErrorMessage(error);
      expect(result).toBe('true');
    });
  });

  describe('when handling circular references', () => {
    it('should return fallback message when JSON.stringify fails due to circular reference', () => {
      const circularError: Record<string, unknown> = {
        message: 'Circular error',
      };
      circularError['self'] = circularError;

      const result = extractErrorMessage(circularError);
      expect(result).toBe('An unexpected error occurred');
    });

    it('should return fallback message when JSON.stringify fails due to complex circular structure', () => {
      const obj1: Record<string, unknown> = { name: 'obj1' };
      const obj2: Record<string, unknown> = { name: 'obj2' };
      obj1['ref'] = obj2;
      obj2['ref'] = obj1;

      const result = extractErrorMessage(obj1);
      expect(result).toBe('An unexpected error occurred');
    });
  });

  describe('when handling malformed objects', () => {
    it('should handle objects with getter that throws', () => {
      const malformedError = {
        get message() {
          throw new Error('Getter error');
        },
      };

      const result = extractErrorMessage(malformedError);
      expect(result).toBe('An unexpected error occurred');
    });

    it('should handle objects with non-enumerable properties', () => {
      const error = {};
      Object.defineProperty(error, 'hidden', {
        value: 'hidden value',
        enumerable: false,
      });

      const result = extractErrorMessage(error);
      expect(result).toBe('{}');
    });

    it('should handle objects with symbol properties', () => {
      const symbolKey = Symbol('error');
      const error = { [symbolKey]: 'symbol error', message: 'regular message' };

      const result = extractErrorMessage(error);
      expect(result).toBe('{"message":"regular message"}');
    });
  });

  describe('edge cases and special values', () => {
    it('should handle Date objects', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      const result = extractErrorMessage(date);
      expect(result).toBe('"2023-01-01T00:00:00.000Z"');
    });

    it('should handle RegExp objects', () => {
      const regex = /test/gi;
      const result = extractErrorMessage(regex);
      expect(result).toBe('{}');
    });

    it('should handle Function objects', () => {
      const func = function testFunction() {
        return 'test';
      };
      const result = extractErrorMessage(func);
      expect(result).toBe(undefined);
    });

    it('should handle BigInt values', () => {
      const bigInt = BigInt(123456789);
      const result = extractErrorMessage(bigInt);
      expect(result).toBe('An unexpected error occurred');
    });

    it('should handle Symbol values', () => {
      const symbol = Symbol('test');
      const result = extractErrorMessage(symbol);
      expect(result).toBe(undefined);
    });
  });

  describe('JSON.stringify fallback behavior', () => {
    it('should use JSON.stringify for serializable objects', () => {
      const error = {
        type: 'ValidationError',
        fields: ['email', 'password'],
        timestamp: '2023-01-01T00:00:00Z',
      };

      const result = extractErrorMessage(error);
      const expected = JSON.stringify(error);
      expect(result).toBe(expected);
    });

    it('should handle nested objects in JSON.stringify', () => {
      const error = {
        error: {
          details: {
            field: 'email',
            message: 'Invalid format',
          },
        },
      };

      const result = extractErrorMessage(error);
      const expected = JSON.stringify(error);
      expect(result).toBe(expected);
    });

    it('should handle arrays with mixed types in JSON.stringify', () => {
      const error = ['string error', 404, { message: 'object error' }, null];

      const result = extractErrorMessage(error);
      const expected = JSON.stringify(error);
      expect(result).toBe(expected);
    });
  });
});
