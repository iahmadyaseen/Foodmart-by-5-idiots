import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, COOKIE_NAME, isSuperAdmin, UserRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (password) {
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
    }

    // Determine strict role:
    // ONLY ay8880625@gmail.com is ever super_admin.
    // Any other user can only be admin if granted by super admin; otherwise customer.
    let effectiveRole: UserRole = user.role as UserRole;
    if (isSuperAdmin(user.email)) {
      effectiveRole = 'super_admin';
    } else if (effectiveRole === 'super_admin') {
      effectiveRole = 'customer';
    } else if (effectiveRole !== 'admin') {
      effectiveRole = 'customer';
    }

    // Update lastLoginAt and ensure role is synchronized in database
    if (user.role !== effectiveRole) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: effectiveRole, lastLoginAt: new Date() },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Create session token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: effectiveRole,
      name: user.name,
    });

    // Strip password field before returning response - NO DATA LEAKS!
    const { password: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      user: {
        ...safeUser,
        role: effectiveRole,
      },
      token,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
