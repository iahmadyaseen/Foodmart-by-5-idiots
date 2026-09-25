'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
}) => {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
      } else if (requireSuperAdmin && !isSuperAdmin) {
        router.push('/admin');
      } else if (requireAdmin && !isAdmin) {
        router.push('/');
      }
    }
  }, [user, loading, isAdmin, isSuperAdmin, requireAdmin, requireSuperAdmin, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8483F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-[#F1E4D8] rounded-3xl text-center shadow-xl">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#242424] mb-2">Super Admin Access Required</h2>
        <p className="text-sm text-[#737373] mb-6">
          This management section is strictly reserved for Super Administrator (ay8880625@gmail.com).
        </p>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-[#F1E4D8] rounded-3xl text-center shadow-xl">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#242424] mb-2">Access Denied</h2>
        <p className="text-sm text-[#737373] mb-6">
          This area is restricted to authorized FOOD MART administrators only.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
