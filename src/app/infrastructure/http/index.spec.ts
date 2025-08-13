import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as HttpModule from './index';
import { ResourceService } from './resource.abstract';

describe('Infrastructure HTTP Module', () => {
  describe('Module Exports', () => {
    it('should export ResourceService', () => {
      expect(HttpModule.ResourceService).toBeDefined();
      expect(HttpModule.ResourceService).toBe(ResourceService);
    });

    it('should export all expected members', () => {
      const expectedExports = ['ResourceService'];

      expectedExports.forEach((exportName) => {
        expect(HttpModule).toHaveProperty(exportName);
      });
    });
  });

  describe('ResourceService Export', () => {
    it('should be an abstract class', () => {
      expect(() => new (ResourceService as unknown)()).toThrow();
    });

    it('should be constructable through inheritance with proper DI setup', () => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });

      class TestResourceService extends ResourceService<unknown> {
        constructor() {
          super('test-resource');
        }
      }

      expect(() => {
        TestBed.runInInjectionContext(() => {
          return new TestResourceService();
        });
      }).not.toThrow();
    });

    it('should have expected public methods when properly instantiated', () => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });

      class TestResourceService extends ResourceService<unknown> {
        constructor() {
          super('test-resource');
        }
      }

      const instance = TestBed.runInInjectionContext(() => {
        return new TestResourceService();
      });

      const expectedMethods = [
        'list',
        'getById',
        'create',
        'update',
        'patch',
        'delete',
      ];

      expectedMethods.forEach((method) => {
        expect(typeof instance[method]).toBe('function');
      });
    });

    it('should support generic type parameters', () => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });

      interface TestModel {
        id: number;
        name: string;
      }

      class TestResourceService extends ResourceService<TestModel> {
        constructor() {
          super('test-resource');
        }
      }

      const instance = TestBed.runInInjectionContext(() => {
        return new TestResourceService();
      });

      expect(instance).toBeInstanceOf(ResourceService);
    });
  });

  describe('Module Interface', () => {
    it('should provide a clean public API', () => {
      const moduleKeys = Object.keys(HttpModule);
      expect(moduleKeys.length).toBeGreaterThan(0);
      expect(moduleKeys).toContain('ResourceService');
    });

    it('should not expose internal implementation details', () => {
      // Verify that only intended exports are available
      const moduleKeys = Object.keys(HttpModule);
      const internalKeys = moduleKeys.filter(
        (key) =>
          key.startsWith('_') ||
          key.includes('private') ||
          key.includes('internal'),
      );

      expect(internalKeys).toHaveLength(0);
    });
  });

  describe('Type Definitions', () => {
    it('should export types that can be used for inheritance', () => {
      // Test that the exported ResourceService can be extended
      expect(() => {
        class ConcreteService extends HttpModule.ResourceService<{
          id: string;
        }> {
          constructor() {
            super('concrete');
          }
        }
        return ConcreteService;
      }).not.toThrow();
    });

    it('should maintain type safety for generic parameters', () => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });

      interface User {
        id: string;
        email: string;
      }

      class UserService extends HttpModule.ResourceService<User> {
        constructor() {
          super('users');
        }
      }

      const userService = TestBed.runInInjectionContext(() => {
        return new UserService();
      });

      expect(userService).toBeInstanceOf(HttpModule.ResourceService);
    });
  });
});
