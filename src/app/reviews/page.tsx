'use client';

import React, { useEffect, useState } from 'react';
import { CustomerReview } from '@/types';
import { INITIAL_REVIEWS } from '@/data/reviews';
import { Star, Send, Check } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !reviewText) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, review: reviewText, location }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews([data.review, ...reviews]);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setShowModal(false);
          setName('');
          setReviewText('');
          setLocation('');
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 bg-[#FFF9F2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left space-y-2">
          <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider bg-[#E8483F]/10 px-3 py-1 rounded-full">
            Customer Voice
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#242424] tracking-tight">
            What Our Customers Say
          </h1>
          <p className="text-sm text-[#737373] leading-relaxed">
            Real feedback from verified shoppers who trust FOOD MART for their everyday grocery needs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 rounded-full bg-[#E8483F] text-white font-bold text-xs shadow-md hover:bg-[#C93630] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Write a Review
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <h3 className="text-xl font-black text-[#242424]">Share Your Experience</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-neutral-300 text-sm font-bold"
                  placeholder="e.g. Ayesha"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">City / Neighborhood</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-neutral-300 text-sm"
                  placeholder="e.g. Gulberg, Lahore"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      className={`p-2 rounded-xl border text-sm font-bold cursor-pointer ${
                        rating >= num ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-neutral-50 border-neutral-200'
                      }`}
                    >
                      ★ {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">Review</label>
                <textarea
                  required
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-neutral-300 text-sm"
                  placeholder="Write your feedback..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#E8483F] text-white text-xs font-bold shadow-md hover:bg-[#C93630] flex items-center gap-2 cursor-pointer"
                >
                  {submitted ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  {submitted ? 'Submitted!' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Overall Score Banner */}
      <div className="bg-gradient-to-r from-[#E8483F] to-[#C93630] text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-4xl font-black">4.9 / 5.0</p>
          <div className="flex items-center justify-center sm:justify-start gap-1 text-[#FFC857]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <p className="text-xs text-white/80">Based on 1,420+ verified doorstep deliveries</p>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-sm font-bold">99.2% Satisfaction Rate</p>
          <p className="text-xs text-white/80">Fresh fruits, organic veggies & prime meats</p>
        </div>
      </div>

      {/* Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#FFC857]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(review.rating) ? 'fill-current' : 'text-neutral-300'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">{review.date}</span>
              </div>

              <p className="text-xs text-neutral-700 italic leading-relaxed">
                &ldquo;{review.review}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              <img
                src={review.avatar}
                alt={review.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-[#242424]">{review.name}</h4>
                <p className="text-[10px] text-[#737373]">{review.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
