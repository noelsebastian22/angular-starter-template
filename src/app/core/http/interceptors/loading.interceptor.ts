import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  // Skip loading if explicitly disabled via header flag (optional escape hatch)
  if (req.headers.get('X-Skip-Loading')) {
    const cleanReq = req.clone({
      headers: req.headers.delete('X-Skip-Loading'),
    });
    return next(cleanReq);
  }

  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
