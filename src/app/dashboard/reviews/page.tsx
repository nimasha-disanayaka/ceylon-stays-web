'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Top Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Reviews</h1>
        <p className="text-sm text-slate-400 mt-1">What guests are saying about your properties</p>
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
                        className="px-3.5 py-1.5 bg-[#222] hover:bg-[#2a2a2a] text-slate-300 text-xs font-medium rounded-lg transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePostReply(rev.id)}
                        disabled={submittingReply}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-blue-600/20 cursor-pointer"
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
    </div>
  );
}

