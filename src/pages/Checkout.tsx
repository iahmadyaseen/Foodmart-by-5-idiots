import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { orderService } from '../services/orderService';
import { Order, PaymentMethod } from '../types';
import { 
  CreditCard, 
  Truck, 
  Lock, 
  AlertCircle
} from 'lucide-react';

export const Checkout: React.FC = () => {
  const { items, subtotal, discount, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { decreaseStock } = useProducts();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Customer Shipping Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Lahore',
    postalCode: '54000',
    notes: ''
  });

  // Credit Card Form State
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const fillTestCard = () => {
    setCardData({
      number: '4242 4242 4242 4242',
      expiry: '12/30',
      cvv: '123'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setError('Please complete all required contact & shipping fields.');
      return;
    }

    if (paymentMethod === 'card' && (!cardData.number || !cardData.expiry || !cardData.cvv)) {
      setError('Please provide demo credit card credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const userId = user?.userId || `guest-${Date.now()}`;

      // Format items
      const orderItems = items.map(item => ({
        productId: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        price: item.product.price,
        unit: item.product.unit,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
        image: item.product.image
      }));

      const newOrder: Order = {
        orderId,
        userId,
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        notes: formData.notes.trim(),
        items: orderItems,
        subtotal,
        discount,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
        orderStatus: 'pending',
        createdAt: new Date().toISOString(),
        estimatedDelivery: 'Today by 8:00 PM'
      };

      // 1. Decrease Product Stock Inventory
      await decreaseStock(items.map(i => ({ productId: i.product.id, quantity: i.quantity })));

      // 2. Save Order to Firestore / Local Storage
      await orderService.createOrder(newOrder);

      // 3. Clear Shopping Basket
      clearCart();

      // 4. Navigate to Receipt / Success Screen
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      console.error('Order checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FFF9F2]">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider">Final Step</span>
        <h1 className="text-3xl font-black text-[#242424] tracking-tight mt-1">
          Checkout & Order Confirmation
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Delivery Info & Payment */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-xl font-black text-[#242424] tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#E8483F]" />
              Shipping & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-sm text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                  placeholder="e.g. Ali Ahmed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-sm text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                  placeholder="e.g. customer@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-sm text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                  placeholder="e.g. +92 300 1234567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-sm text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                  Complete Delivery Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-sm text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                  placeholder="House #, Street, Block / Phase, Gulberg III"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#242424] uppercase mb-1">
                  Special Delivery Instructions (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-sm text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                  placeholder="e.g. Ring the bell twice or leave at reception..."
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-xl font-black text-[#242424] tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#E8483F]" />
              Select Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* COD Option */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  paymentMethod === 'cod'
                    ? 'border-[#E8483F] bg-[#E8483F]/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 accent-[#E8483F]"
                />
                <div>
                  <h4 className="font-bold text-sm text-[#242424]">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                    Pay in physical cash when our express delivery rider hands over your fresh groceries.
                  </p>
                </div>
              </label>

              {/* Demo Credit Card Option */}
              <label
                onClick={() => setPaymentMethod('card')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  paymentMethod === 'card'
                    ? 'border-[#E8483F] bg-[#E8483F]/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-1 accent-[#E8483F]"
                />
                <div>
                  <h4 className="font-bold text-sm text-[#242424]">Online Demo Credit Card</h4>
                  <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                    Instant online test payment. Use 4242 4242 4242 4242.
                  </p>
                </div>
              </label>

            </div>

            {/* Card Form when Card Selected */}
            {paymentMethod === 'card' && (
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-neutral-700">Demo Card Information</span>
                  <button
                    type="button"
                    onClick={fillTestCard}
                    className="text-xs font-bold text-[#E8483F] underline hover:text-[#C93630]"
                  >
                    Auto-Fill Test Credentials
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#242424] uppercase mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white text-[#242424] font-black text-base border-2 border-neutral-400 focus:border-[#E8483F] focus:outline-none font-mono placeholder:text-neutral-400 shadow-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#242424] uppercase mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/30"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white text-[#242424] font-black text-base border-2 border-neutral-400 focus:border-[#E8483F] focus:outline-none font-mono placeholder:text-neutral-400 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#242424] uppercase mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white text-[#242424] font-black text-base border-2 border-neutral-400 focus:border-[#E8483F] focus:outline-none font-mono placeholder:text-neutral-400 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-6 sticky top-28">
          <h2 className="text-xl font-black text-[#242424] tracking-tight">
            Order Review
          </h2>

          <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#242424]">{product.name}</p>
                  <p className="text-neutral-400">Qty: {quantity} x Rs. {product.price}</p>
                </div>
                <span className="font-bold text-[#E8483F]">Rs. {product.price * quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-neutral-100 text-xs">
            <div className="flex justify-between text-[#737373]">
              <span>Subtotal:</span>
              <span className="font-bold text-[#242424]">Rs. {subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Savings Discount:</span>
                <span>- Rs. {discount}</span>
              </div>
            )}

            <div className="flex justify-between text-[#737373]">
              <span>Delivery Fee:</span>
              <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `Rs. ${deliveryFee}`}</span>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex justify-between text-base font-black text-[#E8483F]">
              <span>Total Payable:</span>
              <span>Rs. {total}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#E8483F] hover:bg-[#C93630] text-white font-bold text-base shadow-xl shadow-[#E8483F]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Order...
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Place Order (Rs. {total})
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-neutral-400">
            By placing your order you agree to FOOD MART Terms of Service.
          </p>
        </div>

      </form>

    </div>
  );
};
