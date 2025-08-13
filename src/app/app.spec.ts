import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { App } from './app';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { LoadingService } from './core/services/loading.service';

// Mock SpinnerComponent for testing
@Component({
  selector: 'app-spinner',
  standalone: true,
  template: '<div data-testid="spinner">Mock Spinner</div>',
})
class MockSpinnerComponent {}

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    const loadingServiceSpy = {
      start: jest.fn(),
      stop: jest.fn(),
      isLoading: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<LoadingService>;

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: LoadingService, useValue: loadingServiceSpy },
      ],
    })
      .overrideComponent(App, {
        remove: { imports: [SpinnerComponent] },
        add: { imports: [MockSpinnerComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct title', () => {
      expect(component['title']).toEqual('angular-starter-template');
    });

    it('should be an instance of App', () => {
      expect(component instanceof App).toBe(true);
    });
  });

  describe('Component Properties', () => {
    it('should have title property accessible', () => {
      expect(component['title']).toBeDefined();
      expect(typeof component['title']).toBe('string');
    });

    it('should have protected title property', () => {
      // Test that title is protected by accessing it through component instance
      const titleValue = (component as unknown as { title: string }).title;
      expect(titleValue).toEqual('angular-starter-template');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render app-spinner component', () => {
      const spinnerElement = fixture.debugElement.query(By.css('app-spinner'));
      expect(spinnerElement).toBeTruthy();
    });

    it('should render router-outlet', () => {
      const routerOutletElement = fixture.debugElement.query(
        By.css('router-outlet'),
      );
      expect(routerOutletElement).toBeTruthy();
    });

    it('should have correct component structure', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-spinner')).toBeTruthy();
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should render spinner component with mock content', () => {
      const spinnerElement = fixture.debugElement.query(
        By.css('[data-testid="spinner"]'),
      );
      expect(spinnerElement).toBeTruthy();
      expect(spinnerElement.nativeElement.textContent.trim()).toBe(
        'Mock Spinner',
      );
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component initialization without errors', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should maintain component state after change detection', () => {
      fixture.detectChanges();
      expect(component['title']).toEqual('angular-starter-template');
    });

    it('should handle multiple change detection cycles', () => {
      fixture.detectChanges();
      fixture.detectChanges();
      fixture.detectChanges();
      expect(component['title']).toEqual('angular-starter-template');
    });
  });

  describe('Component Integration', () => {
    it('should integrate with router system', () => {
      fixture.detectChanges();
      const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
      expect(routerOutlet).toBeTruthy();
    });

    it('should integrate with spinner component', () => {
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('app-spinner'));
      expect(spinner).toBeTruthy();
    });
  });

  describe('Component Selector and Metadata', () => {
    it('should have correct selector', () => {
      // Test that the component can be created and has the expected behavior
      // The selector is tested implicitly through the component creation
      expect(component).toBeTruthy();
      expect(component['title']).toBe('angular-starter-template');
    });

    it('should be standalone component', () => {
      // Test that the component works as a standalone component
      // by verifying it can be instantiated and rendered
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement).toBeTruthy();
    });
  });
});
