import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const session = await getSessionUser(req);
    // If order has an owner, verify caller is owner or admin
    if (order.userId && order.userId !== 'guest-user') {
      if (!session || (session.userId !== order.userId && session.role !== 'admin')) {
        // Prevent unauthorized customer from inspecting other customers' orders!
        return NextResponse.json({ error: 'Forbidden: Access denied to this order' }, { status: 403 });
      }
    }

    return NextResponse.json({
      order: {
        orderId: order.id,
        userId: order.userId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        phone: order.phone,
        address: order.address,
        city: order.city,
        postalCode: order.postalCode,
        notes: order.notes || undefined,
        subtotal: order.subtotal,
        discount: order.discount,
        deliveryFee: order.deliveryFee,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt.toISOString(),
        estimatedDelivery: order.estimatedDelivery,
        items: order.items.map((item) => ({
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          image: item.image,
        })),
      },
    });
  } catch (error) {
    console.error('Fetch order by id error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
