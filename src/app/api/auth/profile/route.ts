import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, photoURL } = await req.json();

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(photoURL !== undefined ? { photoURL } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        photoURL: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
