'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Bell, BarChart3, ShieldCheck, Play, Pause, RotateCcw, X, CheckCircle2, ArrowRight, MousePointer, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(1);

  // Auto-play timer slideshow interval when playing demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showDemoModal && isPlayingDemo) {
      interval = setInterval(() => {
        setDemoStep((prev) => (prev % 3) + 1);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [showDemoModal, isPlayingDemo]);

  const startDemoPlay = () => {
    setIsPlayingDemo(true);
    setDemoStep(1);
  };

  const togglePlayPause = () => {
    setIsPlayingDemo(!isPlayingDemo);
  };

  const nextStep = () => {
    setDemoStep((prev) => (prev % 3) + 1);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-white tracking-tight">Ceylon Stays</span>
          <span className="text-sm text-slate-400 font-medium">for owners</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-300 font-medium">
          <a href="#how-it-works" className="hover:text-white transition">How it works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <Link href="/login" className="hover:text-white transition">Sign in</Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-xl text-sm transition"
          >
            List your property
          </Link>
        </nav>

        <div className="md:hidden flex items-center space-x-3">
          <Link href="/login" className="text-sm font-medium text-slate-300">Sign in</Link>
          <Link href="/register" className="px-3.5 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded-lg">
            List property
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center my-auto w-full">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#1e293b]/80 border border-slate-700/60 text-blue-400 text-xs font-semibold mb-8">
          <ShieldCheck className="w-4 h-4" />
          <span>Built for Sri Lankan hosts</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Reach foreign travelers directly. <br />
          Keep more of what you earn.
        </h1>

        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          List your hotel, homestay, or restaurant and manage bookings, availability, and payouts from one dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-base font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            Get started free
          </Link>
          <button
            onClick={() => {
              setShowDemoModal(true);
              setIsPlayingDemo(true);
              setDemoStep(1);
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-slate-700 hover:bg-slate-800/80 text-slate-200 text-base font-semibold rounded-xl transition flex items-center justify-center space-x-2 group active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 text-blue-400 group-hover:scale-110 transition fill-blue-400" />
            <span>See a demo</span>
          </button>
        </div>

        <div className="bg-white text-slate-900 py-10 px-6 rounded-2xl mb-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center shadow-xl">
          <div>
            <p className="text-4xl font-extrabold text-slate-900 mb-1">0%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission for first 3 months</p>
          </div>
          <div className="md:border-x md:border-slate-200 px-4">
            <p className="text-4xl font-extrabold text-slate-900 mb-1">1-click</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accept or decline bookings by email</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-slate-900 mb-1">24h</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average payout processing time</p>
          </div>
        </div>

        <h2 id="how-it-works" className="text-2xl font-bold text-white mb-10">Everything you need to run your listings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-20">
          <div className="ui-card p-6">
            <div className="p-3 bg-slate-800/80 rounded-xl w-fit text-blue-400 mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Availability calendar</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Block dates, set prices per season, avoid double bookings.
            </p>
          </div>

          <div className="ui-card p-6">
            <div className="p-3 bg-slate-800/80 rounded-xl w-fit text-blue-400 mb-5">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant notifications</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Get an email the moment someone books, with 1-click accept.
            </p>
          </div>

          <div className="ui-card p-6">
            <div className="p-3 bg-slate-800/80 rounded-xl w-fit text-blue-400 mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Earnings dashboard</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track revenue, occupancy, and upcoming payouts at a glance.
            </p>
          </div>
        </div>

        <div className="py-12 text-center border-t border-slate-800/80">
          <h3 className="text-xl font-bold text-white mb-2">Ready to list your property?</h3>
          <p className="text-sm text-slate-400 mb-6">Takes about 10 minutes. No setup fees.</p>
          <Link
            href="/register"
            className="px-8 py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl transition inline-block shadow-lg shadow-blue-600/20"
          >
            List your property
          </Link>
        </div>
      </main>

      {/* Interactive Playable Video Demo Walkthrough Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#161616] border border-[#2a2a2a] rounded-3xl p-6 md:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#262626] mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600/20 rounded-xl text-blue-400">
                  <Play className="w-5 h-5 fill-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Ceylon Stays Platform Demo Video</h3>
                  <p className="text-xs text-slate-400">See how traveler bookings & owner 1-click email approvals work automatically</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDemoModal(false);
                  setIsPlayingDemo(false);
                }}
                className="p-2 bg-[#222222] hover:bg-[#2a2a2a] text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Display Frame */}
            <div className="relative bg-[#0d0d0d] border border-[#262626] rounded-2xl overflow-hidden min-h-[320px] flex flex-col justify-between p-6 md:p-8 mb-6 shadow-inner">
              {!isPlayingDemo ? (
                /* Video Cover Screen before clicking Play */
                <div className="my-auto text-center flex flex-col items-center justify-center py-8">
                  <button
                    onClick={startDemoPlay}
                    className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-600/40 mb-5 hover:scale-110 active:scale-95 transition duration-300 group cursor-pointer"
                  >
                    <Play className="w-9 h-9 fill-white translate-x-0.5 group-hover:scale-110 transition" />
                  </button>

                  <h4 className="text-2xl font-extrabold text-white mb-2">Click Play to Watch Demo</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Automated video walkthrough showing real-time mobile booking, instant email notifications, and dashboard stats update.
                  </p>
                </div>
              ) : (
                /* Animated Video Steps Screen */
                <div className="flex-1 flex flex-col justify-between space-y-6">
                  {/* Top Live Play status & Step Progress Indicators */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
                    <div className="flex items-center space-x-3">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Playing Demo • Step {demoStep} of 3
                      </span>
                    </div>

                    {/* Step Tabs */}
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3].map((step) => (
                        <button
                          key={step}
                          onClick={() => setDemoStep(step)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                            demoStep === step
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                              : 'bg-[#1a1a1a] text-slate-400 hover:bg-[#262626]'
                          }`}
                        >
                          {step}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animated Video Scene Content */}
                  <div className="my-auto py-2">
                    {demoStep === 1 && (
                      <div className="space-y-4 text-left max-w-md mx-auto bg-[#161616] p-6 rounded-2xl border border-slate-800 shadow-2xl transition duration-500 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            📱 Step 1: Traveler Mobile App Booking
                          </span>
                          <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full font-semibold">Live</span>
                        </div>
                        <div className="p-4 bg-[#0d0d0d] rounded-xl border border-slate-800">
                          <p className="text-xs text-slate-400 mb-1">Traveler Profile</p>
                          <p className="text-sm font-bold text-white mb-2">Alexander Wright (France 🇫🇷)</p>
                          <p className="text-xs text-slate-300">Property: <strong className="text-white">Mirissa Beach Villa</strong> (Deluxe Suite)</p>
                          <p className="text-xs text-emerald-400 font-bold mt-2">Total Amount: $255.00 • 3 Nights</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                          <span>Dispatching instant encrypted email to property owner...</span>
                        </div>
                      </div>
                    )}

                    {demoStep === 2 && (
                      <div className="space-y-4 text-left max-w-md mx-auto bg-[#161616] p-6 rounded-2xl border border-blue-900/50 shadow-2xl transition duration-500 animate-fadeIn relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            ✉️ Step 2: Owner Email Notification
                          </span>
                          <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full font-semibold">1-Click Approval</span>
                        </div>
                        <p className="text-xs text-slate-300">Email sent to <span className="text-blue-300 underline font-medium">nimuu1449disanayaka@gmail.com</span> with 1-click token links:</p>

                        <div className="space-y-2 pt-1 relative">
                          <div className="flex space-x-2">
                            <div className="flex-1 py-2.5 bg-[#2563eb] text-white text-xs font-bold rounded-xl text-center shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1 border border-blue-400/30">
                              <span>✓ Accept Reservation</span>
                            </div>
                            <div className="flex-1 py-2.5 bg-[#1f1616] border border-red-900/50 text-red-400 text-xs font-semibold rounded-xl text-center">
                              <span>✕ Decline</span>
                            </div>
                          </div>
                          {/* Animated Pointer Clicking Accept */}
                          <div className="absolute right-1/2 top-1.5 translate-x-6 animate-bounce">
                            <MousePointer className="w-6 h-6 text-yellow-300 fill-yellow-400 drop-shadow-md" />
                          </div>
                        </div>
                      </div>
                    )}

                    {demoStep === 3 && (
                      <div className="space-y-4 text-left max-w-md mx-auto bg-[#161616] p-6 rounded-2xl border border-emerald-900/50 shadow-2xl transition duration-500 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            📊 Step 3: Owner Dashboard Updated
                          </span>
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">Confirmed</span>
                        </div>

                        <div className="bg-[#0d0d0d] p-4 rounded-xl border border-emerald-900/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">Total Dashboard Revenue</span>
                            <span className="text-sm font-bold text-emerald-400">$1,495.00 (+ $255.00)</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <span className="text-xs text-slate-400">Booking Status</span>
                            <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 font-extrabold text-[11px] rounded-md border border-emerald-800">
                              CONFIRMED
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-emerald-400 flex items-center gap-2 font-semibold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>Dates locked on calendar & payout scheduled within 24h!</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Video Playback Bar & Controls */}
                  <div className="pt-3 border-t border-[#222222] flex flex-col space-y-3">
                    {/* Animated Progress Bar */}
                    <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300 ease-linear rounded-full shadow-md shadow-blue-500/50"
                        style={{ width: `${(demoStep / 3) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={togglePlayPause}
                          className="px-3.5 py-1.5 bg-[#222222] hover:bg-[#2e2e2e] text-white text-xs font-semibold rounded-xl border border-[#333] transition flex items-center space-x-1.5 cursor-pointer"
                        >
                          {isPlayingDemo ? (
                            <>
                              <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                              <span>Play</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setDemoStep(1);
                            setIsPlayingDemo(true);
                          }}
                          className="px-3 py-1.5 bg-[#222222] hover:bg-[#2e2e2e] text-slate-300 text-xs font-semibold rounded-xl border border-[#333] transition flex items-center space-x-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restart</span>
                        </button>
                      </div>

                      <button
                        onClick={nextStep}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1 cursor-pointer shadow-md shadow-blue-600/30"
                      >
                        <span>Next Scene</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-400">Ready to start accepting reservations for your property?</p>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowDemoModal(false);
                    setIsPlayingDemo(false);
                  }}
                  className="px-4 py-2.5 bg-[#222222] hover:bg-[#2a2a2a] text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
                >
                  Register Business Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Ceylon Stays for owners. All rights reserved.
      </footer>
    </div>
  );
}
