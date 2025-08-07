import { AuthService } from './auth.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  it('should return user object on valid credentials', fakeAsync(() => {
    let result: {
      id: string;
      name: string;
    };
    service.login('user', 'pass').subscribe((res) => {
      result = res;
      expect(result).toEqual({ id: '1', name: 'user' });
    });
  }));

  it('should throw error on invalid credentials', fakeAsync(() => {
    let error: Error | undefined;
    service.login('wrong', 'credentials').subscribe({
      error: (err) => (error = err),
    });

    tick(1000);
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('Invalid credentials');
  }));
});
