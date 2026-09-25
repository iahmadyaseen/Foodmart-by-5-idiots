import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { localDb } from '@/lib/localDb';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.orderId || !data.customerName || !data.customerEmail || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    const session = await getSessionUser(req);
    let targetUserId: string | null = session?.userId || data.userId || null;

    if (targetUserId && targetUserId.startsWith('guest-')) {
      targetUserId = null;
    }

    if (targetUserId) {
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: targetUserId },
        });
        if (!userExists) {
          const userByEmail = await prisma.user.findUnique({
            where: { email: data.customerEmail.toLowerCase().trim() },
          });
          targetUserId = userByEmail ? userByEmail.id : null;
        }
      } catch {
        targetUserId = null;
      }
    } else if (data.customerEmail) {
      try {
        const userByEmail = await prisma.user.findUnique({
          where: { email: data.customerEmail.toLowerCase().trim() },
        });
        if (userByEmail) targetUserId = userByEmail.id;
      } catch {
        targetUserId = null;
      }
    }

    const paymentMethod = data.paymentMethod === 'card' ? 'card' : 'cod';
    const paymentStatus = paymentMethod === 'card' ? 'paid' : (data.paymentStatus || 'pending');

    const formattedItems = data.items.map((item: any, idx: number) => {
      const price = parseFloat(item.price) || 0;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const totalPrice = parseFloat(item.totalPrice) || price * quantity;
      return {
        productId: item.productId || null,
        sku: item.sku || `SKU-${idx + 1}-${Date.now().toString().slice(-4)}`,
        name: item.name || 'Grocery Item',
        price,
        unit: item.unit || 'unit',
        quantity,
        totalPrice,
        image: item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
      };
    });

    let orderId = data.orderId;
    try {
      const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
      if (existingOrder) {
        orderId = `${orderId}-${Date.now().toString().slice(-4)}`;
      }
    } catch {
      // Ignore
    }

    const orderData = {
      id: orderId,
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
      paymentMethod,
      paymentStatus,
      orderStatus: data.orderStatus || 'pending',
      estimatedDelivery: data.estimatedDelivery || 'Within 2 hours',
      items: {
        create: formattedItems,
      },
    };

    let order: any = null;

    try {
      // 1. Primary path: Prisma transaction with stock decrement
      order = await prisma.$transaction(async (tx: any) => {
        const createdOrder = await tx.order.create({
          data: orderData,
          include: {
            items: true,
          },
        });

        // Safely decrement stock (never block order placement if product not tracked)
        for (const item of data.items) {
          if (item.productId) {
            try {
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
            } catch (stockErr) {
              console.warn('[Orders] Stock decrement skipped for item:', item.productId, stockErr);
            }
          }
        }

        return createdOrder;
      });
    } catch (txErr) {
      console.warn('[Orders] Transaction path encountered error, trying direct order create:', txErr);
      // 2. Resilient fallback: direct order create without strict transaction
      try {
        order = await prisma.order.create({
          data: orderData,
          include: { items: true },
        });
      } catch (directErr) {
        console.warn('[Orders] Direct prisma create failed, using localDb fallback:', directErr);
        order = await (localDb as any).order.create({
          data: orderData,
        });
      }
    }

    if (!order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

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
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        items: (order.items || formattedItems).map((item: any) => ({
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
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ orders: [] });
    }

    const userEmail = session.email ? session.email.toLowerCase().trim() : '';
    const conditions: any[] = [{ userId: session.userId }];
    if (userEmail) {
      conditions.push({ customerEmail: { equals: userEmail, mode: 'insensitive' } });
    }

    let orders: any[] = [];

    try {
      orders = await prisma.order.findMany({
        where: {
          OR: conditions,
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      // Auto-link previously unassigned orders placed with this email
      if (userEmail && session.userId) {
        prisma.order
          .updateMany({
            where: {
              customerEmail: { equals: userEmail, mode: 'insensitive' },
              userId: null,
            },
            data: {
              userId: session.userId,
            },
          })
          .catch(() => {});
      }
    } catch (dbErr) {
      console.warn('[Orders GET] Prisma query error, trying localDb:', dbErr);
      orders = await (localDb as any).order.findMany({
        where: {
          OR: [
            { userId: session.userId },
            { customerEmail: userEmail },
          ],
        },
      });
    }

    const formatted = (orders || []).map((o: any) => ({
      orderId: o.id,
      userId: o.userId,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      phone: o.phone || '',
      address: o.address || '',
      city: o.city || '',
      postalCode: o.postalCode || '',
      notes: o.notes || undefined,
      subtotal: parseFloat(o.subtotal) || 0,
      discount: parseFloat(o.discount) || 0,
      deliveryFee: parseFloat(o.deliveryFee) || 0,
      total: parseFloat(o.total) || 0,
      paymentMethod: o.paymentMethod || 'cod',
      paymentStatus: o.paymentStatus || 'pending',
      orderStatus: o.orderStatus || 'pending',
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : (o.createdAt || new Date().toISOString()),
      estimatedDelivery: o.estimatedDelivery || 'Within 2 hours',
      items: (o.items || []).map((item: any) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        price: parseFloat(item.price) || 0,
        unit: item.unit || 'unit',
        quantity: parseInt(item.quantity) || 1,
        totalPrice: parseFloat(item.totalPrice) || 0,
        image: item.image,
      })),
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error('Fetch user orders error:', error);
    return NextResponse.json({ orders: [] });
  }
}
