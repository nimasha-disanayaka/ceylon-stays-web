'use client';

import { useState, useEffect } from 'react';
import { BedDouble, Plus, Users, DollarSign, Tag, AlertCircle, X } from 'lucide-react';
import { api } from '@/services/api';
import { useBusinesses } from '@/context/BusinessContext';

export default function ListingsPage() {
  const { businesses, fetchBusinesses } = useBusinesses();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    businessId: '',
    name: '',
    description: '',
    pricePerNight: 85.0,
    maxGuests: 2,
    amenitiesString: 'WiFi, AC, Sea View',
  });

  useEffect(() => {
    fetchData();
  }, [businesses]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (businesses.length > 0) {
        setFormData((prev) => ({
          ...prev,
          businessId: prev.businessId || businesses[0].id,
        }));
        const allListings = businesses.flatMap((b: any) =>
          (b.listings || []).map((l: any) => ({ ...l, businessName: b.name }))
        );
        setListings(allListings);
      } else {
        setListings([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const amenities = formData.amenitiesString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post('/listings', {
        businessId: formData.businessId,
        name: formData.name,
        description: formData.description,
        pricePerNight: Number(formData.pricePerNight),
        maxGuests: Number(formData.maxGuests),
        amenities,
      });

      setShowModal(false);
      setFormData({
        businessId: businesses[0]?.id || '',
        name: '',
        description: '',
        pricePerNight: 85.0,
        maxGuests: 2,
        amenitiesString: 'WiFi, AC, Sea View',
      });
      await fetchBusinesses(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create listing. Please check input.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading room listings...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Listings</h1>
          <p className="text-sm text-slate-400 mt-1">Rooms, Suites, and Restaurant Tables</p>
        </div>

        <button
          onClick={() => {
            if (businesses.length === 0) {
              alert('Please add a business/property first before adding room listings!');
              return;
            }
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Listing</span>
        </button>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-dashed border-slate-800">
          <BedDouble className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold text-lg">No Listings Created</p>
          <p className="text-xs text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
            Add room types, suites, or restaurant tables to your listed properties.
          </p>
          <button
            onClick={() => {
              if (businesses.length === 0) {
                alert('Please add a property first!');
                return;
              }
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Listing</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 truncate max-w-[150px]">
                    {item.businessName}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400 flex items-center">
                    <DollarSign className="w-4 h-4" />
                    {item.pricePerNight} <span className="text-[10px] text-slate-500 font-normal ml-0.5">/night</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{item.description || 'No description'}</p>

                <div className="flex items-center space-x-4 text-xs text-slate-300 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Max {item.maxGuests} Guests</span>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {item.amenities?.map((amenity: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 flex items-center space-x-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-blue-400" />
                      <span>{amenity}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Status: {item.isActive ? 'Active' : 'Inactive'}</span>
                <span className="text-slate-400">ID: {item.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-1">Add New Listing</h2>
            <p className="text-xs text-slate-400 mb-6">Create a room type or item under your property</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Property
                </label>
                <select
                  value={formData.businessId}
                  onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Listing Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Deluxe Sea View Suite"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Price Per Night ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Max Guest Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="King bed, private balcony with sea view, complimentary breakfast..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amenities (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.amenitiesString}
                  onChange={(e) => setFormData({ ...formData, amenitiesString: e.target.value })}
                  placeholder="WiFi, AC, Sea View, Pool, Breakfast"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
