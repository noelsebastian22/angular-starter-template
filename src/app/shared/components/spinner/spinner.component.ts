import { Component, computed, inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    @if (isLoading()) {
      <div class="fixed inset-0 grid place-items-center bg-black/20">
        <div class="rounded-xl p-4 shadow bg-white">Loading…</div>
      </div>
    }
  `,
})
export class SpinnerComponent {
  private readonly loading = inject(LoadingService);
  // computed() so template change-detects efficiently
  isLoading = computed(() => this.loading.isLoading());
}
