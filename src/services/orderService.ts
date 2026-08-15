import { Order, OrderStatus, PaymentStatus } from '../types';

export const orderService = {
  /**
   * Save a newly created order to Prisma database via Next.js API
   */
  async createOrder(order: Order): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to place order');
      }

      const data = await res.json();
      return data.order || order;
    } catch (err) {
      console.error('Order creation error:', err);
      throw err;
    }
  },

  /**
   * Get orders for current authenticated customer (Server ensures no leaks!)
   */
  async getUserOrders(userId?: string): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) return [];
      const data = await res.json();
      return data.orders || [];
    } catch (err) {
      console.error('Fetch user orders error:', err);
      return [];
    }
  },

  /**
   * Get single order by orderId (Server enforces ownership verification)
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.order || null;
    } catch (err) {
      console.error('Fetch order by ID error:', err);
      return null;
    }
  },

  /**
   * Admin: Get all orders across all customers
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) return [];
      const data = await res.json();
      return data.orders || [];
    } catch (err) {
      console.error('Fetch all orders error:', err);
      return [];
    }
  },

  /**
   * Admin: Update order status or payment status
   */
  async updateOrderStatus(orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus): Promise<void> {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      if (!res.ok) {
        throw new Error('Failed to update order status');
      }
    } catch (err) {
      console.error('Update order status error:', err);
      throw err;
    }
  },
};
