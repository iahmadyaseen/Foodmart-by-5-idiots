import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { localDb } from '@/lib/localDb';
import { hashPassword, signToken, COOKIE_NAME, isSuperAdmin, UserRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword, signMeIn } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const isValid = await localDb.passwordReset.verifyCode(trimmedEmail, code.trim());

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please request a new code.' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // If new password is provided, update it
    if (newPassword && typeof newPassword === 'string' && newPassword.length >= 6) {
      const hashedPassword = await hashPassword(newPassword);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, updatedAt: new Date() },
      });
    }

    // Consume code once used
    await localDb.passwordReset.consumeCode(trimmedEmail);

    // Enforce role consistency
    let role = user.role as UserRole;
    if (isSuperAdmin(user.email)) {
      role = 'super_admin';
    } else if (role === 'super_admin') {
      role = 'customer';
    }

    // Sign user in directly!
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role,
      name: user.name,
    });

    const { password: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: newPassword
        ? 'Password updated successfully! Welcome back.'
        : 'Verification confirmed! Signed in via email.',
      user: {
        ...safeUser,
        role,
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
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error('Reset password / sign in error:', error);
    return NextResponse.json({ error: 'Failed to verify code and sign in' }, { status: 500 });
  }
}
