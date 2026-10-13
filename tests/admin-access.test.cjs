const assert = require('node:assert/strict');
const { test } = require('node:test');
const { load } = require('./helpers/load-ts.cjs');

test('disabled sections block nested admin URLs while superadmins retain access', () => {
  const { canAccessAdminPath } = load('@/lib/adminSections');
  assert.equal(canAccessAdminPath('admin', ['products'], '/admin/products/new'), false);
  assert.equal(canAccessAdminPath('admin', ['products'], '/admin/orders'), true);
  assert.equal(canAccessAdminPath('superadmin', ['products'], '/admin/products'), true);
  assert.equal(canAccessAdminPath('customer', [], '/admin'), false);
  assert.equal(canAccessAdminPath('admin', [], '/admin/unknown'), false);
});

test('settings reject unknown section IDs and malformed input', () => {
  const { parseDisabledSections } = load('@/lib/adminSections');
  assert.deepEqual(parseDisabledSections(['orders', 'products', 'orders']), ['orders', 'products']);
  assert.throws(() => parseDisabledSections(['superadmin']));
  assert.throws(() => parseDisabledSections('orders'));
  assert.throws(() => parseDisabledSections([null]));
});

function sessionModules({ databaseRole = 'admin', active = true, exists = true, disabled = ['products'], staffTarget } = {}) {
  const auth = load('@/lib/auth');
  const id = '507f1f77bcf86cd799439011';
  const databaseUser = exists ? { _id: id, name: 'Current admin', phone: '01700000000', role: databaseRole, permissions: [], isActive: active } : null;
  const userModel = { findById: (targetId) => {
    const record = targetId.toLowerCase() === id ? databaseUser : staffTarget;
    const query = { select: () => query, lean: async () => record, then: (resolve, reject) => Promise.resolve(record).then(resolve, reject) };
    return query;
  } };
  const replacements = {
    '@/lib/db': { __esModule: true, default: async () => {}, connectToDatabase: async () => {} },
    '@/lib/auditLogger': { logAuditEvent: async () => {} },
    '@/models/User': { __esModule: true, default: userModel, User: userModel },
    '@/models/AdminSettings': { __esModule: true, default: { findById: () => ({ lean: async () => ({ disabledSections: disabled }) }) } },
  };
  const token = auth.signToken({ userId: id, role: 'superadmin', name: 'Old name', phone: '01700000000' });
  const request = (url, method = 'GET', body) => new Request(`http://localhost${url}`, { method, headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { replacements, request };
}

test('a demoted superadmin cannot use an old token to enter the control API', async () => {
  const { replacements, request } = sessionModules();
  const { authorizeRole } = load('@/lib/middleware/withRole', replacements);
  const result = await authorizeRole(request('/api/super-admin/settings'), ['superadmin']);
  assert.equal(result.errorResponse?.status, 403);
});

test('regular admins cannot create or promote a superadmin through staff endpoints', async () => {
  const { replacements, request } = sessionModules();
  const create = load('@/app/api/admin/staff/route', replacements);
  const update = load('@/app/api/admin/staff/[id]/route', replacements);
  const created = await create.POST(request('/api/admin/staff', 'POST', { name: 'Other admin', phone: '01710000000', password: 'test-password', role: 'superadmin' }));
  assert.equal(created.status, 403);
  const updated = await update.PUT(request('/api/admin/staff/other', 'PUT', { role: 'superadmin' }), { params: Promise.resolve({ id: 'other' }) });
  assert.equal(updated.status, 403);
});

test('regular admins cannot modify an existing superadmin through the staff endpoint', async () => {
  const { replacements, request } = sessionModules({ staffTarget: { _id: 'other', role: 'superadmin', name: 'Owner' } });
  const { PUT } = load('@/app/api/admin/staff/[id]/route', replacements);
  const response = await PUT(request('/api/admin/staff/other', 'PUT', { password: 'new-password', isActive: false }), { params: Promise.resolve({ id: 'other' }) });
  assert.equal(response.status, 403);
});

test('mixed-case Mongo IDs cannot bypass the self-role protection', async () => {
  const { replacements, request } = sessionModules({ databaseRole: 'superadmin' });
  const { PUT } = load('@/app/api/admin/staff/[id]/route', replacements);
  const id = '507F1F77BCF86CD799439011';
  const response = await PUT(request(`/api/admin/staff/${id}`, 'PUT', { role: 'moderator' }), { params: Promise.resolve({ id }) });
  assert.equal(response.status, 400);
});

test('hiding staff management blocks role changes through customer management too', async () => {
  for (const [staffTarget, body] of [
    [{ _id: 'other', role: 'customer' }, { role: 'admin' }],
    [{ _id: 'other', role: 'moderator' }, { isActive: false }],
  ]) {
    const { replacements, request } = sessionModules({ disabled: ['staff'], staffTarget });
    const { PUT } = load('@/app/api/admin/users/route', replacements);
    const response = await PUT(request('/api/admin/users', 'PUT', { userId: 'other', ...body }));
    assert.equal(response.status, 403);
  }
});

test('regular admins cannot read or save the global dashboard settings', async () => {
  const { replacements, request } = sessionModules();
  const { GET, PUT } = load('@/app/api/super-admin/settings/route', replacements);
  assert.equal((await GET(request('/api/super-admin/settings'))).status, 403);
  assert.equal((await PUT(request('/api/super-admin/settings', 'PUT', { disabledSections: [] }))).status, 403);
});

test('superadmin settings reject malformed updates', async () => {
  const { replacements, request } = sessionModules({ databaseRole: 'superadmin' });
  const { PUT } = load('@/app/api/super-admin/settings/route', replacements);
  for (const disabledSections of ['all', ['unknown-section'], [1], null]) {
    const response = await PUT(request('/api/super-admin/settings', 'PUT', { disabledSections }));
    assert.equal(response.status, 400);
  }
});

test('disabled management APIs reject regular admins including alternate URLs', async () => {
  const { replacements, request } = sessionModules();
  const { authorizeRole } = load('@/lib/middleware/withRole', replacements);
  for (const [url, method] of [['/api/products/sku-1', 'PUT'], ['/api/products', 'POST'], ['/api/seed', 'GET']]) {
    const result = await authorizeRole(request(url, method), ['admin', 'moderator']);
    assert.equal(result.errorResponse?.status, 403, url);
  }
  const allowed = await authorizeRole(request('/api/orders'), ['admin', 'moderator']);
  assert.equal(allowed.errorResponse, null);
});

test('disabled sections do not restrict superadmins or change moderator access', async () => {
  for (const databaseRole of ['superadmin', 'moderator']) {
    const { replacements, request } = sessionModules({ databaseRole });
    const { authorizeRole } = load('@/lib/middleware/withRole', replacements);
    const result = await authorizeRole(request('/api/products', 'POST'), ['admin', 'moderator']);
    assert.equal(result.errorResponse, null);
    assert.equal(result.user.role, databaseRole);
  }
});

test('deactivated and deleted accounts cannot keep using their session', async () => {
  for (const options of [{ active: false }, { exists: false }]) {
    const { replacements, request } = sessionModules(options);
    const { authenticateRequest } = load('@/lib/middleware/withAuth', replacements);
    const result = await authenticateRequest(request('/api/admin/access'));
    assert.equal(result.errorResponse?.status, 401);
  }
});

test('staff can still list roles when only the Roles section is hidden, but cannot change them', () => {
  const { isAdminApiBlocked } = load('@/lib/adminSections');
  assert.equal(isAdminApiBlocked('/api/admin/roles', 'GET', ['roles']), false);
  assert.equal(isAdminApiBlocked('/api/admin/roles', 'POST', ['roles']), true);
  assert.equal(isAdminApiBlocked('/api/admin/roles', 'DELETE', ['roles']), true);
  assert.equal(isAdminApiBlocked('/api/admin/roles', 'GET', ['roles', 'staff']), true);
  assert.equal(isAdminApiBlocked('/api/admin/products', 'GET', ['orders']), false);
  assert.equal(isAdminApiBlocked('/api/orders/ORD-1', 'GET', ['orders']), true);
});

test('order details require a staff session', async () => {
  const { replacements, request } = sessionModules({ databaseRole: 'customer', disabled: [] });
  replacements['@/models/Order'] = { __esModule: true, default: { findOne: () => { throw new Error('order lookup must not run'); } } };
  const { GET } = load('@/app/api/orders/[id]/route', replacements);
  const anonymous = await GET(new Request('http://localhost/api/orders/ORD-1'), { params: Promise.resolve({ id: 'ORD-1' }) });
  assert.equal(anonymous.status, 401);
  const customer = await GET(request('/api/orders/ORD-1'), { params: Promise.resolve({ id: 'ORD-1' }) });
  assert.equal(customer.status, 403);
});
