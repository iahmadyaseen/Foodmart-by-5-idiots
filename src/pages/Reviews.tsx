import React from 'react';
import { INITIAL_REVIEWS } from '../data/reviews';
import { Star } from 'lucide-react';

export const Reviews: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 bg-[#FFF9F2]">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
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
        {INITIAL_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#FFC857]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">{review.date}</span>
              </div>

              <p className="text-xs text-neutral-700 italic leading-relaxed">
                "{review.review}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
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
};
