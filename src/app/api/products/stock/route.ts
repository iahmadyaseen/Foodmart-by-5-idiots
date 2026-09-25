import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    for (const item of items) {
      if (item && item.productId) {
        try {
          const p = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          if (p) {
            const newQty = Math.max(0, p.stockQuantity - item.quantity);
            const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= 5 ? 'low_stock' : 'in_stock';
            await prisma.product.update({
              where: { id: p.id },
              data: {
                stockQuantity: newQty,
                stockStatus: newStatus,
              },
            });
          }
        } catch (e) {
          console.warn('[Stock] Could not update stock for product:', item.productId, e);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stock decrement error:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
