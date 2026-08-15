import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CATEGORIES } from '@/data/categories';

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    // If database is not seeded yet, return from local categories
    if (categories.length === 0) {
      return NextResponse.json({
        categories: CATEGORIES.map((c) => ({
          ...c,
          subcategories: c.subcategories || [],
        })),
      });
    }

    const formatted = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image,
      productCount: c.productCount,
      subcategories: c.subcategories ? JSON.parse(c.subcategories) : [],
    }));

    return NextResponse.json({ categories: formatted });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ categories: CATEGORIES }, { status: 200 });
  }
}
