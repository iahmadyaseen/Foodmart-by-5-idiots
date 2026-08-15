import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session user check error:', error);
    return NextResponse.json({ user: null });
  }
}
