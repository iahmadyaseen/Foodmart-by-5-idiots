'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  className?: string;
  redirectTo?: string;
}

export function GoogleSignInButton({ onSuccess, className = '', redirectTo }: GoogleSignInButtonProps) {
  const router = useRouter();
  const { setAuthenticatedUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [googleClientAvailable, setGoogleClientAvailable] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Initialize real Google Identity Services if client ID is configured
  useEffect(() => {
    if (typeof window !== 'undefined' && googleClientId) {
      const initGsi = () => {
        if ((window as any).google?.accounts?.id) {
          try {
            (window as any).google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleGoogleCredentialResponse,
              auto_select: false,
            });
            setGoogleClientAvailable(true);
          } catch (e) {
            console.warn('GIS init error:', e);
          }
        }
      };

      if ((window as any).google?.accounts?.id) {
        initGsi();
      }
    }
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user) {
          setAuthenticatedUser({
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            photoURL: data.user.photoURL || undefined,
            role: data.user.role,
            createdAt: data.user.createdAt,
            lastLoginAt: data.user.lastLoginAt,
          });
        }
        if (onSuccess) onSuccess();
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(data.user?.role === 'super_admin' ? '/admin' : '/');
        }
      }
    } catch (err) {
      console.error('Google Sign In error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectGoogleLogin = async (email: string, name: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || email.split('@')[0],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user) {
          setAuthenticatedUser({
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            photoURL: data.user.photoURL || undefined,
            role: data.user.role,
            createdAt: data.user.createdAt,
            lastLoginAt: data.user.lastLoginAt,
          });
        }
        setShowModal(false);
        if (onSuccess) onSuccess();
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(data.user?.role === 'super_admin' ? '/admin' : '/');
        }
      }
    } catch (err) {
      console.error('Local Google Sign In error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (googleClientAvailable && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt();
        return;
      } catch (e) {
        // Fallback to modal dialog
      }
    }
    setShowModal(true);
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (googleClientId && (window as any).google?.accounts?.id) {
            (window as any).google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleGoogleCredentialResponse,
            });
            setGoogleClientAvailable(true);
          }
        }}
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-2xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 ${className}`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-[#E8483F] border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      {/* Google Account Selector Modal (Localhost / Zero Config) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#F1E4D8] p-6 max-w-sm w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 className="font-black text-sm text-[#242424]">Google Identity Sign-In</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#737373]">
              Enter your Google Account email to sign in:
            </p>

            {/* Google Account Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#242424] uppercase mb-1">
                  Google Email
                </label>
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white text-sm font-bold border border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#242424] uppercase mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white text-sm font-bold border border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                />
              </div>

              <button
                type="button"
                disabled={!customEmail.includes('@') || loading}
                onClick={() => handleDirectGoogleLogin(customEmail, customName || customEmail.split('@')[0])}
                className="w-full py-3 rounded-xl bg-[#E8483F] hover:bg-[#C93630] text-white font-bold text-sm disabled:opacity-50 transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Continue with Google</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
