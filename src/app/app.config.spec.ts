import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ErrorHandler } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { appConfig } from './app.config';
import { GlobalErrorHandler } from '@core/errors/global-error.handler';

describe('AppConfig', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: appConfig.providers,
    }).compileComponents();
  });

  it('should provide Router service', () => {
    const router = TestBed.inject(Router);
    expect(router).toBeDefined();
    expect(router).toBeInstanceOf(Router);
  });

  it('should provide Store service', () => {
    const store = TestBed.inject(Store);
    expect(store).toBeDefined();
    expect(store).toBeInstanceOf(Store);
  });

  it('should provide HttpClient service', () => {
    const httpClient = TestBed.inject(HttpClient);
    expect(httpClient).toBeDefined();
    expect(httpClient).toBeInstanceOf(HttpClient);
  });

  it('should provide custom ErrorHandler', () => {
    const errorHandler = TestBed.inject(ErrorHandler);
    expect(errorHandler).toBeDefined();
    expect(errorHandler).toBeInstanceOf(GlobalErrorHandler);
  });

  it('should configure providers array', () => {
    expect(appConfig.providers).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers.length).toBe(8);
  });

  it('should include all required providers', () => {
    // Test that all services can be injected, proving providers are configured
    const router = TestBed.inject(Router);
    const store = TestBed.inject(Store);
    const httpClient = TestBed.inject(HttpClient);
    const errorHandler = TestBed.inject(ErrorHandler);

    expect(router).toBeDefined();
    expect(store).toBeDefined();
    expect(httpClient).toBeDefined();
    expect(errorHandler).toBeDefined();
  });

  it('should configure custom error handler provider', () => {
    const errorHandlerProvider = appConfig.providers.find(
      (provider) =>
        typeof provider === 'object' &&
        provider !== null &&
        'provide' in provider &&
        provider.provide === ErrorHandler,
    );

    expect(errorHandlerProvider).toBeDefined();
    expect(errorHandlerProvider).toEqual({
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    });
  });

  it('should have correct provider count', () => {
    // Verify we have the expected number of providers
    expect(appConfig.providers.length).toBe(8);
  });

  it('should be a valid ApplicationConfig', () => {
    expect(appConfig).toBeDefined();
    expect(appConfig.providers).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
  });
});
