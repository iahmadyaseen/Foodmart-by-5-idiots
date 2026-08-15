'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Check, LogOut, PackageCheck } from 'lucide-react';

function ProfileContent() {
  const { user, updateProfileData, logout, isAdmin } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileData({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider">Account Settings</span>
        <h1 className="text-3xl font-black text-[#242424] tracking-tight mt-1">
          Customer Profile
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-[#F1E4D8] p-8 shadow-xs space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#F1E4D8]">
          <div className="w-16 h-16 rounded-full bg-[#E8483F] text-white font-black text-2xl flex items-center justify-center uppercase shadow-md">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#242424]">{user?.name}</h2>
            <p className="text-xs text-[#737373]">{user?.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                Admin / Owner Role
              </span>
            )}
          </div>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-[#242424] font-bold text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
              Email Address (Permanent)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 text-[#242424] font-bold text-sm border border-neutral-200 cursor-not-allowed opacity-80"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#E8483F] text-white font-bold text-xs shadow-md hover:bg-[#C93630] transition-colors flex items-center gap-2 cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              {saved ? 'Saved Changes!' : 'Update Profile'}
            </button>

            <Link
              href="/orders"
              className="px-6 py-2.5 rounded-xl bg-[#FFF4E8] text-[#242424] font-bold text-xs border border-[#F1E4D8] flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4 text-[#E8483F]" />
              View Orders
            </Link>
          </div>
        </form>

        <div className="pt-6 border-t border-[#F1E4D8]">
          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="px-6 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
