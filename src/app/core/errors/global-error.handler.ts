import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorNotificationService } from '../services/error-notification.service';
import { environment } from '@environments/environment';

// Optional: wire to a remote logger like Sentry
@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private notify = inject(ErrorNotificationService);

  handleError(error: unknown): void {
    // Avoid double-reporting HTTP errors already handled by interceptor
    if (error instanceof HttpErrorResponse) {
      // Interceptor already notified; still log to console in dev
      if (!isProd()) console.warn('[HTTP caught in ErrorHandler]', error);
      return;
    }

    // Show a friendly message
    this.notify.show(error);

    // Attach breadcrumbs, send to remote logger, etc.
    if (!isProd()) {
      console.error('[Uncaught error]', error);
    } else {
      // TODO: send to Sentry/Datadog/NewRelic, etc.
    }
  }
}

function isProd(): boolean {
  try {
    // Lazy import to avoid circulars; adjust path as needed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // const { environment } = require('../../../environments/environment');
    return !!environment.production;
  } catch {
    return false;
  }
}
