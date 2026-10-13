import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';
import { DEFAULT_SITE_CONTENT, SITE_CONTENT_ID, normalizeSiteContent } from '@/lib/siteContent';

// Homepage layout, top announcement bar and footer, edited from
// Admin → Page Layout Sections and rendered by the storefront.

export async function GET(req: Request) {
  const { errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const doc = await SiteSettings.findById(SITE_CONTENT_ID).lean();
    return NextResponse.json({
      success: true,
      content: normalizeSiteContent(doc?.content ?? DEFAULT_SITE_CONTENT).content,
      defaults: DEFAULT_SITE_CONTENT,
      updatedAt: doc?.updatedAt ?? null,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse || !user) return errorResponse || NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const { content, errors } = normalizeSiteContent(body?.content);
  if (errors.length > 0) {
    return NextResponse.json({ success: false, error: errors[0], errors }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const doc = await SiteSettings.findByIdAndUpdate(
      SITE_CONTENT_ID,
      { $set: { content, updatedBy: user.userId } },
      { upsert: true, returnDocument: 'after' },
    );

    const visible = content.homeSections.filter((s) => s.enabled).length;
    await logAuditEvent({
      user, action: 'site_content.update', target: 'SiteSettings', targetId: SITE_CONTENT_ID,
      details: `Updated storefront layout: ${visible}/${content.homeSections.length} homepage sections visible, announcement bar ${content.announcement.enabled ? 'on' : 'off'}, footer ${content.footer.enabled ? 'on' : 'off'}.`,
      req,
    });
    invalidateStorefront('site-content');

    return NextResponse.json({ success: true, content, updatedAt: doc?.updatedAt ?? new Date() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
