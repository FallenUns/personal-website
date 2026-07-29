const path = require('path');
const fs = require('fs');
const os = require('os');
const { buildApp } = require('../index');

function makeApp(overrides = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-test-'));
  fs.mkdirSync(path.join(tmpDir, 'csv'));
  const env = {
    LLM_API_KEY: 'test-key',
    NODE_ENV: 'test',
    ADMIN_API_KEY: 'admin-test-key',
    DATA_DIR: tmpDir,
    ...overrides.env,
  };
  const fetch = overrides.fetch || (async () => ({
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
  }));
  const { app } = buildApp({ env, fetch });
  return { app, env, tmpDir };
}

module.exports = { makeApp };
