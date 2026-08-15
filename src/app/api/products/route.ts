import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { INITIAL_PRODUCTS } from '@/data/products';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const topSelling = searchParams.get('topSelling');

    const where: any = {};
    if (category) {
      where.categorySlug = category;
    }
    if (topSelling === 'true') {
      where.isTopSelling = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { categoryName: { contains: search } },
      ];
    }

    let products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0 && !category && !search && !topSelling) {
      return NextResponse.json({
        products: INITIAL_PRODUCTS.map((p) => ({
          ...p,
          category: p.category,
        })),
      });
    }

    const formatted = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.categorySlug,
      categoryName: p.categoryName,
      subcategory: p.subcategory || undefined,
      price: p.price,
      originalPrice: p.originalPrice || undefined,
      sale: p.sale,
      unit: p.unit,
      stockQuantity: p.stockQuantity,
      stockStatus: p.stockStatus as 'in_stock' | 'low_stock' | 'out_of_stock',
      image: p.image,
      rating: p.rating,
      reviewCount: p.reviewCount,
      description: p.description,
      isTopSelling: p.isTopSelling,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ products: formatted });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ products: INITIAL_PRODUCTS }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const data = await req.json();
    const newId = `prod-${Date.now()}`;
    const newSku = data.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = await prisma.product.create({
      data: {
        id: newId,
        sku: newSku,
        name: data.name,
        categorySlug: data.category || 'fruits',
        categoryName: data.categoryName || 'Fruits',
        subcategory: data.subcategory || null,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        sale: Boolean(data.sale),
        unit: data.unit || 'kg',
        stockQuantity: parseInt(data.stockQuantity) || 0,
        stockStatus: data.stockStatus || 'in_stock',
        image: data.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600',
        rating: data.rating ? parseFloat(data.rating) : 5.0,
        reviewCount: data.reviewCount ? parseInt(data.reviewCount) : 0,
        description: data.description || 'Fresh quality farm product delivered directly from certified suppliers.',
        isTopSelling: Boolean(data.isTopSelling),
      },
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
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
