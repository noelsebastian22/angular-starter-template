import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ResourceService } from './resource.abstract';

interface User {
  id: string;
  name: string;
}

// Concrete test service extending your abstract ResourceService
@Injectable()
class UsersService extends ResourceService<User> {
  constructor() {
    // common headers we want on every request from this service
    super('users', { 'X-Common': 'common-value' });
  }

  // proxy a couple methods so tests are readable
  listUsers() {
    return this.list<User>();
  }

  getUser(id: string) {
    return this.getById<User>(id);
  }

  createUser(body: Partial<User>) {
    return this.create<User>(body);
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

describe('ResourceService (abstract) via UsersService', () => {
  let service: UsersService;
  let http: HttpTestingController;

  const base = environment.apiUrl.replace(/\/+$/, ''); // strip trailing slash to match service

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UsersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('builds URLs with baseUrl + resourcePath + segments', () => {
    service.getUser('42').subscribe();

    const req = http.expectOne(`${base}/users/42`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: '42', name: 'Zed' });
  });

  it('merges common headers with per-request headers (per-request can override)', () => {
    // 1) First request: customSearch
    service.customSearch('neo').subscribe();

    const req1 = http.expectOne(
      (req) =>
        req.url === `${base}/users` &&
        req.method === 'GET' &&
        req.params.get('q') === 'neo' &&
        req.params.get('page') === '1' &&
        req.params.get('includeInactive') === 'false',
    );

    expect(req1.request.headers.get('X-Common')).toBe('common-value');
    expect(req1.request.headers.get('X-Request-ID')).toBe('req-123');

    // 🔴 IMPORTANT: flush the response so it doesn't remain open
    req1.flush([{ id: '1', name: 'Neo' }]);

    // 2) Second request: headerOverride
    service.headerOverride().subscribe();

    const req2 = http.expectOne(
      (req) => req.url === `${base}/users` && req.method === 'GET',
    );

    expect(req2.request.headers.get('X-Common')).toBe('overridden');
    expect(req2.request.headers.get('X-Extra')).toBe('extra');

    // Flush the second one too
    req2.flush([]);
  });

  it('supports CRUD helpers (list/create/update/delete)', () => {
    // list
    service.listUsers().subscribe();
    const listReq = http.expectOne(`${base}/users`);
    expect(listReq.request.method).toBe('GET');
    listReq.flush([]);

    // create
    service.createUser({ name: 'Alice' }).subscribe();
    const createReq = http.expectOne(`${base}/users`);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual({ name: 'Alice' });
    createReq.flush({ id: '100', name: 'Alice' });

    // update
    service.update<User>('100', { name: 'Alicia' }).subscribe();
    const updateReq = http.expectOne(`${base}/users/100`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual({ name: 'Alicia' });
    updateReq.flush({ id: '100', name: 'Alicia' });

    // delete
    service.delete('100').subscribe();
    const delReq = http.expectOne(`${base}/users/100`);
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush(null);
  });
});
