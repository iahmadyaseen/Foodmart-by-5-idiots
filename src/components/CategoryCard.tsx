import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      
      {/* Category Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        <span className="absolute bottom-3 left-3 bg-white/95 text-neutral-900 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs">
          {category.productCount}+ Products
        </span>
      </div>

      {/* Category Info */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-[#242424] group-hover:text-[#E8483F] transition-colors uppercase tracking-tight">
            {category.name}
          </h3>
          <p className="text-xs text-[#737373] mt-1.5 leading-relaxed line-clamp-2">
            {category.description}
          </p>
        </div>

        <Link
          to={`/category/${category.slug}`}
          className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-bold text-sm bg-neutral-100 text-neutral-800 hover:bg-[#E8483F] hover:text-white transition-all duration-200 group/btn"
        >
          <span>View Items</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
};
