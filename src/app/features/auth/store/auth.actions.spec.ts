import * as AuthActions from './auth.actions';

describe('Auth Actions', () => {
  describe('login', () => {
    it('should create login action with username and password', () => {
      const username = 'testuser';
      const password = 'testpass';
      const action = AuthActions.login({ username, password });

      expect(action.type).toBe('[Auth] Login');
      expect(action.username).toBe(username);
      expect(action.password).toBe(password);
    });

    it('should create login action with empty credentials', () => {
      const username = '';
      const password = '';
      const action = AuthActions.login({ username, password });

      expect(action.type).toBe('[Auth] Login');
      expect(action.username).toBe('');
      expect(action.password).toBe('');
    });

    it('should create login action with special characters', () => {
      const username = 'user@example.com';
      const password = 'P@ssw0rd!';
      const action = AuthActions.login({ username, password });

      expect(action.type).toBe('[Auth] Login');
      expect(action.username).toBe(username);
      expect(action.password).toBe(password);
    });
  });

  describe('loginSuccess', () => {
    it('should create loginSuccess action with user data', () => {
      const user = { id: '123', name: 'John Doe' };
      const action = AuthActions.loginSuccess({ user });

      expect(action.type).toBe('[Auth] Login Success');
      expect(action.user).toEqual(user);
    });

    it('should create loginSuccess action with minimal user data', () => {
      const user = { id: '1', name: '' };
      const action = AuthActions.loginSuccess({ user });

      expect(action.type).toBe('[Auth] Login Success');
      expect(action.user).toEqual(user);
    });

    it('should preserve user object reference', () => {
      const user = { id: '456', name: 'Jane Smith' };
      const action = AuthActions.loginSuccess({ user });

      expect(action.user).toBe(user);
    });
  });

  describe('loginFailure', () => {
    it('should create loginFailure action with error message', () => {
      const error = 'Invalid credentials';
      const action = AuthActions.loginFailure({ error });

      expect(action.type).toBe('[Auth] Login Failure');
      expect(action.error).toBe(error);
    });

    it('should create loginFailure action with empty error', () => {
      const error = '';
      const action = AuthActions.loginFailure({ error });

      expect(action.type).toBe('[Auth] Login Failure');
      expect(action.error).toBe('');
    });

    it('should create loginFailure action with detailed error message', () => {
      const error = 'Network error: Unable to connect to authentication server';
      const action = AuthActions.loginFailure({ error });

      expect(action.type).toBe('[Auth] Login Failure');
      expect(action.error).toBe(error);
    });
  });

  describe('logout', () => {
    it('should create logout action without payload', () => {
      const action = AuthActions.logout();

      expect(action.type).toBe('[Auth] Logout');
      expect(Object.keys(action)).toEqual(['type']);
    });

    it('should create consistent logout action instances', () => {
      const action1 = AuthActions.logout();
      const action2 = AuthActions.logout();

      expect(action1.type).toBe(action2.type);
      expect(action1).toEqual(action2);
    });
  });

  describe('Action Type Safety', () => {
    it('should have correct action types as constants', () => {
      expect(
        AuthActions.login({ username: 'test', password: 'test' }).type,
      ).toBe('[Auth] Login');
      expect(
        AuthActions.loginSuccess({ user: { id: '1', name: 'test' } }).type,
      ).toBe('[Auth] Login Success');
      expect(AuthActions.loginFailure({ error: 'test' }).type).toBe(
        '[Auth] Login Failure',
      );
      expect(AuthActions.logout().type).toBe('[Auth] Logout');
    });

    it('should maintain payload structure integrity', () => {
      const loginAction = AuthActions.login({
        username: 'user',
        password: 'pass',
      });
      const successAction = AuthActions.loginSuccess({
        user: { id: '1', name: 'User' },
      });
      const failureAction = AuthActions.loginFailure({ error: 'Error' });

      // Verify payload properties exist and are correctly typed
      expect(typeof loginAction.username).toBe('string');
      expect(typeof loginAction.password).toBe('string');
      expect(typeof successAction.user.id).toBe('string');
      expect(typeof successAction.user.name).toBe('string');
      expect(typeof failureAction.error).toBe('string');
    });
  });
});
