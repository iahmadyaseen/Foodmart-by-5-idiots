import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { 
  Star, 
  ShoppingCart, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Plus, 
  Minus,
  Package
} from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, getProductById } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const product = getProductById(id || '');

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-neutral-200">
        <h2 className="text-2xl font-black text-[#242424]">Product Not Found</h2>
        <p className="text-xs text-[#737373] mt-2 mb-6">The grocery item you requested is no longer in our store catalog.</p>
        <Link to="/items" className="px-6 py-2.5 rounded-full bg-[#E8483F] text-white font-bold text-sm">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0 || product.stockStatus === 'out_of_stock';
  const isLowStock = !isOutOfStock && (product.stockQuantity <= 5 || product.stockStatus === 'low_stock');

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stockQuantity) return product.stockQuantity;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const success = addToCart(product, quantity);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 bg-[#FFF9F2]">
      
      {/* Back Link */}
      <Link to={`/category/${product.category}`} className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#E8483F] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to {product.categoryName}
      </Link>

      {/* PRODUCT MAIN CONTAINER */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left: Product Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
          />

          {product.sale && !isOutOfStock && (
            <span className="absolute top-4 left-4 bg-[#F97316] text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md">
              SPECIAL SALE
            </span>
          )}

          {isOutOfStock && (
            <span className="absolute top-4 left-4 bg-neutral-900 text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Right: Info & Controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E8483F] bg-[#E8483F]/10 px-3 py-1 rounded-full">
                {product.categoryName} {product.subcategory ? `• ${product.subcategory}` : ''}
              </span>
              <span className="text-xs font-mono text-neutral-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-3xl font-black text-[#242424] tracking-tight mt-3">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-[#FFC857]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-300'}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-[#242424]">{product.rating}</span>
              <span className="text-xs text-[#737373]">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#E8483F]">
                Rs. {product.price}
              </span>
              <span className="text-sm font-medium text-neutral-500">
                per {product.unit}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-neutral-400 line-through">
                  Rs. {product.originalPrice}
                </span>
              )}
            </div>

            <p className="text-sm text-[#737373] leading-relaxed mt-4">
              {product.description}
            </p>

            {/* Stock indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
              <Package className="w-4 h-4 text-neutral-400" />
              <span>Availability: </span>
              {isOutOfStock ? (
                <span className="text-red-600 font-bold uppercase">Out of Stock</span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-bold">Only {product.stockQuantity} remaining in store</span>
              ) : (
                <span className="text-emerald-600 font-bold">In Stock ({product.stockQuantity} units available)</span>
              )}
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-4 pt-6 border-t border-neutral-100">
            
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-neutral-500 uppercase">Quantity:</span>
                <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-neutral-50">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 text-neutral-600 hover:bg-neutral-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-[#242424]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 text-neutral-600 hover:bg-neutral-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#E8483F] hover:bg-[#C93630] text-white shadow-lg shadow-[#E8483F]/20 hover:scale-[1.02]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 px-8 rounded-2xl font-bold text-sm bg-neutral-900 text-white hover:bg-black transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Delivery Assurances */}
            <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-neutral-500 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E8483F]" />
                <span>Express Same-Day Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E8483F]" />
                <span>Quality & Freshness Guarantee</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#242424] tracking-tight">
            Related Items in {product.categoryName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
