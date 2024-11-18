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
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

export interface Sale {
  id: string;
  date: string;
  product: string;
  category: 'Smartphones' | 'Computers';
  quantity: number;
  seller: string;
  totalPrice: number;
  createdAt: string;
}

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  updateSale: (sale: Sale) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  resetAllSales: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}

interface SalesProviderProps {
  children: ReactNode;
}

export function SalesProvider({ children }: SalesProviderProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'sales'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedSales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sale[];
      
      setSales(updatedSales);
      setIsLoading(false);
    }, (err) => {
      console.error('Error listening to sales:', err);
      setError('Failed to load sales');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addSale = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'sales'), {
        ...saleData,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to add sale');
      console.error('Error adding sale:', err);
      throw err;
    }
  };

  const updateSale = async (updatedSale: Sale) => {
    try {
      const saleRef = doc(db, 'sales', updatedSale.id);
      await updateDoc(saleRef, {
        ...updatedSale,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update sale');
      console.error('Error updating sale:', err);
      throw err;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'sales', id));
    } catch (err) {
      setError('Failed to delete sale');
      console.error('Error deleting sale:', err);
      throw err;
    }
  };

  const resetAllSales = async () => {
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'sales'));
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (err) {
      setError('Failed to reset sales');
      console.error('Error resetting sales:', err);
      throw err;
    }
  };

  const value = {
    sales,
    addSale,
    updateSale,
    deleteSale,
    resetAllSales,
    isLoading,
    error
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
}