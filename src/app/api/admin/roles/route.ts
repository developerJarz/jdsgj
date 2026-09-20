import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import StaffRole from '@/models/StaffRole';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { PERMISSION_GROUPS } from '@/lib/permissions';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    let roles = await StaffRole.find().sort({ createdAt: 1 }).lean();

    // If no custom roles exist yet, seed default staff roles
    if (roles.length === 0) {
      const defaultRoles = [
        {
          name: 'Order Manager',
          slug: 'order-manager',
          description: 'Manage order fulfillment, tracking updates and cancel requests',
          permissions: ['orders.view', 'orders.update_status', 'orders.cancel', 'orders.export', 'returns.view'],
          isActive: true,
        },
        {
          name: 'Catalog Specialist',
          slug: 'catalog-specialist',
          description: 'Manage products, categories, brands and reviews',
          permissions: ['products.view', 'products.create', 'products.edit', 'categories.manage', 'brands.manage', 'reviews.view', 'reviews.moderate'],
          isActive: true,
        },
        {
          name: 'Inventory Controller',
          slug: 'inventory-controller',
          description: 'Monitor stock levels, update inventory and view reports',
          permissions: ['products.view', 'inventory.view', 'inventory.update', 'orders.view'],
          isActive: true,
        },
        {
          name: 'Customer Support Lead',
          slug: 'customer-support-lead',
          description: 'Handle customer profiles, returns and reviews moderation',
          permissions: ['customers.view', 'customers.edit', 'orders.view', 'returns.view', 'returns.process', 'reviews.view', 'reviews.moderate'],
          isActive: true,
        },
      ];
      await StaffRole.insertMany(defaultRoles);
      roles = await StaffRole.find().sort({ createdAt: 1 }).lean();
    }

    return NextResponse.json({
      success: true,
      roles,
      permissionGroups: PERMISSION_GROUPS,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, description, permissions } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Role name is required' }, { status: 400 });
    }

    await connectToDatabase();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const role = await StaffRole.create({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      permissions: permissions || [],
      isActive: true,
    });

    await logAuditEvent({
      user,
      action: 'role.create',
      target: 'StaffRole',
      targetId: role._id.toString(),
      details: `Created new role: ${role.name}`,
      req,
    });

    return NextResponse.json({ success: true, role });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, name, description, permissions, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Role id required' }, { status: 400 });
    }

    await connectToDatabase();
    const role = await StaffRole.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(permissions && { permissions }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );

    return NextResponse.json({ success: true, role });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Role id required' }, { status: 400 });
    }

    await connectToDatabase();
    await StaffRole.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Role deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
