import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = orders.map((o) => ({
      orderId: o.id,
      userId: o.userId,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      phone: o.phone,
      address: o.address,
      city: o.city,
      postalCode: o.postalCode,
      notes: o.notes || undefined,
      subtotal: o.subtotal,
      discount: o.discount,
      deliveryFee: o.deliveryFee,
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt.toISOString(),
      estimatedDelivery: o.estimatedDelivery,
      items: o.items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        image: item.image,
      })),
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
