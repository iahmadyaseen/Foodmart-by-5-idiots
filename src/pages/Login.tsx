import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Mail, Lock, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        navigate(from, { replace: true });
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCustomer = async () => {
    setLoading(true);
    await demoLogin(false);
    navigate(from, { replace: true });
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    await demoLogin(true);
    navigate('/admin', { replace: true });
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
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Owner
            </button>
          </div>
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
            <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
              Password
            </label>
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
            className="w-full py-3.5 rounded-2xl bg-[#E8483F] hover:bg-[#C93630] text-white font-bold text-sm shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-[#E8483F] hover:underline">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
};
