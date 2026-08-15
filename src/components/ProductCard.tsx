'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Check, AlertCircle, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stockQuantity <= 0 || product.stockStatus === 'out_of_stock';
  const isLowStock = !isOutOfStock && (product.stockQuantity <= 5 || product.stockStatus === 'low_stock');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const success = addToCart(product, 1);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative">
      {/* Top Image Container */}
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-neutral-100 block">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {product.isTopSelling && !isOutOfStock && (
            <span className="bg-[#E8483F] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-red-400">
              <Flame className="w-3 h-3 text-yellow-300 fill-yellow-300 shrink-0" />
              TOP SELLING
            </span>
          )}
          {product.sale && !isOutOfStock && (
            <span className="bg-[#F97316] text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
              SALE
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-neutral-800 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
              OUT OF STOCK
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
              Only {product.stockQuantity} left
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-neutral-800 shadow-sm border border-neutral-200/50">
          <Star className="w-3.5 h-3.5 fill-[#FFC857] text-[#FFC857]" />
          <span>{product.rating}</span>
          <span className="text-[10px] text-neutral-400">({product.reviewCount})</span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8483F]">
            {product.categoryName}
          </span>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-base font-bold text-neutral-900 line-clamp-1 hover:text-[#E8483F] transition-colors mt-0.5">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#E8483F]">
                Rs. {product.price}
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                / {product.unit}
              </span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                Rs. {product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
              isOutOfStock
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-[#E8483F] hover:bg-[#C93630] text-white shadow-md hover:shadow-lg shadow-[#E8483F]/20 hover:scale-105'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <Check className="w-5 h-5" />
            ) : isOutOfStock ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
