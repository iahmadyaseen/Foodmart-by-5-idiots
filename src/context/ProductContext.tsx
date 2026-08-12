import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CategorySlug } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const LOCAL_STORAGE_PRODUCTS_KEY = 'foodmart_products_catalog';

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        // Merge any new products from INITIAL_PRODUCTS that are missing from localStorage
        const existingIds = new Set(parsed.map(p => p.id));
        const missingInitial = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
        if (missingInitial.length > 0) {
          const merged = [...parsed, ...missingInitial];
          localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse stored products catalog:', e);
      }
    }
    return INITIAL_PRODUCTS;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync catalog to local storage
  const updateLocalProducts = (newList: Product[]) => {
    setProducts(newList);
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(newList));
  };

  // Fetch from Firestore if available
  useEffect(() => {
    const fetchFirestoreProducts = async () => {
      if (isFirebaseConfigured() && db) {
        try {
          const colRef = collection(db, 'products');
          const snap = await getDocs(colRef);
          if (!snap.empty) {
            const remoteProducts: Product[] = [];
            snap.forEach(docSnap => {
              remoteProducts.push(docSnap.data() as Product);
            });
            if (remoteProducts.length > 0) {
              updateLocalProducts(remoteProducts);
            }
          } else {
            // Seed initial products to Firestore
            for (const prod of INITIAL_PRODUCTS) {
              await setDoc(doc(db, 'products', prod.id), prod);
            }
          }
        } catch (err) {
          console.warn('Firestore products fetch error, using local catalog:', err);
        }
      }
      setLoading(false);
    };

    fetchFirestoreProducts();
  }, []);

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  const getProductsByCategory = (categorySlug: CategorySlug) => {
    return products.filter(p => p.category === categorySlug);
  };

  // Decrease stock when order is placed
  const decreaseStock = async (items: { productId: string; quantity: number }[]) => {
    const updatedList = products.map(product => {
      const target = items.find(i => i.productId === product.id);
      if (!target) return product;

      const newQty = Math.max(0, product.stockQuantity - target.quantity);
      const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= 5 ? 'low_stock' : 'in_stock';

      const updatedProduct: Product = {
        ...product,
        stockQuantity: newQty,
        stockStatus: newStatus
      };

      // Sync individual item to Firestore if configured
      if (isFirebaseConfigured() && db) {
        setDoc(doc(db, 'products', product.id), updatedProduct, { merge: true }).catch(err =>
          handleFirestoreError(err, OperationType.UPDATE, `products/${product.id}`)
        );
      }

      return updatedProduct;
    });

    updateLocalProducts(updatedList);
  };

  // Admin add product
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId
    };

    const updated = [newProduct, ...products];
    updateLocalProducts(updated);

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'products', newId), newProduct);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `products/${newId}`);
      }
    }

    return newProduct;
  };

  // Admin update product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = products.map(p => (p.id === id ? { ...p, ...updates } : p));
    updateLocalProducts(updated);

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'products', id), updates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
      }
    }
  };

  // Admin delete product
  const deleteProduct = async (id: string) => {
    const updated = products.filter(p => p.id !== id);
    updateLocalProducts(updated);

    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  // Admin toggle top selling status for a product
  const toggleTopSelling = async (id: string) => {
    const updated = products.map(p => (p.id === id ? { ...p, isTopSelling: !p.isTopSelling } : p));
    updateLocalProducts(updated);

    if (isFirebaseConfigured() && db) {
      const target = updated.find(p => p.id === id);
      if (target) {
        setDoc(doc(db, 'products', id), target, { merge: true }).catch(err =>
          handleFirestoreError(err, OperationType.UPDATE, `products/${id}`)
        );
      }
    }
  };

  // Admin randomize top selling products selection (picks count random products)
  const randomizeTopSelling = async (count = 8) => {
    if (products.length === 0) return;
    
    // Pick random items across categories if possible
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selectedIds = new Set(shuffled.slice(0, Math.min(count, products.length)).map(p => p.id));

    const updated = products.map(p => ({
      ...p,
      isTopSelling: selectedIds.has(p.id)
    }));

    updateLocalProducts(updated);

    if (isFirebaseConfigured() && db) {
      for (const p of updated) {
        setDoc(doc(db, 'products', p.id), p, { merge: true }).catch(() => {});
      }
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
        randomizeTopSelling
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
