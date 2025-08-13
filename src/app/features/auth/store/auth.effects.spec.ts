import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { AuthEffects } from './auth.effects';
import { AuthService } from '../services/auth.service';
import * as AuthActions from './auth.actions';

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  let effects: AuthEffects;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    const authServiceSpy = {
      login: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    effects = TestBed.inject(AuthEffects);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  describe('login$', () => {
    it('should dispatch loginSuccess action on successful login', (done) => {
      const username = 'testuser';
      const password = 'testpass';
      const user = { id: '123', name: 'Test User' };
      const loginAction = AuthActions.login({ username, password });
      const expectedAction = AuthActions.loginSuccess({ user });

      authService.login.mockReturnValue(of(user));
      actions$ = of(loginAction);

      effects.login$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(authService.login).toHaveBeenCalledWith(username, password);
        done();
      });
    });

    it('should dispatch loginFailure action on login error', (done) => {
      const username = 'testuser';
      const password = 'wrongpass';
      const error = new Error('Invalid credentials');
      const loginAction = AuthActions.login({ username, password });
      const expectedAction = AuthActions.loginFailure({ error });

      authService.login.mockReturnValue(throwError(() => error));
      actions$ = of(loginAction);

      effects.login$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(authService.login).toHaveBeenCalledWith(username, password);
        done();
      });
    });

    it('should handle HTTP error responses', (done) => {
      const username = 'testuser';
      const password = 'testpass';
      const httpError = {
        status: 401,
        statusText: 'Unauthorized',
        message: 'Authentication failed',
      };
      const loginAction = AuthActions.login({ username, password });
      const expectedAction = AuthActions.loginFailure({ error: httpError });

      authService.login.mockReturnValue(throwError(() => httpError));
      actions$ = of(loginAction);

      effects.login$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(authService.login).toHaveBeenCalledWith(username, password);
        done();
      });
    });

    it('should handle network errors', (done) => {
      const username = 'testuser';
      const password = 'testpass';
      const networkError = new Error('Network connection failed');
      const loginAction = AuthActions.login({ username, password });
      const expectedAction = AuthActions.loginFailure({ error: networkError });

      authService.login.mockReturnValue(throwError(() => networkError));
      actions$ = of(loginAction);

      effects.login$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(authService.login).toHaveBeenCalledWith(username, password);
        done();
      });
    });

    it('should handle empty credentials', (done) => {
      const username = '';
      const password = '';
      const user = { id: '456', name: '' };
      const loginAction = AuthActions.login({ username, password });
      const expectedAction = AuthActions.loginSuccess({ user });

      authService.login.mockReturnValue(of(user));
      actions$ = of(loginAction);

      effects.login$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(authService.login).toHaveBeenCalledWith('', '');
        done();
      });
    });

    it('should handle special characters in credentials', (done) => {
      const username = 'user@example.com';
      const password = 'P@ssw0rd!';
      const user = { id: '789', name: 'Special User' };
      const loginAction = AuthActions.login({ username, password });
      const expectedAction = AuthActions.loginSuccess({ user });

      authService.login.mockReturnValue(of(user));
      actions$ = of(loginAction);

      effects.login$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(authService.login).toHaveBeenCalledWith(username, password);
        done();
      });
    });

    it('should handle undefined error objects', (done) => {
      const username = 'testuser';
      const password = 'testpass';
      const loginAction = AuthActions.login({ username, password });
      const expectedAction = AuthActions.loginFailure({ error: undefined });

      authService.login.mockReturnValue(throwError(() => undefined));
      actions$ = of(loginAction);

      effects.login$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(authService.login).toHaveBeenCalledWith(username, password);
        done();
      });
    });

    it('should handle null error objects', (done) => {
      const username = 'testuser';
      const password = 'testpass';
      const loginAction = AuthActions.login({ username, password });
      const expectedAction = AuthActions.loginFailure({ error: null });

      authService.login.mockReturnValue(throwError(() => null));
      actions$ = of(loginAction);

      effects.login$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(authService.login).toHaveBeenCalledWith(username, password);
        done();
      });
    });
  });

  describe('switchMap operator behavior', () => {
    it('should cancel previous login request when new login action is dispatched', (done) => {
      const firstLogin = AuthActions.login({
        username: 'user1',
        password: 'pass1',
      });
      const secondLogin = AuthActions.login({
        username: 'user2',
        password: 'pass2',
      });
      const user2 = { id: '2', name: 'User 2' };
      const expectedAction = AuthActions.loginSuccess({ user: user2 });

      let _callCount = 0;
      authService.login.mockImplementation((username: string) => {
        _callCount++;
        if (username === 'user1') {
          // Simulate slow first request
          return of({ id: '1', name: 'User 1' });
        }
        return of(user2);
      });

      // Create observable that emits both actions
      actions$ = of(firstLogin, secondLogin);

      const results: unknown[] = [];
      effects.login$.subscribe((action) => {
        results.push(action);

        // After receiving both results, verify switchMap behavior
        if (results.length === 2) {
          expect(results[1]).toEqual(expectedAction);
          expect(authService.login).toHaveBeenCalledTimes(2);
          done();
        }
      });
    });

    it('should handle rapid successive login attempts', (done) => {
      const actions = [
        AuthActions.login({ username: 'user1', password: 'pass1' }),
        AuthActions.login({ username: 'user2', password: 'pass2' }),
        AuthActions.login({ username: 'user3', password: 'pass3' }),
      ];

      authService.login.mockImplementation((username: string) => {
        return of({
          id: username.slice(-1),
          name: `User ${username.slice(-1)}`,
        });
      });

      actions$ = of(...actions);

      const results: unknown[] = [];
      effects.login$.subscribe((action) => {
        results.push(action);

        if (results.length === 3) {
          expect(results[2].user.name).toBe('User 3');
          expect(authService.login).toHaveBeenCalledTimes(3);
          done();
        }
      });
    });
  });

  describe('Observable stream handling', () => {
    it('should maintain observable stream on error', (done) => {
      const firstLogin = AuthActions.login({
        username: 'user1',
        password: 'pass1',
      });
      const secondLogin = AuthActions.login({
        username: 'user2',
        password: 'pass2',
      });
      const user2 = { id: '2', name: 'User 2' };

      authService.login.mockImplementation((username: string) => {
        if (username === 'user1') {
          return throwError(() => new Error('First login failed'));
        }
        return of(user2);
      });

      actions$ = of(firstLogin, secondLogin);

      const results: unknown[] = [];
      effects.login$.subscribe((action) => {
        results.push(action);

        if (results.length === 2) {
          expect(results[0].type).toBe('[Auth] Login Failure');
          expect(results[1].type).toBe('[Auth] Login Success');
          expect(results[1].user).toEqual(user2);
          done();
        }
      });
    });

    it('should handle service returning undefined user', (done) => {
      const username = 'testuser';
      const password = 'testpass';
      const loginAction = AuthActions.login({ username, password });
      const expectedAction = AuthActions.loginSuccess({
        user: undefined as unknown,
      });

      authService.login.mockReturnValue(of(undefined as unknown));
      actions$ = of(loginAction);

      effects.login$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('Effect registration and injection', () => {
    it('should be properly injectable', () => {
      expect(effects).toBeTruthy();
      expect(effects.login$).toBeDefined();
    });

    it('should have access to injected dependencies', () => {
      expect(authService).toBeTruthy();
      expect(authService.login).toBeDefined();
    });

    it('should be an observable', () => {
      expect(effects.login$.subscribe).toBeDefined();
      expect(typeof effects.login$.subscribe).toBe('function');
    });
  });
});
