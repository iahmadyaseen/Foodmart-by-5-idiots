import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    // Process all stock updates in a Prisma transaction
    await prisma.$transaction(
      items.map((item: { productId: string; quantity: number }) => {
        return prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      })
    );

    // Update stockStatus for zero/low stock items
    for (const item of items) {
      const p = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (p) {
        const newQty = Math.max(0, p.stockQuantity);
        const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= 5 ? 'low_stock' : 'in_stock';
        await prisma.product.update({
          where: { id: p.id },
          data: {
            stockQuantity: newQty,
            stockStatus: newStatus,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stock decrement error:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
