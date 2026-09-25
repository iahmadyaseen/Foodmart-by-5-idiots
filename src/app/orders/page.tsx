'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import {
  Package,
  FileText,
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Banknote,
  MapPin,
  ArrowRight,
  LogIn,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = Boolean(user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered'>('all');

  // Track order by ID state (for guests or direct lookup)
  const [trackId, setTrackId] = useState('');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        orderService.getUserOrders(user.userId).then((res) => {
          setOrders(res);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, user, authLoading]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;

    setTrackingLoading(true);
    setTrackError(null);
    setTrackingOrder(null);

    try {
      const res = await orderService.getOrderById(trackId.trim());
      if (res) {
        setTrackingOrder(res);
      } else {
        setTrackError(`Order "${trackId.trim()}" not found. Please verify your Order ID.`);
      }
    } catch {
      setTrackError('Failed to retrieve order. Please check the Order ID and try again.');
    } finally {
      setTrackingLoading(false);
    }
  };

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FFF9F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E8483F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#737373]">Loading your order records...</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'delivered'
        ? o.orderStatus === 'delivered'
        : o.orderStatus !== 'delivered';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FFF9F2] min-h-[85vh]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider bg-[#E8483F]/10 px-3 py-1 rounded-full">
            Customer Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#242424] tracking-tight mt-2">
            Previous Orders & Records
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            {isAuthenticated
              ? `Viewing all grocery purchases linked to ${user?.email}`
              : 'Track past orders by Order ID or sign in to view your complete order history'}
          </p>
        </div>

        {!isAuthenticated && (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E8483F] text-white text-xs font-bold shadow-md hover:bg-[#C93630] transition-all self-start md:self-auto"
          >
            <LogIn className="w-4 h-4" />
            Sign In to View All Orders
          </Link>
        )}
      </div>

      {/* INSTANT ORDER TRACKING / LOOKUP FORM */}
      <div className="bg-white rounded-3xl border border-[#F1E4D8] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-[#242424]">
              Track Any Order or Receipt
            </h2>
            <p className="text-xs text-[#737373]">
              Have an Order ID from a previous checkout or receipt? Enter it below to inspect records in real time.
            </p>
          </div>
          <span className="text-[11px] font-bold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Instant Lookup
          </span>
        </div>

        <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="e.g. ORD-COD-1790339560550"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF9F2] text-[#242424] font-mono font-bold text-xs sm:text-sm border-2 border-neutral-300 focus:border-[#E8483F] focus:bg-white focus:outline-none"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={trackingLoading || !trackId.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#242424] hover:bg-[#383838] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {trackingLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Truck className="w-4 h-4 text-emerald-400" />
                Track Order
              </>
            )}
          </button>
        </form>

        {trackError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{trackError}</span>
          </div>
        )}

        {/* Display Looked Up Order */}
        {trackingOrder && (
          <div className="mt-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#E8483F]">{trackingOrder.orderId}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    trackingOrder.orderStatus === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {trackingOrder.orderStatus}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-neutral-700 border border-emerald-200 uppercase">
                  {trackingOrder.paymentMethod === 'card' ? 'Online Card' : 'Cash on Delivery'}
                </span>
              </div>

              <Link
                href={`/receipt/${trackingOrder.orderId}`}
                className="px-4 py-1.5 rounded-xl bg-[#E8483F] text-white font-bold text-xs shadow-xs hover:bg-[#C93630] flex items-center gap-1.5 self-start sm:self-auto"
              >
                <FileText className="w-3.5 h-3.5" />
                View Full Receipt
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Customer</p>
                <p className="font-bold text-[#242424]">{trackingOrder.customerName}</p>
                <p className="text-neutral-500 font-mono text-[11px]">{trackingOrder.customerEmail}</p>
              </div>

              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Delivery Address</p>
                <p className="font-bold text-[#242424]">{trackingOrder.address}, {trackingOrder.city}</p>
                <p className="text-neutral-500 text-[11px]">{trackingOrder.estimatedDelivery}</p>
              </div>

              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Order Total</p>
                <p className="text-base font-black text-[#E8483F]">Rs. {trackingOrder.total}</p>
                <p className="text-emerald-700 font-semibold text-[11px]">
                  Payment: {trackingOrder.paymentStatus}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200">
              <p className="text-[10px] font-bold text-neutral-500 uppercase mb-2">Purchased Items ({trackingOrder.items.length}):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {trackingOrder.items.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs flex items-center gap-2.5">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#242424] truncate">{item.name}</p>
                      <p className="text-[10px] text-neutral-500">Qty: {item.quantity} • Rs. {item.price}</p>
                    </div>
                    <span className="font-bold text-[#242424]">Rs. {item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AUTHENTICATED CUSTOMER ORDERS SECTION */}
      {isAuthenticated ? (
        <div className="space-y-6">
          {/* Controls: Search and Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by ID, item name, or address..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-300 rounded-full text-xs font-bold focus:outline-none focus:border-[#E8483F] text-[#242424]"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#E8483F] text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('delivered')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'delivered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                Delivered
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#F1E4D8] space-y-4">
              <div className="w-16 h-16 bg-[#E8483F]/10 text-[#E8483F] rounded-full flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#242424]">
                {orders.length === 0 ? 'No Orders Recorded Yet' : 'No Matching Orders'}
              </h3>
              <p className="text-xs text-[#737373] max-w-sm mx-auto">
                {orders.length === 0
                  ? 'Your account has no previous grocery orders. Place your first order with fresh fruits, vegetables, and meats!'
                  : 'No orders match your search criteria. Try clearing the search or status filter.'}
              </p>
              <Link
                href="/items"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E8483F] text-white text-xs font-bold shadow-md hover:scale-105 transition-transform"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-3xl border border-[#F1E4D8] p-6 shadow-xs hover:border-[#E8483F]/40 transition-all space-y-4"
                >
                  {/* Top Order Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1E4D8]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-mono font-black text-[#E8483F]">
                          {order.orderId}
                        </span>
                        <button
                          onClick={() => handleCopyId(order.orderId)}
                          title="Copy Order ID"
                          className="p-1 text-neutral-400 hover:text-[#242424] rounded-md transition-colors"
                        >
                          {copiedId === order.orderId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF4E8] text-[#242424] border border-[#F1E4D8]">
                          {order.paymentMethod === 'card' ? (
                            <>
                              <CreditCard className="w-3 h-3 text-blue-600" />
                              Card ({order.paymentStatus})
                            </>
                          ) : (
                            <>
                              <Banknote className="w-3 h-3 text-emerald-600" />
                              Cash on Delivery ({order.paymentStatus})
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {order.address && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            {order.address}, {order.city}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-[10px] text-[#737373] uppercase font-bold">Total</p>
                        <p className="text-lg font-black text-[#E8483F]">Rs. {order.total}</p>
                      </div>

                      <Link
                        href={`/receipt/${order.orderId}`}
                        className="px-4 py-2 rounded-xl bg-[#FFF4E8] border border-[#F1E4D8] text-[#242424] hover:bg-[#E8483F] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Receipt
                      </Link>
                    </div>
                  </div>

                  {/* Items Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-[#FFF9F2] border border-[#F1E4D8] text-xs flex items-center gap-3"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-neutral-200"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#242424] line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-[#737373]">
                            Qty: {item.quantity} • Rs. {item.price}
                          </p>
                        </div>
                        <span className="font-bold text-[#242424] shrink-0">
                          Rs. {item.totalPrice}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* GUEST PROMPT CARD */
        <div className="bg-white rounded-3xl border border-[#F1E4D8] p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E8483F]/10 text-[#E8483F] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-[#242424]">
            Want to see your full order history?
          </h3>
          <p className="text-xs text-[#737373] max-w-md mx-auto">
            Sign in to your account with Google or Email. All past purchases associated with your email will automatically appear here!
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full bg-[#E8483F] text-white text-xs font-bold shadow-md hover:bg-[#C93630] transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 rounded-full bg-white border border-neutral-300 text-[#242424] text-xs font-bold hover:bg-[#FFF9F2] transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
