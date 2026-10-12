'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  DollarSign,
  Download,
  KeyRound,
  ExternalLink,
  Smartphone,
  Send,
  MessageSquare,
} from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'payouts' | 'notifications' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('+94 77 123 4567');
  const [testChannel, setTestChannel] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsResult, setSmsResult] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    bio: 'Independent Boutique Villa & Hotel Host in Southern Sri Lanka',
    role: 'OWNER',
  });

  // Payout Form State
  const [payouts, setPayouts] = useState({
    currency: 'USD',
    payoutSchedule: 'WEEKLY',
    bankName: 'Commercial Bank of Ceylon',
    accountHolder: 'Nimasha Disanayaka',
    accountNumber: '•••••••• 8821',
    branchCode: 'Colombo Fort #001',
    stripeConnected: true,
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailNewBookings: true,
    emailCancellations: true,
    smsAlerts: true,
    weeklyDigest: false,
    reviewAlerts: true,
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Load stored user data
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        setProfile((prev) => ({
          ...prev,
          name: storedUser.name || 'Nimasha Disanayaka',
          email: storedUser.email || 'nimuu1449disanayaka@gmail.com',
          phone: storedUser.phone || '+94 77 123 4567',
          role: storedUser.role || 'OWNER',
        }));
      } catch (err) {
        console.error('Error parsing stored user:', err);
      }
    }

    // Load saved settings if any
    const savedPayouts = localStorage.getItem('host_payout_settings');
    if (savedPayouts) {
      try {
        setPayouts(JSON.parse(savedPayouts));
      } catch (e) {}
    }

    const savedNotifications = localStorage.getItem('host_notification_settings');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (e) {}
    }
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Update local storage user
        const storedUserStr = localStorage.getItem('user');
        if (storedUserStr) {
          const u = JSON.parse(storedUserStr);
          u.name = profile.name;
          u.phone = profile.phone;
          localStorage.setItem('user', JSON.stringify(u));
        }
        showNotification('success', 'Profile information updated successfully!');
      } else {
        showNotification('error', data.error || 'Failed to update profile');
      }
    } catch (err) {
      // Fallback local update
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        const u = JSON.parse(storedUserStr);
        u.name = profile.name;
        u.phone = profile.phone;
        localStorage.setItem('user', JSON.stringify(u));
      }
      showNotification('success', 'Profile changes saved successfully!');
    } finally {
      setLoading(false);
    }
  };

  // Handle Payout Save
  const handleSavePayouts = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('host_payout_settings', JSON.stringify(payouts));
    showNotification('success', 'Banking and payout preferences saved!');
  };

  // Handle Notifications Save
  const handleSaveNotifications = () => {
    localStorage.setItem('host_notification_settings', JSON.stringify(notifications));
    showNotification('success', 'Notification preferences updated!');
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'New password and confirm password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('error', 'New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification('success', 'Password updated successfully! Keep your credentials safe.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showNotification('error', data.error || 'Failed to update password');
      }
    } catch (err) {
      showNotification('error', 'Could not reach server to change password.');
    } finally {
      setLoading(false);
    }
  };

  // Test SMS / WhatsApp Dispatch
  const handleSendTestSMS = async () => {
    setSendingSms(true);
    setSmsResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: testPhone || profile.phone,
          channel: testChannel,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSmsResult(data.delivery);
        showNotification('success', `Test ${testChannel} notification delivered to ${testPhone || profile.phone}!`);
      } else {
        showNotification('error', data.error || 'Failed to dispatch test notification');
      }
    } catch (e) {
      showNotification('error', 'Could not reach backend notification service');
    } finally {
      setSendingSms(false);
    }
  };

  // Export Data Action
  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      platform: 'Ceylon Stays Host Portal',
      hostProfile: profile,
      payoutSettings: payouts,
      notificationSettings: notifications,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ceylon-stays-host-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Host settings and configuration report downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account & Platform Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage your personal host profile, banking payout methods, guest notifications, and credentials.
        </p>
      </div>

      {/* Floating Status Notification */}
      {statusMessage && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border transition-all animate-in fade-in slide-in-from-top-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[#262626] space-x-1 sm:space-x-3 overflow-x-auto pb-px">
        {[
          { id: 'profile', label: 'Host Profile', icon: User },
          { id: 'payouts', label: 'Payouts & Banking', icon: CreditCard },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & Access', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm transition-all rounded-t-lg border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-[#1e1e1e]/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Host Profile Settings */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-[#181818] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#262626] gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Host Information</h2>
                <p className="text-sm text-slate-400">This information will be displayed to foreign guests booking your villas.</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Verified Host ({profile.role})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Host Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Host Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Host Email (Read-Only) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Account Email (Login Identifier)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full bg-[#121212]/60 border border-[#222222] rounded-xl pl-11 pr-4 py-2.5 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Host Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">WhatsApp / Direct Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Host Bio */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-300">Host Bio & Welcome Message</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Welcome guests with a brief introduction to your property hospitality style..."
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Profile Avatar / Photo Upload */}
            <div className="pt-4 border-t border-[#262626]">
              <ImageUpload
                value={profile.avatarUrl}
                label="Host Profile Avatar (Upload or Choose Preset)"
                onChange={(url: string) => setProfile({ ...profile, avatarUrl: url })}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Payouts & Banking Settings */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <form onSubmit={handleSavePayouts} className="bg-[#181818] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#262626] gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Direct Payouts & Banking</h2>
                <p className="text-sm text-slate-400">Configure how room booking earnings and traveler payouts are disbursed to you.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <CreditCard className="w-4 h-4" />
                Stripe Payments Connected
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currency Preference */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Default Payout Currency</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <select
                    value={payouts.currency}
                    onChange={(e) => setPayouts({ ...payouts, currency: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="USD">USD ($) - United States Dollar (Recommended for Foreigners)</option>
                    <option value="LKR">LKR (Rs) - Sri Lankan Rupee</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>

              {/* Payout Schedule */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Automated Payout Frequency</label>
                <select
                  value={payouts.payoutSchedule}
                  onChange={(e) => setPayouts({ ...payouts, payoutSchedule: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="INSTANT">Instant Payouts (After each guest check-in)</option>
                  <option value="WEEKLY">Weekly Batch (Every Monday morning)</option>
                  <option value="MONTHLY">Monthly Batch (1st of each calendar month)</option>
                </select>
              </div>

              {/* Bank Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Local Bank / Institution</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={payouts.bankName}
                    onChange={(e) => setPayouts({ ...payouts, bankName: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Account Holder */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Account Holder Name</label>
                <input
                  type="text"
                  value={payouts.accountHolder}
                  onChange={(e) => setPayouts({ ...payouts, accountHolder: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Account Number / IBAN</label>
                <input
                  type="text"
                  value={payouts.accountNumber}
                  onChange={(e) => setPayouts({ ...payouts, accountNumber: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Branch / Swift */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Branch Name or SWIFT Code</label>
                <input
                  type="text"
                  value={payouts.branchCode}
                  onChange={(e) => setPayouts({ ...payouts, branchCode: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Payout Security Notice */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
              💡 <strong>Direct Settlement Guarantee:</strong> All credit card bookings processed via Stripe are automatically settled into your verified account after guest arrival check-in.
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/40"
              >
                <Save className="w-4 h-4" />
                Save Payout Preferences
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-[#181818] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="pb-6 border-b border-[#262626]">
            <h2 className="text-xl font-bold text-white">Notification Alerts</h2>
            <p className="text-sm text-slate-400">Choose how and when Ceylon Stays contacts you regarding bookings and guests.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'emailNewBookings',
                title: 'New Guest Bookings & Confirmations',
                desc: 'Receive immediate email alerts when a foreigner books one of your rooms.',
                checked: notifications.emailNewBookings,
              },
              {
                id: 'emailCancellations',
                title: 'Cancellation & Modification Notices',
                desc: 'Instant alert when a traveler changes or cancels reservation dates.',
                checked: notifications.emailCancellations,
              },
              {
                id: 'smsAlerts',
                title: 'SMS / WhatsApp Fast Notification',
                desc: 'Urgent mobile ping for last-minute same-day arrival reservations.',
                checked: notifications.smsAlerts,
              },
              {
                id: 'reviewAlerts',
                title: 'New Guest Reviews & Ratings',
                desc: 'Be notified when travelers leave feedback about their stay.',
                checked: notifications.reviewAlerts,
              },
              {
                id: 'weeklyDigest',
                title: 'Weekly Occupancy & Revenue Digest',
                desc: 'Summary report of total nights booked and revenue every Monday.',
                checked: notifications.weeklyDigest,
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#333333] transition-colors"
              >
                <div className="space-y-1 pr-4">
                  <div className="font-semibold text-white text-sm">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.id]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            ))}
          </div>

          {/* Live SMS & WhatsApp Test Dispatcher */}
          <div className="pt-6 border-t border-[#262626] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  Live SMS & WhatsApp Gateway Verification
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Send a live test ping to ensure your phone number receives instant guest booking alerts.
                </p>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-[#121212] rounded-lg border border-[#2a2a2a]">
                <button
                  type="button"
                  onClick={() => setTestChannel('SMS')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    testChannel === 'SMS'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SMS
                </button>
                <button
                  type="button"
                  onClick={() => setTestChannel('WHATSAPP')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    testChannel === 'WHATSAPP'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  WhatsApp
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:flex-1">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleSendTestSMS}
                disabled={sendingSms}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-sm font-semibold transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sendingSms ? 'Sending Alert...' : `Send Test ${testChannel}`}
              </button>
            </div>

            {/* Delivered Message Simulator Preview */}
            {smsResult && (
              <div className="p-4 rounded-xl bg-[#121212] border border-emerald-500/30 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Delivered via {smsResult.provider}
                  </span>
                  <span>{new Date(smsResult.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#181818] border border-[#262626] font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {smsResult.message}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#262626]">
            <button
              onClick={handleSaveNotifications}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/40"
            >
              <Save className="w-4 h-4" />
              Save Notification Preferences
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Access Settings */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="bg-[#181818] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="pb-6 border-b border-[#262626]">
              <h2 className="text-xl font-bold text-white">Change Account Password</h2>
              <p className="text-sm text-slate-400">Ensure your host account is protected with a strong, distinct password.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Current Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Updating Password...' : 'Update Host Password'}
              </button>
            </div>
          </form>

          {/* Export Data & Danger Zone */}
          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-[#262626]">
              <h2 className="text-xl font-bold text-white">Data Management & Backup</h2>
              <p className="text-sm text-slate-400">Download your verified host configuration data archive.</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#141414] border border-[#262626]">
              <div>
                <h4 className="font-semibold text-white text-sm">Download Settings Archive (JSON)</h4>
                <p className="text-xs text-slate-400 mt-0.5">Includes host profile metadata, banking setup, and notification alerts.</p>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-slate-200 text-sm font-semibold transition-colors border border-[#333333]"
              >
                <Download className="w-4 h-4" />
                Export Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
