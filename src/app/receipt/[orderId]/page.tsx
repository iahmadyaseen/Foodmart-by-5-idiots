'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { orderService } from '@/services/orderService';
import { ReceiptView } from '@/components/ReceiptView';
import { Order } from '@/types';
import { ArrowLeft } from 'lucide-react';

export default function ReceiptPage({
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
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-neutral-200">
        <h2 className="text-2xl font-black text-neutral-900">Receipt Not Found</h2>
        <Link
          href="/orders"
          className="mt-4 inline-block px-6 py-2.5 rounded-full bg-[#E8483F] text-white font-bold text-xs"
        >
          Go to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#E8483F] transition-colors print:hidden"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders History
      </Link>

      <ReceiptView order={order} />
    </div>
  );
}
