import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { action, productId, count } = await req.json();

    if (action === 'toggle' && productId) {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (!prod) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

      const updated = await prisma.product.update({
        where: { id: productId },
        data: { isTopSelling: !prod.isTopSelling },
      });

      return NextResponse.json({ success: true, product: updated });
    }

    if (action === 'randomize') {
      const targetCount = count || 8;
      const allProducts = await prisma.product.findMany();
      if (allProducts.length === 0) {
        return NextResponse.json({ success: true });
      }

      // Shuffle & pick
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      const selectedIds = new Set(shuffled.slice(0, Math.min(targetCount, allProducts.length)).map((p) => p.id));

      await prisma.$transaction(
        allProducts.map((p) => {
          return prisma.product.update({
            where: { id: p.id },
            data: { isTopSelling: selectedIds.has(p.id) },
          });
        })
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Top selling update error:', error);
    return NextResponse.json({ error: 'Failed to update top selling' }, { status: 500 });
  }
}
