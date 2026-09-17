'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Star,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

import { BusinessProvider } from '@/context/BusinessContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'OWNER') {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
    { name: 'Listings', href: '/dashboard/businesses', icon: BedDouble },
    { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-slate-400 font-medium">
        Loading Ceylon Stays Dashboard...
      </div>
    );
  }

  return (
    <BusinessProvider>
      <div className="min-h-screen bg-[#121212] text-slate-100 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-60 bg-[#161616] border-r border-[#262626] p-6 flex flex-col justify-between shrink-0">
          <div>
            {/* Brand Title */}
            <Link href="/dashboard" className="block mb-8">
              <span className="text-xl font-bold text-white tracking-tight">Ceylon Stays</span>
            </Link>

            {/* Sidebar Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-[#2a2a2a] text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-[#222222]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Info & Logout */}
          <div className="pt-6 border-t border-[#262626]">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="p-2 bg-[#242424] rounded-lg text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
      </div>
    </BusinessProvider>
  );
}
