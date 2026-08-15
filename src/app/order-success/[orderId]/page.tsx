'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { orderService } from '@/services/orderService';
import { ReceiptView } from '@/components/ReceiptView';
import { Order } from '@/types';
import { CheckCircle2, ShoppingBag, PackageCheck } from 'lucide-react';

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      orderService.getOrderById(orderId).then((res) => {
        setOrder(res);
        setLoading(false);
      });
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8483F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-[#F1E4D8]">
        <h2 className="text-2xl font-black text-[#242424]">Order Not Found</h2>
        <Link
          href="/"
          className="mt-4 inline-block px-6 py-2.5 rounded-full bg-[#E8483F] text-white font-bold text-xs"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* SUCCESS HERO BADGE */}
      <div className="text-center space-y-3 bg-emerald-50 border border-emerald-200 p-8 rounded-3xl shadow-xs">
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-[#242424] tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-[#737373] max-w-md mx-auto">
          Thank you for choosing FOOD MART! Your order <span className="font-bold text-[#E8483F]">{order.orderId}</span> is confirmed and securely stored in our Prisma database.
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/orders"
            className="px-6 py-2.5 rounded-full bg-white border border-neutral-300 text-[#242424] text-xs font-bold shadow-xs hover:bg-[#FFF9F2] flex items-center gap-2"
          >
            <PackageCheck className="w-4 h-4 text-[#E8483F]" />
            View My Orders
          </Link>

          <Link
            href="/items"
            className="px-6 py-2.5 rounded-full bg-[#E8483F] text-white text-xs font-bold shadow-md hover:bg-[#C93630] flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* RENDER EMBEDDED RECEIPT */}
      <ReceiptView order={order} />
    </div>
  );
}
