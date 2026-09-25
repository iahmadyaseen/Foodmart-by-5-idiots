import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { localDb } from '@/lib/localDb';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please check or create an account.' },
        { status: 404 }
      );
    }

    // Generate 6-digit verification code
    const code = await localDb.passwordReset.createToken(trimmedEmail);

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const magicLink = `${protocol}://${host}/login?code=${code}&email=${encodeURIComponent(trimmedEmail)}`;

    // Dispatch email
    const emailResult = await sendPasswordResetEmail({
      email: trimmedEmail,
      name: user.name,
      code,
      magicLink,
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code and instant sign-in link have been sent to ${trimmedEmail}.`,
      // In dev mode, return devCode so localhost user can test instantly without leaving browser!
      devCode: code,
      devMagicLink: magicLink,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 });
  }
}
