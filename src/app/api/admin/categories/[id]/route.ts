import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { authorizeRole } from '@/lib/middleware/withRole';
import { logAuditEvent } from '@/lib/auditLogger';
import { invalidateStorefront } from '@/lib/cacheTags';
import { escapeRegex } from '@/lib/productInput';

const byAnyId = (id: string) => ({
  $or: [...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []), { id }, { slug: id }],
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const { id } = await params;
    const { _id, createdAt, updatedAt, ...data } = await req.json();

    const previous = await Category.findOne(byAnyId(id)).lean();
    const category = await Category.findOneAndUpdate(byAnyId(id), { $set: data }, { new: true });

    if (!category || !previous) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    // Keep denormalised product fields in sync when a category is renamed
    if (previous.name !== category.name || previous.slug !== category.slug) {
      await Product.updateMany(
        { category_slug: previous.slug },
        { $set: { category: category.name, category_slug: category.slug } }
      );
      invalidateStorefront('products');
    }

    await logAuditEvent({
      user,
      action: 'category.update',
      target: 'Category',
      targetId: category._id.toString(),
      details: `Updated category: ${category.name}`,
      req,
    });
    invalidateStorefront('categories');

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();
    const { id } = await params;

    // Check product count before deleting
    const cat = await Category.findOne(byAnyId(id));
    if (!cat) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    const productCount = await Product.countDocuments({
      $or: [
        { category_slug: new RegExp(`^${escapeRegex(cat.slug)}$`, 'i') },
        { category: new RegExp(`^${escapeRegex(cat.name)}$`, 'i') },
      ],
    });

    if (productCount > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete: ${productCount} products are in this category. Reassign them first.` },
        { status: 400 }
      );
    }

    await Category.deleteOne({ _id: cat._id });

    await logAuditEvent({
      user,
      action: 'category.delete',
      target: 'Category',
      targetId: cat._id.toString(),
      details: `Deleted category: ${cat.name}`,
      req,
    });
    invalidateStorefront('categories');

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
