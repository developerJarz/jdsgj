const assert = require('node:assert/strict');
const { test } = require('node:test');

async function run({ account = null, connectionError, identifier = 'owner@example.com' } = {}) {
  const { makeSuperadmin } = await import('../scripts/make-superadmin.mjs');
  const messages = [];
  const writes = [];
  let disconnected = false;
  const client = {
    connect: async () => { if (connectionError) throw connectionError; },
    disconnect: async () => { disconnected = true; },
    connection: { collection: () => ({
      findOne: async (query) => {
        assert.deepEqual(query, { $or: [{ phone: identifier.trim() }, { email: identifier.trim().toLowerCase() }] });
        return account;
      },
      updateOne: async (filter, update) => { writes.push({ filter, update }); return { matchedCount: 1 }; },
    }) },
  };
  const output = { error: (message) => messages.push(message), log: (message) => messages.push(message) };
  const exitCode = await makeSuperadmin(identifier, { uri: 'mongodb://localhost/test', client, output });
  return { exitCode, messages: messages.join('\n'), writes, disconnected };
}

test('a missing account reports the identifier problem without changing any account', async () => {
  const result = await run();
  assert.equal(result.exitCode, 1);
  assert.match(result.messages, /account.*not found/i);
  assert.match(result.messages, /sign in|website|\/login/i);
  assert.deepEqual(result.writes, []);
  assert.equal(result.disconnected, true);
});

test('a suspended account explains why access was refused', async () => {
  const result = await run({ account: { _id: 'owner', name: 'Owner', isActive: false } });
  assert.equal(result.exitCode, 1);
  assert.match(result.messages, /suspended/i);
  assert.deepEqual(result.writes, []);
});

test('connection errors retain their reason and hide database connection credentials', async () => {
  const result = await run({ connectionError: new Error('Connection refused: mongodb://private-user:secret-password@localhost/test') });
  assert.equal(result.exitCode, 1);
  assert.match(result.messages, /Connection refused/i);
  assert.doesNotMatch(result.messages, /secret-password|private-user/);
  assert.equal(result.disconnected, true);
});

test('an existing active account is promoted and receives the panel URL', async () => {
  const result = await run({ identifier: '  OWNER@example.com  ', account: { _id: 'owner', name: 'Owner', isActive: true } });
  assert.equal(result.exitCode, 0);
  assert.equal(result.writes.length, 1);
  assert.deepEqual(result.writes[0].filter, { _id: 'owner' });
  assert.equal(result.writes[0].update.$set.role, 'superadmin');
  assert.match(result.messages, /\/super-admin/);
});
