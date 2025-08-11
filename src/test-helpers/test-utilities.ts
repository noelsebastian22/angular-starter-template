import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';

/**
 * Shared test utilities and helper functions for common testing patterns
 * Following Requirements 8.1 (AAA pattern), 8.4 (test isolation), and 8.5 (async handling)
 */

// DOM testing utilities
export class DOMTestHelper {
  constructor(private fixture: ComponentFixture<unknown>) {}

  /**
   * Get element by CSS selector
   */
  getElement<T extends Element>(selector: string): T | null {
    return this.fixture.nativeElement.querySelector(selector);
  }

  /**
   * Get all elements by CSS selector
   */
  getAllElements<T extends Element>(selector: string): T[] {
    return Array.from(this.fixture.nativeElement.querySelectorAll(selector));
  }

  /**
   * Get debug element by CSS selector
   */
  getDebugElement(selector: string): DebugElement | null {
    return this.fixture.debugElement.query(By.css(selector));
  }

  /**
   * Get all debug elements by CSS selector
   */
  getAllDebugElements(selector: string): DebugElement[] {
    return this.fixture.debugElement.queryAll(By.css(selector));
  }

  /**
   * Trigger event on element
   */
  triggerEvent(selector: string, eventType: string, eventData?: unknown): void {
    const debugElement = this.getDebugElement(selector);
    if (debugElement) {
      debugElement.triggerEventHandler(eventType, eventData);
      this.fixture.detectChanges();
    }
  }

  /**
   * Set input value and trigger input event
   */
  setInputValue(selector: string, value: string): void {
    const input = this.getElement<HTMLInputElement>(selector);
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
      this.fixture.detectChanges();
    }
  }

  /**
   * Click element
   */
  clickElement(selector: string): void {
    this.triggerEvent(selector, 'click');
  }

  /**
   * Submit form
   */
  submitForm(selector = 'form'): void {
    this.triggerEvent(selector, 'submit', {
      preventDefault: () => {
        // Mock preventDefault function for form submission testing
      },
    });
  }

  /**
   * Get text content of element
   */
  getTextContent(selector: string): string {
    const element = this.getElement(selector);
    return element?.textContent?.trim() || '';
  }

  /**
   * Check if element exists
   */
  elementExists(selector: string): boolean {
    return this.getElement(selector) !== null;
  }

  /**
   * Check if element has CSS class
   */
  elementHasClass(selector: string, className: string): boolean {
    const element = this.getElement(selector);
    return element?.classList.contains(className) || false;
  }
}

// Async testing utilities
export class AsyncTestHelper {
  /**
   * Create a resolved promise for testing
   */
  static createResolvedPromise<T>(value: T): Promise<T> {
    return Promise.resolve(value);
  }

  /**
   * Create a rejected promise for testing
   */
  static createRejectedPromise(error: unknown): Promise<never> {
    return Promise.reject(error);
  }

  /**
   * Create an observable that emits a value
   */
  static createObservable<T>(value: T): Observable<T> {
    return of(value);
  }

  /**
   * Create an observable that throws an error
   */
  static createErrorObservable(error: unknown): Observable<never> {
    return throwError(() => error);
  }

  /**
   * Wait for a specified number of milliseconds (for use with fakeAsync)
   */
  static wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Flush all pending promises (for use with fakeAsync)
   */
  static flushPromises(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
}

// Spy utilities for better test organization (Jest-compatible)
export class SpyHelper {
  /**
   * Create a spy object with specified methods (Jest version)
   */
  static createSpyObj<T extends Record<string, unknown>>(
    _baseName: string,
    methodNames: (keyof T)[],
  ): jest.Mocked<T> {
    const spyObj = {} as jest.Mocked<T>;
    methodNames.forEach((methodName) => {
      (spyObj as Record<string, jest.Mock>)[methodName as string] = jest.fn();
    });
    return spyObj;
  }

  /**
   * Create a property spy (Jest version)
   */
  static spyOnProperty<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    property: K,
    accessType: 'get' | 'set' = 'get',
  ): jest.SpyInstance {
    if (accessType === 'get') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return jest.spyOn(obj as any, property as string, 'get');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return jest.spyOn(obj as any, property as string, 'set');
    }
  }

  /**
   * Create a method spy with return value (Jest version)
   */
  static spyOnWithReturnValue<
    T extends Record<string, unknown>,
    K extends keyof T,
  >(obj: T, method: K, returnValue: unknown): jest.SpyInstance {
    return (
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(obj as any, method as string)
        .mockReturnValue(returnValue)
    );
  }

  /**
   * Create a method spy that throws an error (Jest version)
   */
  static spyOnWithError<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    method: K,
    error: unknown,
  ): jest.SpyInstance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jest.spyOn(obj as any, method as string).mockImplementation(() => {
      throw error;
    });
  }
}

// Test data validation utilities
export class ValidationHelper {
  /**
   * Assert that an object has all required properties
   */
  static assertHasProperties<T>(obj: unknown, properties: (keyof T)[]): void {
    properties.forEach((prop) => {
      expect(obj).toHaveProperty(prop as string);
    });
  }

