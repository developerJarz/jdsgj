const assert = require('node:assert/strict');
const { test } = require('node:test');
const { load } = require('./helpers/load-ts.cjs');
const { NextResponse } = require('next/server');

function fixtures(role = 'admin', initialSettings = { disabledSections: [] }) {
  let settings = initialSettings;
  const actor = { _id: '507f1f77bcf86cd799439011', userId: '507f1f77bcf86cd799439011', role, name: 'Operator' };
  const replacements = {
    '@/lib/db': { __esModule: true, default: async () => {}, connectToDatabase: async () => {} },
    '@/lib/auditLogger': { logAuditEvent: async () => {} },
    '@/lib/middleware/withRole': { authorizeRole: async () => ({ user: actor, errorResponse: null }) },
    '@/models/AdminSettings': { __esModule: true, default: {
      findById: () => ({ lean: async () => settings }),
      findByIdAndUpdate: async (_id, update) => { settings = { ...settings, ...update.$set, updatedAt: new Date() }; return settings; },
    } },
  };
  return { replacements, setSettings: (value) => { settings = value; } };
}

test('regular admins cannot delete audit logs until approval is enabled', async () => {
  const { replacements } = fixtures();
  const { canDeleteAuditLogs } = load('@/lib/adminAccess', replacements);
  assert.equal(await canDeleteAuditLogs('admin'), false);
});

test('audit deletion approval and revocation take effect without a new login', async () => {
  const { replacements, setSettings } = fixtures('admin', { disabledSections: [], allowAdminAuditDelete: true });
  const { canDeleteAuditLogs } = load('@/lib/adminAccess', replacements);
  assert.equal(await canDeleteAuditLogs('admin'), true);
  setSettings({ disabledSections: [], allowAdminAuditDelete: false });
  assert.equal(await canDeleteAuditLogs('admin'), false);
});

test('superadmins can delete while moderators and customers cannot', async () => {
  const { replacements } = fixtures('superadmin', { disabledSections: [], allowAdminAuditDelete: true });
  const { canDeleteAuditLogs } = load('@/lib/adminAccess', replacements);
  assert.equal(await canDeleteAuditLogs('superadmin'), true);
  assert.equal(await canDeleteAuditLogs('moderator'), false);
  assert.equal(await canDeleteAuditLogs('customer'), false);
});

test('hiding the audit trail also disables deletion for regular admins', async () => {
  const { replacements } = fixtures('admin', { disabledSections: ['audit-log'], allowAdminAuditDelete: true });
  const { canDeleteAuditLogs } = load('@/lib/adminAccess', replacements);
  assert.equal(await canDeleteAuditLogs('admin'), false);
});

test('the superadmin settings API saves and returns the deletion approval flag', async () => {
  const { replacements } = fixtures('superadmin');
  const { GET, PUT } = load('@/app/api/super-admin/settings/route', replacements);
  const response = await PUT(new Request('http://localhost/api/super-admin/settings', { method: 'PUT', body: JSON.stringify({ disabledSections: [], allowAdminAuditDelete: true }) }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).allowAdminAuditDelete, true);
  assert.equal((await (await GET(new Request('http://localhost/api/super-admin/settings'))).json()).allowAdminAuditDelete, true);
});

test('older settings saves do not reset deletion approval', async () => {
  const { replacements } = fixtures('superadmin', { disabledSections: [], allowAdminAuditDelete: true });
  const { PUT } = load('@/app/api/super-admin/settings/route', replacements);
  const response = await PUT(new Request('http://localhost/api/super-admin/settings', { method: 'PUT', body: JSON.stringify({ disabledSections: ['reports'] }) }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).allowAdminAuditDelete, true);
});

test('approval values must be booleans', async () => {
  const { replacements } = fixtures('superadmin');
  const { PUT } = load('@/app/api/super-admin/settings/route', replacements);
  for (const value of ['true', 1, null]) {
    const response = await PUT(new Request('http://localhost/api/super-admin/settings', { method: 'PUT', body: JSON.stringify({ disabledSections: [], allowAdminAuditDelete: value }) }));
    assert.equal(response.status, 400);
  }
});

