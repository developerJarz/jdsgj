import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import ShippingZone from '@/models/ShippingZone';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    let zones = await ShippingZone.find().sort({ shippingFee: 1 }).lean();

    // Auto-seed Bangladesh zones if empty
    if (zones.length === 0) {
      const defaultZones = [
        {
          name: 'Inside Dhaka Metropolitan',
          code: 'DHAKA_INSIDE',
          areas: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Badda', 'Motijheel', 'Old Dhaka'],
          shippingFee: 60,
          freeShippingThreshold: 1500,
          estimatedDays: '1-2 Days',
          isActive: true,
        },
        {
          name: 'Dhaka Suburbs & Greater Dhaka',
          code: 'DHAKA_SUBURB',
          areas: ['Savar', 'Gazipur', 'Narayanganj', 'Keraniganj', 'Tongie'],
          shippingFee: 100,
          freeShippingThreshold: 2000,
          estimatedDays: '2-3 Days',
          isActive: true,
        },
        {
          name: 'Outside Dhaka (All Bangladesh Districts)',
          code: 'OUTSIDE_DHAKA',
          areas: ['Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Coxs Bazar'],
          shippingFee: 120,
          freeShippingThreshold: 2500,
          estimatedDays: '3-5 Days',
          isActive: true,
        },
      ];
      await ShippingZone.insertMany(defaultZones);
      zones = await ShippingZone.find().sort({ shippingFee: 1 }).lean();
    }

    return NextResponse.json({ success: true, zones });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, code, areas, shippingFee, freeShippingThreshold, estimatedDays } = body;

    if (!name || !code || shippingFee === undefined) {
      return NextResponse.json(
        { success: false, message: 'Name, code, and shipping fee are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const zone = await ShippingZone.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      areas: Array.isArray(areas) ? areas : areas.split(',').map((s: string) => s.trim()),
      shippingFee: Number(shippingFee),
      freeShippingThreshold: freeShippingThreshold ? Number(freeShippingThreshold) : 0,
      estimatedDays: estimatedDays || '2-4 Days',
      isActive: true,
    });

    await logAuditEvent({
      user,
      action: 'shipping.create',
      target: 'ShippingZone',
      targetId: zone._id.toString(),
      details: `Created shipping zone: ${zone.name}`,
      req,
    });

    return NextResponse.json({ success: true, zone });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'superadmin']);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, name, code, areas, shippingFee, freeShippingThreshold, estimatedDays, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Zone ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const zone = await ShippingZone.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(code && { code: code.trim().toUpperCase() }),
        ...(areas && { areas: Array.isArray(areas) ? areas : areas.split(',').map((s: string) => s.trim()) }),
        ...(shippingFee !== undefined && { shippingFee: Number(shippingFee) }),
        ...(freeShippingThreshold !== undefined && { freeShippingThreshold: Number(freeShippingThreshold) }),
        ...(estimatedDays && { estimatedDays }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );

    return NextResponse.json({ success: true, zone });
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
      return NextResponse.json({ success: false, message: 'Zone ID required' }, { status: 400 });
    }

    await connectToDatabase();
    await ShippingZone.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Shipping zone removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
