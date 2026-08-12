import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { INITIAL_REVIEWS } from '../data/reviews';
import { 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Leaf, 
  Star, 
  CheckCircle2,
  Flame,
  Shuffle,
  Check
} from 'lucide-react';

export const Home: React.FC = () => {
  const { products, randomizeTopSelling } = useProducts();
  const { isAdmin } = useAuth();
  const [randomizedNotice, setRandomizedNotice] = useState(false);

  // Top selling products (or fallback to top rated)
  const topSellingList = products.filter(p => p.isTopSelling);
  const displayTopSelling = topSellingList.length > 0 ? topSellingList : products.slice(0, 8);

  const handleRandomize = async () => {
    await randomizeTopSelling(8);
    setRandomizedNotice(true);
    setTimeout(() => setRandomizedNotice(false), 3000);
  };

  return (
    <div className="space-y-20 pb-16 bg-[#FFF9F2]">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-orange-50/40 to-white pt-12 pb-20 rounded-b-[2.5rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Text */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8483F]/10 text-[#E8483F] font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                #1 Fresh Grocery Marketplace
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#242424] tracking-tight leading-[1.1]">
                Fresh Groceries, <br />
                <span className="text-[#E8483F] italic font-serif font-normal">Delivered With Care.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#737373] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Shop farm-fresh organic fruits, crisp vegetables, prime meats, dairy, aromatic spices, and everyday household essentials delivered directly to your doorstep.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/items"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#E8483F] hover:bg-[#C93630] text-white font-bold text-base shadow-xl shadow-[#E8483F]/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                </Link>

                <a
                  href="#categories"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-neutral-200 text-[#242424] hover:bg-neutral-50 font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  Explore Categories
                  <ArrowRight className="w-5 h-5 text-[#E8483F]" />
                </a>
              </div>

              {/* Stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-neutral-200/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-[#242424]">10+</p>
                  <p className="text-xs text-[#737373]">Main Categories</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#242424]">270+</p>
                  <p className="text-xs text-[#737373]">Fresh Products</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#242424]">100%</p>
                  <p className="text-xs text-[#737373]">Quality Assured</p>
                </div>
              </div>
            </div>

            {/* Right Banner Visual */}
            <div className="relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
                  alt="Food Mart Fresh Grocery Store"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-4">
                  <div className="p-3 bg-[#FFC857]/20 text-[#F97316] rounded-xl font-black text-xl">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#242424]">Daily Organic Harvesting</h4>
                    <p className="text-xs text-[#737373]">Hand-picked every morning at 5 AM</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10 MAIN FOOD CATEGORIES */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider">Aisle Discovery</span>
            <h2 className="text-3xl font-black text-[#242424] tracking-tight mt-1">
              Shop by 10 Primary Categories
            </h2>
          </div>
          <Link
            to="/items"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#E8483F] hover:underline"
          >
            See All Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* TOP SELLING & MOST PURCHASED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#E8483F] font-bold text-xs uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5 fill-[#E8483F]" />
                Customer Most Purchased
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#242424] tracking-tight">
                Top Selling Products
              </h2>
              <p className="text-xs sm:text-sm text-[#737373] mt-1">
                Hand-picked customer favorites including chilled drinks, fresh fruits, bakery cakes & daily items.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <button
                  onClick={handleRandomize}
                  className="px-4 py-2.5 rounded-xl bg-[#242424] hover:bg-neutral-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95"
                  title="Admin Feature: Click to randomly shuffle Top Selling items on main screen"
                >
                  <Shuffle className="w-4 h-4 text-[#FFC857]" />
                  <span>Randomize Top Products (Admin)</span>
                </button>
              )}

              <Link
                to="/items"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#E8483F] hover:underline"
              >
                Browse Full Catalog
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {isAdmin && randomizedNotice && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Top Selling section successfully randomized! New items are now live on the main screen.</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayTopSelling.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* PROMOTIONAL PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#E8483F] to-[#C93630] text-white p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                Special Launch Discount
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                Get Free Express Delivery on Orders Over Rs. 3,000!
              </h2>
              <p className="text-sm text-white/90 max-w-md leading-relaxed">
                Stock your kitchen with fresh basmati rice, organic vegetables, farm milk, and succulent meat cuts. Fast, hygienic doorstep delivery.
              </p>
              <div className="pt-2">
                <Link
                  to="/items"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFC857] text-[#242424] font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  Start Shopping Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="hidden md:flex justify-end">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
                alt="Food Mart Grocery Delivery"
                className="w-80 h-80 object-cover rounded-2xl shadow-xl border-4 border-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT FOOD MART SNIPPET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider">Our Commitment</span>
              <h2 className="text-3xl font-black text-[#242424] tracking-tight">
                About FOOD MART Marketplace
              </h2>
              <p className="text-sm text-[#737373] leading-relaxed">
                FOOD MART is a modern online grocery marketplace designed to make everyday food shopping simple, convenient, and reliable. We collaborate directly with trusted local farmers and certified distributors to bring you the highest quality produce and pantry essentials.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#242424]">Strict Cold-Chain Packaging</h4>
                    <p className="text-xs text-[#737373]">Temperature-controlled delivery for dairy, ice creams, and fresh meat cuts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#242424]">Zero-Hassle Order Tracking</h4>
                    <p className="text-xs text-[#737373]">Access your permanent customer order history anytime from any device.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#E8483F] hover:underline"
                >
                  Read More About Us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600"
                alt="Fresh Produce"
                className="rounded-2xl w-full h-48 object-cover shadow-xs"
              />
              <img
                src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=600"
                alt="Prime Meat"
                className="rounded-2xl w-full h-48 object-cover shadow-xs mt-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS SNIPPET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl font-black text-[#242424] tracking-tight mt-1">
            Loved by Thousands of Families
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_REVIEWS.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-1 text-[#FFC857]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#737373] italic leading-relaxed">
                "{review.review}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
                <img src={review.avatar} alt={review.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-[#242424]">{review.name}</h4>
                  <p className="text-[10px] text-[#737373]">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
