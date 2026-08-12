import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryBySlug } from '../data/categories';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { CategorySlug } from '../types';
import { Search, ArrowLeft, ArrowUpDown } from 'lucide-react';

export const CategoryProducts: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug((slug || '') as CategorySlug);

  const { products } = useProducts();

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  if (!category) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-neutral-200">
        <h2 className="text-2xl font-black text-[#242424]">Category Not Found</h2>
        <p className="text-xs text-[#737373] mt-2 mb-6">The grocery aisle you are looking for does not exist.</p>
        <Link to="/items" className="px-6 py-2.5 rounded-full bg-[#E8483F] text-white font-bold text-sm">
          Return to Categories
        </Link>
      </div>
    );
  }

  // Get base products for this category
  const categoryProducts = products.filter(p => p.category === category.slug);

  // Filter by subcategory
  let filtered = selectedSubcategory === 'all'
    ? categoryProducts
    : categoryProducts.filter(p => p.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase());

  // Filter by search query inside category
  if (searchQuery.trim()) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sorting logic
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured default
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#FFF9F2]">
      
      {/* Back Link & Header Banner */}
      <div className="space-y-4">
        <Link to="/items" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#E8483F] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to All Categories
        </Link>

        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-8 sm:p-12 shadow-xl">
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="px-3 py-1 bg-[#E8483F] text-white rounded-full text-xs font-black uppercase tracking-wider">
              {categoryProducts.length}+ Products Available
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              {category.name}
            </h1>
            <p className="text-sm text-neutral-200 leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER & SUBCATEGORY BAR */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-4 shadow-xs">
        
        {/* Subcategory Pills */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSubcategory === 'all'
                  ? 'bg-[#E8483F] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All {category.name}
            </button>

            {category.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSubcategory.toLowerCase() === sub.toLowerCase()
                    ? 'bg-[#E8483F] text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Search & Sorting Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-neutral-100">
          
          {/* Inner Search */}
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder={`Search in ${category.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFF9F2] text-xs text-[#242424] border border-neutral-200 focus:border-[#E8483F] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <ArrowUpDown className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FFF9F2] text-xs font-semibold text-[#242424] px-3 py-2 rounded-xl border border-neutral-200 focus:border-[#E8483F] focus:outline-none"
            >
              <option value="featured">Featured / Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>

        </div>

      </div>

      {/* PRODUCT GRID - FULL UNBOUNDED LIST */}
      <div>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200">
            <p className="text-base font-bold text-[#242424]">No items found</p>
            <p className="text-xs text-[#737373] mt-1">Try resetting subcategory or search filters.</p>
            <button
              onClick={() => { setSelectedSubcategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-full bg-[#E8483F] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
