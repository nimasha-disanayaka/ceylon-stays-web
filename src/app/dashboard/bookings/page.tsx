'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, User, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
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
        <p className="text-sm text-slate-300 mt-1">Manage incoming guest reservations and status changes in real-time</p>
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
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white font-outfit">{item.foreigner?.name || 'Guest'}</p>
                          <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{item.foreigner?.email}</span>
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
                      {item.status === 'CONFIRMED' && (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmed</span>
                        </span>
                      )}
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                      {item.status === 'CANCELLED' && (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelled</span>
                        </span>
                      )}
                      {item.status === 'COMPLETED' && (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      )}
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
                            onClick={() => handleStatusChange(item.id, 'CANCELLED')}
                            className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
