import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ErrorNotificationService {
  show(error: unknown) {
    // TODO: Plug in a real toast/snackbar. For now, console.
    if (error instanceof HttpErrorResponse) {
      console.error(`[HTTP ${error.status}] ${error.message}`, error.error);
    } else {
      console.error('[Error]', error);
    }
  }
}
