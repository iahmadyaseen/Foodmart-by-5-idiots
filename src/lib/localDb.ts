import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { CATEGORIES } from '../data/categories';
import { INITIAL_PRODUCTS } from '../data/products';
import { INITIAL_REVIEWS } from '../data/reviews';

const DB_FILE = path.join(process.cwd(), '.local-db.json');

// Pre-hashed passwords
// admin123 -> $2b$10$BLfJRtnvMDhGq15Qa3SBeuczQCltIYAE7n6xbPl6OHer4884WFzQ2
// demo123  -> $2b$10$vTEBUkkEYzRqV6JROCPJ0OUjdLxDhSY.I4BwzSDtWMkOg0PPce1Jq
const DEFAULT_SUPER_ADMIN_PASSWORD_HASH = '$2b$10$BLfJRtnvMDhGq15Qa3SBeuczQCltIYAE7n6xbPl6OHer4884WFzQ2';
const DEFAULT_CUSTOMER_PASSWORD_HASH = '$2b$10$vTEBUkkEYzRqV6JROCPJ0OUjdLxDhSY.I4BwzSDtWMkOg0PPce1Jq';

export interface LocalDbData {
  users: Array<{
    id: string;
    email: string;
    name: string;
    password: string;
    role: string;
    photoURL?: string | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
  }>;
  categories: any[];
  products: any[];
  orders: any[];
  contactMessages: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>;
  reviews: any[];
  passwordResetTokens: Array<{
    email: string;
    code: string;
    expiresAt: number;
  }>;
}

function getInitialData(): LocalDbData {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: 'admin-user-01',
        email: 'ay8880625@gmail.com',
        name: 'FOOD MART Super Admin',
        password: DEFAULT_SUPER_ADMIN_PASSWORD_HASH,
        role: 'super_admin',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      },
      {
        id: 'customer-user-01',
        email: 'demo@foodmart.com',
        name: 'FoodMart Customer',
        password: DEFAULT_CUSTOMER_PASSWORD_HASH,
        role: 'customer',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      },
    ],
    categories: [...CATEGORIES],
    products: [...INITIAL_PRODUCTS],
    orders: [],
    contactMessages: [],
    reviews: [...INITIAL_REVIEWS],
    passwordResetTokens: [],
  };
}

class LocalDatabase {
  private data: LocalDbData;

  constructor() {
    this.data = this.load();
  }

  private load(): LocalDbData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure ay8880625@gmail.com exists and is super_admin
        const superAdmin = parsed.users?.find(
          (u: any) => u.email.toLowerCase() === 'ay8880625@gmail.com'
        );
        if (!superAdmin) {
          const now = new Date().toISOString();
          parsed.users = parsed.users || [];
          parsed.users.unshift({
            id: 'admin-user-01',
            email: 'ay8880625@gmail.com',
            name: 'FOOD MART Super Admin',
            password: DEFAULT_SUPER_ADMIN_PASSWORD_HASH,
            role: 'super_admin',
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
          });
        } else if (superAdmin.role !== 'super_admin') {
          superAdmin.role = 'super_admin';
        }

        // Ensure products and categories exist
        if (!parsed.products || parsed.products.length === 0) {
          parsed.products = [...INITIAL_PRODUCTS];
        }
        if (!parsed.categories || parsed.categories.length === 0) {
          parsed.categories = [...CATEGORIES];
        }
        if (!parsed.reviews || parsed.reviews.length === 0) {
          parsed.reviews = [...INITIAL_REVIEWS];
        }
        if (!parsed.passwordResetTokens) {
          parsed.passwordResetTokens = [];
        }

