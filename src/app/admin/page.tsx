'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { orderService } from '@/services/orderService';
import { contactService } from '@/services/contactService';
import { userService, AdminUserListItem } from '@/services/userService';
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
  Users,
  Crown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  UserCheck,
  UserX,
  Send,
} from 'lucide-react';

function AdminDashboardContent() {
  const { user, isSuperAdmin } = useAuth();
  const { products, addProduct, deleteProduct, toggleTopSelling, randomizeTopSelling, refreshProducts } = useProducts();

  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'messages' | 'users'>('orders');
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [roleActionStatus, setRoleActionStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success?: boolean;
    note?: string;
  } | null>(null);

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' });
      const data = await res.json();
      setTestEmailResult(data);
    } catch {
      setTestEmailResult({ success: false, note: 'Failed to contact test email service.' });
    } finally {
      setTestEmailLoading(false);
    }
  };

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
    const [fetchedOrders, fetchedMessages, fetchedUsers] = await Promise.all([
      orderService.getAllOrders(),
      contactService.getAllMessages(),
      userService.getAllUsers(),
    ]);
    setOrders(fetchedOrders);
    setMessages(fetchedMessages);
    setUsers(fetchedUsers);
    await refreshProducts();
    setLoading(false);
  };

  const handleToggleUserRole = async (targetUser: AdminUserListItem) => {
    if (!isSuperAdmin) {
      setRoleActionStatus({
        message: 'Only Super Admin (ay8880625@gmail.com) is authorized to promote or revoke admin roles.',
        isError: true,
      });
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'customer' : 'admin';
    setUpdatingUserId(targetUser.id);
    setRoleActionStatus(null);

    const result = await userService.updateUserRole(targetUser.id, newRole);
    if (result.success) {
      setRoleActionStatus({
        message: `Successfully changed ${targetUser.email} role to ${newRole === 'admin' ? 'Store Admin' : 'Customer'}.`,
        isError: false,
      });
      const updatedUsers = await userService.getAllUsers();
      setUsers(updatedUsers);
    } else {
      setRoleActionStatus({
        message: result.error || 'Failed to update user role',
        isError: true,
      });
    }
    setUpdatingUserId(null);
  };

  const handleMarkMessageRead = async (id: string) => {
    await contactService.markRead(id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
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

  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const query = userSearchQuery.toLowerCase().trim();
    return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* ADMIN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${
              isSuperAdmin
                ? 'bg-amber-400 text-neutral-900 shadow-md shadow-amber-400/20'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isSuperAdmin ? <Crown className="w-4 h-4 fill-neutral-900" /> : <ShieldCheck className="w-4 h-4" />}
            {isSuperAdmin ? 'Super Admin (Sole Owner)' : 'Store Admin'} • {user?.email}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            FOOD MART Control Dashboard
          </h1>
          <p className="text-xs text-neutral-400">
            {isSuperAdmin
              ? 'Executive control dashboard. Only you (ay8880625@gmail.com) can designate other accounts as store administrators.'
              : 'Store administrator control panel for customer orders, inventory stock, and incoming inquiries.'}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-[#E8483F]/10 text-[#E8483F] rounded-2xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#737373] uppercase">Sales Revenue</p>
            <p className="text-xl font-black text-[#242424]">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#737373] uppercase">Customer Orders</p>
            <p className="text-xl font-black text-[#242424]">{totalOrdersCount}</p>
            <p className="text-[10px] text-amber-600 font-bold">{pendingOrdersCount} pending</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#737373] uppercase">Catalog Items</p>
            <p className="text-xl font-black text-[#242424]">{products.length}</p>
            <p className="text-[10px] text-emerald-600 font-bold">10 Categories</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/10 text-blue-600 rounded-2xl">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#737373] uppercase">Inquiries</p>
            <p className="text-xl font-black text-[#242424]">{messages.length}</p>
            <p className="text-[10px] text-blue-600 font-bold">{unreadMessagesCount} unread</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F1E4D8] shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-purple-500/10 text-purple-600 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#737373] uppercase">Users & Admins</p>
            <p className="text-xl font-black text-[#242424]">{users.length}</p>
            <p className="text-[10px] text-purple-600 font-bold">
              {users.filter((u) => u.role === 'admin' || u.isSuperAdmin).length} admin(s)
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#F1E4D8] pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#E8483F] text-white shadow-md'
              : 'bg-white text-[#737373] hover:bg-[#FFF9F2] border border-[#F1E4D8]'
          }`}
        >
          Orders Management ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#E8483F] text-white shadow-md'
              : 'bg-white text-[#737373] hover:bg-[#FFF9F2] border border-[#F1E4D8]'
          }`}
        >
          Products & Stock ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'messages'
              ? 'bg-[#E8483F] text-white shadow-md'
              : 'bg-white text-[#737373] hover:bg-[#FFF9F2] border border-[#F1E4D8]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Customer Messages ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-[#E8483F] text-white shadow-md'
              : 'bg-white text-[#737373] hover:bg-[#FFF9F2] border border-[#F1E4D8]'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          Admin Roles & Users ({users.length})
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#F1E4D8]">
            <div>
              <h2 className="text-xl font-black text-[#242424] tracking-tight">
                Customer Inquiries & Feedback ({messages.length})
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Every customer message is stored in the database and automatically dispatched to Super Admin email: <strong>ay8880625@gmail.com</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSendTestEmail}
                disabled={testEmailLoading}
                className="px-4 py-2 rounded-xl bg-[#E8483F] hover:bg-[#C93630] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {testEmailLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Send Test Email to ay8880625@gmail.com
              </button>
            </div>
          </div>

          {/* Test Email Result Banner */}
          {testEmailResult && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-start gap-3 border animate-in fade-in ${
                testEmailResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {testEmailResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {testEmailResult.success
                    ? 'Test Email Successfully Delivered!'
                    : 'Gmail SMTP Authentication Notice'}
                </p>
                <p className="leading-relaxed">{testEmailResult.note}</p>
                {!testEmailResult.success && (
                  <div className="pt-2 text-[11px] text-neutral-700 space-y-1">
                    <p className="font-bold text-[#242424]">How to enable Gmail delivery in 2 quick steps:</p>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>Go to your Google Account Security: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-[#E8483F] underline font-bold">https://myaccount.google.com/apppasswords</a></li>
                      <li>Generate a 16-character App Password (name it "FoodMart") and paste it in <code className="bg-white px-1 py-0.5 rounded border border-neutral-300 font-mono">.env</code> as <code className="bg-white px-1 py-0.5 rounded border border-neutral-300 font-mono">GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"</code>.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Notification Architecture Notice */}
          <div className="bg-[#FFF9F2] border border-[#F1E4D8] rounded-2xl p-4 text-xs flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#E8483F] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-[#242424]">Direct Mail Dispatch System</p>
              <p className="text-[#737373]">
                When any customer submits an inquiry on the Contact page, it is recorded here for all administrators and simultaneously routed to your personal mailbox (<strong>ay8880625@gmail.com</strong>).
              </p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#F1E4D8]">
              <p className="text-sm font-bold text-[#242424]">No customer messages received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`bg-white rounded-2xl border p-6 shadow-xs space-y-3 transition-all ${
                    m.read ? 'border-[#F1E4D8] opacity-85' : 'border-amber-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#E8483F]/10 text-[#E8483F] font-bold text-xs flex items-center justify-center uppercase">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#242424]">{m.name}</h4>
                          {!m.read && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                              New / Unread
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#737373] font-mono">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-neutral-400">
                        {new Date(m.createdAt).toLocaleDateString()} at{' '}
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {!m.read && (
                        <button
                          onClick={() => handleMarkMessageRead(m.id)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-bold cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      )}

                      <a
                        href={`mailto:${m.email}?subject=Food%20Mart%20Support:%20Reply%20to%20your%20inquiry`}
                        className="px-3 py-1.5 rounded-xl bg-[#E8483F] hover:bg-[#C93630] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply via Email
                      </a>
                    </div>
                  </div>

                  <div className="bg-[#FFFDF9] rounded-xl p-3 border border-[#F1E4D8]">
                    <p className="text-xs text-[#242424] leading-relaxed italic">
                      &ldquo;{m.message}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADMIN ROLES & USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#F1E4D8]">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-xl font-black text-[#242424] tracking-tight">
                  User Accounts & Store Admin Privileges
                </h2>
              </div>
              <p className="text-xs text-[#737373] mt-1">
                Only <strong className="text-[#242424]">ay8880625@gmail.com</strong> (Super Admin) is authorized to promote registered users to Admin or revoke permissions. All standard signups default strictly to Customer status.
              </p>
            </div>

            {/* Live Search */}
            <div className="relative min-w-[260px]">
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E8483F] focus:bg-white text-[#242424]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Feedback banner */}
          {roleActionStatus && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
                roleActionStatus.isError
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {roleActionStatus.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{roleActionStatus.message}</span>
            </div>
          )}

          {/* Info Card explaining Super Admin rules */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Super Admin Role Guarantee</p>
              <p className="text-amber-800">
                • <strong>ay8880625@gmail.com</strong> is hardcoded and enforced on both server and database levels as the exclusive Super Admin.
                <br />
                • Any other email registering or signing in is automatically restricted to a Customer account unless explicitly promoted by you below.
              </p>
            </div>
          </div>

          {/* Users Table / List */}
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#F1E4D8]">
              <p className="text-sm font-bold text-[#242424]">No registered users found matching your search.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#F1E4D8] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF9F2] text-[#737373] uppercase font-bold border-b border-[#F1E4D8]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Total Orders</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4 text-right pr-6">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1E4D8]">
                    {filteredUsers.map((u) => {
                      const isTargetSuperAdmin = u.isSuperAdmin || u.email.toLowerCase() === 'ay8880625@gmail.com';
                      return (
                        <tr key={u.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                                  isTargetSuperAdmin
                                    ? 'bg-amber-400 text-neutral-900 shadow-sm'
                                    : u.role === 'admin'
                                    ? 'bg-[#E8483F] text-white'
                                    : 'bg-neutral-200 text-neutral-700'
                                }`}
                              >
                                {u.name ? u.name.charAt(0) : 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[#242424] truncate flex items-center gap-1.5">
                                  {u.name}
                                  {isTargetSuperAdmin && (
                                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  )}
                                </p>
                                <p className="text-[11px] text-[#737373] font-mono truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            {isTargetSuperAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                <Crown className="w-3 h-3 text-amber-600 fill-amber-600" />
                                Super Admin
                              </span>
                            ) : u.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-[#E8483F] border border-red-200">
                                <ShieldCheck className="w-3 h-3 text-[#E8483F]" />
                                Store Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-600">
                                Customer
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 font-bold text-[#242424]">
                            {u.ordersCount} orders
                          </td>

                          <td className="py-4 px-4 text-[#737373] text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-4 px-4 text-right pr-6">
                            {isTargetSuperAdmin ? (
                              <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                Master Account
                              </span>
                            ) : isSuperAdmin ? (
                              u.role === 'admin' ? (
                                <button
                                  onClick={() => handleToggleUserRole(u)}
                                  disabled={updatingUserId === u.id}
                                  className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50"
                                >
                                  {updatingUserId === u.id ? (
                                    <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <UserX className="w-3.5 h-3.5" />
                                  )}
                                  Demote to Customer
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleUserRole(u)}
                                  disabled={updatingUserId === u.id}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50"
                                >
                                  {updatingUserId === u.id ? (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                  Allow as Admin
                                </button>
                              )
                            ) : (
                              <span className="text-[11px] text-neutral-400 italic">
                                Super Admin Only
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
