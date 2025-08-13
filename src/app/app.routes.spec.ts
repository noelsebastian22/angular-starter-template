import { routes } from './app.routes';

describe('App Routes', () => {
  it('should define routes array', () => {
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should have root redirect route', () => {
    const rootRoute = routes.find((route) => route.path === '');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.redirectTo).toBe('/auth');
    expect(rootRoute?.pathMatch).toBe('full');
  });

  it('should have auth route with lazy loading', () => {
    const authRoute = routes.find((route) => route.path === 'auth');
    expect(authRoute).toBeDefined();
    expect(authRoute?.loadChildren).toBeDefined();
    expect(typeof authRoute?.loadChildren).toBe('function');
  });

  it('should load auth routes lazily', async () => {
    const authRoute = routes.find((route) => route.path === 'auth');
    expect(authRoute?.loadChildren).toBeDefined();

    if (
      authRoute?.loadChildren &&
      typeof authRoute.loadChildren === 'function'
    ) {
      const lazyModule = await authRoute.loadChildren();
      expect(lazyModule).toBeDefined();
      // The lazy loading function returns an object with authRoutes property
      expect(typeof lazyModule).toBe('object');
    }
  });

  it('should have correct route structure', () => {
    expect(routes.length).toBe(2);
    expect(routes[0]).toEqual({
      path: '',
      redirectTo: '/auth',
      pathMatch: 'full',
    });
    expect(routes[1].path).toBe('auth');
    expect(typeof routes[1].loadChildren).toBe('function');
  });

  it('should contain only expected routes', () => {
    const expectedPaths = ['', 'auth'];
    const actualPaths = routes.map((route) => route.path);
    expect(actualPaths).toEqual(expectedPaths);
  });

  it('should have proper route configuration types', () => {
    routes.forEach((route) => {
      expect(route).toHaveProperty('path');
      expect(typeof route.path).toBe('string');

      if (route.redirectTo) {
        expect(typeof route.redirectTo).toBe('string');
      }

      if (route.pathMatch) {
        expect(typeof route.pathMatch).toBe('string');
      }

      if (route.loadChildren) {
        expect(typeof route.loadChildren).toBe('function');
      }
    });
  });

  it('should not have duplicate paths', () => {
    const paths = routes.map((route) => route.path);
    const uniquePaths = [...new Set(paths)];
    expect(paths.length).toBe(uniquePaths.length);
  });

  it('should have valid redirect configuration', () => {
    const redirectRoute = routes.find((route) => route.redirectTo);
    expect(redirectRoute).toBeDefined();
    expect(redirectRoute?.path).toBe('');
    expect(redirectRoute?.redirectTo).toBe('/auth');
    expect(redirectRoute?.pathMatch).toBe('full');
  });
});
