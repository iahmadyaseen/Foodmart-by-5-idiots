import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, COOKIE_NAME, ADMIN_EMAIL } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { asAdmin } = await req.json().catch(() => ({ asAdmin: false }));

    const targetEmail = asAdmin ? ADMIN_EMAIL : 'demo@foodmart.com';
    const targetName = asAdmin ? 'FOOD MART Owner' : 'Janger Customer';
    const targetRole = asAdmin ? 'admin' : 'customer';

    let user = await prisma.user.findUnique({
      where: { email: targetEmail.toLowerCase() },
    });

    if (!user) {
      const defaultPassword = await hashPassword(asAdmin ? 'admin123' : 'demo123');
      user = await prisma.user.create({
        data: {
          name: targetName,
          email: targetEmail.toLowerCase(),
          password: defaultPassword,
          role: targetRole,
        },
      });
    } else if (user.role !== targetRole) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: targetRole, lastLoginAt: new Date() },
      });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'customer' | 'admin',
      name: user.name,
    });

    const { password: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      token,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error('Demo auth error:', error);
    return NextResponse.json({ error: 'Demo auth failed' }, { status: 500 });
  }
}
