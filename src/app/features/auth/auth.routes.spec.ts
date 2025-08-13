import { authRoutes } from './auth.routes';
import { AuthComponent } from './auth.component';

describe('Auth Routes', () => {
  it('should define authRoutes array', () => {
    expect(authRoutes).toBeDefined();
    expect(Array.isArray(authRoutes)).toBe(true);
    expect(authRoutes.length).toBeGreaterThan(0);
  });

  it('should have root auth route', () => {
    const rootRoute = authRoutes.find((route) => route.path === '');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.component).toBe(AuthComponent);
  });

  it('should have correct route structure', () => {
    expect(authRoutes).toEqual([{ path: '', component: AuthComponent }]);
  });

  it('should contain only expected routes', () => {
    const expectedPaths = [''];
    const actualPaths = authRoutes.map((route) => route.path);
    expect(actualPaths).toEqual(expectedPaths);
  });

  it('should have proper route configuration types', () => {
    authRoutes.forEach((route) => {
      expect(route).toHaveProperty('path');
      expect(typeof route.path).toBe('string');

      if (route.component) {
        expect(typeof route.component).toBe('function');
      }
    });
  });

  it('should not have duplicate paths', () => {
    const paths = authRoutes.map((route) => route.path);
    const uniquePaths = [...new Set(paths)];
    expect(paths.length).toBe(uniquePaths.length);
  });

  it('should map empty path to AuthComponent', () => {
    const emptyPathRoute = authRoutes.find((route) => route.path === '');
    expect(emptyPathRoute).toBeDefined();
    expect(emptyPathRoute?.component).toBe(AuthComponent);
  });

  it('should have valid component references', () => {
    authRoutes.forEach((route) => {
      if (route.component) {
        expect(route.component).toBeDefined();
        expect(typeof route.component).toBe('function');
        expect(route.component.name).toBeTruthy();
      }
    });
  });

  it('should not have any guards defined', () => {
    authRoutes.forEach((route) => {
      expect(route.canActivate).toBeUndefined();
      expect(route.canDeactivate).toBeUndefined();
      expect(route.canLoad).toBeUndefined();
      expect(route.canMatch).toBeUndefined();
    });
  });

  it('should not have any resolvers defined', () => {
    authRoutes.forEach((route) => {
      expect(route.resolve).toBeUndefined();
    });
  });

  it('should not have any redirects defined', () => {
    authRoutes.forEach((route) => {
      expect(route.redirectTo).toBeUndefined();
    });
  });

  it('should not have any lazy loading defined', () => {
    authRoutes.forEach((route) => {
      expect(route.loadChildren).toBeUndefined();
      expect(route.loadComponent).toBeUndefined();
    });
  });
});
