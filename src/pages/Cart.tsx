import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, discount, deliveryFee, total } = useCart();
  const navigate = useNavigate();

  const FREE_THRESHOLD = 3000;
  const progressPercent = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);
  const remainingForFree = FREE_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-neutral-200 shadow-xs space-y-4">
        <div className="w-16 h-16 bg-[#E8483F]/10 text-[#E8483F] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#242424]">Your Cart is Empty</h2>
        <p className="text-xs text-[#737373] leading-relaxed max-w-sm mx-auto">
          Explore our 10 fresh grocery categories to add farm fruits, vegetables, prime meats, milk, or basmati rice.
        </p>
        <div className="pt-2">
          <Link
            to="/items"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E8483F] text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FFF9F2]">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider">Your Basket</span>
          <h1 className="text-3xl font-black text-[#242424] tracking-tight mt-1">
            Shopping Cart ({items.length} items)
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      {/* Free Delivery Progress Bar */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-amber-900">
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#F97316]" />
            {remainingForFree <= 0 ? (
              <span className="text-emerald-600 font-black">🎉 Congratulations! You unlocked FREE Delivery!</span>
            ) : (
              <span>Add Rs. {remainingForFree} more to unlock FREE Express Delivery!</span>
            )}
          </span>
          <span>Rs. {subtotal} / Rs. {FREE_THRESHOLD}</span>
        </div>
        <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#F97316] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-neutral-200/80 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xs"
            >
              {/* Product Image */}
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-xl bg-neutral-100 shrink-0"
              />

              {/* Title & Details */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <span className="text-[10px] font-bold text-[#E8483F] uppercase">{product.categoryName}</span>
                <Link to={`/product/${product.id}`} className="block font-bold text-[#242424] hover:text-[#E8483F] truncate">
                  {product.name}
                </Link>
                <p className="text-xs text-[#737373]">
                  Rs. {product.price} / {product.unit}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2 border border-neutral-200 rounded-xl p-1 bg-neutral-50">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="p-1 hover:bg-neutral-200 rounded-lg text-neutral-700"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-[#242424]">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="p-1 hover:bg-neutral-200 rounded-lg text-neutral-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right sm:w-28">
                <p className="text-base font-black text-[#E8483F]">
                  Rs. {product.price * quantity}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(product.id)}
                className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Column: Summary Card */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-6 sticky top-28">
          <h2 className="text-xl font-black text-[#242424] tracking-tight">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[#737373]">
              <span>Items Subtotal:</span>
              <span className="font-bold text-[#242424]">Rs. {subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Total Savings:</span>
                <span>- Rs. {discount}</span>
              </div>
            )}

            <div className="flex justify-between text-[#737373]">
              <span>Delivery Charges:</span>
              <span className="font-bold text-[#242424]">
                {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `Rs. ${deliveryFee}`}
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-between text-lg font-black text-[#E8483F]">
              <span>Grand Total:</span>
              <span>Rs. {total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 rounded-2xl bg-[#E8483F] hover:bg-[#C93630] text-white font-bold text-base shadow-xl shadow-[#E8483F]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-2 border-t border-neutral-100">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Safe & Secure Checkout</span>
          </div>
        </div>

      </div>

    </div>
  );
};
