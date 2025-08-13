import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SpinnerComponent } from './spinner.component';
import { LoadingService } from '@core/services/loading.service';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [LoadingService],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService);
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject LoadingService', () => {
      expect(component['loading']).toBe(loadingService);
    });

    it('should initialize isLoading computed signal', () => {
      expect(component.isLoading).toBeDefined();
      expect(typeof component.isLoading).toBe('function');
    });
  });

  describe('Template Rendering', () => {
    it('should not render spinner when not loading', () => {
      // Ensure loading service is not loading
      loadingService.reset();
      fixture.detectChanges();

      const spinnerElement = fixture.debugElement.query(By.css('.fixed'));
      expect(spinnerElement).toBeFalsy();
    });

    it('should render spinner when loading', () => {
      // Start loading
      loadingService.start();
      fixture.detectChanges();

      const spinnerElement = fixture.debugElement.query(By.css('.fixed'));
      expect(spinnerElement).toBeTruthy();
    });

    it('should render spinner with correct structure when loading', () => {
      loadingService.start();
      fixture.detectChanges();

      const spinnerContainer = fixture.debugElement.query(
        By.css('.fixed.inset-0.grid.place-items-center'),
      );
      const spinnerContent = fixture.debugElement.query(
        By.css('.rounded-xl.p-4.shadow.bg-white'),
      );

      expect(spinnerContainer).toBeTruthy();
      expect(spinnerContent).toBeTruthy();
      expect(spinnerContent.nativeElement.textContent).toBe('Loading…');
    });

    it('should apply correct CSS classes to spinner container', () => {
      loadingService.start();
      fixture.detectChanges();

      const spinnerContainer = fixture.debugElement.query(By.css('.fixed'));
      const classList = Array.from(spinnerContainer.nativeElement.classList);

      expect(classList).toContain('fixed');
      expect(classList).toContain('inset-0');
      expect(classList).toContain('grid');
      expect(classList).toContain('place-items-center');
      expect(classList).toContain('bg-black/20');
    });

    it('should apply correct CSS classes to spinner content', () => {
      loadingService.start();
      fixture.detectChanges();

      const spinnerContent = fixture.debugElement.query(By.css('.rounded-xl'));
      const classList = Array.from(spinnerContent.nativeElement.classList);

      expect(classList).toContain('rounded-xl');
      expect(classList).toContain('p-4');
      expect(classList).toContain('shadow');
      expect(classList).toContain('bg-white');
    });
  });

  describe('Visibility Logic', () => {
    it('should show spinner when loading service starts', () => {
      expect(component.isLoading()).toBe(false);

      loadingService.start();
      fixture.detectChanges();

      expect(component.isLoading()).toBe(true);
      const spinnerElement = fixture.debugElement.query(By.css('.fixed'));
      expect(spinnerElement).toBeTruthy();
    });

    it('should hide spinner when loading service stops', () => {
      loadingService.start();
      fixture.detectChanges();
      expect(component.isLoading()).toBe(true);

      loadingService.stop();
      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      const spinnerElement = fixture.debugElement.query(By.css('.fixed'));
      expect(spinnerElement).toBeFalsy();
    });

    it('should remain visible with multiple concurrent loading operations', () => {
      loadingService.start();
      loadingService.start();
      fixture.detectChanges();

      expect(component.isLoading()).toBe(true);
      const spinnerElement = fixture.debugElement.query(By.css('.fixed'));
      expect(spinnerElement).toBeTruthy();

      // Stop one operation, should still be loading
      loadingService.stop();
      fixture.detectChanges();

      expect(component.isLoading()).toBe(true);
      const stillLoadingElement = fixture.debugElement.query(By.css('.fixed'));
      expect(stillLoadingElement).toBeTruthy();

      // Stop second operation, should stop loading
      loadingService.stop();
      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      const notLoadingElement = fixture.debugElement.query(By.css('.fixed'));
      expect(notLoadingElement).toBeFalsy();
    });

    it('should hide spinner when loading service is reset', () => {
      loadingService.start();
      loadingService.start();
      fixture.detectChanges();
      expect(component.isLoading()).toBe(true);

      loadingService.reset();
      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      const spinnerElement = fixture.debugElement.query(By.css('.fixed'));
      expect(spinnerElement).toBeFalsy();
    });
  });

  describe('Change Detection', () => {
    it('should update template when loading state changes', () => {
      // Initially not loading
      expect(fixture.debugElement.query(By.css('.fixed'))).toBeFalsy();

      // Start loading
      loadingService.start();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.fixed'))).toBeTruthy();

      // Stop loading
      loadingService.stop();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.fixed'))).toBeFalsy();
    });

    it('should react to computed signal changes efficiently', () => {
      const initialValue = component.isLoading();

      loadingService.start();
      const afterStartValue = component.isLoading();

      loadingService.stop();
      const afterStopValue = component.isLoading();

      expect(initialValue).toBe(false);
      expect(afterStartValue).toBe(true);
      expect(afterStopValue).toBe(false);
    });
  });

  describe('Component Lifecycle', () => {
    it('should properly initialize computed signal on component creation', () => {
      const newFixture = TestBed.createComponent(SpinnerComponent);
      const newComponent = newFixture.componentInstance;

      expect(newComponent.isLoading).toBeDefined();
      expect(typeof newComponent.isLoading).toBe('function');
      expect(newComponent.isLoading()).toBe(false);
    });

    it('should maintain reactivity throughout component lifecycle', () => {
      // Test that the computed signal remains reactive after multiple changes
      expect(component.isLoading()).toBe(false);

      loadingService.start();
      expect(component.isLoading()).toBe(true);

      loadingService.stop();
      expect(component.isLoading()).toBe(false);

      loadingService.start();
      expect(component.isLoading()).toBe(true);

      loadingService.reset();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Integration with LoadingService', () => {
    it('should reflect LoadingService state accurately', () => {
      // Test direct correlation with service state
      expect(component.isLoading()).toBe(loadingService.isLoading());

      loadingService.start();
      expect(component.isLoading()).toBe(loadingService.isLoading());

      loadingService.stop();
      expect(component.isLoading()).toBe(loadingService.isLoading());
    });

    it('should handle rapid state changes from LoadingService', () => {
      // Rapid start/stop cycles
      for (let i = 0; i < 5; i++) {
        loadingService.start();
        expect(component.isLoading()).toBe(true);

        loadingService.stop();
        expect(component.isLoading()).toBe(false);
      }
    });

    it('should handle edge case of stopping when not started', () => {
      // Ensure component handles service edge cases gracefully
      loadingService.stop(); // Stop when not started
      expect(component.isLoading()).toBe(false);

      fixture.detectChanges();
      const spinnerElement = fixture.debugElement.query(By.css('.fixed'));
      expect(spinnerElement).toBeFalsy();
    });
  });

  describe('Accessibility and UX', () => {
    it('should provide visual feedback with overlay background', () => {
      loadingService.start();
      fixture.detectChanges();

      const overlay = fixture.debugElement.query(By.css('.bg-black\\/20'));
      expect(overlay).toBeTruthy();
    });

    it('should center the loading message', () => {
      loadingService.start();
      fixture.detectChanges();

      const centeredContainer = fixture.debugElement.query(
        By.css('.grid.place-items-center'),
      );
      expect(centeredContainer).toBeTruthy();
    });

    it('should display user-friendly loading text', () => {
      loadingService.start();
      fixture.detectChanges();

      const loadingText = fixture.debugElement.query(By.css('.bg-white'));
      expect(loadingText.nativeElement.textContent).toBe('Loading…');
    });

    it('should use appropriate styling for loading indicator', () => {
      loadingService.start();
      fixture.detectChanges();

      const loadingBox = fixture.debugElement.query(By.css('.bg-white'));
      const classList = Array.from(loadingBox.nativeElement.classList);

      // Should have rounded corners, padding, shadow, and white background
      expect(classList).toContain('rounded-xl');
      expect(classList).toContain('p-4');
      expect(classList).toContain('shadow');
      expect(classList).toContain('bg-white');
    });
  });

  describe('Edge Cases', () => {
    it('should handle component destruction gracefully', () => {
      loadingService.start();
      fixture.detectChanges();
      expect(component.isLoading()).toBe(true);

      // Destroy component
      fixture.destroy();

      // Service should still work independently
      expect(loadingService.isLoading()).toBe(true);
    });

    it('should handle multiple rapid template updates', () => {
      // Simulate rapid loading state changes
      for (let i = 0; i < 10; i++) {
        loadingService.start();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.fixed'))).toBeTruthy();

        loadingService.stop();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.fixed'))).toBeFalsy();
      }
    });

    it('should maintain consistent behavior with service reset during loading', () => {
      loadingService.start();
      loadingService.start();
      loadingService.start();
      fixture.detectChanges();
      expect(component.isLoading()).toBe(true);

      loadingService.reset();
      fixture.detectChanges();
      expect(component.isLoading()).toBe(false);
      expect(fixture.debugElement.query(By.css('.fixed'))).toBeFalsy();
    });
  });
});
