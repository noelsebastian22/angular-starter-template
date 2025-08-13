import * as CoreModule from './index';
import { localStorageSyncReducer } from './state/local-storage-sync';

describe('Core Module Exports', () => {
  describe('module barrel exports', () => {
    it('should export localStorageSyncReducer from state module', () => {
      expect(CoreModule.localStorageSyncReducer).toBeDefined();
      expect(typeof CoreModule.localStorageSyncReducer).toBe('function');
    });

    it('should export the same localStorageSyncReducer function', () => {
      expect(CoreModule.localStorageSyncReducer).toBe(localStorageSyncReducer);
    });
  });

  describe('public API accessibility', () => {
    it('should make all state utilities accessible through barrel export', () => {
      // Verify that all expected exports from state module are available
      expect(CoreModule.localStorageSyncReducer).toBeDefined();
    });

    it('should provide a clean public interface', () => {
      const exports = Object.keys(CoreModule);
      expect(exports.length).toBeGreaterThan(0);
      expect(exports).toContain('localStorageSyncReducer');
    });
  });

  describe('module organization', () => {
    it('should re-export state module functionality', () => {
      // Test that the barrel export properly forwards the state module exports
      expect(CoreModule.localStorageSyncReducer).toBe(localStorageSyncReducer);
    });

    it('should maintain consistent export structure', () => {
      // Ensure the module exports are properly structured
      const exportedFunctions = Object.keys(CoreModule).filter(
        (key) =>
          typeof CoreModule[key as keyof typeof CoreModule] === 'function',
      );

      expect(exportedFunctions).toContain('localStorageSyncReducer');
    });
  });
});
