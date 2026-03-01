const request = require('supertest');
const app = require('../src/server');

describe('Authentication', () => {
  let apiKey;
  const testEmail = 'test_' + Date.now() + '@example.com';
  const testPassword = 'testpass123'; // Must be 8+ characters

  test('POST /auth/signup - should create new user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ email: testEmail, password: testPassword, name: 'Test User' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.apiKey).toMatch(/^sk_/);
    apiKey = res.body.apiKey;
  });

  test('POST /auth/signup - should reject duplicate email', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('exists');
  });

  test('POST /auth/login - should login with valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /auth/login - should reject invalid password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  test('GET /api/dashboard - should work with API key', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('X-API-Key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
  });

  test('GET /api/dashboard - should reject without auth', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });
});
