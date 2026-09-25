import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireSuperAdmin, isSuperAdmin, SUPER_ADMIN_EMAIL } from '@/lib/auth';

/**
 * GET /api/admin/users
 * Returns list of registered users.
 * Accessible by admins & super admin.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map((u) => {
      let role = u.role;
      if (isSuperAdmin(u.email)) {
        role = 'super_admin';
      } else if (role === 'super_admin') {
        role = 'customer';
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role,
        isSuperAdmin: isSuperAdmin(u.email),
        ordersCount: u._count.orders,
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      superAdminEmail: SUPER_ADMIN_EMAIL,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 * Grant or revoke admin role for a registered user.
 * STRICTLY restricted to Super Admin (ay8880625@gmail.com) only.
 */
export async function PATCH(req: NextRequest) {
  try {
    const superAdmin = await requireSuperAdmin(req);
    if (!superAdmin) {
      return NextResponse.json(
        {
          error: `Forbidden: Only the Super Admin (${SUPER_ADMIN_EMAIL}) has authority to promote or revoke admin roles.`,
        },
        { status: 403 }
      );
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and target role are required' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'customer') {
      return NextResponse.json(
        { error: 'Invalid role. Only "admin" or "customer" can be assigned.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Protection: Super Admin cannot be demoted or altered
    if (isSuperAdmin(targetUser.email)) {
      return NextResponse.json(
        { error: `The Super Admin (${SUPER_ADMIN_EMAIL}) permissions cannot be modified.` },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} role updated to ${role} by Super Admin.`,
      user: {
        ...updatedUser,
        isSuperAdmin: false,
        createdAt: updatedUser.createdAt.toISOString(),
        lastLoginAt: updatedUser.lastLoginAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
