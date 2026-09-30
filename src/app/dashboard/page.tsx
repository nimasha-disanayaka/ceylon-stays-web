'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Check, X, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
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
    const interval = setInterval(() => {
      fetchBookings();
    }, 3000);
    return () => clearInterval(interval);
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
    if (!name) return 'JT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getPaymentStatusDisplay = (item: any) => {
    const status = item.status;
    const paymentStatus = item.paymentStatus;
    const totalPrice = item.totalPrice || 0;

    if (status === 'PENDING') {
      return (
        <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Authorized
        </span>
      );
    }

    if (status === 'DECLINED') {
      return (
        <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          Released
        </span>
      );
    }

    if (status === 'NO_SHOW') {
      return (
        <span className="text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
          Captured (No Refund)
        </span>
      );
    }

    if (status === 'CANCELLED') {
      if (paymentStatus === 'REFUNDED') {
        return (
          <span className="text-xs font-bold text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-500/30">
            Refunded 100% (${totalPrice.toFixed(2)})
          </span>
        );
      } else if (paymentStatus === 'PARTIAL_REFUND') {
        return (
          <span className="text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
            Refunded 50% (${(totalPrice * 0.5).toFixed(2)})
          </span>
        );
      } else {
        return (
          <span className="text-xs font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
            No Refund (Within 24h)
          </span>
        );
      }
    }

    if (status === 'CONFIRMED' || status === 'COMPLETED') {
      return (
        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
          Captured (${totalPrice.toFixed(2)})
        </span>
      );
    }

    return <span className="text-xs text-slate-400">{paymentStatus || 'Pending'}</span>;
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
            ${totalRevenue > 0 ? totalRevenue.toLocaleString('en-US') : '1,280'}
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
            {pendingBookings.length}
          </p>
        </div>
      </div>

      {/* Booking Requests Card */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-6">Booking requests</h2>

        {bookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No incoming guest requests at the moment.
          </div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {bookings.map((item) => {
              const isCheckInPassed = new Date(item.checkIn) < new Date();

              return (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#102a45] text-[#38bdf8] flex items-center justify-center font-bold text-sm shrink-0">
                      {getInitials(item.foreigner?.name)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-white text-base">{item.foreigner?.name || 'John Traveler'}</p>
                        {getPaymentStatusDisplay(item)}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {item.listing?.name} &bull; {new Date(item.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(item.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {item.status === 'PENDING' ? (
                      <>
                        <button
                          disabled={updatingId === item.id}
                          onClick={() => handleStatusChange(item.id, 'DECLINED')}
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
                    ) : item.status === 'CONFIRMED' ? (
                      <div className="flex items-center space-x-2">
                        {isCheckInPassed && (
                          <button
                            disabled={updatingId === item.id}
                            onClick={() => handleStatusChange(item.id, 'NO_SHOW')}
                            className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-lg transition"
                          >
                            Mark No-Show
                          </button>
                        )}
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                          Confirmed
                        </span>
                      </div>
                    ) : item.status === 'CANCELLED' ? (
                      <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-full">
                        Cancelled
                      </span>
                    ) : item.status === 'DECLINED' ? (
                      <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-full">
                        Declined
                      </span>
                    ) : item.status === 'NO_SHOW' ? (
                      <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold rounded-full">
                        No-Show
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-700/40 text-slate-300 text-xs font-bold rounded-full">
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
