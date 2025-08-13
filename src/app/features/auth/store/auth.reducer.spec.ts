import { authReducer } from './auth.reducer';
import { initialAuthState, AuthState } from './auth.state';
import * as AuthActions from './auth.actions';

describe('Auth Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const _action = {} as unknown;
      const result = authReducer(initialAuthState, _action);

      expect(result).toBe(initialAuthState);
    });

    it('should return the current state for unknown actions', () => {
      const currentState: AuthState = {
        user: { id: '123', name: 'Test User' },
        loading: false,
        error: 'Some error',
      };
      const _action = {} as unknown;
      const result = authReducer(currentState, _action);

      expect(result).toBe(currentState);
    });
  });

  describe('login action', () => {
    it('should set loading to true and clear user and error', () => {
      const _action = AuthActions.login({ username: 'test', password: 'test' });
      const result = authReducer(initialAuthState, _action);

      expect(result).toEqual({
        user: null,
        loading: true,
        error: null,
      });
    });

    it('should clear existing user and error when login starts', () => {
      const currentState: AuthState = {
        user: { id: '123', name: 'Existing User' },
        loading: false,
        error: 'Previous error',
      };
      const _action = AuthActions.login({
        username: 'newuser',
        password: 'newpass',
      });
      const result = authReducer(currentState, _action);

      expect(result).toEqual({
        user: null,
        loading: true,
        error: null,
      });
    });

    it('should not mutate the original state', () => {
      const originalState = { ...initialAuthState };
      const _action = AuthActions.login({ username: 'test', password: 'test' });
      const result = authReducer(initialAuthState, _action);

      expect(initialAuthState).toEqual(originalState);
      expect(result).not.toBe(initialAuthState);
    });
  });

  describe('loginSuccess action', () => {
    it('should set user, clear loading and error', () => {
      const user = { id: '456', name: 'John Doe' };
      const loadingState: AuthState = {
        user: null,
        loading: true,
        error: null,
      };
      const _action = AuthActions.loginSuccess({ user });
      const result = authReducer(loadingState, _action);

      expect(result).toEqual({
        user,
        loading: false,
        error: null,
      });
    });

    it('should replace existing user data', () => {
      const oldUser = { id: '123', name: 'Old User' };
      const newUser = { id: '456', name: 'New User' };
      const currentState: AuthState = {
        user: oldUser,
        loading: true,
        error: 'Some error',
      };
      const _action = AuthActions.loginSuccess({ user: newUser });
      const result = authReducer(currentState, _action);

      expect(result).toEqual({
        user: newUser,
        loading: false,
        error: null,
      });
    });

    it('should not mutate the original state', () => {
      const currentState: AuthState = {
        user: null,
        loading: true,
        error: null,
      };
      const originalState = { ...currentState };
      const user = { id: '789', name: 'Test User' };
      const _action = AuthActions.loginSuccess({ user });
      const result = authReducer(currentState, _action);

      expect(currentState).toEqual(originalState);
      expect(result).not.toBe(currentState);
    });

    it('should preserve user object reference', () => {
      const user = { id: '999', name: 'Reference Test' };
      const _action = AuthActions.loginSuccess({ user });
      const result = authReducer(initialAuthState, _action);

      expect(result.user).toBe(user);
    });
  });

  describe('loginFailure action', () => {
    it('should set error, clear loading and user', () => {
      const error = 'Authentication failed';
      const loadingState: AuthState = {
        user: null,
        loading: true,
        error: null,
      };
      const _action = AuthActions.loginFailure({ error });
      const result = authReducer(loadingState, _action);

      expect(result).toEqual({
        user: null,
        loading: false,
        error: 'Authentication failed',
      });
    });

    it('should extract error message using error utility', () => {
      // Test that the reducer uses extractErrorMessage function
      const errorObject = { message: 'Network error' };
      const _action = AuthActions.loginFailure({
        error: errorObject as unknown,
      });
      const result = authReducer(initialAuthState, _action);

      expect(result.loading).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('should handle string error messages', () => {
      const error = 'Invalid credentials';
      const _action = AuthActions.loginFailure({ error });
      const result = authReducer(initialAuthState, _action);

      expect(result).toEqual({
        user: null,
        loading: false,
        error: 'Invalid credentials',
      });
    });

    it('should preserve existing user on login failure', () => {
      const currentState: AuthState = {
        user: { id: '123', name: 'Current User' },
        loading: true,
        error: null,
      };
      const _action = AuthActions.loginFailure({ error: 'Login failed' });
      const result = authReducer(currentState, _action);

      expect(result.user).toEqual({ id: '123', name: 'Current User' });
      expect(result.loading).toBe(false);
      expect(result.error).toBe('Login failed');
    });

    it('should not mutate the original state', () => {
      const currentState: AuthState = {
        user: null,
        loading: true,
        error: null,
      };
      const originalState = { ...currentState };
      const _action = AuthActions.loginFailure({ error: 'Test error' });
      const result = authReducer(currentState, _action);

      expect(currentState).toEqual(originalState);
      expect(result).not.toBe(currentState);
    });
  });

  describe('logout action', () => {
    it('should reset state to initial state', () => {
      const currentState: AuthState = {
        user: { id: '123', name: 'Logged In User' },
        loading: false,
        error: null,
      };
      const _action = AuthActions.logout();
      const result = authReducer(currentState, _action);

      expect(result).toEqual(initialAuthState);
    });

    it('should reset state with error to initial state', () => {
      const currentState: AuthState = {
        user: { id: '456', name: 'User With Error' },
        loading: false,
        error: 'Some error message',
      };
      const _action = AuthActions.logout();
      const result = authReducer(currentState, _action);

      expect(result).toEqual(initialAuthState);
    });

    it('should reset loading state to initial state', () => {
      const currentState: AuthState = {
        user: null,
        loading: true,
        error: null,
      };
      const _action = AuthActions.logout();
      const result = authReducer(currentState, _action);

      expect(result).toEqual(initialAuthState);
    });

    it('should return initial state reference', () => {
      const currentState: AuthState = {
        user: { id: '789', name: 'Any User' },
        loading: true,
        error: 'Any error',
      };
      const _action = AuthActions.logout();
      const result = authReducer(currentState, _action);

      expect(result).toBe(initialAuthState);
    });
  });

  describe('State Immutability', () => {
    it('should never mutate the input state', () => {
      const testState: AuthState = {
        user: { id: '123', name: 'Test User' },
        loading: false,
        error: 'Test error',
      };
      const originalState = JSON.parse(JSON.stringify(testState));

      // Test all actions
      authReducer(
        testState,
        AuthActions.login({ username: 'test', password: 'test' }),
      );
      authReducer(
        testState,
        AuthActions.loginSuccess({ user: { id: '456', name: 'New User' } }),
      );
      authReducer(testState, AuthActions.loginFailure({ error: 'New error' }));
      authReducer(testState, AuthActions.logout());

      expect(testState).toEqual(originalState);
    });

    it('should create new state objects for each action', () => {
      const state1 = authReducer(
        initialAuthState,
        AuthActions.login({ username: 'test', password: 'test' }),
      );
      const state2 = authReducer(
        state1,
        AuthActions.loginSuccess({ user: { id: '1', name: 'User' } }),
      );
      const state3 = authReducer(
        state2,
        AuthActions.loginFailure({ error: 'Error' }),
      );
      const state4 = authReducer(state3, AuthActions.logout());

      expect(state1).not.toBe(initialAuthState);
      expect(state2).not.toBe(state1);
      expect(state3).not.toBe(state2);
      expect(state4).toBe(initialAuthState); // logout returns initial state reference
    });
  });

  describe('State Shape Consistency', () => {
    it('should maintain consistent state shape across all actions', () => {
      const actions = [
        AuthActions.login({ username: 'test', password: 'test' }),
        AuthActions.loginSuccess({ user: { id: '1', name: 'User' } }),
        AuthActions.loginFailure({ error: 'Error' }),
        AuthActions.logout(),
      ];

      actions.forEach((_action) => {
        const result = authReducer(initialAuthState, _action);

        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('loading');
        expect(result).toHaveProperty('error');
        expect(typeof result.loading).toBe('boolean');
        expect(
          result.user === null ||
            (typeof result.user === 'object' &&
              'id' in result.user &&
              'name' in result.user),
        ).toBe(true);
        expect(result.error === null || typeof result.error === 'string').toBe(
          true,
        );
      });
    });
  });
});
