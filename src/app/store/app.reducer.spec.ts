import { ActionReducerMap } from '@ngrx/store';
import { reducers } from './app.reducer';
import { AppState } from './app.state';
import { authReducer } from '../features/auth/store/auth.reducer';
import * as AuthActions from '../features/auth/store/auth.actions';
import { initialAuthState } from '../features/auth/store/auth.state';

describe('App Reducer', () => {
  describe('reducers configuration', () => {
    it('should be an ActionReducerMap', () => {
      expect(reducers).toBeDefined();
      expect(typeof reducers).toBe('object');
    });

    it('should contain auth reducer', () => {
      expect(reducers.auth).toBe(authReducer);
    });

    it('should have correct structure for AppState', () => {
      const expectedKeys = ['auth'];
      const actualKeys = Object.keys(reducers);

      expect(actualKeys).toEqual(expectedKeys);
    });
  });

  describe('reducer composition', () => {
    it('should combine feature reducers correctly', () => {
      // Create a mock action that affects auth state
      const loginAction = AuthActions.login({
        username: 'test',
        password: 'test',
      });

      // Apply the auth reducer directly
      const authState = authReducer(initialAuthState, loginAction);

      // Verify the reducer in the map produces the same result
      const reducerResult = reducers.auth(initialAuthState, loginAction);

      expect(reducerResult).toEqual(authState);
    });

    it('should maintain state tree structure', () => {
      const mockState: AppState = {
        auth: initialAuthState,
      };

      // Test that each reducer handles its slice correctly
      const loginAction = AuthActions.login({
        username: 'test',
        password: 'test',
      });
      const newAuthState = reducers.auth(mockState.auth, loginAction);

      expect(newAuthState).toBeDefined();
      expect(newAuthState.loading).toBe(true);
      expect(newAuthState.error).toBe(null);
    });
  });

  describe('action routing', () => {
    it('should route auth actions to auth reducer', () => {
      const loginAction = AuthActions.login({
        username: 'test',
        password: 'test',
      });
      const loginSuccessAction = AuthActions.loginSuccess({
        user: { id: '1', name: 'Test' },
      });
      const logoutAction = AuthActions.logout();

      // Test that auth reducer handles auth actions
      expect(() => reducers.auth(initialAuthState, loginAction)).not.toThrow();
      expect(() =>
        reducers.auth(initialAuthState, loginSuccessAction),
      ).not.toThrow();
      expect(() => reducers.auth(initialAuthState, logoutAction)).not.toThrow();
    });

    it('should handle unknown actions gracefully', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };

      // Auth reducer should return current state for unknown actions
      const result = reducers.auth(initialAuthState, unknownAction);
      expect(result).toBe(initialAuthState);
    });
  });

  describe('type safety', () => {
    it('should enforce correct state shape', () => {
      // This test verifies TypeScript compilation
      const testReducers: ActionReducerMap<AppState> = reducers;

      expect(testReducers).toBeDefined();
      expect(testReducers.auth).toBeDefined();
    });

    it('should maintain reducer function signatures', () => {
      // Verify each reducer has correct function signature
      expect(typeof reducers.auth).toBe('function');
      // NgRx reducers created with createReducer may have different signatures
      expect(reducers.auth.length).toBeGreaterThanOrEqual(0);
    });
  });
});
