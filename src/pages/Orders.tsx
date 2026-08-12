import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { Package, Clock, CheckCircle2, ChevronRight, FileText, ShoppingBag } from 'lucide-react';

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      orderService.getUserOrders(user.userId).then(res => {
        setOrders(res);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8483F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#E8483F] uppercase tracking-wider">Account History</span>
        <h1 className="text-3xl font-black text-[#242424] tracking-tight mt-1">
          My Grocery Orders ({orders.length})
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#F1E4D8] space-y-4">
          <div className="w-16 h-16 bg-[#E8483F]/10 text-[#E8483F] rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#242424]">No Orders Placed Yet</h2>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            You haven't placed any grocery orders yet. Start shopping fresh fruits, vegetables, or prime meat cuts!
          </p>
          <Link
            to="/items"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E8483F] text-white text-xs font-bold shadow-md hover:scale-105 transition-transform"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Items Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-3xl border border-[#F1E4D8] p-6 shadow-xs space-y-4"
            >
              {/* Top Order Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1E4D8]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#E8483F]">{order.orderId}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] mt-1">
                    Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[#737373]">Total Amount</p>
                    <p className="text-base font-black text-[#E8483F]">Rs. {order.total}</p>
                  </div>

                  <Link
                    to={`/receipt/${order.orderId}`}
                    className="p-2.5 rounded-xl bg-[#FFF4E8] border border-[#F1E4D8] text-[#242424] hover:bg-[#E8483F] hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    Receipt
                  </Link>
                </div>
              </div>

              {/* Items Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FFF9F2] border border-[#F1E4D8] text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#242424] line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-[#737373]">Qty: {item.quantity} x Rs. {item.price}</p>
                    </div>
                    <span className="font-bold text-[#242424]">Rs. {item.totalPrice}</span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
