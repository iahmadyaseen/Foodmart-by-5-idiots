import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        ...product,
        category: product.categorySlug,
        createdAt: product.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Fetch single product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const data = await req.json();

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
    if (data.sale !== undefined) updateData.sale = Boolean(data.sale);
    if (data.stockQuantity !== undefined) {
      updateData.stockQuantity = parseInt(data.stockQuantity);
      updateData.stockStatus = updateData.stockQuantity === 0 ? 'out_of_stock' : updateData.stockQuantity <= 5 ? 'low_stock' : 'in_stock';
    }
    if (data.stockStatus !== undefined) updateData.stockStatus = data.stockStatus;
    if (data.category !== undefined) updateData.categorySlug = data.category;
    if (data.categoryName !== undefined) updateData.categoryName = data.categoryName;
    if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isTopSelling !== undefined) updateData.isTopSelling = Boolean(data.isTopSelling);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        category: product.categorySlug,
        createdAt: product.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
