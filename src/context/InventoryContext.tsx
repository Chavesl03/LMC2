import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  runTransaction
} from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  ean: string;
  storeStock: number;
  warehouseStock: number;
  minStock: number;
  maxStock: number;
  price: number;
  status: 'critical' | 'warning' | 'optimal';
  imageUrl: string;
}

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'status'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductByEan: (ean: string) => Promise<Product | undefined>;
  updateStockOnSale: (productId: string, quantity: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

interface InventoryProviderProps {
  children: ReactNode;
}

export function InventoryProvider({ children }: InventoryProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const loadedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(loadedProducts);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const calculateStatus = (storeStock: number): 'critical' | 'warning' | 'optimal' => {
    if (storeStock <= 5) return 'critical';
    if (storeStock <= 15) return 'warning';
    return 'optimal';
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'status'>) => {
    try {
      const status = calculateStatus(productData.storeStock);
      const { id, ...productWithoutId } = productData as any; // Remove id if present
      
      const docRef = await addDoc(collection(db, 'products'), {
        ...productWithoutId,
        status,
        createdAt: new Date().toISOString()
      });

      const newProduct: Product = {
        ...productData,
        id: docRef.id,
        status
      };

      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError('Failed to add product');
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const status = calculateStatus(updatedProduct.storeStock);
      const productRef = doc(db, 'products', updatedProduct.id);
      
      const { id, ...productWithoutId } = updatedProduct;
      await updateDoc(productRef, {
        ...productWithoutId,
        status,
        updatedAt: new Date().toISOString()
      });

      setProducts(prev =>
        prev.map(product =>
          product.id === updatedProduct.id
            ? { ...updatedProduct, status }
            : product
        )
      );
    } catch (err) {
      setError('Failed to update product');
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const updateStockOnSale = async (productId: string, quantity: number) => {
    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'products', productId);
        const productDoc = await transaction.get(productRef);
        
        if (!productDoc.exists()) {
          throw new Error('Product not found');
        }

        const productData = productDoc.data() as Product;
        const newStoreStock = productData.storeStock - quantity;
        
        if (newStoreStock < 0) {
          throw new Error('Insufficient stock');
        }

        const status = calculateStatus(newStoreStock);

        transaction.update(productRef, {
          storeStock: newStoreStock,
          status,
          updatedAt: new Date().toISOString()
        });

        setProducts(prev =>
          prev.map(product =>
            product.id === productId
              ? { ...product, storeStock: newStoreStock, status }
              : product
          )
        );
      });
    } catch (err) {
      setError('Failed to update stock');
      console.error('Error updating stock:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const getProductByEan = async (ean: string): Promise<Product | undefined> => {
    try {
      const q = query(collection(db, 'products'), where('ean', '==', ean));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return undefined;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Product;
    } catch (err) {
      setError('Failed to fetch product by EAN');
      console.error('Error fetching product by EAN:', err);
      throw err;
    }
  };

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByEan,
    updateStockOnSale,
    isLoading,
    error
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}