// Set up test environment variables before any modules are loaded
process.env.SESSION_SECRET = 'test-secret-for-jest-tests-only';
process.env.NODE_ENV = 'test';
