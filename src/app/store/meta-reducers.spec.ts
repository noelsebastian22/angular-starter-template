import { ActionReducer, MetaReducer } from '@ngrx/store';
import { metaReducers } from './meta-reducers';
import { localStorageSyncReducer } from '../core/state/local-storage-sync';
import { AppState } from './app.state';
import * as AuthActions from '../features/auth/store/auth.actions';
import { initialAuthState } from '../features/auth/store/auth.state';

describe('Meta Reducers', () => {
  describe('metaReducers configuration', () => {
    it('should be an array of MetaReducer functions', () => {
      expect(Array.isArray(metaReducers)).toBe(true);
      expect(metaReducers.length).toBeGreaterThan(0);
    });

    it('should contain localStorageSyncReducer', () => {
      expect(metaReducers).toContain(localStorageSyncReducer);
    });

    it('should have correct meta-reducer function signatures', () => {
      metaReducers.forEach((metaReducer) => {
        expect(typeof metaReducer).toBe('function');
        expect(metaReducer.length).toBe(1); // Should accept one parameter (reducer)
      });
    });
  });

  describe('meta-reducer functionality', () => {
    let mockReducer: jest.MockedFunction<ActionReducer<AppState>>;
    let mockState: AppState;

    beforeEach(() => {
      mockState = {
        auth: initialAuthState,
      };

      mockReducer = jest.fn().mockReturnValue(mockState);
    });

    it('should enhance reducer with localStorage sync functionality', () => {
      const enhancedReducer = localStorageSyncReducer(mockReducer);

      expect(typeof enhancedReducer).toBe('function');
      expect(enhancedReducer).not.toBe(mockReducer);
    });

    it('should call original reducer when enhanced reducer is invoked', () => {
      const enhancedReducer = localStorageSyncReducer(mockReducer);
      const _action = AuthActions.login({ username: 'test', password: 'test' });

      enhancedReducer(mockState, _action);

      expect(mockReducer).toHaveBeenCalledWith(mockState, _action);
    });

    it('should return state from original reducer', () => {
      const expectedState = {
        auth: { ...initialAuthState, loading: true },
      };
      mockReducer.mockReturnValue(expectedState);

      const enhancedReducer = localStorageSyncReducer(mockReducer);
      const _action = AuthActions.login({ username: 'test', password: 'test' });

      const result = enhancedReducer(mockState, _action);

      expect(result).toEqual(expectedState);
    });
  });

  describe('meta-reducer execution order', () => {
    it('should apply meta-reducers in correct order', () => {
      const mockReducer: ActionReducer<AppState> = (state, _action) =>
        state || mockState;
      const executionOrder: string[] = [];

      // Create test meta-reducers that track execution order
      const testMetaReducer1: MetaReducer<AppState> = (reducer) => {
        return (state, _action) => {
          executionOrder.push('meta1');
          return reducer(state, _action);
        };
      };

      const testMetaReducer2: MetaReducer<AppState> = (reducer) => {
        return (state, _action) => {
          executionOrder.push('meta2');
          return reducer(state, _action);
        };
      };

      // Apply meta-reducers in sequence (simulating NgRx behavior)
      // Meta-reducers are applied in reverse order (last one wraps first)
      const enhancedReducer = testMetaReducer2(testMetaReducer1(mockReducer));

      const mockState = { auth: initialAuthState };
      const _action = { type: 'TEST_ACTION' };

      enhancedReducer(mockState, _action);

      expect(executionOrder).toEqual(['meta2', 'meta1']);
    });
  });

  describe('localStorage sync integration', () => {
    let mockLocalStorage: Record<string, string>;

    beforeEach(() => {
      mockLocalStorage = {};

      jest.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
        return mockLocalStorage[key] || null;
      });

      jest
        .spyOn(localStorage, 'setItem')
        .mockImplementation((key: string, value: string) => {
          mockLocalStorage[key] = value;
        });
    });

    it('should integrate with localStorage sync meta-reducer', () => {
      const mockReducer: ActionReducer<AppState> = (state, action) => {
        if (action.type === 'TEST_UPDATE') {
          return {
            ...state!,
            auth: {
              ...state!.auth,
              user: { id: '1', name: 'Test', email: 'test@test.com' },
            },
          };
        }
        return state || { auth: initialAuthState };
      };

      const enhancedReducer = localStorageSyncReducer(mockReducer);
      const initialState = { auth: initialAuthState };

      // Trigger state change
      const result = enhancedReducer(initialState, { type: 'TEST_UPDATE' });

      expect(result).toBeDefined();
      expect(result.auth.user).toEqual({
        id: '1',
        name: 'Test',
        email: 'test@test.com',
      });
    });
  });

  describe('state transformation', () => {
    it('should preserve state structure through meta-reducer chain', () => {
      const originalState: AppState = {
        auth: { ...initialAuthState, loading: true },
      };

      const mockReducer: ActionReducer<AppState> = (state, _action) => {
        return state || originalState;
      };

      const enhancedReducer = localStorageSyncReducer(mockReducer);
      const result = enhancedReducer(originalState, { type: 'INIT' });

      expect(result).toBeDefined();
      expect(result.auth).toBeDefined();
      expect(result.auth.loading).toBe(true);
    });

    it('should handle undefined state correctly', () => {
      const mockReducer: ActionReducer<AppState> = (state, _action) => {
        return state || { auth: initialAuthState };
      };

      const enhancedReducer = localStorageSyncReducer(mockReducer);

      // Test that the enhanced reducer is callable and doesn't throw
      expect(typeof enhancedReducer).toBe('function');
      expect(() => enhancedReducer(undefined, { type: 'INIT' })).not.toThrow();
    });
  });
});
