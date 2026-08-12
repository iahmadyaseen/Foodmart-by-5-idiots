import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please provide your name and email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await signup(name, email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#F1E4D8] p-8 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <Logo size="lg" />
          <h1 className="text-2xl font-black text-[#242424] tracking-tight pt-2">
            Create Food Mart Account
          </h1>
          <p className="text-xs text-[#737373]">
            Sign up to save delivery addresses and receive exclusive grocery discounts.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-[#242424] font-bold text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                placeholder="Ali Ahmed"
              />
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
                placeholder="ali@example.com"
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
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#E8483F] hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
