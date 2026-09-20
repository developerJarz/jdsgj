import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { authorizeRole } from '@/lib/middleware/withRole';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '30'));
    const action = url.searchParams.get('action');
    const target = url.searchParams.get('target');
    const search = url.searchParams.get('search');

    const filter: any = {};
    if (action) filter.action = new RegExp(action, 'i');
    if (target) filter.target = new RegExp(target, 'i');
    if (search) {
      filter.$or = [
        { userName: new RegExp(search, 'i') },
        { details: new RegExp(search, 'i') },
        { target: new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name phone email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
