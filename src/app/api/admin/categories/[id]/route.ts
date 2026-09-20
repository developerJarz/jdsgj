import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const data = await req.json();

    const category = await Category.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }, { slug: id }] },
      { $set: data },
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Check product count before deleting
    const cat = await Category.findOne({ $or: [{ _id: id }, { id: id }, { slug: id }] });
    if (!cat) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    const productCount = await Product.countDocuments({
      $or: [
        { category_slug: new RegExp(`^${cat.slug}$`, 'i') },
        { category: new RegExp(`^${cat.name}$`, 'i') },
      ],
    });

    if (productCount > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete: ${productCount} products are in this category. Reassign them first.` },
        { status: 400 }
      );
    }

    await Category.findOneAndDelete({ $or: [{ _id: id }, { id: id }, { slug: id }] });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
