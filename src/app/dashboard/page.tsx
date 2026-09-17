'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Check, X } from 'lucide-react';
import { useBusinesses } from '@/context/BusinessContext';
import { api } from '@/services/api';

export default function DashboardOverviewPage() {
  const { businesses, loading: bizLoading } = useBusinesses();
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/owner-bookings');
      setBookings(res.data.bookings || []);
    } catch (e) {
      console.error('Failed to fetch owner bookings:', e);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status');
    } finally {
      setUpdatingId(null);
    }
  };

  const primaryBusiness = businesses[0];
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
  const totalRevenue = confirmedBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  // Helper for 2-letter initials (e.g. James Smith -> JS)
  const getInitials = (name?: string) => {
    if (!name) return 'GS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (bizLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading overview dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Good evening, {user?.name?.split(' ')[0] || 'Nimal'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {primaryBusiness?.name || 'Mirissa Beach Homestay'}
          </p>
        </div>

        <div>
          <Link
            href="/dashboard/businesses"
            className="px-4 py-2.5 bg-transparent border border-[#3a3a3a] hover:bg-[#262626] text-white text-sm font-semibold rounded-xl transition inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add listing</span>
          </Link>
        </div>
      </div>

      {/* 3 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Revenue */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-2xl">
          <p className="text-sm font-medium text-slate-400 mb-3">This month's revenue</p>
          <p className="text-4xl font-extrabold text-white">
            ${totalRevenue > 0 ? totalRevenue.toLocaleString('en-US') : '1,240'}
          </p>
        </div>

        {/* Card 2: Occupancy rate */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-2xl">
          <p className="text-sm font-medium text-slate-400 mb-3">Occupancy rate</p>
          <p className="text-4xl font-extrabold text-white">68%</p>
        </div>

        {/* Card 3: Pending requests */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-2xl">
          <p className="text-sm font-medium text-slate-400 mb-3">Pending requests</p>
          <p className="text-4xl font-extrabold text-[#3b82f6]">
            {pendingBookings.length > 0 ? pendingBookings.length : 3}
          </p>
        </div>
      </div>

      {/* Booking Requests Card */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-6">Booking requests</h2>

        {bookings.length === 0 ? (
          <div className="space-y-4">
            {/* Demo Row 1: James Smith */}
            <div className="flex items-center justify-between py-4 border-b border-[#262626]">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#102a45] text-[#38bdf8] flex items-center justify-center font-bold text-sm">
                  JS
                </div>
                <div>
                  <p className="font-bold text-white text-base">James Smith</p>
                  <p className="text-xs text-slate-400 mt-0.5">Sea View Room &bull; Oct 12-15</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-transparent border border-red-900/60 hover:bg-red-950/40 text-red-400 text-xs font-semibold rounded-lg transition">
                  Decline
                </button>
                <button className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg transition">
                  Accept
                </button>
              </div>
            </div>

            {/* Demo Row 2: Anna Keller */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#102a45] text-[#38bdf8] flex items-center justify-center font-bold text-sm">
                  AK
                </div>
                <div>
                  <p className="font-bold text-white text-base">Anna Keller</p>
                  <p className="text-xs text-slate-400 mt-0.5">Garden Room &bull; Oct 20-22</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-transparent border border-red-900/60 hover:bg-red-950/40 text-red-400 text-xs font-semibold rounded-lg transition">
                  Decline
                </button>
                <button className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg transition">
                  Accept
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {bookings.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#102a45] text-[#38bdf8] flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(item.foreigner?.name)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{item.foreigner?.name || 'Guest'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.listing?.name} &bull; {new Date(item.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(item.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {item.status === 'PENDING' ? (
                    <>
                      <button
                        disabled={updatingId === item.id}
                        onClick={() => handleStatusChange(item.id, 'CANCELLED')}
                        className="px-4 py-2 bg-transparent border border-red-900/60 hover:bg-red-950/40 text-red-400 text-xs font-semibold rounded-lg transition"
                      >
                        Decline
                      </button>
                      <button
                        disabled={updatingId === item.id}
                        onClick={() => handleStatusChange(item.id, 'CONFIRMED')}
                        className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg transition shadow-md shadow-blue-600/20"
                      >
                        Accept
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1 rounded-md ${
                      item.status === 'CONFIRMED' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-red-950/60 text-red-400 border border-red-800/40'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
