'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import {
  Mail,
  Lock,
  UserCheck,
  AlertCircle,
  Crown,
  KeyRound,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

function LoginContent() {
  const { login, demoLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  // URL query params from magic link
  const urlCode = searchParams.get('code') || '';
  const urlEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(urlEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password / Email Sign-In State
  const [showForgotModal, setShowForgotModal] = useState(Boolean(urlCode && urlEmail));
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>(
    urlCode && urlEmail ? 'verify' : 'request'
  );
  const [forgotEmail, setForgotEmail] = useState(urlEmail);
  const [resetCode, setResetCode] = useState(urlCode);
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(urlCode || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (success) {
        router.push(from);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCustomer = async () => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(false);
      router.push(from);
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(true);
      router.push('/admin');
    } catch (err: any) {
      setError(err?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  // 1. Request Reset Code / Magic Link via Email
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setForgotMessage(data.message);
      if (data.devCode) {
        setDevCode(data.devCode);
        setResetCode(data.devCode);
      }
      setForgotStep('verify');
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to send reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 2. Verify Code & Sign In or Reset Password
  const handleVerifyAndSignIn = async (resetPass: boolean = false) => {
    if (!resetCode) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (resetPass && (!newPassword || newPassword.length < 6)) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: resetCode.trim(),
          newPassword: resetPass ? newPassword : undefined,
          signMeIn: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setShowForgotModal(false);
      router.push(data.user?.role === 'super_admin' ? '/admin' : from);
      window.location.reload();
    } catch (err: any) {
      setForgotError(err?.message || 'Verification failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#F1E4D8] p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" />
          <h1 className="text-2xl font-black text-[#242424] tracking-tight pt-2">
            Welcome Back
          </h1>
          <p className="text-xs text-[#737373]">
            Sign in to access your saved orders, favorites, and checkout.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Login Buttons */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <p className="text-[11px] font-bold uppercase text-amber-900">
            One-Click Instant Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="py-2 px-3 rounded-xl bg-white border border-amber-300 text-[#242424] text-xs font-bold shadow-xs hover:scale-102 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Customer
            </button>

            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-2 px-3 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-xs hover:scale-102 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
              Super Admin
            </button>
          </div>
        </div>

        {/* Google Identity Sign-In */}
        <GoogleSignInButton redirectTo={from} />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Or with email & password
          </span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-[#242424] font-bold text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                placeholder="customer@example.com or ay8880625@gmail.com"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#242424] uppercase">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotError(null);
                  setForgotMessage(null);
                  setShowForgotModal(true);
                }}
                className="text-xs font-bold text-[#E8483F] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-[#242424] font-bold text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#E8483F] hover:bg-[#C93630] text-white font-bold text-sm shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500 space-y-2">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold text-[#E8483F] hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD / EMAIL VERIFICATION MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#F1E4D8] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E8483F]/10 text-[#E8483F]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#242424]">
                    {forgotStep === 'request' ? 'Reset Password & Sign In' : 'Enter Verification Code'}
                  </h3>
                  <p className="text-[11px] text-[#737373]">Sign in or reset password via email</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            )}

            {/* Localhost Developer Helper Tip */}
            {devCode && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Localhost Quick-Fill Code:
                </p>
                <p className="font-mono text-base font-black tracking-widest text-[#E8483F]">
                  {devCode}
                </p>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <p className="text-xs text-[#737373] leading-relaxed">
                  Enter your account email address. We will send you a 6-digit verification code and a one-click sign-in link.
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. ay8880625@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-[#242424] font-bold text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-[#E8483F] hover:bg-[#C93630] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: Enter Code & Sign In or Reset Password */
              <div className="space-y-4">
                <p className="text-xs text-[#737373]">
                  Enter the 6-digit code sent to <strong className="text-[#242424]">{forgotEmail}</strong>:
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 rounded-xl bg-white text-[#242424] font-mono font-black text-center text-xl tracking-widest border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none"
                  />
                </div>

                {/* Option A: Quick Sign In directly with code */}
                <button
                  type="button"
                  disabled={forgotLoading || resetCode.length < 6}
                  onClick={() => handleVerifyAndSignIn(false)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Sign In Instantly With Code
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-px bg-neutral-200" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Or change password</span>
                  <div className="flex-1 h-px bg-neutral-200" />
                </div>

                {/* Option B: Set new password */}
                <div>
                  <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                    Set New Password (optional)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-[#242424] font-bold text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {newPassword.length >= 6 && (
                  <button
                    type="button"
                    disabled={forgotLoading}
                    onClick={() => handleVerifyAndSignIn(true)}
                    className="w-full py-2.5 rounded-xl bg-[#242424] hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Reset Password & Sign In
                  </button>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('request')}
                    className="text-xs text-[#737373] hover:text-[#242424] underline cursor-pointer"
                  >
                    Resend code or use different email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
