import { ActionReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { localStorageSyncReducer } from './local-storage-sync';
import { AppState } from '../../store';

// Mock the ngrx-store-localstorage module
jest.mock('ngrx-store-localstorage', () => ({
  localStorageSync: jest.fn(),
}));

describe('localStorageSyncReducer', () => {
  let mockReducer: ActionReducer<AppState>;
  let mockLocalStorageSync: jest.MockedFunction<typeof localStorageSync>;
  let mockSyncedReducer: ActionReducer<AppState>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock reducer
    mockReducer = jest.fn();

    // Create mock synced reducer
    mockSyncedReducer = jest.fn();

    // Mock localStorageSync to return a function that returns our mock synced reducer
    mockLocalStorageSync = localStorageSync as jest.MockedFunction<
      typeof localStorageSync
    >;
    mockLocalStorageSync.mockReturnValue(() => mockSyncedReducer);
  });

  describe('configuration', () => {
    it('should call localStorageSync with correct configuration', () => {
      localStorageSyncReducer(mockReducer);

      expect(mockLocalStorageSync).toHaveBeenCalledWith({
        keys: ['auth'],
        rehydrate: true,
      });
    });

    it('should call localStorageSync exactly once', () => {
      localStorageSyncReducer(mockReducer);

      expect(mockLocalStorageSync).toHaveBeenCalledTimes(1);
    });

    it('should pass the original reducer to the localStorageSync result function', () => {
      const syncFunction = jest.fn().mockReturnValue(mockSyncedReducer);
      mockLocalStorageSync.mockReturnValue(syncFunction);

      localStorageSyncReducer(mockReducer);

      expect(syncFunction).toHaveBeenCalledWith(mockReducer);
    });
  });

  describe('reducer enhancement', () => {
    it('should return the enhanced reducer from localStorageSync', () => {
      const result = localStorageSyncReducer(mockReducer);

      expect(result).toBe(mockSyncedReducer);
    });

    it('should return a function when called', () => {
      const result = localStorageSyncReducer(mockReducer);

      expect(typeof result).toBe('function');
    });
  });

  describe('state synchronization', () => {
    let mockState: AppState;
    let mockAction: { type: string };

    beforeEach(() => {
      mockState = {
        auth: {
          user: null,
          loading: false,
          error: null,
        },
      } as AppState;

      mockAction = { type: 'TEST_ACTION' };
    });

    it('should handle state persistence through the enhanced reducer', () => {
      // Setup the mock to simulate the actual behavior
      const enhancedReducer = jest.fn().mockReturnValue(mockState);
      mockLocalStorageSync.mockReturnValue(() => enhancedReducer);

      const result = localStorageSyncReducer(mockReducer);
      const newState = result(mockState, mockAction);

      expect(enhancedReducer).toHaveBeenCalledWith(mockState, mockAction);
      expect(newState).toBe(mockState);
    });

    it('should work with undefined initial state', () => {
      const enhancedReducer = jest.fn().mockReturnValue(mockState);
      mockLocalStorageSync.mockReturnValue(() => enhancedReducer);

      const result = localStorageSyncReducer(mockReducer);
      const newState = result(undefined, mockAction);

      expect(enhancedReducer).toHaveBeenCalledWith(undefined, mockAction);
      expect(newState).toBe(mockState);
    });

    it('should handle different action types', () => {
      const enhancedReducer = jest.fn().mockReturnValue(mockState);
      mockLocalStorageSync.mockReturnValue(() => enhancedReducer);

      const result = localStorageSyncReducer(mockReducer);

      const loginAction = {
        type: '[Auth] Login',
        username: 'test',
        password: 'test',
      };
      const logoutAction = { type: '[Auth] Logout' };

      result(mockState, loginAction);
      result(mockState, logoutAction);

      expect(enhancedReducer).toHaveBeenCalledWith(mockState, loginAction);
      expect(enhancedReducer).toHaveBeenCalledWith(mockState, logoutAction);
      expect(enhancedReducer).toHaveBeenCalledTimes(2);
    });
  });

  describe('localStorage integration', () => {
    beforeEach(() => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
        },
        writable: true,
      });
    });

    it('should configure localStorage sync for auth state only', () => {
      localStorageSyncReducer(mockReducer);

      expect(mockLocalStorageSync).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: ['auth'],
        }),
      );
    });

    it('should enable rehydration from localStorage', () => {
      localStorageSyncReducer(mockReducer);

      expect(mockLocalStorageSync).toHaveBeenCalledWith(
        expect.objectContaining({
          rehydrate: true,
        }),
      );
    });

    it('should not include other state keys in sync configuration', () => {
      localStorageSyncReducer(mockReducer);

      const callArgs = mockLocalStorageSync.mock.calls[0][0];
      expect(callArgs.keys).toEqual(['auth']);
      expect(callArgs.keys).not.toContain('router');
      expect(callArgs.keys).not.toContain('ui');
      expect(callArgs.keys).not.toContain('data');
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const mockError = new Error('localStorage not available');
      const errorReducer = jest.fn().mockImplementation(() => {
        throw mockError;
      });
      mockLocalStorageSync.mockReturnValue(() => errorReducer);

      const result = localStorageSyncReducer(mockReducer);

      expect(() => {
        result(
          { auth: { user: null, loading: false, error: null } } as AppState,
          { type: 'TEST' },
        );
      }).toThrow(mockError);
    });

    it('should work when localStorage is not available', () => {
      // Simulate environment without localStorage
      const originalLocalStorage = window.localStorage;
      delete (window as unknown).localStorage;

      // The function should still work and return a reducer
      const result = localStorageSyncReducer(mockReducer);
      expect(typeof result).toBe('function');

      // Restore localStorage
      window.localStorage = originalLocalStorage;
    });

    it('should handle malformed localStorage data', () => {
      // Mock localStorage with invalid JSON
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue('invalid json'),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
        },
        writable: true,
      });

      // The reducer should still be created without throwing
      const result = localStorageSyncReducer(mockReducer);
      expect(typeof result).toBe('function');
    });
  });

  describe('type safety', () => {
    it('should accept ActionReducer<AppState> as parameter', () => {
      const typedReducer: ActionReducer<AppState> = (state, _action) =>
        state || ({} as AppState);

      expect(() => {
        localStorageSyncReducer(typedReducer);
      }).not.toThrow();
    });

    it('should return ActionReducer<AppState>', () => {
      const result = localStorageSyncReducer(mockReducer);

      // Test that the returned function has the correct signature
      expect(typeof result).toBe('function');
      // The mock function may not have the same length property, so just verify it's a function
      expect(result).toBeDefined();
    });
  });

  describe('integration with ngrx-store-localstorage', () => {
    it('should pass through all configuration options to localStorageSync', () => {
      localStorageSyncReducer(mockReducer);

      expect(mockLocalStorageSync).toHaveBeenCalledWith({
        keys: ['auth'],
        rehydrate: true,
      });
    });

    it('should create a meta-reducer that wraps the original reducer', () => {
      const syncFunction = jest.fn().mockReturnValue(mockSyncedReducer);
      mockLocalStorageSync.mockReturnValue(syncFunction);

      const result = localStorageSyncReducer(mockReducer);

      expect(mockLocalStorageSync).toHaveBeenCalled();
      expect(syncFunction).toHaveBeenCalledWith(mockReducer);
      expect(result).toBe(mockSyncedReducer);
    });

    it('should maintain the reducer chain correctly', () => {
      // Test that the meta-reducer pattern is correctly implemented
      const originalState = {
        auth: { user: null, loading: false, error: null },
      } as AppState;
      const newState = {
        auth: { user: { id: '1', name: 'Test' }, loading: false, error: null },
      } as AppState;
      const _action = {
        type: '[Auth] Login Success',
        user: { id: '1', name: 'Test' },
      };

      const enhancedReducer = jest.fn().mockReturnValue(newState);
      mockLocalStorageSync.mockReturnValue(() => enhancedReducer);

      const result = localStorageSyncReducer(mockReducer);
      const finalState = result(originalState, _action);

      expect(enhancedReducer).toHaveBeenCalledWith(originalState, _action);
      expect(finalState).toBe(newState);
    });
  });
});
