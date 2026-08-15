import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ADMIN_EMAIL } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      },
    });

    console.log(`[FOOD MART OWNER NOTIFICATION] Inbound Inquiry to ${ADMIN_EMAIL}:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`);

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        name: newMessage.name,
        email: newMessage.email,
        message: newMessage.message,
        createdAt: newMessage.createdAt.toISOString(),
        read: newMessage.read,
      },
    });
  } catch (error) {
    console.error('Contact message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
        read: m.read,
      })),
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
