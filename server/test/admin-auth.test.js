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

test('GET /api/feedback/stats returns aggregates without feedback records', async () => {
  const fs = require('fs').promises;
  const path = require('path');
  const { app, tmpDir } = makeApp();
  await fs.writeFile(path.join(tmpDir, 'feedback.json'), JSON.stringify([{
    id: 'private-id', name: 'Private Name', email: 'private@example.com',
    rating: 5, category: 'general', message: 'private message body',
    timestamp: new Date().toISOString(),
  }]));

  const res = await request(app).get('/api/feedback/stats').expect(200);

  assert.strictEqual(res.body.data.totalFeedback, 1);
  assert.deepStrictEqual(res.body.data.recentFeedback, []);
  assert.strictEqual(JSON.stringify(res.body).includes('private@example.com'), false);
  assert.strictEqual(JSON.stringify(res.body).includes('Private Name'), false);
});

test('feedback persistence files are owner-only', async () => {
  const fs = require('fs').promises;
  const path = require('path');
  const { app, tmpDir } = makeApp();
  await request(app).post('/api/feedback').send({
    name: 'Test', rating: 5, category: 'general', message: 'this is a valid message body',
  }).expect(200);

  const feedbackMode = (await fs.stat(path.join(tmpDir, 'feedback.json'))).mode & 0o777;
  const csvMode = (await fs.stat(path.join(tmpDir, 'csv', `feedback-${new Date().toISOString().split('T')[0]}.csv`))).mode & 0o777;
  assert.strictEqual(feedbackMode, 0o600);
  assert.strictEqual(csvMode, 0o600);
});

test('readFeedback filters out entries older than MAX_FEEDBACK_AGE_DAYS', async () => {
  const fs = require('fs').promises;
  const path = require('path');
  const { app, tmpDir } = makeApp();

  const oldEntry = {
    id: 'old', name: 'old', email: '', rating: 5, category: 'general',
    message: 'old message body has enough chars', timestamp: new Date(Date.now() - 100 * 86400 * 1000).toISOString(),
  };
  const freshEntry = { ...oldEntry, id: 'fresh', timestamp: new Date().toISOString() };
  await fs.mkdir(tmpDir, { recursive: true });
  await fs.writeFile(path.join(tmpDir, 'feedback.json'), JSON.stringify([oldEntry, freshEntry]));

  const res = await request(app)
    .get('/api/feedback')
    .set('x-admin-api-key', 'admin-test-key')
    .expect(200);

  assert.strictEqual(res.body.data.length, 1);
  assert.strictEqual(res.body.data[0].id, 'fresh');
});
