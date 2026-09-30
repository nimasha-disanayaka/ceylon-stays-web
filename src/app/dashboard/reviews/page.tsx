'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, CornerDownRight, CheckCircle2, X } from 'lucide-react';
import { apiFetch } from '@/services/api';

interface ReviewItem {
  id: string;
  initials: string;
  authorName: string;
  businessName: string;
  rating: number;
  comment: string;
  reply?: string | null;
  createdAt?: string;
}

interface SummaryStats {
  averageRating: number;
  totalReviews: number;
  awaitingReply: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<SummaryStats>({
    averageRating: 4.7,
    totalReviews: 32,
    awaitingReply: 2,
  });
  const [loading, setLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Traveler review modal toggle (Image 2 mockup preview)
  const [showTravelerModal, setShowTravelerModal] = useState(false);
  const [travelerRating, setTravelerRating] = useState(5);
  const [travelerComment, setTravelerComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/reviews/owner');
      if (data && data.reviews) {
        setReviews(data.reviews);
        if (data.summary) {
          setStats(data.summary);
        }
      } else {
        useMockData();
      }
    } catch (err) {
      console.warn('Using fallback mock reviews:', err);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    setStats({
      averageRating: 4.7,
      totalReviews: 32,
      awaitingReply: 2,
    });
    setReviews([
      {
        id: 'rev-1',
        initials: 'LM',
        authorName: 'Laura M.',
        businessName: 'Mirissa Ocean Homestay',
        rating: 5,
        comment: 'Beautiful stay, walking distance to the beach, host was incredibly kind.',
        reply: null,
      },
      {
        id: 'rev-2',
        initials: 'JS',
        authorName: 'James Smith',
        businessName: 'Cinnamon Citadel Kandy',
        rating: 4,
        comment: 'Great location, room could use better AC but overall a solid stay.',
        reply: "Thanks for staying with us! We've noted the AC feedback for our next maintenance check.",
      },
    ]);
  };

  const handlePostReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      await apiFetch(`/reviews/${reviewId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply: replyText }),
      });

      // Update local state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, reply: replyText } : r
        )
      );

      setStats((prev) => ({
        ...prev,
        awaitingReply: Math.max(0, prev.awaitingReply - 1),
      }));

      setActiveReplyId(null);
      setReplyText('');
    } catch (err) {
      // Local state optimistic update fallback
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, reply: replyText } : r
        )
      );
      setStats((prev) => ({
        ...prev,
        awaitingReply: Math.max(0, prev.awaitingReply - 1),
      }));
      setActiveReplyId(null);
      setReplyText('');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleTravelerSubmit = () => {
    if (!travelerComment.trim()) return;
    const newRev: ReviewItem = {
      id: `new-${Date.now()}`,
      initials: 'AW',
      authorName: 'Alexander Wright',
      businessName: 'Mirissa Ocean Homestay',
      rating: travelerRating,
      comment: travelerComment,
      reply: null,
    };

    setReviews([newRev, ...reviews]);
    setStats((prev) => ({
      ...prev,
      totalReviews: prev.totalReviews + 1,
      awaitingReply: prev.awaitingReply + 1,
    }));

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowTravelerModal(false);
      setTravelerComment('');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner & Quick Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Reviews</h1>
          <p className="text-sm text-slate-400 mt-1">What guests are saying about your properties</p>
        </div>

        <button
          onClick={() => setShowTravelerModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Preview "Leave a Review" Modal</span>
        </button>
      </div>

      {/* Main Container matching Image 1 UI Mockup Line-for-Line */}
      <div className="bg-[#121212] border border-[#222222] rounded-3xl p-6 md:p-8 shadow-2xl space-y-10">
        {/* Top Overview Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-[#222222]">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Average rating</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {stats.averageRating}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 5</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Total reviews</p>
            <p className="text-4xl font-extrabold text-white tracking-tight">
              {stats.totalReviews}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Awaiting reply</p>
            <p className="text-4xl font-extrabold text-blue-500 tracking-tight">
              {stats.awaitingReply}
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-8">
          {reviews.map((rev) => (
            <div key={rev.id} className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  {/* Round Avatar Badge */}
                  <div className="w-11 h-11 rounded-full bg-[#1d4ed8] text-white font-bold text-sm flex items-center justify-center shadow-md flex-shrink-0">
                    {rev.initials}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-snug">{rev.authorName}</h4>
                    <p className="text-xs text-slate-400 font-medium">{rev.businessName}</p>
                  </div>
                </div>

                {/* 5 Star Rating Stars */}
                <div className="flex items-center space-x-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600 fill-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Guest Comment */}
              <p className="text-sm text-slate-200 leading-relaxed font-normal pl-0 md:pl-[52px]">
                {rev.comment}
              </p>

              {/* Owner Reply Box or Reply Action */}
              <div className="pl-0 md:pl-[52px]">
                {rev.reply ? (
                  /* Existing Inset Host Reply Container matching Mockup 1 */
                  <div className="bg-[#181818] border-l-2 border-blue-500 rounded-xl p-4 space-y-1.5 shadow-inner">
                    <p className="text-xs font-bold text-blue-400">Your reply</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.reply}</p>
                  </div>
                ) : activeReplyId === rev.id ? (
                  /* Reply Input Box */
                  <div className="space-y-3 bg-[#181818] p-4 rounded-xl border border-slate-800">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your host reply to this guest..."
                      rows={3}
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => {
                          setActiveReplyId(null);
                          setReplyText('');
                        }}
                        className="px-3.5 py-1.5 bg-[#222] hover:bg-[#2a2a2a] text-slate-300 text-xs font-medium rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePostReply(rev.id)}
                        disabled={submittingReply}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-blue-600/20"
                      >
                        {submittingReply ? 'Posting...' : 'Post Reply'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Reply Trigger Button matching Mockup 1 */
                  <button
                    onClick={() => {
                      setActiveReplyId(rev.id);
                      setReplyText('');
                    }}
                    className="px-4 py-1.5 bg-[#222222] hover:bg-[#2a2a2a] text-slate-200 text-xs font-semibold rounded-xl border border-[#333333] transition cursor-pointer"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traveler Leave a Review Modal (Matching Image 2 Mockup Line-for-Line) */}
      {showTravelerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#FAF8F5] text-slate-900 rounded-3xl p-6 shadow-2xl border border-amber-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTravelerModal(false)}
                  className="p-1.5 hover:bg-stone-200/60 rounded-full transition text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-bold text-slate-900">Leave a review</h3>
              </div>
            </div>

            {submittedSuccess ? (
              /* Success State */
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-slate-900">Thank you for your feedback!</h4>
                <p className="text-xs text-slate-600">Your review has been published successfully.</p>
              </div>
            ) : (
              /* Form Body */
              <div className="py-6 space-y-6">
                {/* Property Card Info */}
                <div className="flex items-center space-x-3.5 bg-[#F2EDE4] p-3.5 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-[#6ee7b7] flex items-center justify-center text-emerald-950 font-bold text-xl shadow-sm">
                    🌴
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Mirissa Ocean Homestay</h4>
                    <p className="text-xs text-slate-500 font-medium">Stayed Oct 12 - 15, 2026</p>
                  </div>
                </div>

                {/* Rating Picker */}
                <div className="text-center space-y-3">
                  <p className="text-sm font-bold text-slate-800">How was your stay?</p>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTravelerRating(star)}
                        className="p-1 hover:scale-125 transition duration-200 cursor-pointer"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= travelerRating
                              ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                              : 'text-stone-300 fill-stone-100'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Comment Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Your review</label>
                  <textarea
                    value={travelerComment}
                    onChange={(e) => setTravelerComment(e.target.value)}
                    placeholder="Share what you liked, and anything the host could improve..."
                    rows={4}
                    className="w-full bg-white border border-stone-200 rounded-2xl p-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-inner"
                  />
                </div>

                {/* Submit Button (Matching Terracotta Orange Button in Image 2) */}
                <button
                  onClick={handleTravelerSubmit}
                  className="w-full py-3.5 bg-[#d9532f] hover:bg-[#c44523] text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-600/30 transition duration-200 active:scale-98 cursor-pointer"
                >
                  Submit review
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
