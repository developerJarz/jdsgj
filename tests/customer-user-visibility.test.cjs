const assert = require('node:assert/strict');
const { test } = require('node:test');
const { load } = require('./helpers/load-ts.cjs');

const accounts = [
  { _id: 'owner', role: 'superadmin', phone: '01700000001' },
  { _id: 'customer', role: 'customer', phone: '01700000002' },
  { _id: 'admin', role: 'admin', phone: '01700000003' },
  { _id: 'moderator', role: 'moderator', phone: '01700000004' },
];

function usersEndpoint(role, disabled = []) {
  const users = { find: (filter = {}) => {
    const result = accounts.filter((account) => Object.entries(filter).every(([key, condition]) =>
      typeof condition === 'object' ? account[key] !== condition.$ne : account[key] === condition
    ));
    const query = { select: () => query, sort: () => query, lean: async () => result };
    return query;
  } };
  return load('@/app/api/admin/users/route', {
    '@/lib/db': { connectToDatabase: async () => {} },
    '@/lib/middleware/withRole': { authorizeRole: async () => ({ user: { role }, errorResponse: null }) },
    '@/lib/adminAccess': { getDisabledAdminSections: async () => disabled },
    '@/lib/auditLogger': { logAuditEvent: async () => {} },
    '@/models/User': { User: users },
    '@/models/Order': { Order: { aggregate: async () => [{ _id: '01700000002', count: 3 }] } },
  });
}

for (const role of ['admin', 'superadmin']) {
  test(`customer management excludes superadmin accounts for a ${role} viewer`, async () => {
    const { GET } = usersEndpoint(role);
    const response = await GET(new Request('http://localhost/api/admin/users?role=superadmin'));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(body.map((account) => account._id), ['customer', 'admin', 'moderator']);
    assert.equal(body[0].orderCount, 3);
  });
}

test('hiding superadmins preserves the existing staff visibility restriction', async () => {
  const { GET } = usersEndpoint('admin', ['staff']);
  const response = await GET(new Request('http://localhost/api/admin/users'));
  const body = await response.json();
  assert.deepEqual(body.map((account) => account._id), ['customer']);
  assert.equal(body[0].orderCount, 3);
});
