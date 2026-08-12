export type CategorySlug = 
  | 'fruits'
  | 'vegetables'
  | 'spices-masalas'
  | 'dairy-eggs'
  | 'bakery-bread'
  | 'meat'
  | 'rice-grains-pulses'
  | 'beverages-drinks'
  | 'snacks'
  | 'sweets';

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
  subcategories?: string[];
  productCount: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: CategorySlug;
  categoryName: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  sale?: boolean;
  unit: string;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  isTopSelling?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  totalPrice: number;
  image: string;
}

export type PaymentMethod = 'cod' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface CustomerReview {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  review: string;
  date: string;
  location?: string;
}
