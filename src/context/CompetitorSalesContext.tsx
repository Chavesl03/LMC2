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

export interface CompetitorSale {
  id: string;
  brand: string;
  units: number;
  category: 'Smartphones' | 'Computers';
  date: string;
  createdAt: string;
}

interface CompetitorSalesContextType {
  competitorSales: CompetitorSale[];
  addCompetitorSale: (sale: Omit<CompetitorSale, 'id' | 'createdAt'>) => Promise<void>;
  updateCompetitorSale: (sale: CompetitorSale) => Promise<void>;
  deleteCompetitorSale: (id: string) => Promise<void>;
  resetAllCompetitorSales: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CompetitorSalesContext = createContext<CompetitorSalesContextType | undefined>(undefined);

export function useCompetitorSales() {
  const context = useContext(CompetitorSalesContext);
  if (context === undefined) {
    throw new Error('useCompetitorSales must be used within a CompetitorSalesProvider');
  }
  return context;
}

interface CompetitorSalesProviderProps {
  children: ReactNode;
}

export function CompetitorSalesProvider({ children }: CompetitorSalesProviderProps) {
  const [competitorSales, setCompetitorSales] = useState<CompetitorSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'competitorSales'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedSales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CompetitorSale[];
      
      setCompetitorSales(updatedSales);
      setIsLoading(false);
    }, (err) => {
      console.error('Error listening to competitor sales:', err);
      setError('Failed to load competitor sales');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCompetitorSale = async (saleData: Omit<CompetitorSale, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'competitorSales'), {
        ...saleData,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to add competitor sale');
      console.error('Error adding competitor sale:', err);
      throw err;
    }
  };

  const updateCompetitorSale = async (updatedSale: CompetitorSale) => {
    try {
      const saleRef = doc(db, 'competitorSales', updatedSale.id);
      await updateDoc(saleRef, {
        ...updatedSale,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update competitor sale');
      console.error('Error updating competitor sale:', err);
      throw err;
    }
  };

  const deleteCompetitorSale = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'competitorSales', id));
    } catch (err) {
      setError('Failed to delete competitor sale');
      console.error('Error deleting competitor sale:', err);
      throw err;
    }
  };

  const resetAllCompetitorSales = async () => {
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'competitorSales'));
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (err) {
      setError('Failed to reset competitor sales');
      console.error('Error resetting competitor sales:', err);
      throw err;
    }
  };

  const value = {
    competitorSales,
    addCompetitorSale,
    updateCompetitorSale,
    deleteCompetitorSale,
    resetAllCompetitorSales,
    isLoading,
    error
  };

  return (
    <CompetitorSalesContext.Provider value={value}>
      {children}
    </CompetitorSalesContext.Provider>
  );
}