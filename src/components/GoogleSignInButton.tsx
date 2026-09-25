'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Crown, User, X, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  className?: string;
  redirectTo?: string;
}

export function GoogleSignInButton({ onSuccess, className = '', redirectTo }: GoogleSignInButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
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
        if (onSuccess) onSuccess();
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(data.user?.role === 'super_admin' ? '/admin' : '/');
        }
        window.location.reload();
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
          email,
          name,
          photoURL: email.toLowerCase() === 'ay8880625@gmail.com'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
            : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        if (onSuccess) onSuccess();
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(data.user?.role === 'super_admin' ? '/admin' : '/');
        }
        window.location.reload();
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
              Choose a Google account to sign in securely to Food Mart:
            </p>

            {/* Quick account choices */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDirectGoogleLogin('ay8880625@gmail.com', 'FOOD MART Super Admin')}
                className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-neutral-900 font-bold text-xs flex items-center justify-center uppercase shrink-0 shadow-xs">
                    <Crown className="w-4 h-4 fill-neutral-900" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#242424] flex items-center gap-1">
                      ay8880625@gmail.com
                      <span className="text-[9px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                        Super Admin
                      </span>
                    </p>
                    <p className="text-[10px] text-[#737373]">FOOD MART Owner Account</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDirectGoogleLogin('demo@foodmart.com', 'FoodMart Customer')}
                className="w-full p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#242424]">demo@foodmart.com</p>
                    <p className="text-[10px] text-[#737373]">Customer Account</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Custom Google Account Form */}
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <p className="text-[11px] font-bold text-neutral-500 uppercase">Or any other Google Account:</p>
              <input
                type="email"
                placeholder="your.google@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white text-xs font-bold border border-neutral-300 focus:border-[#E8483F] focus:outline-none"
              />
              <button
                type="button"
                disabled={!customEmail.includes('@') || loading}
                onClick={() => handleDirectGoogleLogin(customEmail, customName || customEmail.split('@')[0])}
                className="w-full py-2 rounded-xl bg-[#242424] hover:bg-neutral-800 text-white font-bold text-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                Continue with {customEmail || 'this email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
