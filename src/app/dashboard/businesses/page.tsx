'use client';

import { useState } from 'react';
import { Store, Plus, MapPin, AlertCircle, X, Check, Trash2, Pencil, BedDouble, Users, Tag, DollarSign } from 'lucide-react';
import { api } from '@/services/api';
import { useBusinesses } from '@/context/BusinessContext';
import { ImageUpload } from '@/components/ImageUpload';

export default function BusinessesPage() {
  const { businesses, loading, fetchBusinesses, addBusinessLocally, updateBusiness, deleteBusiness } = useBusinesses();
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [viewListingsBiz, setViewListingsBiz] = useState<any | null>(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'HOTEL',
    description: '',
    address: '',
    latitude: 5.9483,
    longitude: 80.4716,
    photoUrl: '',
  });

  const [roomFormData, setRoomFormData] = useState({
    name: '',
    description: '',
    pricePerNight: 85.0,
    maxGuests: 2,
    amenitiesString: 'WiFi, AC, Sea View',
    photoUrl: '',
  });

  // Blocked Dates State
  const [blockDatesRoom, setBlockDatesRoom] = useState<any | null>(null);
  const [roomBlockedDates, setRoomBlockedDates] = useState<any[]>([]);
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(false);
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('Room maintenance & repairs');
  const [submittingBlock, setSubmittingBlock] = useState(false);

  const handleOpenBlockDatesModal = (room: any) => {
    setBlockDatesRoom(room);
    setBlockStartDate('');
    setBlockEndDate('');
    setBlockReason('Room maintenance & repairs');
    setError('');
    setSuccessMsg('');
    fetchRoomBlockedDates(room.id);
  };

  const fetchRoomBlockedDates = async (roomId: string) => {
    try {
      setLoadingBlockedDates(true);
      const res = await api.get(`/listings/${roomId}/blocked-dates`);
      if (res.data && res.data.blockedDates) {
        setRoomBlockedDates(res.data.blockedDates);
      }
    } catch (err) {
      console.warn('Error fetching room blocked dates:', err);
    } finally {
      setLoadingBlockedDates(false);
    }
  };

  const handleCreateBlockDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDatesRoom || !blockStartDate || !blockEndDate) return;
    setError('');
    setSuccessMsg('');
    try {
      setSubmittingBlock(true);
      await api.post(`/listings/${blockDatesRoom.id}/blocked-dates`, {
        startDate: blockStartDate,
        endDate: blockEndDate,
        reason: blockReason,
      });
      setSuccessMsg('Date range blocked successfully!');
      setBlockStartDate('');
      setBlockEndDate('');
      fetchRoomBlockedDates(blockDatesRoom.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to block dates');
    } finally {
      setSubmittingBlock(false);
    }
  };

  const handleDeleteBlockedDate = async (blockId: string) => {
    if (!blockDatesRoom) return;
    try {
      await api.delete(`/listings/${blockDatesRoom.id}/blocked-dates/${blockId}`);
      setSuccessMsg('Blocked date range removed.');
      fetchRoomBlockedDates(blockDatesRoom.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove blocked dates');
    }
  };

  const confirmDeleteProperty = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    setError('');
    try {
      await deleteBusiness(deleteTarget.id);
      setSuccessMsg(`Property "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Failed to delete property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Property name and address are required.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || undefined,
        address: formData.address.trim(),
        latitude: isNaN(Number(formData.latitude)) ? 5.9483 : Number(formData.latitude),
        longitude: isNaN(Number(formData.longitude)) ? 80.4716 : Number(formData.longitude),
        imageUrls: formData.photoUrl ? [formData.photoUrl] : undefined,
      };

      const res = await api.post('/businesses', payload);

      if (res.status === 201 || res.data?.business) {
        const newBiz = res.data?.business;
        if (newBiz) {
          addBusinessLocally(newBiz);
        }
        setSuccessMsg('Property created successfully!');
        setShowModal(false);
        setFormData({
          name: '',
          type: 'HOTEL',
          description: '',
          address: '',
          latitude: 5.9483,
          longitude: 80.4716,
          photoUrl: '',
        });
        await fetchBusinesses(false);
      }
    } catch (err: any) {
      console.error('Create property error:', err);
      let serverMsg = 'Failed to create property. Please try again.';

      if (err.response?.data?.error) {
        serverMsg = err.response.data.error;
      } else if (err.response?.data?.message) {
        serverMsg = err.response.data.message;
      } else if (err.response?.data?.details) {
        serverMsg = JSON.stringify(err.response.data.details);
      } else if (!err.response) {
        serverMsg = 'Unable to connect to backend server on port 5000.';
      }

      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewListingsBiz) return;
    setError('');
    setSubmitting(true);

    try {
      const amenities = roomFormData.amenitiesString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post('/listings', {
        businessId: viewListingsBiz.id,
        name: roomFormData.name,
        description: roomFormData.description,
        pricePerNight: Number(roomFormData.pricePerNight),
        maxGuests: Number(roomFormData.maxGuests),
        amenities,
      });

      const newListing = res.data.listing;
      
      // Update local state
      setViewListingsBiz((prev: any) => ({
        ...prev,
        listings: [newListing, ...(prev.listings || [])],
      }));

      setShowAddRoomModal(false);
      setRoomFormData({
        name: '',
        description: '',
        pricePerNight: 85.0,
        maxGuests: 2,
        amenitiesString: 'WiFi, AC, Sea View',
        photoUrl: '',
      });
      await fetchBusinesses(false);
    } catch (err: any) {
      console.error('Add room error:', err);
      setError(err.response?.data?.error || 'Failed to add room listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;
    setError('');
    setSuccessMsg('');

    if (!editingBusiness.name.trim() || !editingBusiness.address.trim()) {
      setError('Property name and address are required.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: editingBusiness.name.trim(),
        type: editingBusiness.type,
        description: editingBusiness.description.trim() || undefined,
        address: editingBusiness.address.trim(),
        latitude: isNaN(Number(editingBusiness.latitude)) ? 5.9483 : Number(editingBusiness.latitude),
        longitude: isNaN(Number(editingBusiness.longitude)) ? 80.4716 : Number(editingBusiness.longitude),
      };

      await updateBusiness(editingBusiness.id, payload);
      setSuccessMsg(`Property "${editingBusiness.name}" updated successfully!`);
      setEditingBusiness(null);
    } catch (err: any) {
      console.error('Update property error:', err);
      let serverMsg = 'Failed to update property. Please try again.';

      if (err.response?.data?.error) {
        serverMsg = err.response.data.error;
      } else if (err.response?.data?.message) {
        serverMsg = err.response.data.message;
      }

      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading your properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Properties</h1>
          <p className="text-sm text-slate-400 mt-1">Manage hotels, homestays, and room listings</p>
        </div>

        <button
          onClick={() => {
            setError('');
            setSuccessMsg('');
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl transition duration-200 shadow-lg shadow-emerald-600/20 flex items-center space-x-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-emerald-400 text-sm">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Property Cards Grid */}
      {businesses.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold text-lg">No Properties Found</p>
          <p className="text-xs text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
            You haven't listed any properties yet. Add a hotel, homestay, or restaurant to start taking reservations.
          </p>
          <button
            onClick={() => {
              setError('');
              setSuccessMsg('');
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 inline-flex items-center space-x-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => (
            <div key={biz.id} className="glass-card-interactive p-6 rounded-3xl flex flex-col justify-between border border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {biz.type}
                  </span>
                  
                  {/* Clickable Listings Badge */}
                  <button
                    onClick={() => setViewListingsBiz(biz)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
                    title="Click to view room listings for this property"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{biz.listings?.length || 0} Listings</span>
                    <BedDouble className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{biz.name}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{biz.description || 'No description provided.'}</p>

                <div className="flex items-start space-x-2 text-xs text-slate-400 mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{biz.address}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => setViewListingsBiz(biz)}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>View Rooms ({biz.listings?.length || 0})</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setEditingBusiness({
                        id: biz.id,
                        name: biz.name || '',
                        type: biz.type || 'HOTEL',
                        description: biz.description || '',
                        address: biz.address || '',
                        latitude: biz.latitude || 5.9483,
                        longitude: biz.longitude || 80.4716,
                      });
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                    title="Edit Property"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: biz.id, name: biz.name })}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete Property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Property Listings Modal */}
      {viewListingsBiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl max-h-[85vh] p-6 md:p-8 rounded-3xl shadow-2xl relative border border-slate-700/80 flex flex-col">
            <button
              onClick={() => setViewListingsBiz(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {viewListingsBiz.type}
                  </span>
                  <h2 className="text-2xl font-bold text-white">{viewListingsBiz.name}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">Room & Suite Listings for this property</p>
              </div>

              <button
                onClick={() => {
                  setError('');
                  setShowAddRoomModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 mr-10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room Listing</span>
              </button>
            </div>

            {/* Listings Grid inside Modal */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {(!viewListingsBiz.listings || viewListingsBiz.listings.length === 0) ? (
                <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
                  <BedDouble className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">No Room Listings Yet</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Add rooms, suites, or dining items for this property.</p>
                  <button
                    onClick={() => {
                      setError('');
                      setShowAddRoomModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl transition"
                  >
                    + Add First Room Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewListingsBiz.listings.map((room: any) => (
                    <div key={room.id} className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-white">{room.name}</h4>
                          <span className="text-base font-extrabold text-emerald-400 font-mono">${room.pricePerNight}<span className="text-xs text-slate-400 font-normal">/night</span></span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{room.description || 'No detailed description.'}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-slate-300 mb-3">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Up to {room.maxGuests} guests</span>
                          </span>
                        </div>

                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {room.amenities.map((a: string, idx: number) => (
                              <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <button
                          onClick={() => handleOpenBlockDatesModal(room)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                        >
                          <span>🔒 Block Dates</span>
                        </button>
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && viewListingsBiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl relative border border-slate-700/80">
            <button
              onClick={() => setShowAddRoomModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Add Room Listing</h2>
            <p className="text-xs text-slate-400 mb-6">Create room for <span className="text-emerald-400 font-semibold">{viewListingsBiz.name}</span></p>

            {error && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Room Listing Title
                </label>
                <input
                  type="text"
                  required
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  placeholder="e.g. Deluxe Ocean View Suite"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  placeholder="Room highlights, bed type, view..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Price per Night ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={roomFormData.pricePerNight}
                    onChange={(e) => setRoomFormData({ ...roomFormData, pricePerNight: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    required
                    value={roomFormData.maxGuests}
                    onChange={(e) => setRoomFormData({ ...roomFormData, maxGuests: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={roomFormData.amenitiesString}
                  onChange={(e) => setRoomFormData({ ...roomFormData, amenitiesString: e.target.value })}
                  placeholder="WiFi, AC, Sea View, Balcony"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <ImageUpload
                value={roomFormData.photoUrl}
                onChange={(url) => setRoomFormData({ ...roomFormData, photoUrl: url })}
                label="Room Photo"
              />

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 active:scale-95"
                >
                  {submitting ? 'Creating...' : 'Save Room Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Property Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl shadow-2xl relative border border-red-500/30">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Property</h3>
                <p className="text-xs text-slate-400">Action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">"{deleteTarget.name}"</span>? All associated room listings under this property will also be permanently deleted.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={confirmDeleteProperty}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-red-600/20 disabled:opacity-50 active:scale-95"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Property'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl relative border border-slate-700/80">
            <button
              onClick={() => setEditingBusiness(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-1">Edit Property</h2>
            <p className="text-xs text-slate-400 mb-6">Update details for {editingBusiness.name}</p>

            {error && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdateBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Property Name
                </label>
                <input
                  type="text"
                  required
                  value={editingBusiness.name}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Property Type
                </label>
                <select
                  value={editingBusiness.type}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="HOTEL">Hotel</option>
                  <option value="HOMESTAY">Homestay</option>
                  <option value="RESTAURANT">Restaurant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={editingBusiness.address}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingBusiness.description}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Latitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingBusiness.latitude}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Longitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingBusiness.longitude}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 active:scale-95"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Property Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl relative border border-slate-700/80">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-1">Add New Property</h2>
            <p className="text-xs text-slate-400 mb-6">List a new hotel, homestay, or restaurant</p>

            {error && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Property Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mirissa Ocean Breeze Resort"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Property Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="HOTEL">Hotel</option>
                  <option value="HOMESTAY">Homestay</option>
                  <option value="RESTAURANT">Restaurant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Beach Road, Mirissa, Sri Lanka"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <ImageUpload
                value={formData.photoUrl}
                onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                label="Property Cover Photo"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your property amenities and location highlights..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Latitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Longitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
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
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 active:scale-95"
                >
                  {submitting ? 'Creating...' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Block Dates & Maintenance Modal */}
      {blockDatesRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 md:p-8 rounded-3xl shadow-2xl relative border border-slate-700/80 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setBlockDatesRoom(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Maintenance & Blockouts
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Manage Blocked Dates</h2>
            <p className="text-xs text-slate-400 mb-4">
              Room: <span className="text-emerald-400 font-semibold">{blockDatesRoom.name}</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Existing Blocked Dates */}
            <div className="mb-4 flex-1 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Currently Blocked Ranges
              </h4>

              {loadingBlockedDates ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading blocked dates...</div>
              ) : roomBlockedDates.length === 0 ? (
                <div className="p-4 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-xs text-slate-400">
                  ✨ No dates currently blocked for this room.
                </div>
              ) : (
                <div className="space-y-2">
                  {roomBlockedDates.map((block: any) => (
                    <div
                      key={block.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            🔒 {new Date(block.startDate).toISOString().split('T')[0]} → {new Date(block.endDate).toISOString().split('T')[0]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{block.reason || 'Maintenance'}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteBlockedDate(block.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Remove block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Blocked Range Form */}
            <form onSubmit={handleCreateBlockDates} className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                + Block New Date Range
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={blockStartDate}
                    onChange={(e) => setBlockStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={blockEndDate}
                    onChange={(e) => setBlockEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. AC maintenance, Deep cleaning, Private booking"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBlockDatesRoom(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingBlock}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-amber-600/20 disabled:opacity-50"
                >
                  {submittingBlock ? 'Saving...' : '🔒 Block Dates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
