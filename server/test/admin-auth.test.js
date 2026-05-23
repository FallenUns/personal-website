const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { buildApp } = require('../index');
const { makeApp } = require('./helpers');

test('buildApp throws if ADMIN_API_KEY is not set', () => {
  assert.throws(
    () => buildApp({ env: { LLM_API_KEY: 'x' } }),
    /ADMIN_API_KEY/,
  );
});

test('GET /api/feedback requires the admin key in every env', async () => {
  const { app } = makeApp(); // ADMIN_API_KEY is set in helpers.js
  await request(app).get('/api/feedback').expect(401);
  await request(app)
    .get('/api/feedback')
    .set('x-admin-api-key', 'admin-test-key')
    .expect(200);
});

test('GET /api/feedback responds with Cache-Control: no-store', async () => {
  const { app } = makeApp();
  const res = await request(app)
    .get('/api/feedback')
    .set('x-admin-api-key', 'admin-test-key')
    .expect(200);
  assert.match(res.headers['cache-control'] || '', /no-store/);
});

test('GET /api/feedback/export-csv responds with Cache-Control: no-store', async () => {
  const { app } = makeApp();
  await request(app).post('/api/feedback').send({
    name: 'Test', rating: 5, category: 'general', message: 'this is a valid message body',
  }).expect(200);
  const res = await request(app)
    .get('/api/feedback/export-csv')
    .set('x-admin-api-key', 'admin-test-key')
    .expect(200);
  assert.match(res.headers['cache-control'] || '', /no-store/);
});
