import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ResourceService,
  RequestOptions,
  HttpMethod,
} from './resource.abstract';

interface User {
  id: string;
  name: string;
  email?: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
}

// Concrete test service extending ResourceService with common headers
@Injectable()
class UsersService extends ResourceService<User> {
  constructor() {
    super('users', { 'X-Common': 'common-value' });
  }

  // Proxy methods for testing
  listUsers(options?: RequestOptions) {
    return this.list<User>(options);
  }

  getUser(id: string, options?: RequestOptions) {
    return this.getById<User>(id, options);
  }

  createUser(body: Partial<User> | null, options?: RequestOptions) {
    return this.create<User>(body, options);
  }

  updateUser(id: string, body: Partial<User>, options?: RequestOptions) {
    return this.update<User>(id, body, options);
  }

  patchUser(id: string, body: Partial<User>, options?: RequestOptions) {
    return this.patch<User>(id, body, options);
  }

  deleteUser(id: string, options?: RequestOptions) {
    return this.delete(id, options);
  }

  // Expose protected methods for testing
  public testUrl(...segments: (string | number)[]): string {
    return this.url(...segments);
  }

  public testRequest<T>(
    method: HttpMethod,
    url: string,
    options: RequestOptions,
  ) {
    return this.request<T>(method, url, options);
  }

  customSearch(q: string) {
    return this.list<User>({
      params: { q, page: 1, includeInactive: false },
      headers: { 'X-Request-ID': 'req-123' },
    });
  }

  headerOverride() {
    return this.list<User>({
      headers: { 'X-Common': 'overridden', 'X-Extra': 'extra' },
    });
  }
}

// Service without common headers for testing
@Injectable()
class ProductsService extends ResourceService<Product> {
  constructor() {
    super('products');
  }

  listProducts() {
    return this.list<Product>();
  }

  getProduct(id: number) {
    return this.getById<Product>(id);
  }

  // Expose protected methods for testing
  public testUrl(...segments: (string | number)[]): string {
    return this.url(...segments);
  }
}

// Service with nested resource path
@Injectable()
class NestedService extends ResourceService<unknown> {
  constructor() {
    super('api/v1/nested/resources', { 'X-Version': 'v1' });
  }

  public testUrl(...segments: (string | number)[]): string {
    return this.url(...segments);
  }
}

