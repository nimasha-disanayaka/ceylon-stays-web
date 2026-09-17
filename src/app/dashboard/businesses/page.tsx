'use client';

import { useState } from 'react';
import { Store, Plus, MapPin, AlertCircle, X, Check, Trash2, Pencil } from 'lucide-react';
import { api } from '@/services/api';
import { useBusinesses } from '@/context/BusinessContext';

export default function BusinessesPage() {
  const { businesses, loading, fetchBusinesses, addBusinessLocally, updateBusiness, deleteBusiness } = useBusinesses();
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
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
  });

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
          <p className="text-sm text-slate-400 mt-1">Manage hotels, homestays, and restaurants</p>
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
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {biz.listings?.length || 0} Listings
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{biz.name}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{biz.description || 'No description provided.'}</p>

                <div className="flex items-start space-x-2 text-xs text-slate-400 mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{biz.address}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">ID: {biz.id.slice(0, 8)}...</span>
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
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1 ml-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
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
    </div>
  );
}