test('month cutoffs use calendar months and clamp the day at month end', () => {
  const { auditRetentionCutoff } = load('@/lib/auditRetention');
  assert.equal(auditRetentionCutoff(1, new Date('2026-03-31T09:00:00Z')).toISOString(), '2026-02-28T09:00:00.000Z');
  assert.equal(auditRetentionCutoff(2, new Date('2026-10-14T09:00:00Z')).toISOString(), '2026-08-14T09:00:00.000Z');
  assert.throws(() => auditRetentionCutoff(0));
  assert.throws(() => auditRetentionCutoff('1'));
});

function deletionEndpoint(role = 'admin', approved = false) {
  const { replacements } = fixtures(role, { disabledSections: [], allowAdminAuditDelete: approved });
  const now = new Date();
  const old = new Date(now); old.setUTCFullYear(now.getUTCFullYear() - 2);
  const rows = [
    { _id: 'old-admin', userRole: 'admin', createdAt: old },
    { _id: 'recent-admin', userRole: 'admin', createdAt: now },
    { _id: 'old-owner', userRole: 'superadmin', createdAt: old },
    { _id: 'legacy-owner', user: 'owner-id', createdAt: old },
  ];
  const writes = [];
  const model = {
    deleteMany: async (filter) => {
      const selected = rows.filter((row) => {
        const roleMatches = !filter.userRole || row.userRole !== filter.userRole.$ne;
        const userMatches = !filter.user || !filter.user.$nin.includes(row.user);
        const ageMatches = !filter.createdAt || row.createdAt < filter.createdAt.$lt;
        return roleMatches && userMatches && ageMatches;
      });
      for (const row of selected) rows.splice(rows.indexOf(row), 1);
      return { deletedCount: selected.length };
    },
    create: async (entry) => { writes.push(entry); },
  };
  delete replacements['@/lib/auditLogger'];
  replacements['@/models/AuditLog'] = { __esModule: true, default: model };
  replacements['@/lib/logVisibility'] = { getVisibleLogFilter: async () => ({ userRole: { $ne: 'superadmin' }, user: { $nin: ['owner-id'] } }) };
  replacements['@/lib/middleware/withRole'] = { authorizeRole: async () => role === 'customer' || role === 'moderator'
    ? { user: null, errorResponse: NextResponse.json({ success: false }, { status: 403 }) }
    : { user: { role, userId: '507f1f77bcf86cd799439011', name: 'Operator' }, errorResponse: null } };
  const request = (months) => new Request('http://localhost/api/admin/audit-log', { method: 'DELETE', body: JSON.stringify({ months }) });
  const endpoint = load('@/app/api/admin/audit-log/route', replacements);
  return { ...endpoint, rows, writes, request };
}

test('unapproved admins cannot delete audit entries through the API', async () => {
  const { DELETE, rows, request } = deletionEndpoint();
  const response = await DELETE(request(1));
  assert.equal(response.status, 403);
  assert.equal(rows.length, 4);
});

test('approved admins delete only older visible entries', async () => {
  const { DELETE, rows, writes, request } = deletionEndpoint('admin', true);
  const response = await DELETE(request(1));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).deletedCount, 1);
  assert.deepEqual(rows.map((row) => row._id), ['recent-admin', 'old-owner', 'legacy-owner']);
  assert.equal(writes[0].userRole, 'admin');
});

test('superadmin cleanup keeps its audit record marked as hidden', async () => {
  const { DELETE, writes, request } = deletionEndpoint('superadmin');
  const response = await DELETE(request(2));
  assert.equal(response.status, 200);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].userRole, 'superadmin');
});

test('invalid retention periods cannot delete any entries', async () => {
  const { DELETE, rows, request } = deletionEndpoint('superadmin');
  for (const months of [undefined, 0, -1, 1.5, '1', 100]) {
    assert.equal((await DELETE(request(months))).status, 400);
  }
  assert.equal(rows.length, 4);
});

test('moderators and customers cannot use audit cleanup', async () => {
  for (const role of ['moderator', 'customer']) {
    const { DELETE, rows, request } = deletionEndpoint(role, true);
    assert.equal((await DELETE(request(1))).status, 403);
    assert.equal(rows.length, 4);
  }
});
