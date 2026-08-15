'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import { useProducts } from '@/context/ProductContext';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { Search, Shuffle, Sparkles } from 'lucide-react';

function ItemsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchArg = searchParams.get('search') || '';
  const [query, setQuery] = useState(searchArg);
  const [shuffleKey, setShuffleKey] = useState(0);

  const { products } = useProducts();

  // Pick 20 random products whenever products change or shuffle is clicked
  const random20Products = useMemo(() => {
    if (products.length <= 20) return products;
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 20);
  }, [products, shuffleKey]);

  // Filter products if search is active
  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      router.replace(`${pathname}?search=${encodeURIComponent(val.trim())}`);
    } else {
      router.replace(pathname);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 bg-[#FFF9F2]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider">Catalog & Aisles</span>
          <h1 className="text-3xl font-black text-[#242424] tracking-tight mt-1">
            Food Mart Grocery Catalog
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            Browse our primary food categories, discover 20 random items, or search for specific products.
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search items, SKU, category..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF9F2] text-sm text-[#242424] border border-neutral-200 focus:border-[#E8483F] focus:outline-none"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* SEARCH RESULTS IF QUERY ACTIVE */}
      {query.trim() && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#242424] flex items-center gap-2">
            Search Results for <span className="text-[#E8483F]">&ldquo;{query}&rdquo;</span>
            <span className="text-xs text-neutral-400">({filteredProducts.length} items found)</span>
          </h2>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200">
              <p className="text-base font-bold text-[#242424]">No products found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[#737373] mt-1">Try searching for drinks, cakes, fruits, or basmati rice.</p>
            </div>
          )}
        </div>
      )}

      {/* 10 PRIMARY CATEGORY CARDS */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#242424] tracking-tight">
          Explore 10 Food Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* 20 RANDOM ITEMS DISCOVERY SECTION */}
      {!query.trim() && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Randomized Catalog Browse
              </span>
              <h2 className="text-2xl font-black text-[#242424] tracking-tight">
                20 Randomly Picked Products
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Surprise your pantry! Showing 20 random items across drinks, fruits, cakes, meats & pantry staples.
              </p>
            </div>

            <button
              onClick={() => setShuffleKey((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#E8483F] hover:bg-[#C93630] text-white font-bold text-xs shadow-md shadow-[#E8483F]/20 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle 20 Random Items</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {random20Products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-neutral-500">Loading catalog...</div>}>
      <ItemsContent />
    </Suspense>
  );
}
