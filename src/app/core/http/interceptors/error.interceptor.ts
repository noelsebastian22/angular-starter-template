import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorNotificationService } from '../../services/error-notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(ErrorNotificationService);

  return next(req).pipe(
    catchError((err: unknown) => {
      // Optional opt-out flag per request
      const skip = req.headers.get('X-Skip-Error-Notify');
      if (!skip) {
        notify.show(err);
      }
      // Always rethrow so callers can handle if they want
      return throwError(() => err);
    }),
  );
};
