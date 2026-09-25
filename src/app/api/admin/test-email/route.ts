import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isSuperAdmin } from '@/lib/auth';
import { getEmailConfigStatus, sendTestEmailToSuperAdmin } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const status = getEmailConfigStatus();
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to get email status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
    }

    const result = await sendTestEmailToSuperAdmin();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, note: error?.message || 'Failed to dispatch test email' },
      { status: 500 }
    );
  }
}
