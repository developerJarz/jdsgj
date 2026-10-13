const assert = require('node:assert/strict');
const { test } = require('node:test');
const { load } = require('./helpers/load-ts.cjs');

test('defaults reproduce the original homepage, announcement bar and footer', () => {
  const { DEFAULT_SITE_CONTENT, normalizeSiteContent } = load('@/lib/siteContent');
  const { content, errors } = normalizeSiteContent(DEFAULT_SITE_CONTENT);
  assert.deepEqual(errors, []);
  assert.deepEqual(content, DEFAULT_SITE_CONTENT);
  assert.deepEqual(content.homeSections.map((s) => s.id), ['hero', 'under-hero', 'deals', 'limited-offers', 'bestsellers', 'top-brands', 'special-deals', 'categories', 'concerns', 'new-arrivals']);
});

test('missing fields fall back to defaults so older saves keep working', () => {
  const { DEFAULT_SITE_CONTENT, normalizeSiteContent } = load('@/lib/siteContent');
  const { content, errors } = normalizeSiteContent({ announcement: { enabled: false } });
  assert.deepEqual(errors, []);
  assert.equal(content.announcement.enabled, false);
  assert.equal(content.announcement.text, DEFAULT_SITE_CONTENT.announcement.text);
  assert.deepEqual(content.footer, DEFAULT_SITE_CONTENT.footer);
});

test('unsafe links and colors are rejected with a clear message', () => {
  const { normalizeSiteContent } = load('@/lib/siteContent');
  const { errors } = normalizeSiteContent({
    announcement: { link: 'javascript:alert(1)', background: 'red' },
    footer: { columns: [{ title: 'Help', links: [{ label: 'Bad', href: '//evil.example' }] }] },
  });
  assert.equal(errors.length, 3);
  assert.match(errors.join(' '), /Announcement link/);
  assert.match(errors.join(' '), /background/);
  assert.match(errors.join(' '), /Footer column 1, link 1/);
});

test('safe links include paths, web addresses, phone and email', () => {
  const { isSafeHref } = load('@/lib/siteContent');
  for (const ok of ['', '/', '/shop?brand=ponds', 'https://jarzdigital.com', 'tel:+8809613222333', 'mailto:support@shajgoj.bd']) assert.equal(isSafeHref(ok), true, ok);
  for (const bad of ['javascript:alert(1)', '//evil.example', 'data:text/html,x', 'shop']) assert.equal(isSafeHref(bad), false, bad);
});

test('sections are cleaned: unknown types reported, single sections deduplicated, limits clamped', () => {
  const { normalizeSiteContent } = load('@/lib/siteContent');
  const { content, errors } = normalizeSiteContent({ homeSections: [
    { id: 'hero', type: 'hero', enabled: true, interval: 99 },
    { id: 'hero-2', type: 'hero', enabled: true },
    { id: 'grid', type: 'product_grid', enabled: true, source: 'bestsellers', limit: 500 },
    { id: 'grid', type: 'product_grid', enabled: false, source: 'on_sale' },
    { id: 'x', type: 'video', enabled: true },
  ] });
  assert.deepEqual(content.homeSections.map((s) => s.type), ['hero', 'product_grid', 'product_grid']);
  assert.equal(content.homeSections[0].interval, 15);
  assert.equal(content.homeSections[1].limit, 40);
  assert.notEqual(content.homeSections[1].id, content.homeSections[2].id);
  assert.match(errors.join(' '), /unknown type/);
});

test('category and brand product sections must name what to show', () => {
  const { normalizeSiteContent } = load('@/lib/siteContent');
  const { errors } = normalizeSiteContent({ homeSections: [{ id: 'c', type: 'product_grid', title: 'Skin', source: 'category', sourceValue: '' }] });
  assert.match(errors[0], /choose which category/);
});

test('copyright supports a {year} placeholder', () => {
  const { formatCopyright } = load('@/lib/siteContent');
  assert.equal(formatCopyright('© {year} Shajgoj', new Date('2026-10-14T00:00:00Z')), '© 2026 Shajgoj');
});

function apiFixtures(role = 'admin') {
  let stored = null;
  const invalidated = [];
  const replacements = {
    '@/lib/db': { __esModule: true, default: async () => {}, connectToDatabase: async () => {} },
    '@/lib/auditLogger': { logAuditEvent: async () => {} },
    '@/lib/cacheTags': { invalidateStorefront: (...tags) => invalidated.push(...tags) },
    '@/lib/middleware/withRole': { authorizeRole: async () => (role === 'customer'
      ? { user: null, errorResponse: Response.json({ success: false }, { status: 403 }) }
      : { user: { role, userId: '507f1f77bcf86cd799439011', name: 'Operator' }, errorResponse: null }) },
    '@/models/SiteSettings': { __esModule: true, default: {
      findById: () => ({ lean: async () => stored }),
      findByIdAndUpdate: async (_id, update) => { stored = { _id, ...update.$set, updatedAt: new Date() }; return stored; },
    } },
  };
  const route = load('@/app/api/admin/page-sections/route', replacements);
  const put = (content) => route.PUT(new Request('http://localhost/api/admin/page-sections', { method: 'PUT', body: JSON.stringify({ content }) }));
  return { route, put, invalidated, stored: () => stored };
}

test('saving stores cleaned content and refreshes the storefront cache', async () => {
  const { route, put, invalidated, stored } = apiFixtures();
  const { DEFAULT_SITE_CONTENT } = load('@/lib/siteContent');
  const content = structuredClone(DEFAULT_SITE_CONTENT);
  content.announcement.text = '  Eid sale: 30% off  ';
  content.footer.enabled = false;
  const response = await put(content);
  assert.equal(response.status, 200);
  assert.equal(stored().content.announcement.text, 'Eid sale: 30% off');
  assert.equal(stored().content.footer.enabled, false);
  assert.deepEqual(invalidated, ['site-content']);
  const read = await (await route.GET(new Request('http://localhost/api/admin/page-sections'))).json();
  assert.equal(read.content.announcement.text, 'Eid sale: 30% off');
});

test('invalid content is refused and nothing is stored', async () => {
  const { put, stored, invalidated } = apiFixtures();
  const response = await put({ announcement: { link: 'javascript:alert(1)' } });
  assert.equal(response.status, 400);
  assert.equal(stored(), null);
  assert.deepEqual(invalidated, []);
});

test('customers cannot read or change the layout', async () => {
  const { route, put, stored } = apiFixtures('customer');
  assert.equal((await route.GET(new Request('http://localhost/api/admin/page-sections'))).status, 403);
  assert.equal((await put({})).status, 403);
  assert.equal(stored(), null);
});