  /**
   * Assert that an object matches expected structure
   */
  static assertObjectStructure<T>(actual: unknown, expected: Partial<T>): void {
    // Type guard to ensure actual is an object
    if (typeof actual !== 'object' || actual === null) {
      throw new Error('Actual value is not an object');
    }

    const actualObj = actual as Record<string, unknown>;
    Object.keys(expected).forEach((key) => {
      expect(actualObj).toHaveProperty(key);
      if (
        typeof expected[key as keyof T] === 'object' &&
        expected[key as keyof T] !== null
      ) {
        expect(typeof actualObj[key]).toBe('object');
      } else {
        expect(typeof actualObj[key]).toBe(typeof expected[key as keyof T]);
      }
    });
  }

  /**
   * Assert that an array contains objects with specific properties
   */
  static assertArrayContainsObjectsWithProperties<T>(
    array: unknown[],
    properties: (keyof T)[],
  ): void {
    expect(Array.isArray(array)).toBe(true);
    array.forEach((item) => {
      this.assertHasProperties<T>(item, properties);
    });
  }
}

// HTTP testing utilities
export class HttpTestHelper {
  /**
   * Create mock HTTP headers
   */
  static createMockHeaders(headers: Record<string, string> = {}): Headers {
    const mockHeaders = new Headers();
    Object.entries(headers).forEach(([key, value]) => {
      mockHeaders.set(key, value);
    });
    return mockHeaders;
  }

  /**
   * Create mock HTTP response
   */
  static createMockResponse<T>(
    body: T,
    status = 200,
    statusText = 'OK',
    headers: Record<string, string> = {},
  ) {
    return {
      body,
      status,
      statusText,
      headers: this.createMockHeaders(headers),
      ok: status >= 200 && status < 300,
    };
  }

  /**
   * Create mock HTTP error response
   */
  static createMockErrorResponse(
    status = 500,
    statusText = 'Internal Server Error',
    error: unknown = null,
  ) {
    return {
      status,
      statusText,
      error,
      ok: false,
      headers: this.createMockHeaders(),
    };
  }
}

// Store testing utilities for NgRx
export class StoreTestHelper {
  /**
   * Create a mock selector that returns a specific value
   */
  static createMockSelector<T>(value: T) {
    return () => of(value);
  }

  /**
   * Create a mock action
   */
  static createMockAction(type: string, payload?: Record<string, unknown>) {
    return { type, ...payload };
  }

  /**
   * Assert that an action was dispatched with correct payload
   */
  static assertActionDispatched(
    dispatchSpy: jest.SpyInstance,
    expectedAction: { type: string; [key: string]: unknown },
  ): void {
    expect(dispatchSpy).toHaveBeenCalledWith(expectedAction);
  }

  /**
   * Assert that multiple actions were dispatched in order
   */
  static assertActionsDispatchedInOrder(
    dispatchSpy: jest.SpyInstance,
    expectedActions: { type: string; [key: string]: unknown }[],
  ): void {
    expectedActions.forEach((action, index) => {
      expect(dispatchSpy).toHaveBeenNthCalledWith(index + 1, action);
    });
  }
}

// Error testing utilities
export class ErrorTestHelper {
  /**
   * Assert that a function throws a specific error
   */
  static assertThrowsError(
    fn: () => void,
    expectedError: string | RegExp,
  ): void {
    expect(fn).toThrow(expectedError);
  }

  /**
   * Assert that an async function rejects with a specific error
   */
  static async assertRejectsWithError(
    promise: Promise<unknown>,
    expectedError: string | RegExp,
  ): Promise<void> {
    await expect(promise).rejects.toThrow(expectedError);
  }

  /**
   * Assert that an observable emits an error
   */
  static assertObservableError(
    observable: Observable<unknown>,
    expectedError: unknown,
    done: () => void,
  ): void {
    observable.subscribe({
      next: () => fail('Expected error but got next value'),
      error: (error) => {
        expect(error).toEqual(expectedError);
        done();
      },
    });
  }
}

// Test setup utilities following AAA pattern (Requirement 8.1)
export class TestSetupHelper {
  /**
   * Create a standardized test setup following AAA pattern
   */
  static createTestSetup<T>(
    arrangeCallback: () => T,
    actCallback: (context: T) => unknown,
    assertCallback: (context: T, result: unknown) => void,
  ) {
    return () => {
      // Arrange
      const context = arrangeCallback();

      // Act
      const result = actCallback(context);

      // Assert
      assertCallback(context, result);
    };
  }

  /**
   * Create an async test setup following AAA pattern
   */
  static createAsyncTestSetup<T>(
    arrangeCallback: () => T | Promise<T>,
    actCallback: (context: T) => Promise<unknown>,
    assertCallback: (context: T, result: unknown) => void | Promise<void>,
  ) {
    return async () => {
      // Arrange
      const context = await Promise.resolve(arrangeCallback());

      // Act
      const result = await actCallback(context);

      // Assert
      await Promise.resolve(assertCallback(context, result));
    };
  }
}
