'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';

interface BusinessContextType {
  businesses: any[];
  loading: boolean;
  fetchBusinesses: (showLoading?: boolean) => Promise<void>;
  addBusinessLocally: (business: any) => void;
  updateBusiness: (id: string, payload: any) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType>({
  businesses: [],
  loading: true,
  fetchBusinesses: async () => {},
  addBusinessLocally: () => {},
  updateBusiness: async () => {},
  deleteBusiness: async () => {},
});

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get('/businesses/my-businesses');
      setBusinesses(res.data.businesses || []);
    } catch (err) {
      console.error('Failed to fetch businesses in Context:', err);
    } finally {
      setLoading(false);
    }
  };

  const addBusinessLocally = (newBiz: any) => {
    setBusinesses((prev) => [newBiz, ...prev.filter((b) => b.id !== newBiz.id)]);
  };

  const updateBusiness = async (id: string, payload: any) => {
    try {
      const res = await api.put(`/businesses/${id}`, payload);
      const updated = res.data.business;
      setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    } catch (err) {
      console.error('Failed to update business:', err);
      throw err;
    }
  };

  const deleteBusiness = async (id: string) => {
    try {
      await api.delete(`/businesses/${id}`);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete business:', err);
      throw err;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchBusinesses(true);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <BusinessContext.Provider value={{ businesses, loading, fetchBusinesses, addBusinessLocally, updateBusiness, deleteBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinesses() {
  return useContext(BusinessContext);
}
