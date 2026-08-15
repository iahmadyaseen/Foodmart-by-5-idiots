'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { orderService } from '@/services/orderService';
import { contactService } from '@/services/contactService';
import { Order, OrderStatus, ContactMessage, CategorySlug } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Mail,
  DollarSign,
  Plus,
  Trash2,
  X,
  RefreshCw,
  Flame,
  Shuffle,
} from 'lucide-react';

function AdminDashboardContent() {
  const { user } = useAuth();
  const { products, addProduct, deleteProduct, toggleTopSelling, randomizeTopSelling, refreshProducts } = useProducts();

  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'messages'>('orders');
  const [loading, setLoading] = useState(true);

  // New product form modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductData, setNewProductData] = useState({
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    category: 'fruits' as CategorySlug,
    categoryName: 'Fruits',
    subcategory: '',
    price: 150,
    originalPrice: 180,
    sale: false,
    unit: 'kg',
    stockQuantity: 50,
    stockStatus: 'in_stock' as const,
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    reviewCount: 12,
    description: 'Fresh quality farm product delivered directly from certified suppliers.',
    createdAt: new Date().toISOString(),
  });

  const loadAdminData = async () => {
    setLoading(true);
    const fetchedOrders = await orderService.getAllOrders();
    const fetchedMessages = await contactService.getAllMessages();
    setOrders(fetchedOrders);
    setMessages(fetchedMessages);
    await refreshProducts();
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Total Metrics Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending').length;
  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await orderService.updateOrderStatus(orderId, newStatus);
    loadAdminData();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.price) return;

    await addProduct(newProductData);
    setShowAddProductModal(false);
    setNewProductData({
      ...newProductData,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* ADMIN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            Owner Portal • {user?.email}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            FOOD MART Control Dashboard
          </h1>
          <p className="text-xs text-neutral-400">
            Real-time management for customer orders, catalog stock, and inquiry notifications powered by Prisma ORM.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Database Sync
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-center gap-4">
          <div className="p-4 bg-[#E8483F]/10 text-[#E8483F] rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#737373] uppercase">Total Sales Revenue</p>
            <p className="text-2xl font-black text-[#242424]">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#737373] uppercase">Total Customer Orders</p>
            <p className="text-2xl font-black text-[#242424]">{totalOrdersCount}</p>
            <p className="text-[10px] text-amber-600 font-bold">{pendingOrdersCount} pending fulfillment</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#737373] uppercase">Store Catalog Items</p>
            <p className="text-2xl font-black text-[#242424]">{products.length}</p>
            <p className="text-[10px] text-emerald-600 font-bold">10 Primary Categories</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#737373] uppercase">Inquiry Messages</p>
            <p className="text-2xl font-black text-[#242424]">{messages.length}</p>
            <p className="text-[10px] text-blue-600 font-bold">{unreadMessagesCount} unread</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#F1E4D8] pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#E8483F] text-white shadow-md'
              : 'bg-white text-[#737373] hover:bg-[#FFF9F2] border border-[#F1E4D8]'
          }`}
        >
          Orders Management ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#E8483F] text-white shadow-md'
              : 'bg-white text-[#737373] hover:bg-[#FFF9F2] border border-[#F1E4D8]'
          }`}
        >
          Products & Stock ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-[#E8483F] text-white shadow-md'
              : 'bg-white text-[#737373] hover:bg-[#FFF9F2] border border-[#F1E4D8]'
          }`}
        >
          Customer Messages ({messages.length})
        </button>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#242424] tracking-tight">
            Customer Purchase Orders
          </h2>

          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#F1E4D8]">
              <p className="text-sm font-bold text-[#242424]">No customer orders recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-3xl border border-[#F1E4D8] p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1E4D8]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-[#E8483F]">{order.orderId}</span>
                        <span className="text-xs text-[#737373]">
                          • Customer: <strong className="text-[#242424]">{order.customerName}</strong> ({order.customerEmail})
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] mt-1">
                        Delivery Address: {order.address}, {order.city} | Phone: {order.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-[#737373]">Total Payable</p>
                        <p className="text-lg font-black text-[#E8483F]">Rs. {order.total}</p>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                        className="bg-white text-xs font-bold text-[#242424] px-3 py-2 rounded-xl border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Items list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#FFF9F2] border border-[#F1E4D8] rounded-xl">
                        <p className="font-bold text-[#242424]">{item.name}</p>
                        <p className="text-[10px] text-[#737373]">Qty: {item.quantity} x Rs. {item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS & STOCK INVENTORY */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#F1E4D8]">
            <div>
              <h2 className="text-xl font-black text-[#242424] tracking-tight">
                Grocery Catalog & Stock Management
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Manage stock, toggle top selling products for main screen, or randomize selection.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => randomizeTopSelling(8)}
                className="px-4 py-2.5 rounded-xl bg-[#242424] hover:bg-neutral-800 text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                title="Randomly pick top selling products to feature on the main screen"
              >
                <Shuffle className="w-4 h-4 text-[#FFC857]" />
                Randomize Main Screen Top Items
              </button>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#E8483F] hover:bg-[#C93630] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#F1E4D8] p-4 flex gap-4 shadow-xs"
              >
                <img src={p.image} alt={p.name} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#E8483F] uppercase">{p.categoryName}</span>
                    {p.isTopSelling && (
                      <span className="bg-red-100 text-[#E8483F] text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        Top Seller
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-[#242424] truncate">{p.name}</p>
                  <p className="text-xs font-bold text-[#E8483F]">Rs. {p.price} / {p.unit}</p>

                  <div className="pt-2 flex items-center justify-between text-xs gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.stockQuantity <= 0
                          ? 'bg-red-100 text-red-800'
                          : p.stockQuantity <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Stock: {p.stockQuantity} {p.unit}s
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleTopSelling(p.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          p.isTopSelling
                            ? 'bg-[#E8483F] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                        title="Toggle Top Selling status on main screen"
                      >
                        <Flame className="w-3 h-3" />
                        {p.isTopSelling ? 'Top' : 'Make Top'}
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#242424] tracking-tight">
            Customer Inquiries & Feedback ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#F1E4D8]">
              <p className="text-sm font-bold text-[#242424]">No customer messages received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-[#F1E4D8] p-6 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#242424]">{m.name}</h4>
                      <p className="text-xs text-[#737373]">{m.email}</p>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#242424] pt-2 border-t border-[#F1E4D8]">
                    &ldquo;{m.message}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#F1E4D8] p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#242424]">Add New Grocery Product</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-[#737373] hover:text-[#242424] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#242424] uppercase mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                  placeholder="e.g. Organic Red Apples"
                  className="w-full px-3 py-2 rounded-xl bg-white text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none placeholder:text-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#242424] uppercase mb-1">Category</label>
                  <select
                    value={newProductData.category}
                    onChange={(e) => {
                      const cat = CATEGORIES.find((c) => c.slug === e.target.value);
                      setNewProductData({
                        ...newProductData,
                        category: e.target.value as CategorySlug,
                        categoryName: cat?.name || 'Category',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#242424] uppercase mb-1">Unit (kg/pack/liter)</label>
                  <input
                    type="text"
                    value={newProductData.unit}
                    onChange={(e) => setNewProductData({ ...newProductData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#242424] uppercase mb-1">Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={newProductData.price}
                    onChange={(e) => setNewProductData({ ...newProductData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#242424] uppercase mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newProductData.stockQuantity}
                    onChange={(e) =>
                      setNewProductData({ ...newProductData, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#242424] uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  value={newProductData.image}
                  onChange={(e) => setNewProductData({ ...newProductData, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white text-[#242424] font-bold border-2 border-neutral-300 focus:border-[#E8483F] focus:outline-none font-mono text-[10px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#242424] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#E8483F] hover:bg-[#C93630] text-white font-bold cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