        return parsed;
      }
    } catch (e) {
      console.warn('[LocalDB] Load error, re-initializing:', e);
    }

    const init = getInitialData();
    this.save(init);
    return init;
  }

  private save(data?: LocalDbData) {
    try {
      const toSave = data || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('[LocalDB] Save error:', e);
    }
  }

  $transaction = async (arg: any) => {
    if (typeof arg === 'function') {
      return await arg(this);
    }
    if (Array.isArray(arg)) {
      const results = [];
      for (const item of arg) {
        results.push(await item);
      }
      return results;
    }
    return null;
  };

  // --- USER OPERATIONS ---
  readonly user = {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      this.data = this.load();
      const targetEmail = where.email ? where.email.toLowerCase().trim() : undefined;
      const user = this.data.users.find(
        (u) => (targetEmail && u.email.toLowerCase() === targetEmail) || (where.id && u.id === where.id)
      );
      if (!user) return null;
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        lastLoginAt: new Date(user.lastLoginAt),
      };
    },

    findFirst: async (args: any) => {
      return this.user.findUnique(args);
    },

    findMany: async (args?: { select?: any; orderBy?: any }) => {
      this.data = this.load();
      return this.data.users.map((u) => {
        const orderCount = this.data.orders.filter((o) => o.userId === u.id).length;
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          photoURL: u.photoURL,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
          lastLoginAt: new Date(u.lastLoginAt),
          _count: { orders: orderCount },
        };
      });
    },

    create: async ({ data }: { data: any }) => {
      this.data = this.load();
      const now = new Date().toISOString();
      const newUser = {
        id: data.id || `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        email: data.email.toLowerCase().trim(),
        name: data.name,
        password: data.password || DEFAULT_CUSTOMER_PASSWORD_HASH,
        role: data.role || (data.email.toLowerCase() === 'ay8880625@gmail.com' ? 'super_admin' : 'customer'),
        photoURL: data.photoURL || null,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      this.data.users.push(newUser);
      this.save();

      return {
        ...newUser,
        createdAt: new Date(newUser.createdAt),
        updatedAt: new Date(newUser.updatedAt),
        lastLoginAt: new Date(newUser.lastLoginAt),
      };
    },

    update: async ({ where, data }: { where: { id?: string; email?: string }; data: any }) => {
      this.data = this.load();
      const targetEmail = where.email ? where.email.toLowerCase().trim() : undefined;
      const index = this.data.users.findIndex(
        (u) => (targetEmail && u.email.toLowerCase() === targetEmail) || (where.id && u.id === where.id)
      );

      if (index === -1) throw new Error('User not found in local db');

      const existing = this.data.users[index];
      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
        lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt).toISOString() : existing.lastLoginAt,
      };

      this.data.users[index] = updated;
      this.save();

      return {
        ...updated,
        createdAt: new Date(updated.createdAt),
        updatedAt: new Date(updated.updatedAt),
        lastLoginAt: new Date(updated.lastLoginAt),
      };
    },

    upsert: async ({ where, update, create }: any) => {
      const existing = await this.user.findUnique({ where });
      if (existing) {
        return await this.user.update({ where: { id: existing.id }, data: update });
      } else {
        return await this.user.create({ data: create });
      }
    },
  };

  // --- CONTACT MESSAGE OPERATIONS ---
  readonly contactMessage = {
    findMany: async (args?: any) => {
      this.data = this.load();
      return [...this.data.contactMessages]
        .reverse()
        .map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }));
    },

    create: async ({ data }: { data: any }) => {
      this.data = this.load();
      const now = new Date().toISOString();
      const newMsg = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: data.name,
        email: data.email,
        message: data.message,
        read: false,
        createdAt: now,
      };

      this.data.contactMessages.push(newMsg);
      this.save();

      return {
        ...newMsg,
        createdAt: new Date(newMsg.createdAt),
      };
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      this.data = this.load();
      const index = this.data.contactMessages.findIndex((m) => m.id === where.id);
      if (index !== -1) {
        this.data.contactMessages[index] = {
          ...this.data.contactMessages[index],
          ...data,
        };
        this.save();
        return {
          ...this.data.contactMessages[index],
          createdAt: new Date(this.data.contactMessages[index].createdAt),
        };
      }
      throw new Error('Message not found');
    },
  };

  // --- ORDER OPERATIONS ---
  readonly order = {
    findMany: async (args?: any) => {
      this.data = this.load();
      let res = [...this.data.orders];
      if (args?.where) {
        if (args.where.userId && !args.where.OR) {
          res = res.filter((o) => o.userId === args.where.userId);
        } else if (args.where.OR && Array.isArray(args.where.OR)) {
          res = res.filter((o) => {
            return args.where.OR.some((cond: any) => {
              if (cond.userId && o.userId === cond.userId) return true;
              const targetEmail = cond.customerEmail?.equals || cond.customerEmail;
              if (targetEmail && o.customerEmail?.toLowerCase() === targetEmail.toLowerCase()) return true;
              return false;
            });
          });
        }
      }
      return res.reverse().map((o) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
      }));
    },

    findUnique: async ({ where }: { where: { id: string } }) => {
      this.data = this.load();
      const order = this.data.orders.find((o) => o.id === where.id);
      if (!order) return null;
      return {
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      };
    },

    create: async ({ data }: { data: any }) => {
      this.data = this.load();
      const now = new Date().toISOString();
      const items = (data.items?.create || []).map((it: any) => ({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: data.id,
        productId: it.productId,
        sku: it.sku,
        name: it.name,
        price: it.price,
        unit: it.unit,
        quantity: it.quantity,
        totalPrice: it.totalPrice,
        image: it.image,
      }));

      const newOrder = {
        id: data.id || `ORD-${Date.now()}`,
        userId: data.userId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        notes: data.notes || null,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        deliveryFee: data.deliveryFee || 0,
        total: data.total,
        paymentMethod: data.paymentMethod || 'cod',
        paymentStatus: data.paymentStatus || 'pending',
        orderStatus: data.orderStatus || 'pending',
        estimatedDelivery: data.estimatedDelivery || 'Today by 8:00 PM',
        createdAt: now,
        updatedAt: now,
        items,
      };

      this.data.orders.push(newOrder);
      this.save();

      return {
        ...newOrder,
        createdAt: new Date(newOrder.createdAt),
        updatedAt: new Date(newOrder.updatedAt),
      };
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      this.data = this.load();
      const index = this.data.orders.findIndex((o) => o.id === where.id);
      if (index === -1) throw new Error('Order not found');

      const existing = this.data.orders[index];
      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      this.data.orders[index] = updated;
      this.save();

      return {
        ...updated,
        createdAt: new Date(updated.createdAt),
        updatedAt: new Date(updated.updatedAt),
      };
    },
  };

  // --- PRODUCT OPERATIONS ---
  readonly product = {
    findMany: async (args?: any) => {
      this.data = this.load();
      let res = [...this.data.products];
      if (args?.where?.isTopSelling) {
        res = res.filter((p) => p.isTopSelling);
      }
      if (args?.where?.categorySlug) {
        res = res.filter((p) => p.categorySlug === args.where.categorySlug || p.category === args.where.categorySlug);
      }
      return res.map((p) => ({
        ...p,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      }));
    },

    findUnique: async ({ where }: { where: { id?: string; sku?: string } }) => {
      this.data = this.load();
      const prod = this.data.products.find(
        (p) => (where.id && p.id === where.id) || (where.sku && p.sku === where.sku)
      );
      if (!prod) return null;
      return {
        ...prod,
        createdAt: prod.createdAt ? new Date(prod.createdAt) : new Date(),
        updatedAt: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
      };
    },

    create: async ({ data }: { data: any }) => {
      this.data = this.load();
      const newP = {
        id: data.id || `prod-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.products.push(newP);
      this.save();
      return newP;
    },

    update: async ({ where, data }: { where: { id?: string; sku?: string }; data: any }) => {
      this.data = this.load();
      const index = this.data.products.findIndex(
        (p) => (where.id && p.id === where.id) || (where.sku && p.sku === where.sku)
      );
      if (index === -1) throw new Error('Product not found');
      const updated = { ...this.data.products[index], ...data, updatedAt: new Date().toISOString() };
      this.data.products[index] = updated;
      this.save();
      return updated;
    },

    delete: async ({ where }: { where: { id: string } }) => {
      this.data = this.load();
      this.data.products = this.data.products.filter((p) => p.id !== where.id);
      this.save();
      return { success: true };
    },
  };

  // --- CATEGORY OPERATIONS ---
  readonly category = {
    findMany: async (args?: any) => {
      this.data = this.load();
      return this.data.categories.map((c) => ({
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    },

    findUnique: async ({ where }: { where: { slug: string } }) => {
      this.data = this.load();
      const cat = this.data.categories.find((c) => c.slug === where.slug);
      if (!cat) return null;
      return {
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  };

  // --- REVIEW OPERATIONS ---
  readonly review = {
    findMany: async (args?: any) => {
      this.data = this.load();
      return this.data.reviews.map((r) => ({
        ...r,
        createdAt: new Date(r.date || Date.now()),
      }));
    },

    create: async ({ data }: { data: any }) => {
      this.data = this.load();
      const newR = {
        id: `rev-${Date.now()}`,
        name: data.name,
        avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        rating: data.rating,
        review: data.review,
        location: data.location || 'Local Shopper',
        date: new Date().toISOString().split('T')[0],
      };
      this.data.reviews.unshift(newR);
      this.save();
      return newR;
    },
  };

  // --- PASSWORD RESET TOKEN OPERATIONS ---
  readonly passwordReset = {
    createToken: async (email: string) => {
      this.data = this.load();
      // Generate 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

      this.data.passwordResetTokens = (this.data.passwordResetTokens || []).filter(
        (t) => t.email.toLowerCase() !== email.toLowerCase()
      );
      this.data.passwordResetTokens.push({ email: email.toLowerCase(), code, expiresAt });
      this.save();
      return code;
    },

    verifyCode: async (email: string, code: string): Promise<boolean> => {
      this.data = this.load();
      const token = (this.data.passwordResetTokens || []).find(
        (t) => t.email.toLowerCase() === email.toLowerCase() && t.code.trim() === code.trim()
      );
      if (!token) return false;
      if (Date.now() > token.expiresAt) return false;
      return true;
    },

    consumeCode: async (email: string) => {
      this.data = this.load();
      this.data.passwordResetTokens = (this.data.passwordResetTokens || []).filter(
        (t) => t.email.toLowerCase() !== email.toLowerCase()
      );
      this.save();
    },
  };

  async $disconnect() {
    return Promise.resolve();
  }
}

export const localDb = new LocalDatabase();
