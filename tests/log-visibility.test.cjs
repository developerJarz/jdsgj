const assert = require('node:assert/strict');
const { test } = require('node:test');
const { NextResponse } = require('next/server');
const { Types } = require('mongoose');
const { load } = require('./helpers/load-ts.cjs');

const ownerId = new Types.ObjectId('507f1f77bcf86cd799439011');
const formerOwnerId = new Types.ObjectId('507f1f77bcf86cd799439012');
const adminId = new Types.ObjectId('507f1f77bcf86cd799439013');
const rows = [
  { _id: 'owner-legacy', user: ownerId, userName: 'Owner', type: 'login', createdAt: new Date() },
  { _id: 'former-owner', user: formerOwnerId, userRole: 'superadmin', userName: 'Former owner', type: 'login', createdAt: new Date() },
  { _id: 'regular-admin', user: adminId, userRole: 'admin', userName: 'Admin', type: 'login', createdAt: new Date() },
  { _id: 'guest', type: 'product_view', createdAt: new Date() },
];

const equal = (a, b) => a === b || (a != null && b != null && String(a) === String(b));
function matches(row, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === '$and') return value.every((part) => matches(row, part));
    if (key === '$or') return value.some((part) => matches(row, part));
    if (value instanceof RegExp) return value.test(row[key] || '');
    if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Types.ObjectId)) {
      return Object.entries(value).every(([op, expected]) => {
        if (op === '$ne') return !equal(row[key], expected);
        if (op === '$nin') return !expected.some((item) => equal(row[key], item));
        if (op === '$in') return expected.some((item) => equal(row[key], item));
        if (op === '$gte') return row[key] >= expected;
        if (op === '$exists') return (row[key] !== undefined) === expected;
        throw new Error(`Unsupported fixture query operator: ${op}`);
      });
    }
    return equal(row[key], value);
  });
}

function query(data) {
  let selected = data;
  const result = {
    select: () => result, populate: () => result, sort: () => result,
    skip: (offset) => { selected = selected.slice(offset); return result; },
    limit: (limit) => { selected = selected.slice(0, limit); return result; },
    lean: async () => selected,
  };
  return result;
}

function fixtures() {
  const pipelines = [];
  const model = {
    find: (filter) => query(rows.filter((row) => matches(row, filter))),
    countDocuments: async (filter) => rows.filter((row) => matches(row, filter)).length,
    aggregate: async (pipeline) => { pipelines.push(pipeline); return []; },
  };
  const userModel = { find: (filter) => {
    assert.equal(filter.role, 'superadmin');
    return query([{ _id: ownerId }]);
  } };
  return { pipelines, replacements: {
    '@/lib/db': { __esModule: true, default: async () => {}, connectToDatabase: async () => {} },
    '@/lib/middleware/withRole': { authorizeRole: async () => ({ user: { role: 'admin' }, errorResponse: null }) },
    '@/models/User': { __esModule: true, default: userModel, User: userModel },
    '@/models/AuditLog': { __esModule: true, default: model },
    '@/models/ActivityEvent': { __esModule: true, default: model, ActivityEvent: model },
  } };
}

test('audit log responses hide current and historical superadmin entries before pagination', async () => {
  const { replacements } = fixtures();
  const { GET } = load('@/app/api/admin/audit-log/route', replacements);
  const response = await GET(new Request('http://localhost/api/admin/audit-log?limit=1'));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body.logs.map((row) => row._id), ['regular-admin']);
  assert.equal(body.pagination.total, 2);
  assert.equal(body.pagination.totalPages, 2);
});

test('searching the owner cannot reveal a hidden audit entry', async () => {
  const { replacements } = fixtures();
  const { GET } = load('@/app/api/admin/audit-log/route', replacements);
  const response = await GET(new Request('http://localhost/api/admin/audit-log?search=Owner'));
  const body = await response.json();
  assert.deepEqual(body.logs, []);
  assert.equal(body.pagination.total, 0);
});

test('activity feeds and every traffic metric exclude superadmin activity', async () => {
  const { replacements, pipelines } = fixtures();
  const { GET } = load('@/app/api/admin/activity/route', replacements);
  const response = await GET(new Request('http://localhost/api/admin/activity'));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body.data.feed.map((row) => row._id), ['regular-admin', 'guest']);
  assert.deepEqual(body.data.adminActions.map((row) => row._id), ['regular-admin', 'guest']);
  assert.ok(pipelines.length > 0);
  for (const pipeline of pipelines) {
    const match = pipeline[0].$match;
    assert.equal(matches(rows[0], match), false, 'legacy superadmin rows must not enter aggregations');
    assert.equal(matches(rows[1], match), false, 'historical superadmin rows must not enter aggregations');
  }
});

test('server-side events retain the actor role at the time of the action', async () => {
  let callback;
  let persisted;
  const { recordServerActivity } = load('@/lib/activity', {
    'next/server': { NextResponse, after: (fn) => { callback = fn; } },
    '@/lib/db': { connectToDatabase: async () => {} },
    '@/models/ActivityEvent': { __esModule: true, default: { create: async (event) => { persisted = event; } } },
  });
  recordServerActivity({ type: 'login', userId: ownerId.toString(), userRole: 'superadmin', userName: 'Owner' });
  await callback();
  assert.equal(persisted.userRole, 'superadmin');
});

test('browser tracking uses the current database role instead of an old token role', async () => {
  let callback;
  let persisted;
  const { POST } = load('@/app/api/track/route', {
    'next/server': { NextResponse, after: (fn) => { callback = fn; } },
    '@/lib/db': { connectToDatabase: async () => {} },
    '@/lib/auth': { getTokenFromRequest: () => 'old-token', verifyToken: () => ({ userId: ownerId.toString(), name: 'Owner', role: 'customer' }) },
    '@/models/User': { __esModule: true, default: { findById: () => ({ select: () => ({ lean: async () => ({ role: 'superadmin' }) }) }) } },
    '@/models/ActivityEvent': { __esModule: true, default: { create: async (event) => { persisted = event; } } },
  });
  const response = await POST(new Request('http://localhost/api/track', { method: 'POST', body: JSON.stringify({ type: 'product_view', path: '/product/item' }) }));
  assert.equal(response.status, 204);
  await callback();
  assert.equal(persisted.userRole, 'superadmin');
});

test('role snapshots are retained when development reloads an already registered activity model', () => {
  const mongoose = require('mongoose');
  mongoose.model('ActivityEvent', new mongoose.Schema({ type: String }));
  try {
    const ActivityEvent = load('@/models/ActivityEvent').default;
    const event = new ActivityEvent({ type: 'login', userRole: 'superadmin' });
    assert.equal(event.toObject().userRole, 'superadmin');
  } finally {
    mongoose.deleteModel('ActivityEvent');
  }
});

test('audit search treats brackets and other symbols as plain text', async () => {
  const { replacements } = fixtures();
  const { GET } = load('@/app/api/admin/audit-log/route', replacements);
  for (const search of ['[test-1]', '(', '*', 'a+b?']) {
    const response = await GET(new Request(`http://localhost/api/admin/audit-log?search=${encodeURIComponent(search)}`));
    assert.equal(response.status, 200, `search ${search}`);
    assert.deepEqual((await response.json()).logs, []);
  }
});
