import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { of, throwError } from 'rxjs';
import * as AuthActions from './store';
import * as AuthSelectors from './store';
import { TmdbService } from 'app/core/services/tmdb.service';
import { MovieResult, ApiResult } from '@infrastructure/models/tmdb.model';

describe('AuthComponent', () => {
  let fixture: ComponentFixture<AuthComponent>;
  let component: AuthComponent;
  let store: MockStore;
  let tmdbService: jest.Mocked<Pick<TmdbService, 'searchMovies'>>;

  const initialState = {
    auth: {
      user: null,
      loading: false,
      error: null,
    },
  };

  const mockMovieResult: MovieResult = {
    adult: false,
    backdrop_path: '/backdrop.jpg',
    genre_ids: [28, 12],
    id: 27205,
    original_language: 'en',
    original_title: 'Inception',
    overview: 'Dom Cobb is a skilled thief...',
    popularity: 83.981,
    poster_path: '/poster.jpg',
    release_date: '2010-07-16',
    title: 'Inception',
    video: false,
    vote_average: 8.4,
    vote_count: 31000,
  };

  const mockApiResult: ApiResult<MovieResult> = {
    page: 1,
    results: [mockMovieResult],
    total_pages: 1,
    total_results: 1,
  };

  beforeEach(async () => {
    const tmdbServiceSpy = {
      searchMovies: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AuthComponent, FormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: TmdbService, useValue: tmdbServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    tmdbService = TestBed.inject(TmdbService) as unknown as jest.Mocked<
      Pick<TmdbService, 'searchMovies'>
    >;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.username).toBe('');
      expect(component.password).toBe('');
      expect(component.hide).toBe(true);
      expect(component.movies).toBeUndefined();
    });

    it('should initialize observables from store selectors', () => {
      expect(component.loading$).toBeDefined();
      expect(component.user$).toBeDefined();
      expect(component.error$).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    it('should render login form with username and password inputs', () => {
      const inputs = fixture.debugElement.queryAll(By.css('input'));
      const usernameInput = inputs.find(
        (input) => input.nativeElement.name === 'username',
      );
      const passwordInput = inputs.find(
        (input) => input.nativeElement.name === 'password',
      );

      expect(usernameInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(inputs.length).toBe(2);
    });

    it('should render login button', () => {
      const button = fixture.debugElement.query(
        By.css('button[type="submit"]'),
      );
      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent).toContain('Login');
    });

    it('should render mat-card with proper title', () => {
      const cardTitle = fixture.debugElement.query(By.css('mat-card-title'));
      expect(cardTitle.nativeElement.textContent).toBe('Login');
    });

    it('should render password visibility toggle button', () => {
      const toggleButton = fixture.debugElement.query(
        By.css('button[matSuffix]'),
      );
      expect(toggleButton).toBeTruthy();
      expect(toggleButton.nativeElement.getAttribute('aria-label')).toBe(
        'Show password',
      );
    });
  });

  describe('Form Validation', () => {
    it('should show username required error when field is touched and empty', async () => {
      const usernameInput = fixture.debugElement.query(
        By.css('input[name="username"]'),
      );

      // Simulate user interaction
      usernameInput.nativeElement.focus();
      usernameInput.nativeElement.blur();
      usernameInput.triggerEventHandler('blur', {});
      fixture.detectChanges();
      await fixture.whenStable();

      const errorElement = fixture.debugElement.query(By.css('mat-error'));
      expect(errorElement?.nativeElement.textContent).toContain(
        'Username is required',
      );
    });

    it('should show password required error when field is touched and empty', async () => {
      const passwordInput = fixture.debugElement.query(
        By.css('input[name="password"]'),
      );

      // Simulate user interaction
      passwordInput.nativeElement.focus();
      passwordInput.nativeElement.blur();
      passwordInput.triggerEventHandler('blur', {});
      fixture.detectChanges();
      await fixture.whenStable();

      const errorElements = fixture.debugElement.queryAll(By.css('mat-error'));
      const passwordError = errorElements.find((el) =>
        el.nativeElement.textContent.includes('Password is required'),
      );
      expect(passwordError).toBeTruthy();
    });

    it('should disable submit button when form is invalid', async () => {
      component.username = '';
      component.password = '';
      fixture.detectChanges();
      await fixture.whenStable();

      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]'),
      );
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable submit button when form is valid and not loading', async () => {
      const usernameInput = fixture.debugElement.query(
        By.css('input[name="username"]'),
      );
      const passwordInput = fixture.debugElement.query(
        By.css('input[name="password"]'),
      );

      usernameInput.nativeElement.value = 'testuser';
      usernameInput.nativeElement.dispatchEvent(new Event('input'));
      passwordInput.nativeElement.value = 'testpass';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      await fixture.whenStable();

      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]'),
      );
      expect(submitButton.nativeElement.disabled).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('should toggle password visibility when visibility button is clicked', () => {
      const toggleButton = fixture.debugElement.query(
        By.css('button[matSuffix]'),
      );
      const passwordInput = fixture.debugElement.query(
        By.css('input[name="password"]'),
      );

      expect(component.hide).toBe(true);
      expect(passwordInput.nativeElement.type).toBe('password');

      toggleButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.hide).toBe(false);
      expect(passwordInput.nativeElement.type).toBe('text');

      toggleButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.hide).toBe(true);
      expect(passwordInput.nativeElement.type).toBe('password');
    });

    it('should update aria-label and aria-pressed attributes when toggling password visibility', () => {
      const toggleButton = fixture.debugElement.query(
        By.css('button[matSuffix]'),
      );

      expect(toggleButton.nativeElement.getAttribute('aria-label')).toBe(
        'Show password',
      );
      expect(toggleButton.nativeElement.getAttribute('aria-pressed')).toBe(
        'false',
      );

      toggleButton.nativeElement.click();
      fixture.detectChanges();

      expect(toggleButton.nativeElement.getAttribute('aria-label')).toBe(
        'Hide password',
      );
      expect(toggleButton.nativeElement.getAttribute('aria-pressed')).toBe(
        'true',
      );
    });

    it('should update visibility icon when toggling password visibility', () => {
      const toggleButton = fixture.debugElement.query(
        By.css('button[matSuffix]'),
      );
      const icon = toggleButton.query(By.css('mat-icon'));

      expect(icon.nativeElement.textContent).toBe('visibility');

      toggleButton.nativeElement.click();
      fixture.detectChanges();

      expect(icon.nativeElement.textContent).toBe('visibility_off');
    });

    it('should bind username input to component property', () => {
      const usernameInput = fixture.debugElement.query(
        By.css('input[name="username"]'),
      );

      usernameInput.nativeElement.value = 'testuser';
      usernameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.username).toBe('testuser');
    });

    it('should bind password input to component property', () => {
      const passwordInput = fixture.debugElement.query(
        By.css('input[name="password"]'),
      );

      passwordInput.nativeElement.value = 'testpass';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.password).toBe('testpass');
    });
  });

  describe('Store Integration', () => {
    it('should dispatch login action on form submit with valid credentials', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.username = 'testuser';
      component.password = 'testpass';

      fixture.debugElement
        .query(By.css('form'))
        .triggerEventHandler('ngSubmit', {});
      fixture.detectChanges();

      expect(dispatchSpy).toHaveBeenCalledWith(
        AuthActions.login({ username: 'testuser', password: 'testpass' }),
      );
    });

    it('should not dispatch login action when username is empty', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.username = '';
      component.password = 'testpass';
      component.login();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should not dispatch login action when password is empty', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.username = 'testuser';
      component.password = '';
      component.login();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should not dispatch login action when both fields are empty', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.username = '';
      component.password = '';
      component.login();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should display loading spinner when loading state is true', () => {
      store.overrideSelector(AuthSelectors.selectLoading, true);
      store.refreshState();
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(
        By.css('mat-progress-spinner'),
      );
      const progressBar = fixture.debugElement.query(
        By.css('mat-progress-bar'),
      );

      expect(spinner).toBeTruthy();
      expect(progressBar).toBeTruthy();
    });

    it('should disable submit button when loading', () => {
      store.overrideSelector(AuthSelectors.selectLoading, true);
      store.refreshState();
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]'),
      );
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should display welcome message when user is logged in', () => {
      const mockUser = { id: '1', name: 'Test User' };
      store.overrideSelector(AuthSelectors.selectUser, mockUser);
      store.refreshState();
      fixture.detectChanges();

      const welcomeMessage = fixture.debugElement.query(By.css('.welcome'));
      expect(welcomeMessage).toBeTruthy();
      expect(welcomeMessage.nativeElement.textContent).toContain(
        'Welcome, Test User!',
      );
    });

    it('should display search button when user is logged in', () => {
      const mockUser = { id: '1', name: 'Test User' };
      store.overrideSelector(AuthSelectors.selectUser, mockUser);
      store.refreshState();
      fixture.detectChanges();

      const searchButton = fixture.debugElement.query(
        By.css('mat-card-actions button'),
      );
      expect(searchButton).toBeTruthy();
      expect(searchButton.nativeElement.textContent).toContain(
        'Search TMDB (Inception)',
      );
    });

    it('should display error message when error state is present', () => {
      const errorMessage = 'Invalid credentials';
      store.overrideSelector(AuthSelectors.selectError, errorMessage);
      store.refreshState();
      fixture.detectChanges();

      const errorHint = fixture.debugElement.query(By.css('.error-hint'));
      expect(errorHint).toBeTruthy();
      expect(errorHint.nativeElement.textContent).toContain(errorMessage);
    });

    it('should hide error message when error state is null', () => {
      store.overrideSelector(AuthSelectors.selectError, null);
      store.refreshState();
      fixture.detectChanges();

      const errorHint = fixture.debugElement.query(By.css('.error-hint'));
      expect(errorHint).toBeFalsy();
    });
  });

  describe('TMDB Integration', () => {
    beforeEach(() => {
      const mockUser = { id: '1', name: 'Test User' };
      store.overrideSelector(AuthSelectors.selectUser, mockUser);
      store.refreshState();
      fixture.detectChanges();
    });

    it('should call tmdb service when search button is clicked', () => {
      tmdbService.searchMovies.mockReturnValue(of(mockApiResult));

      const searchButton = fixture.debugElement.query(
        By.css('mat-card-actions button'),
      );
      searchButton.nativeElement.click();

      expect(tmdbService.searchMovies).toHaveBeenCalledWith('inception', 1);
    });

    it('should update movies property on successful search', () => {
      tmdbService.searchMovies.mockReturnValue(of(mockApiResult));

      component.searchExample();

      expect(component.movies).toEqual(mockApiResult.results);
    });

    it('should display movies list when movies are available', () => {
      component.movies = [mockMovieResult];
      fixture.detectChanges();

      const moviesList = fixture.debugElement.query(
        By.css('.movies-card mat-list'),
      );
      const movieItems = fixture.debugElement.queryAll(By.css('mat-list-item'));

      expect(moviesList).toBeTruthy();
      expect(movieItems.length).toBe(1);
      expect(movieItems[0].nativeElement.textContent).toContain('Inception');
      expect(movieItems[0].nativeElement.textContent).toContain('2010-07-16');
    });

    it('should handle tmdb service error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Network error');
      tmdbService.searchMovies.mockReturnValue(throwError(() => error));

      component.searchExample();

      expect(consoleSpy).toHaveBeenCalledWith('TMDB error', error);
      consoleSpy.mockRestore();
    });

    it('should not display movies card when no movies are available', () => {
      component.movies = undefined;
      fixture.detectChanges();

      const moviesCard = fixture.debugElement.query(By.css('.movies-card'));
      expect(moviesCard).toBeFalsy();
    });

    it('should not display movies card when movies array is empty', () => {
      component.movies = [];
      fixture.detectChanges();

      const moviesCard = fixture.debugElement.query(By.css('.movies-card'));
      expect(moviesCard).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper autocomplete attributes', () => {
      const usernameInput = fixture.debugElement.query(
        By.css('input[name="username"]'),
      );
      const passwordInput = fixture.debugElement.query(
        By.css('input[name="password"]'),
      );

      expect(usernameInput.nativeElement.getAttribute('autocomplete')).toBe(
        'username',
      );
      expect(passwordInput.nativeElement.getAttribute('autocomplete')).toBe(
        'current-password',
      );
    });

    it('should have proper aria attributes for password toggle', () => {
      const toggleButton = fixture.debugElement.query(
        By.css('button[matSuffix]'),
      );

      expect(toggleButton.nativeElement.hasAttribute('aria-label')).toBe(true);
      expect(toggleButton.nativeElement.hasAttribute('aria-pressed')).toBe(
        true,
      );
    });

    it('should have proper mat-icon for different states', () => {
      const errorIcon = fixture.debugElement.query(
        By.css('mat-icon[color="warn"]'),
      );
      const personIcon = fixture.debugElement.query(
        By.css('mat-icon[matSuffix]:not([color])'),
      );

      // Person icon should be present in username field
      expect(personIcon).toBeTruthy();

      // Error icon should not be present initially
      expect(errorIcon).toBeFalsy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace-only username', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.username = '   ';
      component.password = 'testpass';
      component.login();

      // Should still dispatch since we only check for empty string, not whitespace
      expect(dispatchSpy).toHaveBeenCalledWith(
        AuthActions.login({ username: '   ', password: 'testpass' }),
      );
    });

    it('should handle whitespace-only password', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      component.username = 'testuser';
      component.password = '   ';
      component.login();

      // Should still dispatch since we only check for empty string, not whitespace
      expect(dispatchSpy).toHaveBeenCalledWith(
        AuthActions.login({ username: 'testuser', password: '   ' }),
      );
    });

    it('should handle multiple rapid clicks on password toggle', () => {
      const toggleButton = fixture.debugElement.query(
        By.css('button[matSuffix]'),
      );

      expect(component.hide).toBe(true);

      // Rapid clicks
      toggleButton.nativeElement.click();
      toggleButton.nativeElement.click();
      toggleButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.hide).toBe(false);
    });

    it('should handle form submission with enter key', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const form = fixture.debugElement.query(By.css('form'));

      component.username = 'testuser';
      component.password = 'testpass';

      // Simulate enter key press
      form.triggerEventHandler('ngSubmit', {});
      fixture.detectChanges();

      expect(dispatchSpy).toHaveBeenCalledWith(
        AuthActions.login({ username: 'testuser', password: 'testpass' }),
      );
    });
  });
});
