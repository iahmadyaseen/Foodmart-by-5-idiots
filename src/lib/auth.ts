import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'foodmart_default_super_secret_jwt_key_2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
export const COOKIE_NAME = 'foodmart_auth_token';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ay8880625@gmail.com';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the authenticated user from request headers or cookies.
 * NEVER returns password or sensitive database fields.
 */
export async function getSessionUser(req?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token) {
      token = req.cookies.get(COOKIE_NAME)?.value;
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Cookies not accessible in this context
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}

/**
 * Helper to ensure the current session is an admin. Throws or returns null if not.
 */
export async function requireAdmin(req?: NextRequest): Promise<TokenPayload | null> {
  const user = await getSessionUser(req);
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}
