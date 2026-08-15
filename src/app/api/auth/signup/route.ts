import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, COOKIE_NAME, ADMIN_EMAIL } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password || 'foodmart123');
    const role = trimmedEmail === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        password: hashedPassword,
        role,
      },
    });

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
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
