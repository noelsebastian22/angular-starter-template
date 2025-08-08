import { Injectable, Signal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _count = signal(0); // active requests
  private readonly _isLoading = signal(false);

  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  start() {
    this._count.update((c) => {
      const n = c + 1;
      this._isLoading.set(n > 0);
      return n;
    });
  }
  stop() {
    this._count.update((c) => {
      const n = Math.max(0, c - 1);
      this._isLoading.set(n > 0);
      return n;
    });
  }
  reset() {
    this._count.set(0);
    this._isLoading.set(false);
  }
}
