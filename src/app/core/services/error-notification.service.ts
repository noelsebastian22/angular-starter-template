// src/app/core/services/error-notification.service.ts
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ErrorNotificationService {
  show(error: unknown) {
    const message = this.toUserMessage(error);
    // TODO: integrate your toast/snackbar here
    // e.g., this.toastr.error(message);
    console.error('[Toast]', message, error);
  }

  toUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (!navigator.onLine) return 'You appear to be offline.';
      if (error.status === 0) return 'Network error. Please try again.';
      if (error.status === 401)
        return 'Your session has expired. Please sign in.';
      if (error.status === 403)
        return 'You do not have permission to perform this action.';
      if (error.status === 404) return 'Not found.';
      if (error.status >= 500) return 'Server error. Please try again later.';
      // Prefer server-provided message if safe:
      const msg = extractServerMessage(error.error);
      return msg || `Request failed (${error.status}).`;
    }
    // Non-HTTP
    if (error instanceof Error)
      return error.message || 'An unexpected error occurred.';
    return 'An unexpected error occurred.';
  }
}

function extractServerMessage(errBody: unknown): string | null {
  if (!errBody) return null;

  if (typeof errBody === 'string') {
    return errBody;
  }

  if (typeof errBody === 'object' && errBody !== null) {
    const body = errBody as Record<string, unknown>;

    if (typeof body['message'] === 'string') {
      return body['message'];
    }

    if (
      Array.isArray(body['errors']) &&
      typeof body['errors'][0] === 'string'
    ) {
      return body['errors'][0];
    }
  }

  try {
    return JSON.stringify(errBody);
  } catch {
    return null;
  }
}
