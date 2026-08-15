import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.orderId || !data.customerName || !data.customerEmail || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    const session = await getSessionUser(req);
    let targetUserId: string | null = session?.userId || data.userId || null;

    if (targetUserId) {
      const userExists = await prisma.user.findUnique({
        where: { id: targetUserId },
      });
      if (!userExists) {
        targetUserId = null;
      }
    }

    // Create Order with nested items in a single Prisma transaction
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          id: data.orderId,
          userId: targetUserId,
          customerName: data.customerName.trim(),
          customerEmail: data.customerEmail.trim(),
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          notes: data.notes || '',
          subtotal: parseFloat(data.subtotal) || 0,
          discount: parseFloat(data.discount) || 0,
          deliveryFee: parseFloat(data.deliveryFee) || 0,
          total: parseFloat(data.total) || 0,
          paymentMethod: data.paymentMethod || 'cod',
          paymentStatus: data.paymentStatus || 'pending',
          orderStatus: data.orderStatus || 'pending',
          estimatedDelivery: data.estimatedDelivery || 'Within 2 hours',
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              sku: item.sku,
              name: item.name,
              price: parseFloat(item.price),
              unit: item.unit,
              quantity: parseInt(item.quantity),
              totalPrice: parseFloat(item.totalPrice),
              image: item.image,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Atomically decrement stock
      for (const item of data.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (product) {
            const newQty = Math.max(0, product.stockQuantity - item.quantity);
            const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= 5 ? 'low_stock' : 'in_stock';
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: newQty,
                stockStatus: newStatus,
              },
            });
          }
        }
      }

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
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
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ orders: [] });
    }

    // Customer can strictly ONLY see their own orders - Zero Data Leaks!
    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
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
    console.error('Fetch user orders error:', error);
    return NextResponse.json({ orders: [] });
  }
}
