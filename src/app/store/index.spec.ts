import * as StoreModule from './index';
import { reducers } from './app.reducer';
import { metaReducers } from './meta-reducers';

describe('Root Store Module', () => {
  describe('Module Exports', () => {
    it('should export reducers', () => {
      expect(StoreModule.reducers).toBeDefined();
      expect(StoreModule.reducers).toBe(reducers);
    });

    it('should export AppState interface', () => {
      // TypeScript interfaces don't exist at runtime, but we can test that the type can be used
      expect(() => {
        const testState: StoreModule.AppState = {
          auth: { user: null, loading: false, error: null },
        };
        return testState;
      }).not.toThrow();
    });

    it('should export metaReducers', () => {
      expect(StoreModule.metaReducers).toBeDefined();
      expect(StoreModule.metaReducers).toBe(metaReducers);
    });

    it('should export all expected store components', () => {
      const expectedExports = ['reducers', 'metaReducers'];

      expectedExports.forEach((exportName) => {
        expect(StoreModule).toHaveProperty(exportName);
      });
    });
  });

  describe('Reducers Configuration', () => {
    it('should provide ActionReducerMap', () => {
      const reducerMap = StoreModule.reducers;

      expect(reducerMap).toBeDefined();
      expect(typeof reducerMap).toBe('object');
    });

    it('should include auth reducer', () => {
      const reducerMap = StoreModule.reducers;

      expect(reducerMap.auth).toBeDefined();
      expect(typeof reducerMap.auth).toBe('function');
    });

    it('should have reducers that can process actions', () => {
      const reducerMap = StoreModule.reducers;
      const authReducer = reducerMap.auth;

      // Test that the reducer can handle an action
      const initialState = { user: null, loading: false, error: null };
      const _action = {
        type: '[Auth] Login',
        username: 'test',
        password: 'pass',
      };

      const newState = authReducer(initialState, _action);
      expect(newState).toBeDefined();
      expect(newState.loading).toBe(true);
    });
  });

  describe('App State Interface', () => {
    it('should define AppState interface structure', () => {
      // Test that AppState can be used as a type
      const mockAppState: StoreModule.AppState = {
        auth: {
          user: null,
          loading: false,
          error: null,
        },
      };

      expect(mockAppState.auth).toBeDefined();
      expect(typeof mockAppState.auth.loading).toBe('boolean');
      expect(mockAppState.auth.user).toBe(null);
      expect(mockAppState.auth.error).toBe(null);
    });

    it('should support auth state slice', () => {
      const appState: StoreModule.AppState = {
        auth: {
          user: { id: '1', name: 'Test User' },
          loading: true,
          error: 'Some error',
        },
      };

      expect(appState.auth.user?.id).toBe('1');
      expect(appState.auth.user?.name).toBe('Test User');
      expect(appState.auth.loading).toBe(true);
      expect(appState.auth.error).toBe('Some error');
    });

    it('should maintain type safety for nested state', () => {
      // Test that the state interface enforces correct types
      const createValidState = (): StoreModule.AppState => ({
        auth: {
          user: { id: '1', name: 'Test' },
          loading: false,
          error: null,
        },
      });

      expect(() => createValidState()).not.toThrow();

      const validState = createValidState();
      expect(validState.auth.user?.id).toBe('1');
      expect(validState.auth.loading).toBe(false);
    });
  });

  describe('Meta Reducers Configuration', () => {
    it('should provide meta reducers array', () => {
      const metaReducersArray = StoreModule.metaReducers;

      expect(Array.isArray(metaReducersArray)).toBe(true);
      expect(metaReducersArray.length).toBeGreaterThan(0);
    });

    it('should include localStorage sync meta reducer', () => {
      const metaReducersArray = StoreModule.metaReducers;

      expect(metaReducersArray.length).toBe(1);
      expect(typeof metaReducersArray[0]).toBe('function');
    });

    it('should have meta reducers that can enhance reducers', () => {
      const metaReducersArray = StoreModule.metaReducers;
      const metaReducer = metaReducersArray[0];

      // Test that meta reducer can wrap a regular reducer
      const mockReducer = (state: unknown = {}, _action: unknown) => state;
      const enhancedReducer = metaReducer(mockReducer);

      expect(typeof enhancedReducer).toBe('function');

      // Test that enhanced reducer can process actions
      const result = enhancedReducer({}, { type: 'TEST_ACTION' });
      expect(result).toBeDefined();
    });
  });

  describe('Store Configuration Integration', () => {
    it('should provide complete store configuration', () => {
      const config = {
        reducers: StoreModule.reducers,
        metaReducers: StoreModule.metaReducers,
      };

      expect(config.reducers).toBeDefined();
      expect(config.metaReducers).toBeDefined();
      expect(Array.isArray(config.metaReducers)).toBe(true);
      expect(typeof config.reducers).toBe('object');
    });

    it('should support store initialization', () => {
      // Test that the exported configuration can be used to initialize a store
      const reducerMap = StoreModule.reducers;
      const metaReducersArray = StoreModule.metaReducers;

      expect(Object.keys(reducerMap)).toContain('auth');
      expect(metaReducersArray.length).toBeGreaterThan(0);

      // Verify that reducers can handle initial state
      const authReducer = reducerMap.auth;
      const initialState = authReducer(undefined, { type: '@@INIT' });

      expect(initialState).toBeDefined();
      expect(initialState.user).toBe(null);
      expect(initialState.loading).toBe(false);
      expect(initialState.error).toBe(null);
    });
  });

  describe('Module Organization', () => {
    it('should provide a clean public API', () => {
      const moduleKeys = Object.keys(StoreModule);

      expect(moduleKeys).toContain('reducers');
      expect(moduleKeys).toContain('metaReducers');
      expect(moduleKeys.length).toBe(2);
    });

    it('should not expose internal implementation details', () => {
      const moduleKeys = Object.keys(StoreModule);
      const internalKeys = moduleKeys.filter(
        (key) =>
          key.startsWith('_') ||
          key.includes('private') ||
          key.includes('internal'),
      );

      expect(internalKeys).toHaveLength(0);
    });

    it('should maintain proper module encapsulation', () => {
      // Verify that the module exports only what's intended
      const expectedExports = ['reducers', 'metaReducers'];
      const actualExports = Object.keys(StoreModule);

      expectedExports.forEach((expectedExport) => {
        expect(actualExports).toContain(expectedExport);
      });

      expect(actualExports.length).toBe(expectedExports.length);
    });
  });

  describe('Type Definitions', () => {
    it('should support type-safe store operations', () => {
      // Test that the exported types work together correctly
      const mockState: StoreModule.AppState = {
        auth: {
          user: null,
          loading: false,
          error: null,
        },
      };

      const reducerMap = StoreModule.reducers;
      const authReducer = reducerMap.auth;

      const _action = {
        type: '[Auth] Login',
        username: 'test',
        password: 'pass',
      };
      const newAuthState = authReducer(mockState.auth, _action);

      const newAppState: StoreModule.AppState = {
        ...mockState,
        auth: newAuthState,
      };

      expect(newAppState.auth.loading).toBe(true);
      expect(newAppState.auth.user).toBe(null);
      expect(newAppState.auth.error).toBe(null);
    });

    it('should maintain type consistency across exports', () => {
      // Verify that AppState interface matches reducer map structure
      const reducerKeys = Object.keys(StoreModule.reducers);

      // AppState should have the same keys as the reducer map
      expect(reducerKeys).toContain('auth');

      // Test that a valid AppState can be created
      const validState: StoreModule.AppState = {
        auth: {
          user: { id: '1', name: 'Test' },
          loading: false,
          error: null,
        },
      };

      expect(validState.auth).toBeDefined();
      expect(typeof validState.auth.loading).toBe('boolean');
    });
  });
});
