/**
 * Test data fixtures for E2E tests
 */

export const testUsers = {
  validUser: {
    username: 'test-user',
    password: 'mock-password',
    email: 'test@example.com',
    name: 'Test User',
  },
  invalidUser: {
    username: 'invalid-user',
    password: 'wrong-password',
    email: 'invalid@example.com',
  },
  adminUser: {
    username: 'admin-user',
    password: 'admin-password',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  },
};

export const mockApiResponses = {
  loginSuccess: {
    user: {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    },
    token: 'mock-jwt-token',
  },
  loginFailure: {
    error: 'Invalid credentials',
    message: 'Username or password is incorrect',
  },
  userProfile: {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
      theme: 'light',
      language: 'en',
    },
  },
};

export const testRoutes = {
  home: '/',
  auth: '/auth',
  login: '/auth/login',
  register: '/auth/register',
  profile: '/profile',
  dashboard: '/dashboard',
  notFound: '/non-existent-route',
};

export const selectors = {
  auth: {
    usernameInput: 'input[name="username"], input[type="text"]',
    passwordInput: 'input[name="password"], input[type="password"]',
    emailInput: 'input[name="email"], input[type="email"]',
    submitButton: 'button[type="submit"]',
    loginButton: 'button:has-text("Login"), button:has-text("Sign In")',
    registerButton: 'button:has-text("Register"), button:has-text("Sign Up")',
    errorMessage: '.error, .invalid, [class*="error"], [role="alert"]',
    successMessage: '.success, [class*="success"], [role="status"]',
  },
  navigation: {
    navMenu: 'nav, [role="navigation"]',
    navLinks: 'nav a, [role="navigation"] a',
    homeLink: 'a[href="/"], a:has-text("Home")',
    authLink: 'a[href*="auth"], a:has-text("Login"), a:has-text("Sign In")',
    profileLink: 'a[href*="profile"], a:has-text("Profile")',
    logoutButton: 'button:has-text("Logout"), button:has-text("Sign Out")',
  },
  common: {
    loadingSpinner: '.spinner, .loading, [class*="loading"]',
    modal: '.modal, [role="dialog"]',
    closeButton: 'button:has-text("Close"), .close, [aria-label="Close"]',
    confirmButton: 'button:has-text("Confirm"), button:has-text("OK")',
    cancelButton: 'button:has-text("Cancel")',
  },
};

export const testContent = {
  pageTitle: 'Angular Starter Template',
  welcomeMessage: 'Welcome',
  loginTitle: 'Login',
  registerTitle: 'Register',
  errorMessages: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email',
    invalidCredentials: 'Invalid username or password',
    networkError: 'Network error occurred',
  },
  successMessages: {
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    profileUpdated: 'Profile updated successfully',
  },
};
