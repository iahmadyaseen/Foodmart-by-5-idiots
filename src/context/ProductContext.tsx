'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CategorySlug } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categorySlug: CategorySlug) => Product[];
  decreaseStock: (items: { productId: string; quantity: number }[]) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleTopSelling: (id: string) => Promise<void>;
  randomizeTopSelling: (count?: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      console.warn('API products fetch failed, using initial list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const getProductsByCategory = (categorySlug: CategorySlug) => {
    return products.filter((p) => p.category === categorySlug);
  };

  const decreaseStock = async (items: { productId: string; quantity: number }[]) => {
    // Optimistic local update
    const updatedList = products.map((product) => {
      const target = items.find((i) => i.productId === product.id);
      if (!target) return product;

      const newQty = Math.max(0, product.stockQuantity - target.quantity);
      const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= 5 ? 'low_stock' : 'in_stock';

      return {
        ...product,
        stockQuantity: newQty,
        stockStatus: newStatus as 'in_stock' | 'low_stock' | 'out_of_stock',
      };
    });

    setProducts(updatedList);

    // Call server API
    try {
      await fetch('/api/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    } catch (err) {
      console.error('Stock decrement API error:', err);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add product');
      }

      const data = await res.json();
      const newProd: Product = data.product;
      setProducts((prev) => [newProd, ...prev]);
      return newProd;
    } catch (err) {
      console.error('Add product error:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update product');
      }

      const data = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
    } catch (err) {
      console.error('Update product error:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete product error:', err);
      throw err;
    }
  };

  const toggleTopSelling = async (id: string) => {
    try {
      const res = await fetch('/api/products/top-selling', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', productId: id }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isTopSelling: !p.isTopSelling } : p))
        );
      }
    } catch (err) {
      console.error('Toggle top selling error:', err);
    }
  };

  const randomizeTopSelling = async (count = 8) => {
    try {
      const res = await fetch('/api/products/top-selling', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'randomize', count }),
      });

      if (res.ok) {
        await fetchProducts();
      }
    } catch (err) {
      console.error('Randomize top selling error:', err);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        getProductById,
        getProductsByCategory,
        decreaseStock,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleTopSelling,
        randomizeTopSelling,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
