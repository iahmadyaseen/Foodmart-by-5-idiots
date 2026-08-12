import { Order, OrderStatus, PaymentStatus } from '../types';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType, ADMIN_EMAIL } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore';

const LOCAL_STORAGE_ORDERS_KEY = 'foodmart_customer_orders';

export const orderService = {
  /**
   * Save a newly created order
   */
  async createOrder(order: Order): Promise<Order> {
    // Local storage persistence
    const existing = this.getLocalOrders();
    const updated = [order, ...existing];
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));

    // Firestore persistence
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'orders', order.orderId), order);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `orders/${order.orderId}`);
        // If production Firebase fails, alert error as required by rule 101
        if ((import.meta as any).env?.PROD) {
          throw new Error('Production Database Error: Could not permanently save your order to Cloud Firestore.');
        }
      }
    }

    return order;
  },

  /**
   * Get orders for a specific customer by userId
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    // Try Firestore first if configured
    if (isFirebaseConfigured() && db) {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', userId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const orders: Order[] = [];
          snap.forEach(d => orders.push(d.data() as Order));
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return orders;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    }

    // Fallback to local storage filtering
    const all = this.getLocalOrders();
    return all.filter(o => o.userId === userId);
  },

  /**
   * Get single order by orderId
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    if (isFirebaseConfigured() && db) {
      try {
        const ref = doc(db, 'orders', orderId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          return snap.data() as Order;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `orders/${orderId}`);
      }
    }

    const all = this.getLocalOrders();
    return all.find(o => o.orderId === orderId) || null;
  },

  /**
   * Admin: Get all orders across all customers
   */
  async getAllOrders(): Promise<Order[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = collection(db, 'orders');
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const orders: Order[] = [];
          snap.forEach(d => orders.push(d.data() as Order));
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return orders;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    }

    return this.getLocalOrders();
  },

  /**
   * Admin: Update order status or payment status
   */
  async updateOrderStatus(orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus): Promise<void> {
    // Update local storage
    const all = this.getLocalOrders();
    const updated = all.map(o => {
      if (o.orderId === orderId) {
        return {
          ...o,
          orderStatus,
          paymentStatus: paymentStatus || o.paymentStatus
        };
      }
      return o;
    });
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));

    // Update Firestore
    if (isFirebaseConfigured() && db) {
      try {
        const updateData: any = { orderStatus };
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        await updateDoc(doc(db, 'orders', orderId), updateData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      }
    }
  },

  /**
   * Helper: Read from local storage
   */
  getLocalOrders(): Order[] {
    const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error reading local orders:', e);
      }
    }
    return [];
  }
};
