const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const request = require('supertest');
const { makeApp } = require('./helpers');

test('concurrent feedback submissions preserve every accepted entry', async () => {
  const { app, tmpDir } = makeApp();
  const responses = await Promise.all(Array.from({ length: 5 }, (_, index) => request(app)
    .post('/api/feedback')
    .send({
      name: `Name ${index}`,
      rating: 5,
      category: 'general',
      message: `message body ${index} is long enough`,
    })));

  assert.deepStrictEqual(responses.map((response) => response.status), [200, 200, 200, 200, 200]);
  const stored = JSON.parse(await fs.readFile(path.join(tmpDir, 'feedback.json'), 'utf8'));
  assert.strictEqual(stored.length, 5);
});
