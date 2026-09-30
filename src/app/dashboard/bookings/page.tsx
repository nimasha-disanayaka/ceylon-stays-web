'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, User, Mail, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/owner-bookings');
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600/30 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Declined</span>
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>No-Show</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  const getPaymentStatusDisplay = (item: any) => {
    const status = item.status;
    const paymentStatus = item.paymentStatus;
    const totalPrice = item.totalPrice || 0;

    if (status === 'PENDING') {
      return (
        <span className="text-xs font-semibold text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
          Authorized (Card Held)
        </span>
      );
    }

    if (status === 'DECLINED') {
      return (
        <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
          Released (Not Charged)
        </span>
      );
    }

    if (status === 'NO_SHOW') {
      return (
        <span className="text-xs font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-500/30">
          Captured (No Refund)
        </span>
      );
    }

    if (status === 'CANCELLED') {
      if (paymentStatus === 'REFUNDED') {
        return (
          <span className="text-xs font-bold text-teal-400 bg-teal-950/40 px-2.5 py-1 rounded-md border border-teal-500/30">
            Refunded 100% (${totalPrice.toFixed(2)})
          </span>
        );
      } else if (paymentStatus === 'PARTIAL_REFUND') {
        return (
          <span className="text-xs font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-500/30">
            Refunded 50% (${(totalPrice * 0.5).toFixed(2)})
          </span>
        );
      } else {
        return (
          <span className="text-xs font-bold text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-500/30">
            No Refund (Within 24h)
          </span>
        );
      }
    }

    if (status === 'CONFIRMED' || status === 'COMPLETED') {
      return (
        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/30">
          Captured (${totalPrice.toFixed(2)})
        </span>
      );
    }

    return <span className="text-xs text-slate-400">{paymentStatus || 'Pending'}</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400 font-outfit">Loading incoming guest reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-teal-500/15">
        <h1 className="text-3xl font-black text-white tracking-tight font-outfit">Reservations & Bookings</h1>
        <p className="text-sm text-slate-300 mt-1">Manage incoming guest reservations, payment statuses, and host actions in real-time</p>
      </div>

      {/* Bookings List Table */}
      {bookings.length === 0 ? (
        <div className="ceylon-glass p-12 text-center rounded-3xl border border-dashed border-slate-700/80">
          <CalendarCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-black text-xl font-outfit">No Reservations Received Yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When international travelers book your Sri Lanka room listings, their reservations will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="ceylon-glass rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0a1122] text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 font-outfit">
                <tr>
                  <th className="px-6 py-4">Guest Details</th>
                  <th className="px-6 py-4">Listing / Room</th>
                  <th className="px-6 py-4">Check-in / Check-out</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Booking Status</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {bookings.map((item) => {
                  const isCheckInPassed = new Date(item.checkIn) < new Date();
                  const isCheckOutPassed = new Date(item.checkOut) < new Date();

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-white font-outfit">{item.foreigner?.name || 'John Traveler'}</p>
                            <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              <span>{item.foreigner?.email || 'traveler@gmail.com'}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{item.listing?.name}</p>
                        <p className="text-xs text-slate-400">${item.listing?.pricePerNight} / night</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-300 font-semibold">
                          {new Date(item.checkIn).toLocaleDateString()} &rarr; {new Date(item.checkOut).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-black text-teal-400 font-outfit text-base">
                        ${item.totalPrice?.toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>

                      <td className="px-6 py-4">
                        {getPaymentStatusDisplay(item)}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        {item.status === 'PENDING' && (
                          <>
                            <button
                              disabled={updatingId === item.id}
                              onClick={() => handleStatusChange(item.id, 'CONFIRMED')}
                              className="px-3.5 py-1.5 bg-ceylon-gradient hover:opacity-95 text-white text-xs font-bold rounded-lg transition"
                            >
                              Accept
                            </button>
                            <button
                              disabled={updatingId === item.id}
                              onClick={() => handleStatusChange(item.id, 'DECLINED')}
                              className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {item.status === 'CONFIRMED' && (
                          <div className="inline-flex space-x-2">
                            {isCheckInPassed && (
                              <button
                                disabled={updatingId === item.id}
                                onClick={() => handleStatusChange(item.id, 'NO_SHOW')}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-lg transition"
                              >
                                Mark No-Show
                              </button>
                            )}
                            <button
                              disabled={updatingId === item.id}
                              onClick={() => handleStatusChange(item.id, 'COMPLETED')}
                              className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold rounded-lg transition"
                            >
                              Mark Completed
                            </button>
                          </div>
                        )}

                        {(item.status === 'CANCELLED' || item.status === 'DECLINED' || item.status === 'NO_SHOW' || item.status === 'COMPLETED') && (
                          <span className="text-xs text-slate-500 italic">Read-only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
