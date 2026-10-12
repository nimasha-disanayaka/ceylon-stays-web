'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Check, Loader2, X } from 'lucide-react';
import { api } from '@/services/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

const PRESET_PHOTOS = [
  { label: 'Beachfront Resort', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
  { label: 'Mountain Villa', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Colonial Heritage', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Infinity Pool Suite', url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80' },
];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Property / Room Photo',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.url) {
        onChange(res.data.url);
      }
    } catch (err: any) {
      console.warn('Upload error:', err);
      setError(err?.response?.data?.error || 'Failed to upload photo. Try using preset photos.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        {label}
      </label>

      {/* Preview Box */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group h-44">
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-lg transition"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold flex items-center space-x-1">
            <Check className="w-3 h-3" />
            <span>Ready</span>
          </span>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition"
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-300">Uploading photo to server...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Click to upload photo from computer</p>
                <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {/* Preset travel photo chips */}
      <div className="pt-1">
        <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Or choose quick sample photo:</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PHOTOS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(p.url)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700/80 transition flex items-center space-x-1"
            >
              <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
