import { NextResponse } from 'next/server';
import { ensureDatabaseSeeded } from '@/lib/seed';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';

export async function GET(req: Request) {
  // force=true wipes and re-imports the catalog: superadmin/admin only.
  const { user, errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    await ensureDatabaseSeeded(force);

    await logAuditEvent({
      user,
      action: force ? 'database.reseed' : 'database.seed',
      target: 'Database',
      details: force ? 'Force re-seeded products, categories and banners' : 'Seeded empty collections',
      req,
    });
    invalidateStorefront('products', 'categories', 'banners');

    return NextResponse.json({ success: true, message: `Database successfully ${force ? 're-seeded' : 'seeded'}!` });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
