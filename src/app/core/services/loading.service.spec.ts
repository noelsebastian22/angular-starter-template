import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with loading false', () => {
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('start()', () => {
    it('should set loading to true when called once', () => {
      service.start();

      expect(service.isLoading()).toBe(true);
    });

    it('should maintain loading true when called multiple times', () => {
      service.start();
      service.start();
      service.start();

      expect(service.isLoading()).toBe(true);
    });

    it('should increment internal counter for concurrent requests', () => {
      // Start multiple requests
      service.start();
      service.start();
      service.start();

      expect(service.isLoading()).toBe(true);

      // Stop one request - should still be loading
      service.stop();
      expect(service.isLoading()).toBe(true);

      // Stop another - should still be loading
      service.stop();
      expect(service.isLoading()).toBe(true);

      // Stop the last one - should stop loading
      service.stop();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('stop()', () => {
    it('should set loading to false when counter reaches zero', () => {
      service.start();
      expect(service.isLoading()).toBe(true);

      service.stop();
      expect(service.isLoading()).toBe(false);
    });

    it('should not go below zero when called more times than start', () => {
      service.start();
      service.stop();
      service.stop(); // Extra stop call
      service.stop(); // Another extra stop call

      expect(service.isLoading()).toBe(false);

      // Should still work normally after extra stops
      service.start();
      expect(service.isLoading()).toBe(true);
    });

    it('should handle stop being called before start', () => {
      service.stop();

      expect(service.isLoading()).toBe(false);
    });
  });

  describe('reset()', () => {
    it('should reset loading state to false', () => {
      service.start();
      service.start();
      service.start();
      expect(service.isLoading()).toBe(true);

      service.reset();
      expect(service.isLoading()).toBe(false);
    });

    it('should reset counter so subsequent start/stop works correctly', () => {
      service.start();
      service.start();
      service.reset();

      // After reset, one start should set loading to true
      service.start();
      expect(service.isLoading()).toBe(true);

      // And one stop should set it back to false
      service.stop();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('concurrent request handling', () => {
    it('should handle multiple concurrent requests correctly', () => {
      // Simulate 3 concurrent requests starting
      service.start(); // Request 1
      service.start(); // Request 2
      service.start(); // Request 3

      expect(service.isLoading()).toBe(true);

      // Request 1 completes
      service.stop();
      expect(service.isLoading()).toBe(true);

      // Request 2 completes
      service.stop();
      expect(service.isLoading()).toBe(true);

      // Request 3 completes
      service.stop();
      expect(service.isLoading()).toBe(false);
    });

    it('should handle mixed start/stop calls', () => {
      service.start();
      expect(service.isLoading()).toBe(true);

      service.start();
      expect(service.isLoading()).toBe(true);

      service.stop();
      expect(service.isLoading()).toBe(true);

      service.start();
      expect(service.isLoading()).toBe(true);

      service.stop();
      expect(service.isLoading()).toBe(true);

      service.stop();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('signal behavior', () => {
    it('should provide readonly signal for isLoading', () => {
      const loadingSignal = service.isLoading;

      expect(typeof loadingSignal).toBe('function');
      expect(loadingSignal()).toBe(false);

      service.start();
      expect(loadingSignal()).toBe(true);

      service.stop();
      expect(loadingSignal()).toBe(false);
    });

    it('should emit signal changes when loading state changes', () => {
      let signalValue = service.isLoading();
      expect(signalValue).toBe(false);

      service.start();
      signalValue = service.isLoading();
      expect(signalValue).toBe(true);

      service.stop();
      signalValue = service.isLoading();
      expect(signalValue).toBe(false);
    });
  });
});
