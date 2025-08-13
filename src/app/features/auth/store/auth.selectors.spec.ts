import {
  selectAuthState,
  selectUser,
  selectLoading,
  selectError,
} from './auth.selectors';
import { AuthState } from './auth.state';

describe('Auth Selectors', () => {
  const mockAppState = {
    auth: {
      user: { id: '123', name: 'Test User' },
      loading: false,
      error: null,
    } as AuthState,
    // Other feature states would be here
    otherFeature: {},
  };

  const mockAppStateWithError = {
    auth: {
      user: null,
      loading: true,
      error: 'Authentication failed',
    } as AuthState,
    otherFeature: {},
  };

  const mockAppStateInitial = {
    auth: {
      user: null,
      loading: false,
      error: null,
    } as AuthState,
    otherFeature: {},
  };

  describe('selectAuthState', () => {
    it('should select the auth state', () => {
      const result = selectAuthState(mockAppState);

      expect(result).toEqual(mockAppState.auth);
    });

    it('should select auth state with error', () => {
      const result = selectAuthState(mockAppStateWithError);

      expect(result).toEqual(mockAppStateWithError.auth);
    });

    it('should select initial auth state', () => {
      const result = selectAuthState(mockAppStateInitial);

      expect(result).toEqual(mockAppStateInitial.auth);
    });

    it('should return same reference for same state', () => {
      const result1 = selectAuthState(mockAppState);
      const result2 = selectAuthState(mockAppState);

      expect(result1).toBe(result2);
    });
  });

  describe('selectUser', () => {
    it('should select user from auth state', () => {
      const result = selectUser.projector(mockAppState.auth);

      expect(result).toEqual({ id: '123', name: 'Test User' });
    });

    it('should select null user when not authenticated', () => {
      const result = selectUser.projector(mockAppStateWithError.auth);

      expect(result).toBeNull();
    });

    it('should select null user from initial state', () => {
      const result = selectUser.projector(mockAppStateInitial.auth);

      expect(result).toBeNull();
    });

    it('should maintain reference equality for same user', () => {
      const user = { id: '456', name: 'Same User' };
      const authState: AuthState = {
        user,
        loading: false,
        error: null,
      };

      const result1 = selectUser.projector(authState);
      const result2 = selectUser.projector(authState);

      expect(result1).toBe(result2);
      expect(result1).toBe(user);
    });

    it('should handle user with empty name', () => {
      const authState: AuthState = {
        user: { id: '789', name: '' },
        loading: false,
        error: null,
      };

      const result = selectUser.projector(authState);

      expect(result).toEqual({ id: '789', name: '' });
    });
  });

  describe('selectLoading', () => {
    it('should select loading state as false', () => {
      const result = selectLoading.projector(mockAppState.auth);

      expect(result).toBe(false);
    });

    it('should select loading state as true', () => {
      const result = selectLoading.projector(mockAppStateWithError.auth);

      expect(result).toBe(true);
    });

    it('should select initial loading state', () => {
      const result = selectLoading.projector(mockAppStateInitial.auth);

      expect(result).toBe(false);
    });

    it('should maintain reference equality for same loading state', () => {
      const result1 = selectLoading.projector(mockAppState.auth);
      const result2 = selectLoading.projector(mockAppState.auth);

      expect(result1).toBe(result2);
    });

    it('should handle different loading states', () => {
      const loadingState: AuthState = {
        user: null,
        loading: true,
        error: null,
      };
      const notLoadingState: AuthState = {
        user: { id: '1', name: 'User' },
        loading: false,
        error: null,
      };

      expect(selectLoading.projector(loadingState)).toBe(true);
      expect(selectLoading.projector(notLoadingState)).toBe(false);
    });
  });

  describe('selectError', () => {
    it('should select null error when no error', () => {
      const result = selectError.projector(mockAppState.auth);

      expect(result).toBeNull();
    });

    it('should select error message when error exists', () => {
      const result = selectError.projector(mockAppStateWithError.auth);

      expect(result).toBe('Authentication failed');
    });

    it('should select null error from initial state', () => {
      const result = selectError.projector(mockAppStateInitial.auth);

      expect(result).toBeNull();
    });

    it('should maintain reference equality for same error', () => {
      const result1 = selectError.projector(mockAppStateWithError.auth);
      const result2 = selectError.projector(mockAppStateWithError.auth);

      expect(result1).toBe(result2);
    });

    it('should handle empty error string', () => {
      const authState: AuthState = {
        user: null,
        loading: false,
        error: '',
      };

      const result = selectError.projector(authState);

      expect(result).toBe('');
    });

    it('should handle different error messages', () => {
      const errorState1: AuthState = {
        user: null,
        loading: false,
        error: 'Network error',
      };
      const errorState2: AuthState = {
        user: null,
        loading: false,
        error: 'Invalid credentials',
      };

      expect(selectError.projector(errorState1)).toBe('Network error');
      expect(selectError.projector(errorState2)).toBe('Invalid credentials');
    });
  });

  describe('Selector Memoization', () => {
    it('should return same reference when auth state has not changed', () => {
      const result1 = selectUser.projector(mockAppState.auth);
      const result2 = selectUser.projector(mockAppState.auth);

      expect(result1).toBe(result2);
    });

    it('should return different reference when auth state changes', () => {
      const authState1: AuthState = {
        user: { id: '1', name: 'User 1' },
        loading: false,
        error: null,
      };
      const authState2: AuthState = {
        user: { id: '2', name: 'User 2' },
        loading: false,
        error: null,
      };

      const result1 = selectUser.projector(authState1);
      const result2 = selectUser.projector(authState2);

      expect(result1).not.toBe(result2);
      expect(result1).toEqual({ id: '1', name: 'User 1' });
      expect(result2).toEqual({ id: '2', name: 'User 2' });
    });

    it('should memoize loading selector', () => {
      const result1 = selectLoading.projector(mockAppState.auth);
      const result2 = selectLoading.projector(mockAppState.auth);

      expect(result1).toBe(result2);
    });

    it('should memoize error selector', () => {
      const result1 = selectError.projector(mockAppState.auth);
      const result2 = selectError.projector(mockAppState.auth);

      expect(result1).toBe(result2);
    });
  });

  describe('Selector Composition', () => {
    it('should work with feature selector composition', () => {
      // Test that selectors work when composed with the feature selector
      const user = selectUser(mockAppState);
      const loading = selectLoading(mockAppState);
      const error = selectError(mockAppState);

      expect(user).toEqual({ id: '123', name: 'Test User' });
      expect(loading).toBe(false);
      expect(error).toBeNull();
    });

    it('should handle undefined auth state gracefully', () => {
      const stateWithUndefinedAuth = {
        auth: undefined as unknown,
        otherFeature: {},
      };

      // These should not throw errors, though they may return undefined
      expect(() => selectAuthState(stateWithUndefinedAuth)).not.toThrow();
    });

    it('should work with partial state objects', () => {
      const partialState = {
        auth: {
          user: { id: '999', name: 'Partial User' },
          loading: true,
          error: 'Partial error',
        } as AuthState,
      };

      const user = selectUser(partialState);
      const loading = selectLoading(partialState);
      const error = selectError(partialState);

      expect(user).toEqual({ id: '999', name: 'Partial User' });
      expect(loading).toBe(true);
      expect(error).toBe('Partial error');
    });
  });

  describe('Derived State Calculations', () => {
    it('should correctly derive user authentication status', () => {
      const authenticatedState: AuthState = {
        user: { id: '1', name: 'Authenticated User' },
        loading: false,
        error: null,
      };
      const unauthenticatedState: AuthState = {
        user: null,
        loading: false,
        error: null,
      };

      const authenticatedUser = selectUser.projector(authenticatedState);
      const unauthenticatedUser = selectUser.projector(unauthenticatedState);

      expect(authenticatedUser).toBeTruthy();
      expect(unauthenticatedUser).toBeFalsy();
    });

    it('should correctly derive loading status during authentication', () => {
      const loadingState: AuthState = {
        user: null,
        loading: true,
        error: null,
      };
      const idleState: AuthState = {
        user: { id: '1', name: 'User' },
        loading: false,
        error: null,
      };

      expect(selectLoading.projector(loadingState)).toBe(true);
      expect(selectLoading.projector(idleState)).toBe(false);
    });

    it('should correctly derive error status', () => {
      const errorState: AuthState = {
        user: null,
        loading: false,
        error: 'Login failed',
      };
      const successState: AuthState = {
        user: { id: '1', name: 'User' },
        loading: false,
        error: null,
      };

      expect(selectError.projector(errorState)).toBeTruthy();
      expect(selectError.projector(successState)).toBeFalsy();
    });
  });
});
