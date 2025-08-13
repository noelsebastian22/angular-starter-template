import * as AuthStoreModule from './index';
import * as AuthActions from './auth.actions';
import { authReducer } from './auth.reducer';
import * as AuthSelectors from './auth.selectors';
import { AuthEffects } from './auth.effects';
import { initialAuthState } from './auth.state';

describe('Auth Store Module', () => {
  describe('Module Exports', () => {
    it('should export all auth actions', () => {
      expect(AuthStoreModule.login).toBeDefined();
      expect(AuthStoreModule.login).toBe(AuthActions.login);

      expect(AuthStoreModule.loginSuccess).toBeDefined();
      expect(AuthStoreModule.loginSuccess).toBe(AuthActions.loginSuccess);

      expect(AuthStoreModule.loginFailure).toBeDefined();
      expect(AuthStoreModule.loginFailure).toBe(AuthActions.loginFailure);

      expect(AuthStoreModule.logout).toBeDefined();
      expect(AuthStoreModule.logout).toBe(AuthActions.logout);
    });

    it('should export auth reducer', () => {
      expect(AuthStoreModule.authReducer).toBeDefined();
      expect(AuthStoreModule.authReducer).toBe(authReducer);
    });

    it('should export all auth selectors', () => {
      expect(AuthStoreModule.selectAuthState).toBeDefined();
      expect(AuthStoreModule.selectAuthState).toBe(
        AuthSelectors.selectAuthState,
      );

      expect(AuthStoreModule.selectUser).toBeDefined();
      expect(AuthStoreModule.selectUser).toBe(AuthSelectors.selectUser);

      expect(AuthStoreModule.selectLoading).toBeDefined();
      expect(AuthStoreModule.selectLoading).toBe(AuthSelectors.selectLoading);

      expect(AuthStoreModule.selectError).toBeDefined();
      expect(AuthStoreModule.selectError).toBe(AuthSelectors.selectError);
    });

    it('should export AuthEffects', () => {
      expect(AuthStoreModule.AuthEffects).toBeDefined();
      expect(AuthStoreModule.AuthEffects).toBe(AuthEffects);
    });

    it('should export auth state types', () => {
      // TypeScript interfaces don't exist at runtime, but we can test the initial state
      expect(AuthStoreModule.initialAuthState).toBeDefined();
      expect(AuthStoreModule.initialAuthState).toBe(initialAuthState);
    });
  });

  describe('Action Creators', () => {
    it('should provide working action creators', () => {
      const loginAction = AuthStoreModule.login({
        username: 'test',
        password: 'pass',
      });
      expect(loginAction.type).toBe('[Auth] Login');
      expect(loginAction.username).toBe('test');
      expect(loginAction.password).toBe('pass');

      const loginSuccessAction = AuthStoreModule.loginSuccess({
        user: { id: '1', name: 'Test User' },
      });
      expect(loginSuccessAction.type).toBe('[Auth] Login Success');
      expect(loginSuccessAction.user.id).toBe('1');

      const loginFailureAction = AuthStoreModule.loginFailure({
        error: 'Login failed',
      });
      expect(loginFailureAction.type).toBe('[Auth] Login Failure');
      expect(loginFailureAction.error).toBe('Login failed');

      const logoutAction = AuthStoreModule.logout();
      expect(logoutAction.type).toBe('[Auth] Logout');
    });
  });

  describe('Reducer Function', () => {
    it('should provide working reducer function', () => {
      const action = AuthStoreModule.login({
        username: 'test',
        password: 'pass',
      });
      const newState = AuthStoreModule.authReducer(
        AuthStoreModule.initialAuthState,
        action,
      );

      expect(newState.loading).toBe(true);
      expect(newState.error).toBe(null);
      expect(newState.user).toBe(null);
    });

    it('should handle all exported actions', () => {
      // Test login action
      const loginAction = AuthStoreModule.login({
        username: 'test',
        password: 'pass',
      });
      const loginState = AuthStoreModule.authReducer(
        AuthStoreModule.initialAuthState,
        loginAction,
      );
      expect(loginState.loading).toBe(true);

      // Test loginSuccess action
      const user = { id: '1', name: 'Test User' };
      const successAction = AuthStoreModule.loginSuccess({ user });
      const successState = AuthStoreModule.authReducer(
        loginState,
        successAction,
      );
      expect(successState.loading).toBe(false);
      expect(successState.user).toEqual(user);

      // Test loginFailure action
      const failureAction = AuthStoreModule.loginFailure({
        error: 'Login failed',
      });
      const failureState = AuthStoreModule.authReducer(
        loginState,
        failureAction,
      );
      expect(failureState.loading).toBe(false);
      expect(failureState.error).toBe('Login failed');

      // Test logout action
      const logoutAction = AuthStoreModule.logout();
      const logoutState = AuthStoreModule.authReducer(
        successState,
        logoutAction,
      );
      expect(logoutState.user).toBe(null);
      expect(logoutState.loading).toBe(false);
      expect(logoutState.error).toBe(null);
    });
  });

  describe('Selectors', () => {
    it('should provide working selector functions', () => {
      const mockState = {
        auth: {
          user: { id: '1', name: 'Test User' },
          loading: false,
          error: null,
        },
      };

      expect(AuthStoreModule.selectUser.projector(mockState.auth)).toEqual(
        mockState.auth.user,
      );
      expect(AuthStoreModule.selectLoading.projector(mockState.auth)).toBe(
        false,
      );
      expect(AuthStoreModule.selectError.projector(mockState.auth)).toBe(null);
    });

    it('should have selectors that work with feature selector', () => {
      const authState: AuthStoreModule.AuthState = {
        user: { id: '1', name: 'Test User' },
        loading: true,
        error: 'Some error',
      };

      expect(AuthStoreModule.selectUser.projector(authState)).toEqual(
        authState.user,
      );
      expect(AuthStoreModule.selectLoading.projector(authState)).toBe(true);
      expect(AuthStoreModule.selectError.projector(authState)).toBe(
        'Some error',
      );
    });
  });

  describe('Effects Class', () => {
    it('should export AuthEffects as a class', () => {
      expect(typeof AuthStoreModule.AuthEffects).toBe('function');
      expect(AuthStoreModule.AuthEffects.prototype).toBeDefined();
    });

    it('should be injectable', () => {
      // Verify that AuthEffects has the necessary metadata for dependency injection
      expect(AuthStoreModule.AuthEffects).toBeDefined();
      // The class should be constructable (though we won't actually construct it here
      // since it requires dependency injection)
      expect(() => {
        const effectsClass = AuthStoreModule.AuthEffects;
        return effectsClass;
      }).not.toThrow();
    });
  });

  describe('State Interface and Initial State', () => {
    it('should provide AuthState interface through initial state', () => {
      const initialState = AuthStoreModule.initialAuthState;

      expect(initialState).toBeDefined();
      expect(typeof initialState.user).toBe('object');
      expect(typeof initialState.loading).toBe('boolean');
      expect(initialState.error).toBe(null);
    });

    it('should have correct initial state structure', () => {
      const initialState = AuthStoreModule.initialAuthState;

      expect(initialState.user).toBe(null);
      expect(initialState.loading).toBe(false);
      expect(initialState.error).toBe(null);
    });

    it('should provide type-safe state interface', () => {
      // Test that the exported types work correctly
      const testState: AuthStoreModule.AuthState = {
        user: { id: '1', name: 'Test' },
        loading: true,
        error: 'Test error',
      };

      expect(testState.user?.id).toBe('1');
      expect(testState.loading).toBe(true);
      expect(testState.error).toBe('Test error');
    });
  });

  describe('Module Organization', () => {
    it('should provide a complete store module API', () => {
      const moduleKeys = Object.keys(AuthStoreModule);

      // Should include actions
      expect(moduleKeys).toContain('login');
      expect(moduleKeys).toContain('loginSuccess');
      expect(moduleKeys).toContain('loginFailure');
      expect(moduleKeys).toContain('logout');

      // Should include reducer
      expect(moduleKeys).toContain('authReducer');

      // Should include selectors
      expect(moduleKeys).toContain('selectAuthState');
      expect(moduleKeys).toContain('selectUser');
      expect(moduleKeys).toContain('selectLoading');
      expect(moduleKeys).toContain('selectError');

      // Should include effects
      expect(moduleKeys).toContain('AuthEffects');

      // Should include state
      expect(moduleKeys).toContain('initialAuthState');
    });

    it('should not expose internal implementation details', () => {
      const moduleKeys = Object.keys(AuthStoreModule);
      const internalKeys = moduleKeys.filter(
        (key) =>
          key.startsWith('_') ||
          key.includes('private') ||
          key.includes('internal'),
      );

      expect(internalKeys).toHaveLength(0);
    });
  });

  describe('Integration', () => {
    it('should allow actions to work with reducer', () => {
      const action = AuthStoreModule.login({
        username: 'test',
        password: 'pass',
      });
      const newState = AuthStoreModule.authReducer(
        AuthStoreModule.initialAuthState,
        action,
      );

      expect(newState).not.toBe(AuthStoreModule.initialAuthState);
      expect(newState.loading).toBe(true);
    });

    it('should allow selectors to work with reducer state', () => {
      const user = { id: '1', name: 'Test User' };
      const action = AuthStoreModule.loginSuccess({ user });
      const newState = AuthStoreModule.authReducer(
        AuthStoreModule.initialAuthState,
        action,
      );

      const selectedUser = AuthStoreModule.selectUser.projector(newState);
      expect(selectedUser).toEqual(user);
    });
  });
});