describe('ResourceService (abstract)', () => {
  let usersService: UsersService;
  let productsService: ProductsService;
  let nestedService: NestedService;
  let http: HttpTestingController;

  const base = environment.apiUrl.replace(/\/+$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersService,
        ProductsService,
        NestedService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    usersService = TestBed.inject(UsersService);
    productsService = TestBed.inject(ProductsService);
    nestedService = TestBed.inject(NestedService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with resource path and common headers', () => {
      expect(usersService).toBeTruthy();
      expect(usersService['resourcePath']).toBe('users');
      expect(usersService['commonHeaders']).toEqual({
        'X-Common': 'common-value',
      });
    });

    it('should initialize without common headers', () => {
      expect(productsService).toBeTruthy();
      expect(productsService['resourcePath']).toBe('products');
      expect(productsService['commonHeaders']).toBeUndefined();
    });

    it('should initialize with nested resource path', () => {
      expect(nestedService).toBeTruthy();
      expect(nestedService['resourcePath']).toBe('api/v1/nested/resources');
      expect(nestedService['commonHeaders']).toEqual({ 'X-Version': 'v1' });
    });

    it('should inject HttpClient', () => {
      expect(usersService['http']).toBeTruthy();
    });

    it('should set baseUrl from environment', () => {
      expect(usersService['baseUrl']).toBe(base);
    });
  });

  describe('URL Building', () => {
    it('should build basic URL with resource path', () => {
      const url = usersService.testUrl();
      expect(url).toBe(`${base}/users`);
    });

    it('should build URL with single segment', () => {
      const url = usersService.testUrl('42');
      expect(url).toBe(`${base}/users/42`);
    });

    it('should build URL with multiple segments', () => {
      const url = usersService.testUrl('42', 'profile', 'avatar');
      expect(url).toBe(`${base}/users/42/profile/avatar`);
    });

    it('should build URL with numeric segments', () => {
      const url = productsService.testUrl(123, 'reviews', 456);
      expect(url).toBe(`${base}/products/123/reviews/456`);
    });

    it('should handle empty segments', () => {
      const url = usersService.testUrl('', '42', '', 'profile');
      expect(url).toBe(`${base}/users/42/profile`);
    });

    it('should strip leading and trailing slashes from segments', () => {
      const url = usersService.testUrl('/42/', '/profile/', '/avatar/');
      expect(url).toBe(`${base}/users/42/profile/avatar`);
    });

    it('should handle nested resource paths', () => {
      const url = nestedService.testUrl('item', 123);
      expect(url).toBe(`${base}/api/v1/nested/resources/item/123`);
    });

    it('should handle zero as valid segment', () => {
      const url = usersService.testUrl(0);
      expect(url).toBe(`${base}/users/0`);
    });
  });

  describe('CRUD Operations', () => {
    describe('list()', () => {
      it('should make GET request to resource URL', () => {
        usersService.listUsers().subscribe();

        const req = http.expectOne(`${base}/users`);
        expect(req.request.method).toBe('GET');
        expect(req.request.body).toBeNull();
        req.flush([{ id: '1', name: 'User 1' }]);
      });

      it('should handle empty options', () => {
        usersService.listUsers({}).subscribe();

        const _req = http.expectOne(`${base}/users`);
        expect(_req.request.method).toBe('GET');
        _req.flush([]);
      });

      it('should include query parameters', () => {
        usersService
          .listUsers({
            params: { page: 1, limit: 10, active: true },
          })
          .subscribe();

        const _req = http.expectOne(
          (r) =>
            r.url === `${base}/users` &&
            r.params.get('page') === '1' &&
            r.params.get('limit') === '10' &&
            r.params.get('active') === 'true',
        );
        expect(_req.request.method).toBe('GET');
        _req.flush([]);
      });

      it('should include custom headers', () => {
        usersService
          .listUsers({
            headers: { 'X-Custom': 'custom-value' },
          })
          .subscribe();

        const _req = http.expectOne(`${base}/users`);
        expect(_req.request.headers.get('X-Custom')).toBe('custom-value');
        _req.flush([]);
      });

      it('should ignore body parameter', () => {
        usersService
          .listUsers({
            body: { ignored: 'data' },
          })
          .subscribe();

        const _req = http.expectOne(`${base}/users`);
        expect(_req.request.body).toBeNull();
        _req.flush([]);
      });
    });

    describe('getById()', () => {
      it('should make GET request with string ID', () => {
        usersService.getUser('42').subscribe();

        const _req = http.expectOne(`${base}/users/42`);
        expect(_req.request.method).toBe('GET');
        expect(_req.request.body).toBeNull();
        _req.flush({ id: '42', name: 'User 42' });
      });

      it('should make GET request with numeric ID', () => {
        productsService.getProduct(123).subscribe();

        const _req = http.expectOne(`${base}/products/123`);
        expect(_req.request.method).toBe('GET');
        _req.flush({ id: 123, title: 'Product 123', price: 99.99 });
      });

      it('should include options', () => {
        usersService
          .getUser('42', {
            params: { include: 'profile' },
            headers: { 'X-Include': 'profile' },
          })
          .subscribe();

        const _req = http.expectOne(
          (r) =>
            r.url === `${base}/users/42` &&
            r.params.get('include') === 'profile',
        );
        expect(_req.request.headers.get('X-Include')).toBe('profile');
        _req.flush({ id: '42', name: 'User 42' });
      });

      it('should ignore body parameter', () => {
        usersService
          .getUser('42', {
            body: { ignored: 'data' },
          })
          .subscribe();

        const _req = http.expectOne(`${base}/users/42`);
        expect(_req.request.body).toBeNull();
        _req.flush({ id: '42', name: 'User 42' });
      });
    });

    describe('create()', () => {
      it('should make POST request with body', () => {
        const userData = { name: 'New User', email: 'new@example.com' };
        usersService.createUser(userData).subscribe();

        const _req = http.expectOne(`${base}/users`);
        expect(_req.request.method).toBe('POST');
        expect(_req.request.body).toEqual(userData);
        _req.flush({ id: '100', ...userData });
      });

      it('should include options', () => {
        const userData = { name: 'New User' };
        usersService
          .createUser(userData, {
            params: { notify: true },
            headers: { 'X-Notify': 'true' },
          })
          .subscribe();

        const _req = http.expectOne(
          (r) => r.url === `${base}/users` && r.params.get('notify') === 'true',
        );
        expect(_req.request.headers.get('X-Notify')).toBe('true');
        expect(_req.request.body).toEqual(userData);
        _req.flush({ id: '100', ...userData });
      });

      it('should handle null body', () => {
        usersService.createUser(null).subscribe();

        const _req = http.expectOne(`${base}/users`);
        expect(_req.request.body).toBeNull();
        _req.flush({ id: '100' });
      });

      it('should handle empty object body', () => {
        usersService.createUser({}).subscribe();

        const _req = http.expectOne(`${base}/users`);
        expect(_req.request.body).toEqual({});
        _req.flush({ id: '100' });
      });
    });

    describe('update()', () => {
      it('should make PUT request with string ID', () => {
        const userData = { name: 'Updated User' };
        usersService.updateUser('42', userData).subscribe();

        const req = http.expectOne(`${base}/users/42`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(userData);
        req.flush({ id: '42', ...userData });
      });

      it('should make PUT request with numeric ID', () => {
        const productData = { title: 'Updated Product', price: 199.99 };
        productsService['update'](123, productData).subscribe();

        const req = http.expectOne(`${base}/products/123`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(productData);
        req.flush({ id: 123, ...productData });
      });

      it('should include options', () => {
        const userData = { name: 'Updated User' };
        usersService
          .updateUser('42', userData, {
            params: { validate: false },
            headers: { 'X-Validate': 'false' },
          })
          .subscribe();

        const req = http.expectOne(
          (r) =>
            r.url === `${base}/users/42` &&
            r.params.get('validate') === 'false',
        );
        expect(req.request.headers.get('X-Validate')).toBe('false');
        req.flush({ id: '42', ...userData });
      });
    });

    describe('patch()', () => {
      it('should make PATCH request with string ID', () => {
        const userData = { name: 'Patched User' };
        usersService.patchUser('42', userData).subscribe();

        const req = http.expectOne(`${base}/users/42`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(userData);
        req.flush({ id: '42', name: 'Patched User' });
      });

      it('should make PATCH request with numeric ID', () => {
        const productData = { price: 299.99 };
        productsService['patch'](123, productData).subscribe();

        const req = http.expectOne(`${base}/products/123`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(productData);
        req.flush({ id: 123, price: 299.99 });
      });

      it('should include options', () => {
        const userData = { email: 'patched@example.com' };
        usersService
          .patchUser('42', userData, {
            params: { partial: true },
            headers: { 'X-Partial': 'true' },
          })
          .subscribe();

        const req = http.expectOne(
          (r) =>
            r.url === `${base}/users/42` && r.params.get('partial') === 'true',
        );
        expect(req.request.headers.get('X-Partial')).toBe('true');
        req.flush({ id: '42', email: 'patched@example.com' });
      });
    });

    describe('delete()', () => {
      it('should make DELETE request with string ID', () => {
        usersService.deleteUser('42').subscribe();

        const req = http.expectOne(`${base}/users/42`);
        expect(req.request.method).toBe('DELETE');
        expect(req.request.body).toBeNull();
        req.flush(null);
      });

      it('should make DELETE request with numeric ID', () => {
        productsService['delete'](123).subscribe();

        const req = http.expectOne(`${base}/products/123`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
      });

      it('should include options', () => {
        usersService
          .deleteUser('42', {
            params: { force: true },
            headers: { 'X-Force': 'true' },
          })
          .subscribe();

        const req = http.expectOne(
          (r) =>
            r.url === `${base}/users/42` && r.params.get('force') === 'true',
        );
        expect(req.request.headers.get('X-Force')).toBe('true');
        req.flush(null);
      });

      it('should ignore body parameter', () => {
        usersService
          .deleteUser('42', {
            body: { ignored: 'data' },
          })
          .subscribe();

        const req = http.expectOne(`${base}/users/42`);
        expect(req.request.body).toBeNull();
        req.flush(null);
      });
    });
  });

  describe('Parameter Handling', () => {
    it('should handle HttpParams object', () => {
      const params = new HttpParams().set('page', '1').set('limit', '10');

      usersService.listUsers({ params }).subscribe();

      const req = http.expectOne(
        (r) =>
          r.url === `${base}/users` &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '10',
      );
      req.flush([]);
    });

    it('should handle record object params', () => {
      usersService
        .listUsers({
          params: { page: 1, limit: 10, active: true, search: 'test' },
        })
        .subscribe();

      const req = http.expectOne(
        (r) =>
          r.url === `${base}/users` &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '10' &&
          r.params.get('active') === 'true' &&
          r.params.get('search') === 'test',
      );
      req.flush([]);
    });

    it('should handle null and undefined params', () => {
      usersService
        .listUsers({
          params: { page: 1, limit: null, active: undefined, search: 'test' },
        })
        .subscribe();

      const req = http.expectOne(
        (r) =>
          r.url === `${base}/users` &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === null &&
          r.params.get('active') === null &&
          r.params.get('search') === 'test',
      );
      req.flush([]);
    });

    it('should handle boolean params', () => {
      usersService
        .listUsers({
          params: { active: true, deleted: false },
        })
        .subscribe();

      const req = http.expectOne(
        (r) =>
          r.url === `${base}/users` &&
          r.params.get('active') === 'true' &&
          r.params.get('deleted') === 'false',
      );
      req.flush([]);
    });

    it('should handle number params', () => {
      usersService
        .listUsers({
          params: { page: 1, limit: 10, offset: 0 },
        })
        .subscribe();

      const req = http.expectOne(
        (r) =>
          r.url === `${base}/users` &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '10' &&
          r.params.get('offset') === '0',
      );
      req.flush([]);
    });
  });

  describe('Header Handling', () => {
    it('should merge common headers with request headers', () => {
      usersService.customSearch('neo').subscribe();

      const req = http.expectOne(
        (r) => r.url === `${base}/users` && r.params.get('q') === 'neo',
      );
      expect(req.request.headers.get('X-Common')).toBe('common-value');
      expect(req.request.headers.get('X-Request-ID')).toBe('req-123');
      req.flush([]);
    });

    it('should allow request headers to override common headers', () => {
      usersService.headerOverride().subscribe();

      const req = http.expectOne(`${base}/users`);
      expect(req.request.headers.get('X-Common')).toBe('overridden');
      expect(req.request.headers.get('X-Extra')).toBe('extra');
      req.flush([]);
    });

    it('should handle HttpHeaders object', () => {
      const headers = new HttpHeaders()
        .set('X-Custom', 'custom-value')
        .set('Authorization', 'Bearer token');

      usersService.listUsers({ headers }).subscribe();

      const req = http.expectOne(`${base}/users`);
      expect(req.request.headers.get('X-Custom')).toBe('custom-value');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token');
      expect(req.request.headers.get('X-Common')).toBe('common-value');
      req.flush([]);
    });

    it('should handle record object headers', () => {
      usersService
        .listUsers({
          headers: {
            'X-Custom': 'custom-value',
            Authorization: 'Bearer token',
          },
        })
        .subscribe();

      const req = http.expectOne(`${base}/users`);
      expect(req.request.headers.get('X-Custom')).toBe('custom-value');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token');
      expect(req.request.headers.get('X-Common')).toBe('common-value');
      req.flush([]);
    });

    it('should work without common headers', () => {
      productsService.listProducts().subscribe();

      const req = http.expectOne(`${base}/products`);
      expect(req.request.headers.get('X-Common')).toBeNull();
      req.flush([]);
    });

    it('should handle empty headers object', () => {
      usersService.listUsers({ headers: {} }).subscribe();

      const req = http.expectOne(`${base}/users`);
      expect(req.request.headers.get('X-Common')).toBe('common-value');
      req.flush([]);
    });
  });

  describe('Request Method', () => {
    it('should handle all HTTP methods', () => {
      // Test each method through the protected request method
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

      methods.forEach((method) => {
        usersService.testRequest(method, `${base}/users/test`, {}).subscribe();

        const req = http.expectOne(`${base}/users/test`);
        expect(req.request.method).toBe(method);
        req.flush(method === 'DELETE' ? null : { result: 'success' });
      });
    });

    it('should pass through request options correctly', () => {
      const body = { test: 'data' };
      const params = { param1: 'value1' };
      const headers = { 'X-Test': 'test-value' };

      usersService
        .testRequest('POST', `${base}/users/test`, {
          body,
          params,
          headers,
        })
        .subscribe();

      const req = http.expectOne(
        (r) =>
          r.url === `${base}/users/test` && r.params.get('param1') === 'value1',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      expect(req.request.headers.get('X-Test')).toBe('test-value');
      expect(req.request.headers.get('X-Common')).toBe('common-value');
      req.flush({ result: 'success' });
    });
  });

  describe('Error Scenarios', () => {
    it('should propagate HTTP errors', () => {
      let error!: HttpErrorResponse;

      usersService.getUser('404').subscribe({
        next: () => fail('Should have failed'),
        error: (err) => (error = err),
      });

      const _req = http.expectOne(`${base}/users/404`);
      _req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(error).toBeInstanceOf(HttpErrorResponse);
      expect(error.status).toBe(404);
    });

    it('should handle network errors', () => {
      let error: unknown;

      usersService.listUsers().subscribe({
        next: () => fail('Should have failed'),
        error: (err) => (error = err),
      });

      const _req = http.expectOne(`${base}/users`);
      _req.error(new ProgressEvent('Network error'));

      expect(error).toBeInstanceOf(HttpErrorResponse);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined options', () => {
      usersService.listUsers(undefined).subscribe();

      const req = http.expectOne(`${base}/users`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle complex nested paths', () => {
      const url = nestedService.testUrl('users', 42, 'posts', 123, 'comments');
      expect(url).toBe(
        `${base}/api/v1/nested/resources/users/42/posts/123/comments`,
      );
    });
  });
});

// Separate test suites for edge cases that need their own TestBed configuration
describe('ResourceService (abstract) - Empty Path Edge Case', () => {
  @Injectable()
  class EmptyPathService extends ResourceService<unknown> {
    constructor() {
      super('');
    }

    public testUrl(...segments: (string | number)[]): string {
      return this.url(...segments);
    }
  }

  let service: EmptyPathService;
  const base = environment.apiUrl.replace(/\/+$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmptyPathService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(EmptyPathService);
  });

  it('should handle empty resource path', () => {
    const url = service.testUrl('test');
    expect(url).toBe(`${base}/test`);
  });
});

describe('ResourceService (abstract) - Slash Path Edge Case', () => {
  @Injectable()
  class SlashPathService extends ResourceService<unknown> {
    constructor() {
      super('/api/v1/users/');
    }

    public testUrl(...segments: (string | number)[]): string {
      return this.url(...segments);
    }
  }

  let service: SlashPathService;
  const base = environment.apiUrl.replace(/\/+$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SlashPathService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SlashPathService);
  });

  it('should handle resource path with slashes', () => {
    const url = service.testUrl('42');
    expect(url).toBe(`${base}/api/v1/users/42`);
  });
});
