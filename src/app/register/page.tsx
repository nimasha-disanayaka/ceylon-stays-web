'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, UserPlus, Lock, Mail, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'OWNER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Restrict input to digits only and cap at 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Phone number validation: if provided, must be exactly 10 digits
    if (formData.phone && formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits (e.g. 0712563369).');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      const serverMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.response
          ? `Server Error (${err.response.status})`
          : 'Unable to connect to backend server. Make sure backend is running on port 5000.');
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2.5 mb-4">
            <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <Building2 className="w-8 h-8" />
            </div>
            <span className="text-2xl font-extrabold text-white">PartnerHub</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Register Business Account</h2>
          <p className="text-sm text-slate-400 mt-1">Start listing hotels, homestays, and restaurants</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Owner"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="owner@example.com"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Phone Number (10 Digits)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">{formData.phone.length}/10</span>
              </div>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="0712563369"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition text-sm font-mono tracking-wider"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition text-sm"
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
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:opacity-95 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Register as Business Owner</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign in to Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
