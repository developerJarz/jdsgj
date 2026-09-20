import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/middleware/withAuth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    await connectToDatabase();
    const dbUser = await User.findById(user._id).select('addresses').lean();
    return NextResponse.json({ success: true, addresses: dbUser?.addresses || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    const body = await req.json();
    const { label, city, area, address, phone, isDefault } = body;

    if (!city || !address || !phone) {
      return NextResponse.json(
        { success: false, message: 'City, address and phone are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (!dbUser.addresses) dbUser.addresses = [];

    // If new address is default, unset other defaults
    if (isDefault) {
      dbUser.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      label: label || 'Home',
      city,
      area: area || '',
      address,
      phone,
      isDefault: isDefault || dbUser.addresses.length === 0,
    };

    dbUser.addresses.push(newAddress as any);
    await dbUser.save();

    return NextResponse.json({ success: true, addresses: dbUser.addresses });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    const body = await req.json();
    const { id, label, city, area, address, phone, isDefault } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Address ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const targetAddr = (dbUser.addresses as any).id(id);
    if (!targetAddr) {
      return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });
    }

    if (isDefault && dbUser.addresses) {
      dbUser.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
      targetAddr.isDefault = true;
    }

    if (label) targetAddr.label = label;
    if (city) targetAddr.city = city;
    if (area !== undefined) targetAddr.area = area;
    if (address) targetAddr.address = address;
    if (phone) targetAddr.phone = phone;

    await dbUser.save();

    return NextResponse.json({ success: true, addresses: dbUser.addresses });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse!;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Address ID required' }, { status: 400 });
    }

    await connectToDatabase();
    await User.findByIdAndUpdate(user._id, {
      $pull: { addresses: { _id: id } },
    });

    return NextResponse.json({ success: true, message: 'Address removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
