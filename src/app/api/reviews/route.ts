import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_REVIEWS } from '@/data/reviews';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (reviews.length === 0) {
      return NextResponse.json({ reviews: INITIAL_REVIEWS });
    }

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        name: r.name,
        avatar: r.avatar,
        rating: r.rating,
        review: r.review,
        location: r.location || undefined,
        date: r.createdAt.toISOString().split('T')[0],
      })),
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ reviews: INITIAL_REVIEWS }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, rating, review, location, avatar } = await req.json();

    if (!name || !review) {
      return NextResponse.json({ error: 'Name and review text are required' }, { status: 400 });
    }

    const created = await prisma.review.create({
      data: {
        name: name.trim(),
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        rating: parseFloat(rating) || 5,
        review: review.trim(),
        location: location ? location.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: created.id,
        name: created.name,
        avatar: created.avatar,
        rating: created.rating,
        review: created.review,
        location: created.location || undefined,
        date: created.createdAt.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
