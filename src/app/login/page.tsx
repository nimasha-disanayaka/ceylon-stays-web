'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Palmtree, LogIn, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (user.role !== 'OWNER') {
        setError('Access denied: Only Business Owners can access this dashboard.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2.5 mb-4">
            <div className="p-3 bg-gradient-to-br from-teal-500/20 to-amber-500/20 border border-teal-500/30 rounded-2xl text-teal-400">
              <Palmtree className="w-8 h-8 text-teal-400" />
            </div>
            <span className="text-2xl font-black text-white font-outfit">
              Ceylon<span className="gradient-ceylon-emerald">Stays</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight font-outfit">Owner Portal Sign In</h2>
          <p className="text-sm text-slate-300 mt-1">Access your Sri Lanka property & reservation dashboard</p>
        </div>

        <div className="ceylon-glass p-8 rounded-3xl shadow-2xl border border-teal-500/20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Owner Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@gmail.com"
                  className="w-full bg-[#0a1122] border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a1122] border border-slate-700/80 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-ceylon-gradient hover:opacity-95 text-white font-bold rounded-xl transition shadow-lg shadow-teal-600/25 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In to Owner Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-6">
            Don't have an owner account?{' '}
            <Link href="/register" className="text-teal-400 font-bold hover:underline">
              Register your Sri Lanka business here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
