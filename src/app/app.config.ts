import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { reducers } from './store';
import { metaReducers } from './store';
import { AuthEffects } from './features/auth/store';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from '@core/http/interceptors/error.interceptor';
import { loadingInterceptor } from '@core/http/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([loadingInterceptor, errorInterceptor])),
    provideRouter(routes),
    provideStore(reducers, { metaReducers }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
