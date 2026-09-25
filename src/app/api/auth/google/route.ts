import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, COOKIE_NAME, isSuperAdmin, UserRole } from '@/lib/auth';
import { decodeJwt } from 'jose';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let email: string = '';
    let name: string = '';
    let photoURL: string | undefined = undefined;

    // 1. If Google Identity credential JWT is supplied
    if (body.credential && typeof body.credential === 'string') {
      try {
        const payload = decodeJwt(body.credential);
        email = (payload.email as string) || '';
        name = (payload.name as string) || (payload.email as string)?.split('@')[0] || 'Google User';
        photoURL = (payload.picture as string) || undefined;
      } catch (jwtErr) {
        console.warn('Failed to parse Google JWT credential:', jwtErr);
      }
    }

    // 2. Direct payload fallback (for localhost Google sign in)
    if (!email && body.email) {
      email = body.email;
      name = body.name || body.email.split('@')[0];
      photoURL = body.photoURL || undefined;
    }

    if (!email) {
      return NextResponse.json({ error: 'Valid Google email is required' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      // Create new user via Google Sign-In
      // Enforce: only ay8880625@gmail.com can be super_admin, all others are customer
      const role: UserRole = isSuperAdmin(trimmedEmail) ? 'super_admin' : 'customer';
      const randomPassword = await hashPassword(`google_${Date.now()}_${Math.random()}`);

      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: trimmedEmail,
          password: randomPassword,
          role,
          photoURL: photoURL || null,
        },
      });
    } else {
      // User exists: update photoURL & lastLoginAt, enforce super_admin if ay8880625@gmail.com
      let effectiveRole = user.role as UserRole;
      if (isSuperAdmin(user.email)) {
        effectiveRole = 'super_admin';
      } else if (effectiveRole === 'super_admin') {
        effectiveRole = 'customer';
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: effectiveRole,
          photoURL: photoURL || user.photoURL,
          lastLoginAt: new Date(),
        },
      });
    }

    const effectiveRole = user.role as UserRole;

    // Create session token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: effectiveRole,
      name: user.name,
    });

    const { password: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: `Signed in successfully via Google as ${user.email}`,
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
    console.error('Google sign in error:', error);
    return NextResponse.json({ error: 'Google authentication failed' }, { status: 500 });
  }
}
